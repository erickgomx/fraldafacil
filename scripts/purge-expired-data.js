/**
 * Script de Expurgo e Anonimização de Dados Pessoais (LGPD Art. 16)
 *
 * Anonimiza CPFs, telefones e e-mails de convidados/pagadores de pedidos
 * associados a eventos concluídos há mais de 90 dias (ou tempo customizado),
 * preservando estritamente os valores monetários, datas e status para
 * integridade fiscal, contábil e auditoria financeira.
 *
 * Uso:
 *   node scripts/purge-expired-data.js [--days=90] [--dry-run]
 *
 * Exemplos:
 *   • Simulação (Dry Run):
 *       node scripts/purge-expired-data.js --dry-run
 *
 *   • Execução Real (padrão 90 dias):
 *       node scripts/purge-expired-data.js
 *
 *   • Execução Real para eventos com mais de 180 dias:
 *       node scripts/purge-expired-data.js --days=180
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function maskCpf(cpf) {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  return `***.${digits.slice(3, 6)}.***-**`;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return 'anonimizado@lgpd.invalid';
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : 'u***';
  return `${maskedUser}@anonimizado.invalid`;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  let days = 90;
  const daysArg = args.find((a) => a.startsWith('--days='));
  if (daysArg) {
    const parsedDays = parseInt(daysArg.split('=')[1], 10);
    if (!isNaN(parsedDays) && parsedDays > 0) {
      days = parsedDays;
    }
  }

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  console.log('=============================================================');
  console.log('  FRALDA ONLINE - ROTINA DE ANONIMIZAÇÃO LGPD (ART. 16)');
  console.log('=============================================================');
  console.log(`Modo: ${isDryRun ? 'SIMULAÇÃO (DRY RUN - Nenhuma alteração no banco)' : 'EXECUÇÃO EFETIVA'}`);
  console.log(`Período de Retenção: Pedidos finalizados anteriores a ${days} dias (${cutoffDate.toLocaleDateString('pt-BR')})`);
  console.log('-------------------------------------------------------------');

  try {
    // Busca pedidos concluídos que ainda possuem CPF não mascarado
    const candidates = await prisma.order.findMany({
      where: {
        createdAt: { lte: cutoffDate },
        status: { in: ['APPROVED', 'REJECTED'] },
        payerCpf: { not: null },
      },
      select: {
        id: true,
        payerName: true,
        payerEmail: true,
        payerPhone: true,
        payerCpf: true,
        createdAt: true,
        amount: true,
      },
      take: 500, // Processa em lotes seguros
    });

    // Filtra aqueles que ainda não foram anonimizados
    const toAnonymize = candidates.filter((o) => o.payerCpf && !o.payerCpf.includes('*'));

    console.log(`Pedidos elegíveis para expurgo de dados sensíveis: ${toAnonymize.length}`);

    if (toAnonymize.length === 0) {
      console.log('Nenhum dado sensível pendente de expurgo encontrado. Base em conformidade!');
      process.exit(0);
    }

    if (isDryRun) {
      console.log('\nExemplos de registros que seriam anonimizados:');
      toAnonymize.slice(0, 5).forEach((order, idx) => {
        console.log(`  [${idx + 1}] ID: ${order.id}`);
        console.log(`      Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}`);
        console.log(`      CPF Atual: ${order.payerCpf} -> Mascarado: ${maskCpf(order.payerCpf)}`);
        console.log(`      E-mail Atual: ${order.payerEmail} -> Mascarado: ${maskEmail(order.payerEmail)}`);
        console.log(`      Telefone Atual: ${order.payerPhone || 'N/A'} -> Removido (null)`);
      });
      console.log('\n(Execute sem a flag --dry-run para aplicar a anonimização)');
      process.exit(0);
    }

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

    console.log(`\n✅ Sucesso! ${processedCount} registros anonimizados com êxito.`);
    console.log('Conformidade LGPD (Art. 6º, III e Art. 16) atualizada.');
  } catch (err) {
    console.error('❌ Erro durante a execução da rotina de anonimização:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
