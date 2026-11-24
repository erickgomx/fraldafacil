'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  DollarSign,
  CalendarHeart,
  Users,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
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

export default function AdminShell({
  adminName,
  adminEmail,
  children,
}: AdminShellProps) {
  const { locale } = useI18n();
  const dict = adminDict[locale].shell;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = (
    <nav className="px-3 space-y-1">
      <Link
        href="/admin"
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-800 bg-slate-100/80 hover:bg-slate-100 transition"
      >
        <LayoutDashboard className="w-4 h-4 text-rose-600" />
        <span>{dict.nav.overview}</span>
      </Link>

      <a
        href="#relatorios-financeiros"
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
      >
        <DollarSign className="w-4 h-4 text-emerald-600" />
        <span>{dict.nav.earnings}</span>
      </a>

      <a
        href="#top-eventos"
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
      >
        <CalendarHeart className="w-4 h-4 text-indigo-600" />
        <span>{dict.nav.topEvents}</span>
      </a>

      <a
        href="#transacoes-gerais"
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
      >
        <Users className="w-4 h-4 text-amber-600" />
        <span>{dict.nav.ordersAudit}</span>
      </a>
    </nav>
  );

  const organizerLink = (
    <div className="px-3 mt-4 md:mt-6">
      <div className="pt-4 border-t border-slate-100">
        <Link
          href="/painel"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition group"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            {dict.nav.organizerPanel}
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Sidebar Administrativa */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo com Selo ADM, Seletor de Idioma e Seletor de Tema */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <Link href="/admin" className="group shrink-0">
              <BrandLogo size="sm" showTagline={false} />
            </Link>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide text-slate-600 bg-slate-100 border border-slate-200">
                <ShieldCheck className="w-3 h-3 text-slate-500" />
                {dict.badge}
              </span>
              <LanguageSwitcher size="sm" />
              <ThemeToggle size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? dict.closeMenu : dict.openMenu}
                aria-expanded={mobileMenuOpen}
                className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Indicador de Status Minimalista */}
          <div className="hidden md:flex px-5 py-3 items-center gap-2 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono uppercase tracking-wider text-[10px] text-slate-500">
              {dict.activeSession}
            </span>
          </div>

          {/* Links de Navegação Desktop */}
          <div className="hidden md:block">
            {navLinks}
            {organizerLink}
          </div>

          {/* Navegação Mobile Expansível */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-100 bg-white">
              <div className="mx-3 mb-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono uppercase tracking-wider text-[10px] text-slate-500">
                      {dict.activeSession}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 block truncate">
                    {adminName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 block truncate">
                    {adminEmail}
                  </span>
                </div>
                <LogoutButton />
              </div>
              {navLinks}
              {organizerLink}
            </div>
          )}
        </div>

        {/* Rodapé da Sidebar com Identificação do Super Admin */}
        <div className="hidden md:block p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-semibold text-slate-900 block truncate">
                {adminName}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block truncate">
                {adminEmail}
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
