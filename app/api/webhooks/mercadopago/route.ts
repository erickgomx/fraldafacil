import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { approveOrder, rejectOrder } from '@/lib/orders';
import { decryptSecret } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

function verifyWebhookSignature(
  xSignature: string | null,
  requestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !requestId || !secret) return false;

  const parts = xSignature.split(',');
  let ts: string | undefined;
  let v1: string | undefined;

  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key?.trim() === 'ts') ts = val?.trim();
    if (key?.trim() === 'v1') v1 = val?.trim();
  }

  if (!ts || !v1) return false;

  // 1. Defesa Anti-Replay: Tolera no máximo 5 minutos (300.000 ms)
  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum)) return false;
  const tsMs = tsNum < 1e11 ? tsNum * 1000 : tsNum;
  if (Math.abs(Date.now() - tsMs) > 5 * 60 * 1000) {
    console.warn('[Webhook MP] Notificação expirada ou relógio dessincronizado.');
    return false;
  }

  // Formato oficial do Mercado Pago: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const computedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  const bufComputed = Buffer.from(computedHash, 'utf8');
  const bufReceived = Buffer.from(v1, 'utf8');

  // Proteção contra erro de comprimentos distintos em crypto.timingSafeEqual
  if (bufComputed.length !== bufReceived.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufComputed, bufReceived);
}

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

    // Verificação de autenticidade da assinatura criptográfica do Mercado Pago
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret.trim() !== '') {
      const xSignature = req.headers.get('x-signature');
      const xRequestId = req.headers.get('x-request-id');
      const isValid = verifyWebhookSignature(xSignature, xRequestId, cleanPaymentId, webhookSecret);

      if (!isValid) {
        console.warn('Webhook do Mercado Pago rejeitado por assinatura inválida.');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }

    // 1. Tenta localizar a ordem previamente registrada pelo ID de pagamento do Mercado Pago
    let order = await prisma.order.findFirst({
      where: { mpPaymentId: cleanPaymentId },
      include: { event: true },
    });

    // 2. Determina o melhor token para consulta (token do vendedor ou da plataforma)
    const rawSellerToken = decryptSecret(order?.event?.mpAccessToken);
    const preferredToken = rawSellerToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const fallbackToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    let paymentStatus: string | null = null;
    let externalReference: string | undefined;

    const queryMpStatus = async (token: string) => {
      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      const client = new MercadoPagoConfig({ accessToken: token });
      const paymentApi = new Payment(client);
      return await paymentApi.get({ id: cleanPaymentId });
    };

    if (preferredToken && preferredToken.trim() !== '' && !preferredToken.includes('SEU_TOKEN')) {
      try {
        const paymentInfo = await queryMpStatus(preferredToken);
        paymentStatus = paymentInfo.status || 'pending';
        externalReference = paymentInfo.external_reference;
      } catch (err) {
        if (fallbackToken && fallbackToken !== preferredToken && !fallbackToken.includes('SEU_TOKEN')) {
          try {
            const paymentInfo = await queryMpStatus(fallbackToken);
            paymentStatus = paymentInfo.status || 'pending';
            externalReference = paymentInfo.external_reference;
          } catch (fallbackErr) {
            console.error('Falha na consulta oficial Mercado Pago:', fallbackErr);
            return NextResponse.json({ message: 'Falha ao consultar transação' }, { status: 200 });
          }
        } else {
          console.error('Falha na consulta oficial Mercado Pago:', err);
          return NextResponse.json({ message: 'Falha ao consultar transação' }, { status: 200 });
        }
      }
    } else {
      return NextResponse.json({ message: 'Webhook inativo (sem credenciais)' }, { status: 200 });
    }

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
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
