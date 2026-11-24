import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getAdminGlobalMetrics } from '@/lib/admin-metrics';

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
    const metrics = await getAdminGlobalMetrics();

    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      metrics: {
        totalGross: metrics.totalGross,
        totalPlatformFee: metrics.totalPlatformFee,
        totalParentsNet: metrics.totalParentsNet,
        totalGatewayFee: metrics.totalGatewayFee,
        grossToday: metrics.grossToday,
        earningsToday: metrics.earningsToday,
        grossWeek: metrics.grossWeek,
        earningsWeek: metrics.earningsWeek,
        grossMonth: metrics.grossMonth,
        earningsMonth: metrics.earningsMonth,
        totalOrdersCount: metrics.totalOrdersCount,
        approvedOrdersCount: metrics.approvedOrdersCount,
        pendingOrdersCount: metrics.pendingOrdersCount,
        rejectedOrdersCount: metrics.rejectedOrdersCount,
        totalUsers: metrics.totalUsers,
        totalEvents: metrics.totalEvents,
        totalPollVotes: metrics.totalPollVotes,
        totalGuestMessages: metrics.totalGuestMessages,
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
