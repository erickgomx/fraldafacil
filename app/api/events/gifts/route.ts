import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, title, description, price, imageUrl, category } = body;

    if (!eventId || !title || !price) {
      return NextResponse.json({ error: 'Título e preço são obrigatórios.' }, { status: 400 });
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
        title: title.trim(),
        description: description?.trim() || null,
        price: Number(price),
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

    const updated = await prisma.giftItem.update({
      where: { id },
      data: {
        ...(active !== undefined && { active: Boolean(active) }),
        ...(title !== undefined && { title: title.trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(description !== undefined && { description: description.trim() }),
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
