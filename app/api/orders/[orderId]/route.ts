import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { approveOrder, rejectOrder } from '@/lib/orders';
import { decryptSecret } from '@/lib/crypto';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Cache em memória de curto prazo para evitar chamadas redundantes à API do Mercado Pago
// durante polling automático frequente (máximo 1 chamada a cada 2.5s por pedido)
const lastMpCheckMap = new Map<string, number>();

// Limpeza periódica do mapa a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  lastMpCheckMap.forEach((timestamp, key) => {
    if (now - timestamp > 10 * 60 * 1000) {
      lastMpCheckMap.delete(key);
    }
  });
}, 10 * 60 * 1000);

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const isForced = req.nextUrl.searchParams.get('force') === 'true';

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        giftItem: true,
        guestMessage: true,
        event: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado.' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    let currentStatus = order.status;

    // Se ainda estiver PENDING, consulta status ativo no Mercado Pago (sem cache)
    if (currentStatus === 'PENDING') {
      const now = Date.now();
      const lastCheck = lastMpCheckMap.get(order.id) || 0;
      const shouldCheckMp = isForced || now - lastCheck >= 2500;

      if (shouldCheckMp) {
        lastMpCheckMap.set(order.id, now);

        const rawSellerToken = decryptSecret(order.event?.mpAccessToken);
        const preferredToken = rawSellerToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
        const fallbackToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

        // Lista de tokens candidatos com fallback automático
        const candidateTokens = [preferredToken, fallbackToken].filter(
          (t): t is string => Boolean(t && t.trim() !== '' && !t.includes('SEU_TOKEN'))
        );
        const uniqueTokens = Array.from(new Set(candidateTokens));

        let cleanPaymentId = order.mpPaymentId ? String(order.mpPaymentId).trim() : null;
        let paymentInfo: { id?: string | number; status?: string } | null = null;

        // 1. Consulta direta pelo mpPaymentId com cache: 'no-store' para evitar Data Cache do Next.js
        if (cleanPaymentId) {
          for (const token of uniqueTokens) {
            try {
              const mpRes = await fetch(
                `https://api.mercadopago.com/v1/payments/${encodeURIComponent(cleanPaymentId)}`,
                {
                  method: 'GET',
                  headers: { Authorization: `Bearer ${token}` },
                  cache: 'no-store',
                }
              );
              if (mpRes.ok) {
                const data = (await mpRes.json()) as { id?: string | number; status?: string };
                if (data && data.status) {
                  paymentInfo = data;
                  break;
                }
              }
            } catch (err: unknown) {
              console.warn('[Order Check] Falha ao consultar pagamento por ID no Mercado Pago:', err);
            }
          }
        }

        // 2. Fallback: busca por external_reference (= order.id) se não houver mpPaymentId ou falhar a consulta direta
        if (!paymentInfo) {
          for (const token of uniqueTokens) {
            try {
              const searchRes = await fetch(
                `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(order.id)}&sort=date_created&criteria=desc`,
                {
                  method: 'GET',
                  headers: { Authorization: `Bearer ${token}` },
                  cache: 'no-store',
                }
              );
              if (searchRes.ok) {
                const searchData = (await searchRes.json()) as {
                  results?: Array<{ id?: string | number; status?: string }>;
                };
                if (searchData?.results && searchData.results.length > 0) {
                  paymentInfo = searchData.results[0];
                  if (paymentInfo.id && !cleanPaymentId) {
                    cleanPaymentId = String(paymentInfo.id);
                    await prisma.order.update({
                      where: { id: order.id },
                      data: { mpPaymentId: cleanPaymentId },
                    });
                  }
                  break;
                }
              }
            } catch (err: unknown) {
              console.warn('[Order Check] Falha ao buscar pagamento por external_reference:', err);
            }
          }
        }

        if (paymentInfo) {
          if (paymentInfo.status === 'approved') {
            await approveOrder(order.id);
            currentStatus = 'APPROVED';
          } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
            await rejectOrder(order.id);
            currentStatus = 'REJECTED';
          }
        }
      }
    }

    let raffleTicketNumber = order.raffleTicketNumber;
    if (currentStatus === 'APPROVED' && raffleTicketNumber === null) {
      const refreshed = await prisma.order.findUnique({
        where: { id: order.id },
        select: { raffleTicketNumber: true },
      });
      raffleTicketNumber = refreshed?.raffleTicketNumber ?? null;
    }

    return NextResponse.json(
      {
        id: order.id,
        status: currentStatus,
        amount: order.amount,
        payerName: order.payerName,
        pollGuess: order.pollGuess,
        giftTitle: order.giftItem?.title || 'Presente em Dinheiro',
        guestMessage: order.guestMessage,
        raffleTicketNumber,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar status do pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status do pedido.' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }
}
