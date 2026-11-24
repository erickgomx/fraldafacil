import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Remove uma mensagem do mural público (moderação dos pais),
 * preservando integralmente o pedido financeiro (Order) no banco.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = (searchParams.get('id') || '').trim();

    if (!id) {
      return NextResponse.json({ error: 'ID do recado é obrigatório.' }, { status: 400 });
    }

    const message = await prisma.guestMessage.findUnique({
      where: { id },
      include: {
        event: {
          select: { userId: true },
        },
      },
    });

    if (!message || message.event.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Recado não encontrado ou acesso não permitido.' },
        { status: 404 }
      );
    }

    await prisma.guestMessage.delete({
      where: { id: message.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir recado do mural:', error);
    return NextResponse.json(
      { error: 'Não foi possível remover o recado.' },
      { status: 500 }
    );
  }
}
