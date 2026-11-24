import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { approveOrder, refundOrChargebackOrder, rejectOrder } from '@/lib/orders';
import { fetchMpPaymentStatus } from '@/lib/mercadopago';

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

        const paymentInfo = await fetchMpPaymentStatus({
          paymentId: order.mpPaymentId,
          externalReference: order.id,
          eventId: order.eventId,
          sellerAccessToken: order.event?.mpAccessToken || null,
          sellerRefreshToken: order.event?.mpRefreshToken || null,
          allowPlatformFallback: true,
        });

        if (paymentInfo) {
          if (paymentInfo.id && !order.mpPaymentId) {
            await prisma.order.update({
              where: { id: order.id },
              data: { mpPaymentId: String(paymentInfo.id) },
            });
          }

          const mpStatus = String(paymentInfo.status || '').toLowerCase();
          if (mpStatus === 'approved') {
            await approveOrder(order.id);
            currentStatus = 'APPROVED';
          } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
            await rejectOrder(order.id);
            currentStatus = 'REJECTED';
          } else if (mpStatus === 'refunded') {
            await refundOrChargebackOrder(order.id, 'REFUNDED');
            currentStatus = 'REFUNDED';
          } else if (mpStatus === 'charged_back') {
            await refundOrChargebackOrder(order.id, 'CHARGED_BACK');
            currentStatus = 'CHARGED_BACK';
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
