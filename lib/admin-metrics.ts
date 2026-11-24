/**
 * ============================================================================
 * CONSULTAS AGREGADAS E PERFORMANCE DO PAINEL ADMIN (Fralda Online)
 * ============================================================================
 * Substitui carregamentos completos de tabelas por agregações SQL nativas,
 * projeções mínimas (sem selecionar credenciais OAuth) e limites explícitos
 * nas listagens de auditoria e ranking.
 */

import prisma from '@/lib/prisma';
import { PLATFORM_FEE_RATE } from '@/lib/fees';
import type {
  AdminEventSummary,
  AdminMetricsData,
  AdminOrderRow,
  DailyChartPoint,
} from '@/app/admin/AdminDashboardClient';

export const MAX_ADMIN_AUDIT_ORDERS = 500;
export const MAX_ADMIN_TOP_EVENTS = 200;

interface OrderAggregateRow {
  totalOrdersCount: number;
  approvedOrdersCount: number;
  pendingOrdersCount: number;
  rejectedOrdersCount: number;
  totalGross: number;
  totalPlatformFee: number;
  totalParentsNet: number;
  totalGatewayFee: number;
  grossToday: number;
  earningsToday: number;
  grossWeek: number;
  earningsWeek: number;
  grossMonth: number;
  earningsMonth: number;
  pixOrdersCount: number;
  pixGrossAmount: number;
  cardOrdersCount: number;
  cardGrossAmount: number;
  guestFeeCount: number;
  parentsFeeCount: number;
}

interface EventAggregateRow {
  totalEvents: number;
  mpConnectedCount: number;
  mpPendingCount: number;
  revelacaoCount: number;
  fraldaCount: number;
  ambosCount: number;
}

interface TopEventRawRow {
  id: string;
  slug: string;
  babyName: string | null;
  parentsNames: string;
  eventType: string;
  eventDate: Date;
  mpConnected: boolean;
  ownerName: string;
  ownerEmail: string;
  ordersCount: number;
  grossRaised: number;
  platformEarnings: number;
  createdAt: Date;
}

function getLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getAdminGlobalMetrics(now: Date = new Date()): Promise<AdminMetricsData> {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultNetRate = 1 - PLATFORM_FEE_RATE;

  const [orderAggRows, eventAggRows, totalUsers, totalPollVotes, totalGuestMessages] =
    await Promise.all([
      prisma.$queryRaw<OrderAggregateRow[]>`
        SELECT
          COUNT(*)::int AS "totalOrdersCount",
          COUNT(*) FILTER (WHERE "status" = 'APPROVED')::int AS "approvedOrdersCount",
          COUNT(*) FILTER (WHERE "status" = 'PENDING')::int AS "pendingOrdersCount",
          COUNT(*) FILTER (WHERE "status" IN ('REJECTED', 'REFUNDED', 'CHARGED_BACK'))::int AS "rejectedOrdersCount",
          COALESCE(SUM("amount") FILTER (WHERE "status" = 'APPROVED'), 0)::float8 AS "totalGross",
          COALESCE(SUM(COALESCE("platformFee", "amount" * ${PLATFORM_FEE_RATE})) FILTER (WHERE "status" = 'APPROVED'), 0)::float8 AS "totalPlatformFee",
          COALESCE(SUM(COALESCE("netAmount", "amount" * ${defaultNetRate})) FILTER (WHERE "status" = 'APPROVED'), 0)::float8 AS "totalParentsNet",
          COALESCE(SUM(COALESCE("gatewayFee", 0)) FILTER (WHERE "status" = 'APPROVED'), 0)::float8 AS "totalGatewayFee",
          COALESCE(SUM("amount") FILTER (WHERE "status" = 'APPROVED' AND "createdAt" >= ${startOfToday}), 0)::float8 AS "grossToday",
          COALESCE(SUM(COALESCE("platformFee", "amount" * ${PLATFORM_FEE_RATE})) FILTER (WHERE "status" = 'APPROVED' AND "createdAt" >= ${startOfToday}), 0)::float8 AS "earningsToday",
          COALESCE(SUM("amount") FILTER (WHERE "status" = 'APPROVED' AND "createdAt" >= ${sevenDaysAgo}), 0)::float8 AS "grossWeek",
          COALESCE(SUM(COALESCE("platformFee", "amount" * ${PLATFORM_FEE_RATE})) FILTER (WHERE "status" = 'APPROVED' AND "createdAt" >= ${sevenDaysAgo}), 0)::float8 AS "earningsWeek",
          COALESCE(SUM("amount") FILTER (WHERE "status" = 'APPROVED' AND "createdAt" >= ${thirtyDaysAgo}), 0)::float8 AS "grossMonth",
          COALESCE(SUM(COALESCE("platformFee", "amount" * ${PLATFORM_FEE_RATE})) FILTER (WHERE "status" = 'APPROVED' AND "createdAt" >= ${thirtyDaysAgo}), 0)::float8 AS "earningsMonth",
          COUNT(*) FILTER (WHERE "status" = 'APPROVED' AND "paymentMethod" = 'PIX')::int AS "pixOrdersCount",
          COALESCE(SUM("amount") FILTER (WHERE "status" = 'APPROVED' AND "paymentMethod" = 'PIX'), 0)::float8 AS "pixGrossAmount",
          COUNT(*) FILTER (WHERE "status" = 'APPROVED' AND "paymentMethod" <> 'PIX')::int AS "cardOrdersCount",
          COALESCE(SUM("amount") FILTER (WHERE "status" = 'APPROVED' AND "paymentMethod" <> 'PIX'), 0)::float8 AS "cardGrossAmount",
          COUNT(*) FILTER (WHERE "status" = 'APPROVED' AND "feePayer" = 'GUEST')::int AS "guestFeeCount",
          COUNT(*) FILTER (WHERE "status" = 'APPROVED' AND "feePayer" = 'PARENTS')::int AS "parentsFeeCount"
        FROM "Order"
      `,
      prisma.$queryRaw<EventAggregateRow[]>`
        SELECT
          COUNT(*)::int AS "totalEvents",
          COUNT(*) FILTER (WHERE "mpConnected" = true)::int AS "mpConnectedCount",
          COUNT(*) FILTER (WHERE "mpConnected" = false)::int AS "mpPendingCount",
          COUNT(*) FILTER (WHERE "eventType" = 'REVELACAO')::int AS "revelacaoCount",
          COUNT(*) FILTER (WHERE "eventType" = 'FRALDA')::int AS "fraldaCount",
          COUNT(*) FILTER (WHERE "eventType" = 'AMBOS')::int AS "ambosCount"
        FROM "Event"
      `,
      prisma.user.count(),
      prisma.pollVote.count(),
      prisma.guestMessage.count(),
    ]);

  const ord = orderAggRows[0];
  const evt = eventAggRows[0];

  const totalOrdersCount = Number(ord?.totalOrdersCount ?? 0);
  const approvedOrdersCount = Number(ord?.approvedOrdersCount ?? 0);
  const totalGross = Number(ord?.totalGross ?? 0);

  return {
    totalGross,
    totalPlatformFee: Number(ord?.totalPlatformFee ?? 0),
    totalParentsNet: Number(ord?.totalParentsNet ?? 0),
    totalGatewayFee: Number(ord?.totalGatewayFee ?? 0),
    grossToday: Number(ord?.grossToday ?? 0),
    earningsToday: Number(ord?.earningsToday ?? 0),
    grossWeek: Number(ord?.grossWeek ?? 0),
    earningsWeek: Number(ord?.earningsWeek ?? 0),
    grossMonth: Number(ord?.grossMonth ?? 0),
    earningsMonth: Number(ord?.earningsMonth ?? 0),
    totalOrdersCount,
    approvedOrdersCount,
    pendingOrdersCount: Number(ord?.pendingOrdersCount ?? 0),
    rejectedOrdersCount: Number(ord?.rejectedOrdersCount ?? 0),
    conversionRate: totalOrdersCount > 0 ? (approvedOrdersCount / totalOrdersCount) * 100 : 0,
    averageTicket: approvedOrdersCount > 0 ? totalGross / approvedOrdersCount : 0,
    pixOrdersCount: Number(ord?.pixOrdersCount ?? 0),
    pixGrossAmount: Number(ord?.pixGrossAmount ?? 0),
    cardOrdersCount: Number(ord?.cardOrdersCount ?? 0),
    cardGrossAmount: Number(ord?.cardGrossAmount ?? 0),
    guestFeeCount: Number(ord?.guestFeeCount ?? 0),
    parentsFeeCount: Number(ord?.parentsFeeCount ?? 0),
    totalUsers: Number(totalUsers ?? 0),
    totalEvents: Number(evt?.totalEvents ?? 0),
    mpConnectedCount: Number(evt?.mpConnectedCount ?? 0),
    mpPendingCount: Number(evt?.mpPendingCount ?? 0),
    revelacaoCount: Number(evt?.revelacaoCount ?? 0),
    fraldaCount: Number(evt?.fraldaCount ?? 0),
    ambosCount: Number(evt?.ambosCount ?? 0),
    totalPollVotes: Number(totalPollVotes ?? 0),
    totalGuestMessages: Number(totalGuestMessages ?? 0),
  };
}

