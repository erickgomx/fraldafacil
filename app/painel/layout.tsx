import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
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
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row text-charcoal-900 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-warm-border flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-warm-border flex items-center justify-between">
            <Link href="/painel" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-charcoal-900 text-cream-50 flex items-center justify-center font-serif text-sm font-medium">
                F
              </span>
              <span className="font-serif text-lg tracking-tight font-medium text-charcoal-900">
                Fralda Fácil
              </span>
            </Link>
          </div>

          {/* Dados do Evento Ativo */}
          <div className="p-4 mx-4 my-4 rounded-xl bg-cream-50/80 border border-warm-border">
            <span className="text-[10px] uppercase font-mono text-charcoal-500 block mb-0.5">
              Página Ativa
            </span>
            <strong className="font-serif text-sm font-medium text-charcoal-900 block truncate">
              {currentEvent.babyName ? `Chá de ${currentEvent.babyName}` : currentEvent.parentsNames}
            </strong>
            <Link
              href={`/${currentEvent.slug}`}
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-700 hover:text-charcoal-900 underline underline-offset-2"
            >
              <span>Ver página pública</span>
              <ExternalLink className="w-3 h-3 text-charcoal-400" />
            </Link>
          </div>

          {/* Links de Navegação */}
          <nav className="px-3 space-y-1">
            <Link
              href="/painel"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-charcoal-500" />
              <span>Visão Geral</span>
            </Link>

            <Link
              href="/painel/presentes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <Gift className="w-4 h-4 text-charcoal-500" />
              <span>Presentes & Fraldas</span>
            </Link>

            <Link
              href="/painel/recados"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <MessageSquare className="w-4 h-4 text-charcoal-500" />
              <span>Livro de Recados</span>
            </Link>

            <Link
              href="/painel/configuracoes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <Settings className="w-4 h-4 text-charcoal-500" />
              <span>Configurações & Chave Pix</span>
            </Link>
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-warm-border">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-medium text-charcoal-900 block truncate">
                {user.name}
              </span>
              <span className="text-[11px] font-mono text-charcoal-400 block truncate">
                {user.email}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
