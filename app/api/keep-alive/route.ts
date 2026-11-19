import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Keep-Alive para evitar o congelamento automático do banco
 * Supabase (plano gratuito) após 7 dias de inatividade.
 *
 * Executado periodicamente via Vercel Cron (`vercel.json`) a cada 4 dias.
 */
export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && cronSecret.trim() !== '') {
      const authHeader = req.headers.get('authorization') || '';
      const expectedHeader = `Bearer ${cronSecret}`;
      const bufExpected = Buffer.from(expectedHeader, 'utf8');
      const bufReceived = Buffer.from(authHeader, 'utf8');

      if (
        bufExpected.length !== bufReceived.length ||
        !crypto.timingSafeEqual(bufExpected, bufReceived)
      ) {
        return NextResponse.json(
          { error: 'Não autorizado. Bearer Token inválido.' },
          { status: 401 }
        );
      }
    }

    // Consulta mínima sem tráfego de payload na tabela real `Event`
    await prisma.event.findFirst({
      select: { id: true },
    });

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no keep-alive do banco:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao consultar o banco de dados.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
