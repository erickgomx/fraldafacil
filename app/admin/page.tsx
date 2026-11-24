/**
 * ============================================================================
 * DASHBOARD DE ADMINISTRAÇÃO E AUDITORIA GERAL (/admin)
 * ============================================================================
 * Painel executivo exclusivo para administradores com papel 'ADMIN':
 * - Verificação de autenticação e papel de acesso no banco de dados.
 * - Agregações SQL paralelas para KPIs globais sem carregar tabelas inteiras.
 * - Top eventos e pedidos recentes com projeções mínimas (sem tokens OAuth).
 * - Recortes diários (últimos 30 dias) para gráficos analíticos de desempenho.
 */

import { redirect } from 'next/navigation';
import { getSession, getAdminSession } from '@/lib/auth';
import {
  getAdminGlobalMetrics,
  getAdminRecentAuditOrders,
  getAdminRecentChartData,
  getAdminTopEvents,
} from '@/lib/admin-metrics';
import AdminDashboardClient from './AdminDashboardClient';

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

  const now = new Date();
  const [metrics, orderRows, topEvents, chartData] = await Promise.all([
    getAdminGlobalMetrics(now),
    getAdminRecentAuditOrders(),
    getAdminTopEvents(),
    getAdminRecentChartData(now),
  ]);

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
