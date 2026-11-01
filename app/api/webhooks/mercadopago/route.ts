import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { approveOrder, rejectOrder } from '@/lib/orders';

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
    let paymentStatus: string | null = null;
    let externalReference: string | undefined;

    // Apenas consulta o Mercado Pago se houver token configurado
    if (token && token.trim() !== '' && !token.includes('SEU_TOKEN')) {
      try {
        const { MercadoPagoConfig, Payment } = await import('mercadopago');
        const client = new MercadoPagoConfig({ accessToken: token });
        const paymentApi = new Payment(client);
        const paymentInfo = await paymentApi.get({ id: paymentId });

        paymentStatus = paymentInfo.status || 'pending';
        externalReference = paymentInfo.external_reference;
      } catch (err) {
        console.error('Erro ao verificar status na API oficial do Mercado Pago:', err);
        // Em caso de falha na consulta oficial, NUNCA assume como aprovado
        return NextResponse.json({ message: 'Falha ao consultar transação no Mercado Pago' }, { status: 200 });
      }
    } else {
      // Sem token de produção configurado, o webhook ignora eventos externos
      return NextResponse.json({ message: 'Webhook inativo (sem credenciais de produção)' }, { status: 200 });
    }

    // Localiza a ordem por mpPaymentId ou externalReference
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { mpPaymentId: String(paymentId) },
          ...(externalReference ? [{ id: externalReference }] : []),
        ],
      },
    });

    if (order) {
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
