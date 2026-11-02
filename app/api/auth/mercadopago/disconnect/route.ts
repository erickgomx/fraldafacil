import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Desconecta com segurança a conta do Mercado Pago vinculada ao evento.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, eventId } = body;

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.userId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });
    }

    if (action === 'DISCONNECT') {
      await prisma.event.update({
        where: { id: event.id },
        data: {
          mpConnected: false,
          mpAccessToken: null,
          mpRefreshToken: null,
          mpUserId: null,
          mpPublicKey: null,
        },
      });
      return NextResponse.json({ success: true, connected: false });
    }

    return NextResponse.json({ error: 'Ação não permitida.' }, { status: 400 });
  } catch (error) {
    console.error('Erro na desconexão da conta MP:', error);
    return NextResponse.json({ error: 'Erro interno ao desconectar.' }, { status: 500 });
  }
}
