import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { approveOrder, refundOrChargebackOrder, rejectOrder } from '@/lib/orders';
import { fetchMpPaymentStatus } from '@/lib/mercadopago';
import { verifyMercadoPagoWebhookSignature } from '@/lib/webhook';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // O Mercado Pago pode enviar dados no query param (data.id / id) ou no corpo
    let paymentId = searchParams.get('data.id') || searchParams.get('id');

    const body = await req.json().catch(() => ({}));
    if (!paymentId && body?.data?.id) {
      paymentId = String(body.data.id);
    }

    if (!paymentId) {
      return NextResponse.json({ message: 'Evento ignorado (sem payment id)' }, { status: 200 });
    }

    // Validação estrita: IDs de pagamento do Mercado Pago são estritamente numéricos
    const cleanPaymentId = String(paymentId).trim();
    if (!/^\d+$/.test(cleanPaymentId)) {
      return NextResponse.json({ message: 'ID de pagamento inválido ignorado' }, { status: 200 });
    }

    // Verificação de autenticidade da assinatura criptográfica do Mercado Pago (Fail-Closed)
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && (!webhookSecret || webhookSecret.trim() === '')) {
      console.error('[FATAL SECURITY] MERCADO_PAGO_WEBHOOK_SECRET obrigatório não configurado em ambiente de produção.');
      return NextResponse.json(
        { error: 'Configuração de segurança de webhook pendente no servidor.' },
        { status: 500 }
      );
    }

    if (webhookSecret && webhookSecret.trim() !== '') {
      const xSignature = req.headers.get('x-signature');
      const xRequestId = req.headers.get('x-request-id');
      const isValid = verifyMercadoPagoWebhookSignature(
        xSignature,
        xRequestId,
        cleanPaymentId,
        webhookSecret
      );

      if (!isValid) {
        console.warn('[Webhook MP] Notificação rejeitada por assinatura HMAC inválida ou expirada.');
        return NextResponse.json({ error: 'Assinatura inválida ou não autorizada.' }, { status: 401 });
      }
    } else {
      console.warn('[Webhook MP][DEV WARNING] MERCADO_PAGO_WEBHOOK_SECRET não configurado. Verificação ignorada apenas em desenvolvimento.');
    }

    // 1. Tenta localizar a ordem previamente registrada pelo ID de pagamento do Mercado Pago
    let order = await prisma.order.findFirst({
      where: { mpPaymentId: cleanPaymentId },
      include: { event: true },
    });

    // Se a ordem ainda não tiver mpPaymentId salvo, tenta localizar o evento pelo user_id do webhook
    const sellerEvent =
      order?.event ||
      (body?.user_id
        ? await prisma.event.findFirst({
            where: {
              mpUserId: String(body.user_id),
              mpAccessToken: { not: null },
            },
          })
        : null);

    // 2. Consulta status oficial diretamente na API do Mercado Pago (com refresh automático + fallback legado)
    const paymentInfo = await fetchMpPaymentStatus({
      paymentId: cleanPaymentId,
      eventId: sellerEvent?.id || null,
      sellerAccessToken: sellerEvent?.mpAccessToken || null,
      sellerRefreshToken: sellerEvent?.mpRefreshToken || null,
      allowPlatformFallback: true,
    });

    if (!paymentInfo || !paymentInfo.status) {
      return NextResponse.json(
        { message: 'Falha ao consultar transação ou credenciais indisponíveis' },
        { status: 200 }
      );
    }

    const paymentStatus = String(paymentInfo.status).toLowerCase();
    const externalReference = paymentInfo.external_reference;

    // 3. Se a ordem não havia sido encontrada antes, busca pela external_reference (orderId interno)
    if (!order && externalReference) {
      order = await prisma.order.findUnique({
        where: { id: externalReference },
        include: { event: true },
      });
    }

    if (order) {
      // Garante que o mpPaymentId esteja salvo
      if (!order.mpPaymentId) {
        await prisma.order.update({
          where: { id: order.id },
          data: { mpPaymentId: cleanPaymentId },
        });
      }

      if (paymentStatus === 'approved') {
        await approveOrder(order.id);
      } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
        await rejectOrder(order.id);
      } else if (paymentStatus === 'refunded') {
        await refundOrChargebackOrder(order.id, 'REFUNDED');
      } else if (paymentStatus === 'charged_back') {
        await refundOrChargebackOrder(order.id, 'CHARGED_BACK');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
