import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { approveOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // 1. Bloqueia completamente o endpoint em ambiente de produção
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Simulação de pagamento indisponível em ambiente de produção.' },
        { status: 403 }
      );
    }

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

    // 2. Garante que apenas pedidos marcados como simulados podem ser aprovados por este endpoint
    const isMockPayment = !order.mpPaymentId || order.mpPaymentId.startsWith('sim_');
    if (!isMockPayment) {
      return NextResponse.json(
        { error: 'Não é permitido simular aprovação de transações reais do Mercado Pago.' },
        { status: 403 }
      );
    }

    await approveOrder(orderId);
    const updatedOrder = await prisma.order.findUnique({ where: { id: orderId } });

    return NextResponse.json({
      message: 'Pagamento simulado aprovado com sucesso!',
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
