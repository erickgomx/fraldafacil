import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ALLOWED_GIFT_IMAGE_URLS, DEFAULT_GIFT_IMAGE_URL } from '@/lib/gift-gallery';

export const dynamic = 'force-dynamic';

const ALLOWED_GIFT_CATEGORIES = new Set(['fraldas', 'higiene', 'brincadeiras']);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, title, description, price, imageUrl, category } = body;

    const numPrice = Number(price);
    if (!eventId || !title?.trim() || isNaN(numPrice) || numPrice < 1 || numPrice > 50000) {
      return NextResponse.json(
        { error: 'Título e preço válido (entre R$ 1,00 e R$ 50.000,00) são obrigatórios.' },
        { status: 400 }
      );
    }

    let validCategory = 'fraldas';
    if (category !== undefined && category !== null && category !== '') {
      if (typeof category !== 'string' || !ALLOWED_GIFT_CATEGORIES.has(category.trim())) {
        return NextResponse.json({ error: 'Categoria de presente inválida.' }, { status: 400 });
      }
      validCategory = category.trim();
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.userId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    // Aceita apenas imagens da galeria pré-definida para evitar links arbitrários e sobrecarga no banco
    let validImageUrl = DEFAULT_GIFT_IMAGE_URL;
    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') {
      if (typeof imageUrl !== 'string' || !ALLOWED_GIFT_IMAGE_URLS.has(imageUrl.trim())) {
        return NextResponse.json(
          { error: 'Selecione uma imagem válida da galeria pré-definida.' },
          { status: 400 }
        );
      }
      validImageUrl = imageUrl.trim();
    }

    const gift = await prisma.giftItem.create({
      data: {
        eventId,
        title: title.trim().slice(0, 150),
        description: description ? String(description).trim().slice(0, 500) || null : null,
        price: Math.round(numPrice * 100) / 100,
        imageUrl: validImageUrl,
        category: validCategory,
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
    const { id, active, title, price, description, category, imageUrl } = body;

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

    let validTitle: string | undefined;
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return NextResponse.json({ error: 'O título do presente é obrigatório.' }, { status: 400 });
      }
      validTitle = title.trim().slice(0, 150);
    }

    let parsedPrice: number | undefined;
    if (price !== undefined) {
      parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 1 || parsedPrice > 50000) {
        return NextResponse.json(
          { error: 'Preço inválido (deve estar entre R$ 1,00 e R$ 50.000,00).' },
          { status: 400 }
        );
      }
      parsedPrice = Math.round(parsedPrice * 100) / 100;
    }

    let validCategory: string | undefined;
    if (category !== undefined) {
      if (typeof category !== 'string' || !ALLOWED_GIFT_CATEGORIES.has(category.trim())) {
        return NextResponse.json({ error: 'Categoria de presente inválida.' }, { status: 400 });
      }
      validCategory = category.trim();
    }

    let validImageUrl: string | undefined;
    if (imageUrl !== undefined) {
      if (typeof imageUrl !== 'string' || !ALLOWED_GIFT_IMAGE_URLS.has(imageUrl.trim())) {
        return NextResponse.json(
          { error: 'Selecione uma imagem válida da galeria pré-definida.' },
          { status: 400 }
        );
      }
      validImageUrl = imageUrl.trim();
    }

    const updated = await prisma.giftItem.update({
      where: { id },
      data: {
        ...(active !== undefined && { active: Boolean(active) }),
        ...(validTitle !== undefined && { title: validTitle }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
        ...(description !== undefined && {
          description: description === null ? null : String(description).trim().slice(0, 500) || null,
        }),
        ...(validCategory !== undefined && { category: validCategory }),
        ...(validImageUrl !== undefined && { imageUrl: validImageUrl }),
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
