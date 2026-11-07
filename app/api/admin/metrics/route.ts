import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { error: 'Não encontrado.' },
      { status: 404 }
    );
  }

  try {
    const [orders, events, totalUsers, totalPollVotes, totalGuestMessages] = await Promise.all([
      // Minimização de dados LGPD: não carrega CPF, telefone ou e-mail de pagadores em queries estatísticas
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          netAmount: true,
          platformFee: true,
          gatewayFee: true,
          createdAt: true,
          event: {
            select: {
              slug: true,
              babyName: true,
              parentsNames: true,
              eventType: true,
              mpConnected: true,
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

    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      metrics: {
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
        totalUsers,
        totalEvents: events.length,
        totalPollVotes,
        totalGuestMessages,
      },
    });
  } catch (error) {
    console.error('Erro na API de métricas administrativas:', error);
    return NextResponse.json(
      { error: 'Falha ao processar métricas do sistema.' },
      { status: 500 }
    );
  }
}
