import { NextRequest, NextResponse } from 'next/server';
import { getSession, sanitizeEventPayload } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isValidEventType, parseEventDateInput } from '@/lib/validation';

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
      eventType,
      parentsNames,
      babyName,
      boyName,
      girlName,
      eventDate,
      storyMessage,
      themeColor,
      pixKey,
      revealedGender,
      feePayer,
      raffleEnabled,
      rafflePrize,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 });
    }

    let validEventType: string | undefined;
    if (eventType !== undefined) {
      if (!isValidEventType(eventType)) {
        return NextResponse.json({ error: 'Modalidade do evento inválida.' }, { status: 400 });
      }
      validEventType = eventType;
    }

    // Garante que o evento pertence ao usuário logado
    const existing = await prisma.event.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Evento não encontrado ou acesso não permitido.' }, { status: 404 });
    }

    // Validação estrita de entradas (OWASP ASVS v4.0.3)
    let parsedEventDate: Date | undefined;
    if (eventDate !== undefined && eventDate !== '') {
      const d = parseEventDateInput(eventDate);
      if (!d) {
        return NextResponse.json({ error: 'Data do evento inválida.' }, { status: 400 });
      }
      parsedEventDate = d;
    }

    let validRevealedGender: string | null | undefined;
    if (revealedGender !== undefined) {
      if (revealedGender === 'BOY' || revealedGender === 'GIRL' || revealedGender === null) {
        validRevealedGender = revealedGender;
      } else {
        return NextResponse.json({ error: 'Gênero revelado inválido (use BOY ou GIRL).' }, { status: 400 });
      }
    }

    let validThemeColor: string | undefined;
    if (themeColor !== undefined) {
      const cleanColor = String(themeColor).trim();
      validThemeColor = /^#[0-9A-Fa-f]{3,8}$/.test(cleanColor) ? cleanColor : '#38BDF8';
    }

    // Protege integridade de sorteio já realizado (resultado definitivo)
    if (existing.raffleDrawnAt && (raffleEnabled !== undefined || rafflePrize !== undefined)) {
      return NextResponse.json(
        { error: 'O sorteio já foi realizado e seu resultado é definitivo.' },
        { status: 400 }
      );
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(validEventType !== undefined && { eventType: validEventType }),
        ...(parentsNames !== undefined && { parentsNames: String(parentsNames).trim().slice(0, 150) }),
        ...(babyName !== undefined && { babyName: babyName ? String(babyName).trim().slice(0, 100) : null }),
        ...(boyName !== undefined && { boyName: boyName ? String(boyName).trim().slice(0, 100) : null }),
        ...(girlName !== undefined && { girlName: girlName ? String(girlName).trim().slice(0, 100) : null }),
        ...(parsedEventDate !== undefined && { eventDate: parsedEventDate }),
        ...(storyMessage !== undefined && { storyMessage: storyMessage ? String(storyMessage).slice(0, 2000) : null }),
        ...(validThemeColor !== undefined && { themeColor: validThemeColor }),
        ...(pixKey !== undefined && { pixKey: pixKey ? String(pixKey).trim().slice(0, 120) : null }),
        ...(validRevealedGender !== undefined && { revealedGender: validRevealedGender }),
        ...(feePayer !== undefined && { feePayer: feePayer === 'PARENTS' ? 'PARENTS' : 'GUEST' }),
        ...(raffleEnabled !== undefined && { raffleEnabled: Boolean(raffleEnabled) }),
        ...(rafflePrize !== undefined && {
          rafflePrize: rafflePrize ? String(rafflePrize).trim().slice(0, 160) : null,
        }),
      },
    });

    return NextResponse.json({ message: 'Evento atualizado com sucesso!', event: sanitizeEventPayload(updated) });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json({ error: 'Erro ao salvar alterações.' }, { status: 500 });
  }
}
