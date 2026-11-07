import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function maskCpf(cpf: string | null): string | null {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  return `***.${digits.slice(3, 6)}.***-**`;
}

function maskEmail(email: string | null): string {
  if (!email || !email.includes('@')) return 'anonimizado@lgpd.invalid';
  const [user] = email.split('@');
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : 'u***';
  return `${maskedUser}@anonimizado.invalid`;
}

/**
 * Endpoint de Execução de Manutenção e Anonimização de Dados (LGPD Art. 16).
 *
 * Protegido obrigatoriamente por Bearer Token configurado em CRON_SECRET.
 * Executa mascaramento de dados sensíveis (CPF, telefone, e-mail) de pagamentos
 * finalizados com mais de 90 dias, mantendo os registros fiscais/contábeis seguros.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || cronSecret.trim() === '') {
      return NextResponse.json(
        { error: 'CRON_SECRET não configurado no servidor.' },
        { status: 500 }
      );
    }

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

    // Parâmetro de dias (padrão: 90 dias)
    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get('days') || '90', 10);
    const days = !isNaN(daysParam) && daysParam > 0 ? daysParam : 90;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Busca pedidos concluídos que ainda possuem CPF sem máscara
    const candidates = await prisma.order.findMany({
      where: {
        createdAt: { lte: cutoffDate },
        status: { in: ['APPROVED', 'REJECTED'] },
        payerCpf: { not: null },
      },
      select: {
        id: true,
        payerCpf: true,
        payerEmail: true,
      },
      take: 200,
    });

    const toAnonymize = candidates.filter((o) => o.payerCpf && !o.payerCpf.includes('*'));

    let processedCount = 0;
    for (const order of toAnonymize) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          payerCpf: maskCpf(order.payerCpf),
          payerPhone: null,
          payerEmail: maskEmail(order.payerEmail),
        },
      });
      processedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Rotina LGPD executada com sucesso. ${processedCount} registros anonimizados.`,
      processedCount,
      cutoffDate: cutoffDate.toISOString(),
      daysRetention: days,
    });
  } catch (error) {
    console.error('Erro na execução do cron de anonimização LGPD:', error);
    return NextResponse.json(
      { error: 'Falha interna ao processar anonimização de dados.' },
      { status: 500 }
    );
  }
}
