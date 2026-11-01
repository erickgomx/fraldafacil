import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      parentsNames,
      babyName,
      eventDate,
      storyMessage,
      themeColor,
      pixKey,
      revealedGender,
      feePayer,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 });
    }

    // Garante que o evento pertence ao usuário logado
    const existing = await prisma.event.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Evento não encontrado ou acesso não permitido.' }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(parentsNames !== undefined && { parentsNames: parentsNames.trim() }),
        ...(babyName !== undefined && { babyName: babyName ? babyName.trim() : null }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(storyMessage !== undefined && { storyMessage }),
        ...(themeColor !== undefined && { themeColor }),
        ...(pixKey !== undefined && { pixKey: pixKey ? pixKey.trim() : null }),
        ...(revealedGender !== undefined && { revealedGender }),
        ...(feePayer !== undefined && { feePayer: feePayer === 'PARENTS' ? 'PARENTS' : 'GUEST' }),
      },
    });

    return NextResponse.json({ message: 'Evento atualizado com sucesso!', event: updated });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json({ error: 'Erro ao salvar alterações.' }, { status: 500 });
  }
}
