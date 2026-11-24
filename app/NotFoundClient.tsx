'use client';

import Link from 'next/link';
import { ArrowRight, Home, Search } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from '@/components/LanguageProvider';
import { commonDict } from '@/lib/i18n/dictionaries/common';

export default function NotFoundClient() {
  const { locale } = useI18n();
  const dict = commonDict[locale].notFound;

  return (
    <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6 pt-20 sm:pt-12 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher size="sm" />
        <ThemeToggle size="sm" />
      </div>

      <div className="w-full max-w-md text-center space-y-6">
        <Link href="/" className="inline-flex justify-center group">
          <BrandLogo size="md" />
        </Link>

        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-warm-border shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cream-100 border border-warm-border text-charcoal-700 mx-auto flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta block mb-1">
              {dict.codeLabel}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
              {dict.title}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 font-sans mt-2 leading-relaxed">
              {dict.description}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{dict.goHome}</span>
            </Link>

            <Link
              href="/demo"
              className="py-2.5 px-4 rounded-xl text-xs font-medium bg-cream-50 text-charcoal-800 border border-warm-border hover:bg-cream-100 transition inline-flex items-center justify-center gap-1.5"
            >
              <span>{dict.viewDemo}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
