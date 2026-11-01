import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    if (order.status === 'APPROVED') {
      return NextResponse.json({ message: 'Pedido já aprovado!', order });
    }

    // Atualiza pedido para APPROVED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'APPROVED' },
    });

    // Se houver mensagem dos pais/convidados, salva no mural
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

    // Se o pedido continha palpite no bolão, registra o voto
    if (order.pollGuess === 'BOY' || order.pollGuess === 'GIRL') {
      await prisma.pollVote.create({
        data: {
          eventId: order.eventId,
          voterName: order.payerName,
          guess: order.pollGuess,
        },
      });
    }

    return NextResponse.json({
      message: 'Pagamento aprovado com sucesso!',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Erro ao simular aprovação:', error);
    return NextResponse.json(
      { error: 'Erro ao aprovar o pedido.' },
      { status: 500 }
    );
  }
}
