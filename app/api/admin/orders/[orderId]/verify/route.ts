import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { approveOrder, rejectOrder } from '@/lib/orders';
import { decryptSecret } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido não fornecido.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { event: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    if (order.status === 'APPROVED') {
      return NextResponse.json({
        success: true,
        status: 'APPROVED',
        message: 'Este pagamento já se encontra aprovado no sistema.',
      });
    }

    const rawSellerToken = decryptSecret(order.event?.mpAccessToken);
    const preferredToken = rawSellerToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const fallbackToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    const candidateTokens = [preferredToken, fallbackToken].filter(
      (t): t is string => Boolean(t && t.trim() !== '' && !t.includes('SEU_TOKEN'))
    );
    const uniqueTokens = Array.from(new Set(candidateTokens));

    if (uniqueTokens.length === 0) {
      return NextResponse.json({
        success: false,
        status: order.status,
        message: 'Nenhuma credencial válida do Mercado Pago encontrada para consulta.',
      });
    }

    let cleanPaymentId = order.mpPaymentId ? String(order.mpPaymentId).trim() : null;
    let paymentInfo: {
      id?: string | number;
      status?: string;
      status_detail?: string;
    } | null = null;
    let lastErrorMsg = '';

    const { MercadoPagoConfig, Payment } = await import('mercadopago');

    // 1. Se possuir mpPaymentId, busca diretamente pelo ID do pagamento
    if (cleanPaymentId) {
      for (const token of uniqueTokens) {
        try {
          const client = new MercadoPagoConfig({ accessToken: token });
          const paymentApi = new Payment(client);
          const res = await paymentApi.get({ id: cleanPaymentId });
          if (res && res.status) {
            paymentInfo = res;
            break;
          }
        } catch (err: unknown) {
          lastErrorMsg = err instanceof Error ? err.message : String(err);
          console.warn(`[Admin Verify] Falha ao consultar status com token no Mercado Pago:`, err);
        }
      }
    }

    // 2. Se não possuir mpPaymentId ou a consulta direta falhou, tenta buscar pelo external_reference (= order.id)
    if (!paymentInfo) {
      for (const token of uniqueTokens) {
        try {
          const client = new MercadoPagoConfig({ accessToken: token });
          const paymentApi = new Payment(client);
          const searchRes = await paymentApi.search({
            options: { criteria: 'desc', external_reference: order.id },
          });
          if (searchRes?.results && searchRes.results.length > 0) {
            paymentInfo = searchRes.results[0];
            cleanPaymentId = String(paymentInfo.id);
            await prisma.order.update({
              where: { id: order.id },
              data: { mpPaymentId: cleanPaymentId },
            });
            break;
          }
        } catch (err: unknown) {
          lastErrorMsg = err instanceof Error ? err.message : String(err);
          console.warn(`[Admin Verify] Falha na busca por external_reference no Mercado Pago:`, err);
        }
      }
    }

    if (!paymentInfo || !paymentInfo.status) {
      if (!cleanPaymentId) {
        return NextResponse.json({
          success: false,
          status: order.status,
          message: 'Este pedido não possui ID do Mercado Pago e não foi encontrado pelo ID do pedido no Mercado Pago.',
        });
      }

      return NextResponse.json({
        success: false,
        status: order.status,
        message: `Não foi possível verificar no Mercado Pago. ${lastErrorMsg ? `Motivo: ${lastErrorMsg}` : ''}`,
      });
    }

    const mpStatus = String(paymentInfo.status).toLowerCase();
    const detail = paymentInfo.status_detail ? ` (${paymentInfo.status_detail})` : '';

    if (mpStatus === 'approved') {
      await approveOrder(order.id);
      return NextResponse.json({
        success: true,
        status: 'APPROVED',
        previousStatus: order.status,
        message: `Pagamento APROVADO com sucesso no Mercado Pago! (ID MP: ${cleanPaymentId})`,
      });
    }

    if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      await rejectOrder(order.id);
      const label = mpStatus === 'cancelled' ? 'Cancelado' : 'Rejeitado';
      return NextResponse.json({
        success: true,
        status: 'REJECTED',
        previousStatus: order.status,
        message: `Pagamento marcado como ${label} no Mercado Pago${detail}.`,
      });
    }

    // Status pendente / em análise (pending, in_process, in_mediation, etc.)
    return NextResponse.json({
      success: true,
      status: 'PENDING',
      previousStatus: order.status,
      message: `Pagamento continua pendente no Mercado Pago (Status: ${mpStatus}${detail}). Aguardando quitação pelo pagador.`,
    });
  } catch (error: unknown) {
    console.error('[Admin Verify] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar verificação de pagamento.' },
      { status: 500 }
    );
  }
}
