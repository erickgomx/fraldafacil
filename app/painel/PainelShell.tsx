'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
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

export default function PainelShell(props: PainelShellProps) {
  const { userName, eventSlug, children } = props;
  const pathname = usePathname();
  const { locale } = useI18n();
  const dict = painelDict[locale].shell;

  const navItems = [
    { href: '/painel', label: dict.nav.overview },
    { href: '/painel/presentes', label: dict.nav.gifts },
    { href: '/painel/recados', label: dict.nav.messages },
    { href: '/painel/configuracoes', label: dict.nav.settings },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col text-charcoal-900 font-sans overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-warm-border">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between gap-2">
          <Link href="/painel" className="group shrink-0">
            <BrandLogo size="sm" showTagline={false} />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="hidden md:inline text-xs text-charcoal-500 truncate max-w-[160px] mr-1">
              {userName}
            </span>
            <LanguageSwitcher size="sm" />
            <ThemeToggle size="sm" />
            <LogoutButton />
          </div>
        </div>

        <div className="border-t border-warm-border/60">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto">
            <nav className="flex items-center gap-4 sm:gap-6 shrink-0" aria-label={dict.nav.overview}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`border-b-2 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-charcoal-900 text-charcoal-900 font-semibold'
                        : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href={`/${eventSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:underline underline-offset-2 whitespace-nowrap py-2 shrink-0"
            >
              <span>{dict.openPublicPage}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
