import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, title, description, price, imageUrl, category } = body;

    const numPrice = Number(price);
    if (!eventId || !title?.trim() || isNaN(numPrice) || numPrice <= 0 || numPrice > 50000) {
      return NextResponse.json({ error: 'Título e preço válido (entre R$ 1 e R$ 50.000) são obrigatórios.' }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.userId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    const gift = await prisma.giftItem.create({
      data: {
        eventId,
        title: title.trim().slice(0, 150),
        description: description?.trim().slice(0, 500) || null,
        price: Math.round(numPrice * 100) / 100,
        imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
        category: category || 'fraldas',
        active: true,
      },
    });

    return NextResponse.json({ message: 'Presente adicionado!', gift });
  } catch (error) {
    console.error('Erro ao adicionar presente:', error);
    return NextResponse.json({ error: 'Erro ao criar presente' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { id, active, title, price, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do item é obrigatório' }, { status: 400 });
    }

    const gift = await prisma.giftItem.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!gift || gift.event.userId !== session.userId) {
      return NextResponse.json({ error: 'Item não encontrado ou não autorizado' }, { status: 404 });
    }

    let parsedPrice: number | undefined;
    if (price !== undefined) {
      parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 50000) {
        return NextResponse.json({ error: 'Preço inválido (deve estar entre R$ 1 e R$ 50.000).' }, { status: 400 });
      }
      parsedPrice = Math.round(parsedPrice * 100) / 100;
    }

    const updated = await prisma.giftItem.update({
      where: { id },
      data: {
        ...(active !== undefined && { active: Boolean(active) }),
        ...(title !== undefined && { title: title.trim().slice(0, 150) }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
        ...(description !== undefined && { description: description.trim().slice(0, 500) }),
      },
    });

    return NextResponse.json({ message: 'Item atualizado com sucesso!', gift: updated });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json({ error: 'Erro ao atualizar presente' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do presente obrigatório' }, { status: 400 });
    }

    const gift = await prisma.giftItem.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!gift || gift.event.userId !== session.userId) {
      return NextResponse.json({ error: 'Item não encontrado ou não autorizado' }, { status: 404 });
    }

    await prisma.giftItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Presente excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar presente:', error);
    return NextResponse.json({ error: 'Erro ao excluir presente' }, { status: 500 });
  }
}
