'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Gift,
  MessageSquare,
  Settings,
  ExternalLink,
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/LanguageProvider';
import { painelDict } from '@/lib/i18n/dictionaries/painel';

interface PainelShellProps {
  userName: string;
  userEmail: string;
  eventSlug: string;
  eventBabyName: string | null;
  eventParentsNames: string;
  children: React.ReactNode;
}

export default function PainelShell({
  userName,
  userEmail,
  eventSlug,
  eventBabyName,
  eventParentsNames,
  children,
}: PainelShellProps) {
  const { locale } = useI18n();
  const dict = painelDict[locale].shell;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row text-charcoal-900 font-sans">
      <aside className="w-full md:w-64 bg-white border-r border-warm-border flex flex-col justify-between shrink-0">
        <div>
          <div className="p-4 border-b border-warm-border flex flex-wrap items-center justify-between gap-2">
            <Link href="/painel" className="group shrink-0">
              <BrandLogo size="sm" showTagline={false} />
            </Link>
            <div className="flex items-center gap-1.5 shrink-0">
              <LanguageSwitcher size="sm" />
              <ThemeToggle size="sm" />
            </div>
          </div>

          <div className="p-4 mx-4 my-4 rounded-xl bg-cream-50/80 border border-warm-border">
            <span className="text-[10px] uppercase font-mono text-charcoal-500 block mb-0.5">
              {dict.activePageLabel}
            </span>
            <strong className="font-serif text-sm font-medium text-charcoal-900 block truncate">
              {eventBabyName ? `${dict.showerPrefix} ${eventBabyName}` : eventParentsNames}
            </strong>
            <Link
              href={`/${eventSlug}`}
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-700 hover:text-charcoal-900 underline underline-offset-2"
            >
              <span>{dict.viewPublicPage}</span>
              <ExternalLink className="w-3 h-3 text-charcoal-400" />
            </Link>
          </div>

          <nav className="px-3 space-y-1">
            <Link
              href="/painel"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-charcoal-500" />
              <span>{dict.nav.overview}</span>
            </Link>

            <Link
              href="/painel/presentes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <Gift className="w-4 h-4 text-charcoal-500" />
              <span>{dict.nav.gifts}</span>
            </Link>

            <Link
              href="/painel/recados"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <MessageSquare className="w-4 h-4 text-charcoal-500" />
              <span>{dict.nav.messages}</span>
            </Link>

            <Link
              href="/painel/configuracoes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-cream-100/70 hover:text-charcoal-900 transition"
            >
              <Settings className="w-4 h-4 text-charcoal-500" />
              <span>{dict.nav.settings}</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-warm-border">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-medium text-charcoal-900 block truncate">
                {userName}
              </span>
              <span className="text-[11px] font-mono text-charcoal-400 block truncate">
                {userEmail}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
