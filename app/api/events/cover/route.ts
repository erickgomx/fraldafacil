import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  deleteCoverFromSupabaseByUrl,
  getSupabaseStorageConfig,
  uploadCoverToSupabase,
  validateImageMagicBytes,
} from '@/lib/storage';

export const dynamic = 'force-dynamic';

const MAX_COVER_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const storageConfig = getSupabaseStorageConfig();
    if (!storageConfig) {
      return NextResponse.json(
        {
          error:
            'O armazenamento de fotos ainda não foi configurado no servidor (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).',
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const eventId = String(formData.get('eventId') || '').trim();

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Selecione um arquivo de imagem válido.' }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_COVER_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 3 MB.' },
        { status: 400 }
      );
    }

    const existing = await prisma.event.findFirst({
      where: { id: eventId, userId: session.userId },
      select: { id: true, coverImageUrl: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Evento não encontrado ou acesso não permitido.' },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const magic = validateImageMagicBytes(buffer);
    if (!magic.valid || !magic.mimeType || !magic.ext) {
      return NextResponse.json(
        { error: 'Formato inválido. Utilize apenas imagens JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    const { publicUrl } = await uploadCoverToSupabase({
      eventId: existing.id,
      buffer,
      contentType: magic.mimeType,
      ext: magic.ext,
    });

    await prisma.event.update({
      where: { id: existing.id },
      data: { coverImageUrl: publicUrl },
    });

    if (existing.coverImageUrl && existing.coverImageUrl !== publicUrl) {
      await deleteCoverFromSupabaseByUrl(existing.coverImageUrl);
    }

    return NextResponse.json({
      coverImageUrl: publicUrl,
      message: 'Foto de capa atualizada com sucesso!',
    });
  } catch (error) {
    console.error('Erro no upload da foto de capa:', error);
    return NextResponse.json(
      { error: 'Não foi possível enviar a foto de capa. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let eventId = (searchParams.get('eventId') || '').trim();

    if (!eventId) {
      const body = (await req.json().catch(() => ({}))) as { eventId?: string };
      eventId = String(body?.eventId || '').trim();
    }

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.event.findFirst({
      where: { id: eventId, userId: session.userId },
      select: { id: true, coverImageUrl: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Evento não encontrado ou acesso não permitido.' },
        { status: 404 }
      );
    }

    await deleteCoverFromSupabaseByUrl(existing.coverImageUrl);

    await prisma.event.update({
      where: { id: existing.id },
      data: { coverImageUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover foto de capa:', error);
    return NextResponse.json(
      { error: 'Não foi possível remover a foto de capa.' },
      { status: 500 }
    );
  }
}
