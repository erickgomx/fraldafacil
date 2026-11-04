import { redirect } from 'next/navigation';
import { getSession, getAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminDashboardClient, {
  AdminMetricsData,
  AdminOrderRow,
  AdminEventSummary,
  DailyChartPoint,
} from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const admin = await getAdminSession();

  if (!admin) {
    redirect('/painel');
  }

  // Consulta atômica e paralela das entidades principais
  const [orders, events, totalUsers, totalPollVotes, totalGuestMessages] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            slug: true,
            babyName: true,
            parentsNames: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        guestMessage: {
          select: {
            message: true,
          },
        },
      },
    }),
    prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orders: {
          where: { status: 'APPROVED' },
          select: {
            amount: true,
            platformFee: true,
          },
        },
      },
    }),
    prisma.user.count(),
    prisma.pollVote.count(),
    prisma.guestMessage.count(),
  ]);

  const approvedOrders = orders.filter((o) => o.status === 'APPROVED');
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const rejectedOrders = orders.filter((o) => o.status === 'REJECTED');

  const totalGross = approvedOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalPlatformFee = approvedOrders.reduce(
    (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
    0
  );
  const totalParentsNet = approvedOrders.reduce(
    (sum, o) => sum + (o.netAmount ?? o.amount * (1 - 0.0499)),
    0
  );
  const totalGatewayFee = approvedOrders.reduce((sum, o) => sum + (o.gatewayFee ?? 0), 0);

  // Recortes temporais
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayApproved = approvedOrders.filter((o) => new Date(o.createdAt) >= startOfToday);
  const grossToday = todayApproved.reduce((sum, o) => sum + o.amount, 0);
  const earningsToday = todayApproved.reduce(
    (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
    0
  );

  const weekApproved = approvedOrders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
  const grossWeek = weekApproved.reduce((sum, o) => sum + o.amount, 0);
  const earningsWeek = weekApproved.reduce(
    (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
    0
  );

  const monthApproved = approvedOrders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
  const grossMonth = monthApproved.reduce((sum, o) => sum + o.amount, 0);
  const earningsMonth = monthApproved.reduce(
    (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
    0
  );

  // Métricas de Métodos de Pagamento
  const pixApproved = approvedOrders.filter((o) => o.paymentMethod === 'PIX');
  const cardApproved = approvedOrders.filter((o) => o.paymentMethod !== 'PIX');

  const pixGrossAmount = pixApproved.reduce((sum, o) => sum + o.amount, 0);
  const cardGrossAmount = cardApproved.reduce((sum, o) => sum + o.amount, 0);

  // Pagador da Taxa
  const guestFeeCount = approvedOrders.filter((o) => o.feePayer === 'GUEST').length;
  const parentsFeeCount = approvedOrders.filter((o) => o.feePayer === 'PARENTS').length;

  // Tipos de Eventos e Status MP
  const mpConnectedCount = events.filter((e) => e.mpConnected).length;
  const mpPendingCount = events.length - mpConnectedCount;
  const revelacaoCount = events.filter((e) => e.eventType === 'REVELACAO').length;
  const fraldaCount = events.filter((e) => e.eventType === 'FRALDA').length;
  const ambosCount = events.filter((e) => e.eventType === 'AMBOS').length;

  const conversionRate = orders.length > 0 ? (approvedOrders.length / orders.length) * 100 : 0;
  const averageTicket = approvedOrders.length > 0 ? totalGross / approvedOrders.length : 0;

  const metrics: AdminMetricsData = {
    totalGross,
    totalPlatformFee,
    totalParentsNet,
    totalGatewayFee,
    grossToday,
    earningsToday,
    grossWeek,
    earningsWeek,
    grossMonth,
    earningsMonth,
    totalOrdersCount: orders.length,
    approvedOrdersCount: approvedOrders.length,
    pendingOrdersCount: pendingOrders.length,
    rejectedOrdersCount: rejectedOrders.length,
    conversionRate,
    averageTicket,
    pixOrdersCount: pixApproved.length,
    pixGrossAmount,
    cardOrdersCount: cardApproved.length,
    cardGrossAmount,
    guestFeeCount,
    parentsFeeCount,
    totalUsers,
    totalEvents: events.length,
    mpConnectedCount,
    mpPendingCount,
    revelacaoCount,
    fraldaCount,
    ambosCount,
    totalPollVotes,
    totalGuestMessages,
  };

  // Formatação de lista de pedidos para a auditoria
  const orderRows: AdminOrderRow[] = orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    amount: o.amount,
    netAmount: o.netAmount ?? o.amount * (1 - 0.0499),
    platformFee: o.platformFee ?? o.amount * 0.0499,
    gatewayFee: o.gatewayFee ?? 0,
    status: o.status,
    paymentMethod: o.paymentMethod,
    feePayer: o.feePayer || 'GUEST',
    payerName: o.payerName,
    payerEmail: o.payerEmail,
    payerPhone: o.payerPhone,
    payerCpf: o.payerCpf,
    pollGuess: o.pollGuess,
    payerMessage: o.payerMessage || o.guestMessage?.message || null,
    eventSlug: o.event?.slug || 'sem-evento',
    babyName: o.event?.babyName || null,
    parentsNames: o.event?.parentsNames || 'Não informado',
    ownerEmail: o.event?.user?.email || 'N/A',
  }));

  // Ranking dos Top Eventos
  const topEvents: AdminEventSummary[] = events
    .map((e) => {
      const grossRaised = e.orders.reduce((sum, ord) => sum + ord.amount, 0);
      const platformEarnings = e.orders.reduce(
        (sum, ord) => sum + (ord.platformFee ?? ord.amount * 0.0499),
        0
      );
      return {
        id: e.id,
        slug: e.slug,
        babyName: e.babyName,
        parentsNames: e.parentsNames,
        eventType: e.eventType,
        eventDate: e.eventDate.toISOString(),
        mpConnected: e.mpConnected,
        ownerName: e.user.name,
        ownerEmail: e.user.email,
        ordersCount: e.orders.length,
        grossRaised,
        platformEarnings,
        createdAt: e.createdAt.toISOString(),
      };
    })
    .sort((a, b) => b.grossRaised - a.grossRaised);

  // Geração de dados diários para o gráfico dos últimos 30 dias
  const chartData: DailyChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    const dayOrders = approvedOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });

    const dayGross = dayOrders.reduce((sum, o) => sum + o.amount, 0);
    const dayEarnings = dayOrders.reduce(
      (sum, o) => sum + (o.platformFee ?? o.amount * 0.0499),
      0
    );

    const dayStr = String(targetDate.getDate()).padStart(2, '0');
    const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');

    chartData.push({
      date: targetDate.toISOString().slice(0, 10),
      label: `${dayStr}/${monthStr}`,
      gross: Math.round(dayGross * 100) / 100,
      earnings: Math.round(dayEarnings * 100) / 100,
      orders: dayOrders.length,
    });
  }

  return (
    <AdminDashboardClient
      admin={{
        id: admin.id,
        name: admin.name,
        email: admin.email,
      }}
      metrics={metrics}
      orders={orderRows}
      topEvents={topEvents}
      chartData={chartData}
    />
  );
}
