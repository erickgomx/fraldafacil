/**
 * 🗄️ Cliente Central do Prisma ORM (Database Singleton)
 *
 * Em ambientes Serverless e com Fast-Refresh no Next.js (desenvolvimento), módulos
 * são reavaliados frequentemente a cada alteração de código. Se criássemos uma nova
 * instância do `PrismaClient` a cada import, esgotaríamos o pool de conexões do banco
 * (PostgreSQL / Supabase) em poucos minutos.
 *
 * Padrão adotado:
 * Armazenamos a instância única no objeto global (`globalThis`). Em desenvolvimento,
 * ela é reaproveitada em todos os hot-reloads. Em produção, cada worker cria sua
 * conexão gerenciada de forma otimizada.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
