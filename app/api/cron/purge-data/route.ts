import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BATCH_SIZE = 200;
const MAX_BATCHES = 5;

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

function isEmailAlreadyAnonymized(email: string | null): boolean {
  if (!email) return true;
  const normalized = email.trim().toLowerCase();
  return (
    normalized.endsWith('@anonimizado.invalid') ||
    normalized.endsWith('@lgpd.invalid') ||
    normalized === 'convidado@fralda.online'
  );
}

/**
 * Endpoint de Execução de Manutenção e Anonimização de Dados (LGPD Art. 16).
 *
 * Protegido obrigatoriamente por Bearer Token configurado em CRON_SECRET.
 * Executa mascaramento de dados sensíveis (CPF, telefone, e-mail) de pagamentos
 * finalizados com mais de 90 dias, mantendo os registros fiscais/contábeis seguros.
 */
async function handlePurge(req: NextRequest) {
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

    const whereEligible = {
      createdAt: { lte: cutoffDate },
      status: { in: ['APPROVED', 'REJECTED', 'REFUNDED', 'CHARGED_BACK'] },
      OR: [
        {
          AND: [
            { payerCpf: { not: null } },
            { NOT: { payerCpf: { contains: '*' } } },
          ],
        },
        { payerPhone: { not: null } },
        {
          AND: [
            { NOT: { payerEmail: { endsWith: '@anonimizado.invalid' } } },
            { NOT: { payerEmail: { endsWith: '@lgpd.invalid' } } },
            { NOT: { payerEmail: 'convidado@fralda.online' } },
          ],
        },
      ],
    };

    let processedCount = 0;
    let lastBatchCount = 0;

    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      const candidates = await prisma.order.findMany({
        where: whereEligible,
        select: {
          id: true,
          payerCpf: true,
          payerEmail: true,
          payerPhone: true,
        },
        orderBy: { createdAt: 'asc' },
        take: BATCH_SIZE,
      });

      lastBatchCount = candidates.length;
      if (candidates.length === 0) break;

      for (const order of candidates) {
        const nextCpf =
          order.payerCpf && !order.payerCpf.includes('*')
            ? maskCpf(order.payerCpf)
            : order.payerCpf;
        const nextEmail = !isEmailAlreadyAnonymized(order.payerEmail)
          ? maskEmail(order.payerEmail)
          : order.payerEmail;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            payerCpf: nextCpf,
            payerPhone: null,
            payerEmail: nextEmail,
          },
        });
        processedCount++;
      }

      if (candidates.length < BATCH_SIZE) break;
    }

    const hasMore =
      lastBatchCount === BATCH_SIZE
        ? (await prisma.order.count({ where: whereEligible })) > 0
        : false;

    return NextResponse.json({
      success: true,
      message: `Rotina LGPD executada com sucesso. ${processedCount} registros anonimizados.`,
      processedCount,
      hasMore,
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

export async function GET(req: NextRequest) {
  return handlePurge(req);
}

export async function POST(req: NextRequest) {
  return handlePurge(req);
}
