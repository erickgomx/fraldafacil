import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { approveOrder, rejectOrder } from '@/lib/orders';
import { decryptSecret } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        giftItem: true,
        guestMessage: true,
        event: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    let currentStatus = order.status;

    // Se ainda estiver PENDING e houver ID do Mercado Pago, consulta status ativo no MP
    if (currentStatus === 'PENDING' && order.mpPaymentId) {
      const decryptedToken = decryptSecret(order.event?.mpAccessToken);
      const token = decryptedToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (token && token.trim() !== '' && !token.includes('SEU_TOKEN')) {
        try {
          const { MercadoPagoConfig, Payment } = await import('mercadopago');
          const client = new MercadoPagoConfig({ accessToken: token });
          const paymentApi = new Payment(client);
          const paymentInfo = await paymentApi.get({ id: order.mpPaymentId });

          if (paymentInfo.status === 'approved') {
            await approveOrder(order.id);
            currentStatus = 'APPROVED';
          } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
            await rejectOrder(order.id);
            currentStatus = 'REJECTED';
          }
        } catch {
          // Ignora erro transitório na consulta, continua retornando o status do banco
        }
      }
    }

    return NextResponse.json({
      id: order.id,
      status: currentStatus,
      amount: order.amount,
      payerName: order.payerName,
      pollGuess: order.pollGuess,
      giftTitle: order.giftItem?.title || 'Presente em Dinheiro',
      guestMessage: order.guestMessage,
    });
  } catch (error) {
    console.error('Erro ao buscar status do pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status do pedido.' },
      { status: 500 }
    );
  }
}
