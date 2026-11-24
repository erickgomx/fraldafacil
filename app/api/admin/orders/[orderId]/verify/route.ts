import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { approveOrder, refundOrChargebackOrder, rejectOrder } from '@/lib/orders';
import { fetchMpPaymentStatus, hasMercadoPagoToken } from '@/lib/mercadopago';

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

    if (!order.event?.mpAccessToken && !hasMercadoPagoToken()) {
      return NextResponse.json({
        success: false,
        status: order.status,
        message: 'Nenhuma credencial válida do Mercado Pago encontrada para consulta.',
      });
    }

    const paymentInfo = await fetchMpPaymentStatus({
      paymentId: order.mpPaymentId,
      externalReference: order.id,
      eventId: order.eventId,
      sellerAccessToken: order.event?.mpAccessToken || null,
      sellerRefreshToken: order.event?.mpRefreshToken || null,
      allowPlatformFallback: true,
    });

    if (!paymentInfo || !paymentInfo.status) {
      if (!order.mpPaymentId) {
        return NextResponse.json({
          success: false,
          status: order.status,
          message:
            'Este pedido não possui ID do Mercado Pago e não foi encontrado pelo ID do pedido no Mercado Pago.',
        });
      }

      return NextResponse.json({
        success: false,
        status: order.status,
        message: 'Não foi possível localizar o pagamento atualizado no Mercado Pago.',
      });
    }

    const resolvedPaymentId = paymentInfo.id ? String(paymentInfo.id) : order.mpPaymentId;
    if (resolvedPaymentId && !order.mpPaymentId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { mpPaymentId: resolvedPaymentId },
      });
    }

    const mpStatus = String(paymentInfo.status).toLowerCase();
    const detail = paymentInfo.status_detail ? ` (${paymentInfo.status_detail})` : '';

    if (mpStatus === 'approved') {
      if (order.status !== 'APPROVED') {
        await approveOrder(order.id);
      }
      return NextResponse.json({
        success: true,
        status: 'APPROVED',
        previousStatus: order.status,
        message:
          order.status === 'APPROVED'
            ? `Este pagamento permanece aprovado no Mercado Pago (ID MP: ${resolvedPaymentId || 'N/A'}).`
            : `Pagamento APROVADO com sucesso no Mercado Pago! (ID MP: ${resolvedPaymentId || 'N/A'})`,
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

    if (mpStatus === 'refunded') {
      await refundOrChargebackOrder(order.id, 'REFUNDED');
      return NextResponse.json({
        success: true,
        status: 'REFUNDED',
        previousStatus: order.status,
        message: `Pagamento marcado como Estornado (REFUNDED) no Mercado Pago${detail}.`,
      });
    }

    if (mpStatus === 'charged_back') {
      await refundOrChargebackOrder(order.id, 'CHARGED_BACK');
      return NextResponse.json({
        success: true,
        status: 'CHARGED_BACK',
        previousStatus: order.status,
        message: `Pagamento marcado como Contestado / Chargeback (CHARGED_BACK) no Mercado Pago${detail}.`,
      });
    }

    // Status pendente / em análise (pending, in_process, in_mediation, etc.)
    return NextResponse.json({
      success: true,
      status: order.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
      previousStatus: order.status,
      message: `Status atual no Mercado Pago: ${mpStatus}${detail}.`,
    });
  } catch (error: unknown) {
    console.error('[Admin Verify] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar verificação de pagamento.' },
      { status: 500 }
    );
  }
}
