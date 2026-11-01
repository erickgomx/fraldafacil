import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function PainelPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user || user.events.length === 0) redirect('/cadastro');

  const event = user.events[0];

  // Pedidos aprovados
  const approvedOrders = await prisma.order.findMany({
    where: { eventId: event.id, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
  });

  // O total líquido dos pais considera os valores já calculados no split
  const totalGross = approvedOrders.reduce((sum, order) => sum + order.amount, 0);
  const totalNet = approvedOrders.reduce((sum, order) => sum + (order.netAmount ?? (order.amount * (1 - 0.0499))), 0);
  const platformFee = approvedOrders.reduce((sum, order) => sum + (order.platformFee ?? (order.amount * 0.0499)), 0);
  const netAmount = totalNet;

  // Bolão
  const [boyVotes, girlVotes] = await Promise.all([
    prisma.pollVote.count({ where: { eventId: event.id, guess: 'BOY' } }),
    prisma.pollVote.count({ where: { eventId: event.id, guess: 'GIRL' } }),
  ]);

  const totalVotes = boyVotes + girlVotes;
  const boyPercent = totalVotes > 0 ? Math.round((boyVotes / totalVotes) * 100) : 50;
  const girlPercent = totalVotes > 0 ? 100 - boyPercent : 50;

  return (
    <DashboardClient
      event={{
        id: event.id,
        slug: event.slug,
        babyName: event.babyName,
        parentsNames: event.parentsNames,
        revealedGender: event.revealedGender,
        pixKey: event.pixKey,
        mpConnected: event.mpConnected,
        feePayer: (event.feePayer as 'GUEST' | 'PARENTS') || 'GUEST',
      }}
      metrics={{
        totalGross,
        platformFee,
        netAmount,
        totalOrders: approvedOrders.length,
        boyVotes,
        girlVotes,
        totalVotes,
        boyPercent,
        girlPercent,
      }}
      recentOrders={approvedOrders.slice(0, 5).map((o) => ({
        id: o.id,
        amount: o.amount,
        payerName: o.payerName,
        pollGuess: o.pollGuess,
        createdAt: o.createdAt.toISOString(),
        payerMessage: o.payerMessage,
      }))}
    />
  );
}
