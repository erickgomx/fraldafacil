import { redirect } from 'next/navigation';
import { getSession, getAdminSession } from '@/lib/auth';
import Link from 'next/link';
import {
  LayoutDashboard,
  DollarSign,
  CalendarHeart,
  Users,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import LogoutButton from '@/app/painel/LogoutButton';
import BrandLogo from '@/components/BrandLogo';

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Sidebar Administrativa */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo com Selo ADM */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Link href="/admin" className="group">
              <BrandLogo size="sm" showTagline={false} />
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldCheck className="w-3 h-3 text-rose-600" />
              Super Admin
            </span>
          </div>

          {/* Banner de Segurança */}
          <div className="p-3.5 mx-4 my-4 rounded-xl bg-slate-900 text-white shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase">
                Acesso Restrito 100% Seguro
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Sessão autenticada e validada em tempo real com o banco de dados.
            </p>
          </div>

          {/* Links de Navegação */}
          <nav className="px-3 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-800 bg-slate-100/80 hover:bg-slate-100 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-rose-600" />
              <span>Visão Geral & Faturamento</span>
            </Link>

            <a
              href="#relatorios-financeiros"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Ganhos & Transações</span>
            </a>

            <a
              href="#top-eventos"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <CalendarHeart className="w-4 h-4 text-indigo-600" />
              <span>Ranking de Chás</span>
            </a>

            <a
              href="#transacoes-gerais"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Auditoria de Pedidos</span>
            </a>
          </nav>

          {/* Atalho para o painel de organizador */}
          <div className="px-3 mt-6">
            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/painel"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition group"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                  Painel de Organizador
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé da Sidebar com Identificação do Super Admin */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-semibold text-slate-900 block truncate">
                {admin.name}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block truncate">
                {admin.email}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
