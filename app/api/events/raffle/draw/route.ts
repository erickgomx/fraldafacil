import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Realiza o sorteio definitivo entre todos os presentes aprovados com Número da Sorte.
 * Após realizado, o resultado é travado no banco e não pode ser refeito.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.userId },
      select: {
        id: true,
        raffleEnabled: true,
        rafflePrize: true,
        raffleDrawnAt: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado ou acesso não permitido.' }, { status: 404 });
    }

    if (!event.raffleEnabled) {
      return NextResponse.json({ error: 'O sorteio não está ativado neste evento.' }, { status: 400 });
    }

    if (event.raffleDrawnAt) {
      return NextResponse.json({ error: 'O sorteio já foi realizado e o resultado é definitivo.' }, { status: 409 });
    }

    const candidates = await prisma.order.findMany({
      where: {
        eventId: event.id,
        status: 'APPROVED',
        raffleTicketNumber: { not: null },
      },
      select: {
        id: true,
        payerName: true,
        raffleTicketNumber: true,
      },
      orderBy: { raffleTicketNumber: 'asc' },
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'Ainda não há participantes com presentes confirmados para sortear.' },
        { status: 400 }
      );
    }

    const winner = candidates[randomInt(0, candidates.length)];
    const drawnAt = new Date();

    // Atualização condicional atômica para garantir que o sorteio ocorra apenas uma vez
    const { count } = await prisma.event.updateMany({
      where: {
        id: event.id,
        raffleDrawnAt: null,
      },
      data: {
        raffleWinnerOrderId: winner.id,
        raffleWinnerName: winner.payerName,
        raffleWinnerTicket: winner.raffleTicketNumber,
        raffleDrawnAt: drawnAt,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: 'O sorteio já foi realizado anteriormente.' }, { status: 409 });
    }

    return NextResponse.json({
      winner: {
        orderId: winner.id,
        name: winner.payerName,
        ticketNumber: winner.raffleTicketNumber,
        drawnAt: drawnAt.toISOString(),
        prize: event.rafflePrize,
      },
    });
  } catch (error) {
    console.error('Erro ao realizar sorteio:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar o sorteio.' }, { status: 500 });
  }
}
