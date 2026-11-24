/**
 * ============================================================================
 * LAYOUT DA ÁREA ADMINISTRATIVA (/admin/layout)
 * ============================================================================
 * Shell de navegação da área de administração:
 * - Validação em nível de servidor da sessão de Superusuário ('ADMIN').
 * - Barra lateral fixa com atalhos de auditoria de pedidos, relatórios e ranking de eventos.
 * - Selo de segurança visual e atalho de retorno ao Painel de Organizador.
 */

import { redirect } from 'next/navigation';
import { getSession, getAdminSession } from '@/lib/auth';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const admin = await getAdminSession();

  if (!admin) {
    redirect('/painel');
  }

  return (
    <AdminShell adminName={admin.name} adminEmail={admin.email}>
      {children}
    </AdminShell>
  );
}
