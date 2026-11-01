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

    // 1. Tenta localizar a ordem previamente registrada pelo ID de pagamento ou ID interno
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { mpPaymentId: String(paymentId) },
          { id: String(paymentId) },
        ],
      },
      include: { event: true },
    });

    // 2. Determina o melhor token para consulta (token do vendedor ou da plataforma)
    const preferredToken = order?.event?.mpAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const fallbackToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    let paymentStatus: string | null = null;
    let externalReference: string | undefined;

    const queryMpStatus = async (token: string) => {
      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      const client = new MercadoPagoConfig({ accessToken: token });
      const paymentApi = new Payment(client);
      return await paymentApi.get({ id: String(paymentId) });
    };

    if (preferredToken && preferredToken.trim() !== '' && !preferredToken.includes('SEU_TOKEN')) {
      try {
        const paymentInfo = await queryMpStatus(preferredToken);
        paymentStatus = paymentInfo.status || 'pending';
        externalReference = paymentInfo.external_reference;
      } catch (err) {
        // Se falhou com o token preferencial e há outro token de fallback, tenta o fallback
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

    // 3. Se a ordem não havia sido encontrada antes, busca pela external_reference retornada pelo MP
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
          data: { mpPaymentId: String(paymentId) },
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
