import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Permite simular a conexão de conta Mercado Pago ou desconectar uma conta vinculada.
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

    if (action === 'SIMULATE_CONNECT') {
      await prisma.event.update({
        where: { id: event.id },
        data: {
          mpConnected: true,
          mpUserId: `sim_user_${Math.random().toString(36).substring(2, 8)}`,
          mpAccessToken: `sim_token_${Date.now()}`,
          mpPublicKey: `sim_pub_${Date.now()}`,
        },
      });
      return NextResponse.json({ success: true, connected: true });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error) {
    console.error('Erro na gestão da conta MP:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
