import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
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
