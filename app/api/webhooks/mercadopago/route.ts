import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    let paymentStatus = 'approved';
    let externalReference: string | undefined;

    if (token && token.trim() !== '' && !token.includes('SEU_TOKEN')) {
      try {
        const { MercadoPagoConfig, Payment } = await import('mercadopago');
        const client = new MercadoPagoConfig({ accessToken: token });
        const paymentApi = new Payment(client);
        const paymentInfo = await paymentApi.get({ id: paymentId });

        paymentStatus = paymentInfo.status || 'pending';
        externalReference = paymentInfo.external_reference;
      } catch (err) {
        console.error('Erro ao buscar pagamento no Mercado Pago:', err);
      }
    }

    if (paymentStatus === 'approved') {
      // Localiza a ordem por mpPaymentId ou externalReference
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { mpPaymentId: String(paymentId) },
            ...(externalReference ? [{ id: externalReference }] : []),
          ],
        },
      });

      if (order && order.status !== 'APPROVED') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'APPROVED' },
        });

        // Cria mensagem no mural se existir
        if (order.payerMessage && order.payerMessage.trim() !== '') {
          await prisma.guestMessage.upsert({
            where: { orderId: order.id },
            update: {
              name: order.payerName,
              message: order.payerMessage,
            },
            create: {
              eventId: order.eventId,
              orderId: order.id,
              name: order.payerName,
              message: order.payerMessage,
            },
          });
        }

        // Registra palpite no bolão
        if (order.pollGuess === 'BOY' || order.pollGuess === 'GIRL') {
          await prisma.pollVote.create({
            data: {
              eventId: order.eventId,
              voterName: order.payerName,
              guess: order.pollGuess,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
