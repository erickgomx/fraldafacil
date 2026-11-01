import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Baby,
  LayoutDashboard,
  Gift,
  MessageSquare,
  Settings,
  ExternalLink,
} from 'lucide-react';
import LogoutButton from './LogoutButton';

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user || user.events.length === 0) {
    redirect('/cadastro');
  }

  const currentEvent = user.events[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Link href="/painel" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-rose-400 flex items-center justify-center text-white shadow-sm">
                <Baby className="w-5 h-5" />
              </span>
              <span className="font-black text-lg tracking-tight text-slate-800">
                Fralda<span className="text-rose-500">Fácil</span>
              </span>
            </Link>
          </div>

          {/* Dados do Evento Ativo */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-gradient-to-br from-sky-50 to-rose-50/50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
              Evento Ativo
            </span>
            <strong className="text-xs font-bold text-slate-800 block truncate">
              {currentEvent.babyName || currentEvent.parentsNames}
            </strong>
            <Link
              href={`/${currentEvent.slug}`}
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>Ver Página Pública</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Links de Navegação */}
          <nav className="px-3 space-y-1">
            <Link
              href="/painel"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-500" />
              <span>Visão Geral</span>
            </Link>

            <Link
              href="/painel/presentes"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <Gift className="w-4 h-4 text-rose-500" />
              <span>Presentes & Fraldas</span>
            </Link>

            <Link
              href="/painel/recados"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>Mural de Recados</span>
            </Link>

            <Link
              href="/painel/configuracoes"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Configurações & Chave Pix</span>
            </Link>
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {user.email}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
