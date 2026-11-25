'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import LogoutButton from '@/app/painel/LogoutButton';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/LanguageProvider';
import { adminDict } from '@/lib/i18n/dictionaries/admin';

interface AdminShellProps {
  adminName: string;
  adminEmail: string;
  children: React.ReactNode;
}

type SectionKey = 'overview' | 'earnings' | 'topEvents' | 'ordersAudit';

export default function AdminShell({
  adminName,
  adminEmail,
  children,
}: AdminShellProps) {
  const { locale } = useI18n();
  const dict = adminDict[locale].shell;
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');

  const navItems: { key: SectionKey; href: string; label: string }[] = [
    { key: 'overview', href: '#relatorios-financeiros', label: dict.nav.overview },
    { key: 'earnings', href: '#evolucao-receita', label: dict.nav.earnings },
    { key: 'topEvents', href: '#top-eventos', label: dict.nav.topEvents },
    { key: 'ordersAudit', href: '#transacoes-gerais', label: dict.nav.ordersAudit },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col text-charcoal-900 font-sans overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-warm-border">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/admin" className="group shrink-0">
              <BrandLogo size="sm" showTagline={false} />
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-cream-100 text-charcoal-600 border border-warm-border">
              {dict.badge}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span
              title={adminEmail}
              className="hidden md:inline text-xs text-charcoal-500 truncate max-w-[160px] mr-1"
            >
              {adminName}
            </span>
            <LanguageSwitcher size="sm" />
            <ThemeToggle size="sm" />
            <LogoutButton />
          </div>
        </div>

        <div className="border-t border-warm-border/60">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto">
            <nav className="flex items-center gap-4 sm:gap-6 shrink-0" aria-label={dict.nav.overview}>
              {navItems.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setActiveSection(item.key)}
                    className={`border-b-2 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-charcoal-900 text-charcoal-900 font-semibold'
                        : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <Link
              href="/painel"
              className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:underline underline-offset-2 whitespace-nowrap py-2 shrink-0"
            >
              <span>{dict.nav.organizerPanel}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
