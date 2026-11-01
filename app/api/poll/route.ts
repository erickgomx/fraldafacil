import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, voterName, guess } = body;

    if (!eventId || !voterName || !guess) {
      return NextResponse.json(
        { error: 'Por favor, informe seu nome e seu palpite (Menino ou Menina).' },
        { status: 400 }
      );
    }

    if (guess !== 'BOY' && guess !== 'GIRL') {
      return NextResponse.json({ error: 'Palpite inválido.' }, { status: 400 });
    }

    const cleanName = voterName.trim().slice(0, 100);
    if (cleanName.length < 2) {
      return NextResponse.json({ error: 'Nome muito curto.' }, { status: 400 });
    }

    // Valida se o evento existe antes de registrar voto
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });
    }

    const vote = await prisma.pollVote.create({
      data: {
        eventId: event.id,
        voterName: cleanName,
        guess,
      },
    });

    const [boyVotes, girlVotes] = await Promise.all([
      prisma.pollVote.count({ where: { eventId, guess: 'BOY' } }),
      prisma.pollVote.count({ where: { eventId, guess: 'GIRL' } }),
    ]);

    const total = boyVotes + girlVotes;
    const boyPercent = total > 0 ? Math.round((boyVotes / total) * 100) : 50;
    const girlPercent = total > 0 ? 100 - boyPercent : 50;

    return NextResponse.json({
      message: 'Voto registrado!',
      vote,
      stats: {
        total,
        boyVotes,
        girlVotes,
        boyPercent,
        girlPercent,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar voto:', error);
    return NextResponse.json({ error: 'Erro ao registrar voto.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId obrigatório' }, { status: 400 });
    }

    const [boyVotes, girlVotes, recentVotes] = await Promise.all([
      prisma.pollVote.count({ where: { eventId, guess: 'BOY' } }),
      prisma.pollVote.count({ where: { eventId, guess: 'GIRL' } }),
      prisma.pollVote.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const total = boyVotes + girlVotes;
    const boyPercent = total > 0 ? Math.round((boyVotes / total) * 100) : 50;
    const girlPercent = total > 0 ? 100 - boyPercent : 50;

    return NextResponse.json({
      total,
      boyVotes,
      girlVotes,
      boyPercent,
      girlPercent,
      recentVotes,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do bolão:', error);
    return NextResponse.json({ error: 'Erro ao buscar votos.' }, { status: 500 });
  }
}