export async function getAdminTopEvents(
  limit: number = MAX_ADMIN_TOP_EVENTS
): Promise<AdminEventSummary[]> {
  const rows = await prisma.$queryRaw<TopEventRawRow[]>`
    SELECT
      e."id",
      e."slug",
      e."babyName",
      e."parentsNames",
      e."eventType",
      e."eventDate",
      e."mpConnected",
      u."name" AS "ownerName",
      u."email" AS "ownerEmail",
      COALESCE(agg."ordersCount", 0)::int AS "ordersCount",
      COALESCE(agg."grossRaised", 0)::float8 AS "grossRaised",
      COALESCE(agg."platformEarnings", 0)::float8 AS "platformEarnings",
      e."createdAt"
    FROM "Event" e
    INNER JOIN "User" u ON u."id" = e."userId"
    LEFT JOIN (
      SELECT
        "eventId",
        COUNT(*)::int AS "ordersCount",
        COALESCE(SUM("amount"), 0)::float8 AS "grossRaised",
        COALESCE(SUM(COALESCE("platformFee", "amount" * ${PLATFORM_FEE_RATE})), 0)::float8 AS "platformEarnings"
      FROM "Order"
      WHERE "status" = 'APPROVED'
      GROUP BY "eventId"
    ) agg ON agg."eventId" = e."id"
    ORDER BY COALESCE(agg."grossRaised", 0) DESC, e."createdAt" DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    babyName: row.babyName,
    parentsNames: row.parentsNames,
    eventType: row.eventType,
    eventDate: new Date(row.eventDate).toISOString(),
    mpConnected: Boolean(row.mpConnected),
    ownerName: row.ownerName,
    ownerEmail: row.ownerEmail,
    ordersCount: Number(row.ordersCount ?? 0),
    grossRaised: Number(row.grossRaised ?? 0),
    platformEarnings: Number(row.platformEarnings ?? 0),
    createdAt: new Date(row.createdAt).toISOString(),
  }));
}

export async function getAdminRecentChartData(
  now: Date = new Date()
): Promise<DailyChartPoint[]> {
  const oldestDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  const windowStart = new Date(
    oldestDate.getFullYear(),
    oldestDate.getMonth(),
    oldestDate.getDate()
  );

  const recentApproved = await prisma.order.findMany({
    where: {
      status: 'APPROVED',
      createdAt: { gte: windowStart },
    },
    select: {
      amount: true,
      platformFee: true,
      createdAt: true,
    },
  });

  const buckets = new Map<string, { gross: number; earnings: number; orders: number }>();
  for (const order of recentApproved) {
    const key = getLocalDateKey(new Date(order.createdAt));
    const current = buckets.get(key) || { gross: 0, earnings: 0, orders: 0 };
    current.gross += order.amount;
    current.earnings += order.platformFee ?? order.amount * PLATFORM_FEE_RATE;
    current.orders += 1;
    buckets.set(key, current);
  }

  const points: DailyChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = getLocalDateKey(targetDate);
    const agg = buckets.get(key) || { gross: 0, earnings: 0, orders: 0 };
    const dayStr = String(targetDate.getDate()).padStart(2, '0');
    const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');

    points.push({
      date: targetDate.toISOString().slice(0, 10),
      label: `${dayStr}/${monthStr}`,
      gross: Math.round(agg.gross * 100) / 100,
      earnings: Math.round(agg.earnings * 100) / 100,
      orders: agg.orders,
    });
  }

  return points;
}

export async function getAdminRecentAuditOrders(
  limit: number = MAX_ADMIN_AUDIT_ORDERS
): Promise<AdminOrderRow[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      amount: true,
      netAmount: true,
      platformFee: true,
      gatewayFee: true,
      status: true,
      paymentMethod: true,
      feePayer: true,
      payerName: true,
      payerEmail: true,
      payerPhone: true,
      payerCpf: true,
      pollGuess: true,
      payerMessage: true,
      mpPaymentId: true,
      event: {
        select: {
          slug: true,
          babyName: true,
          parentsNames: true,
          user: {
            select: {
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
  });

  return orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    amount: o.amount,
    netAmount: o.netAmount ?? o.amount * (1 - PLATFORM_FEE_RATE),
    platformFee: o.platformFee ?? o.amount * PLATFORM_FEE_RATE,
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
    mpPaymentId: o.mpPaymentId || null,
  }));
}
