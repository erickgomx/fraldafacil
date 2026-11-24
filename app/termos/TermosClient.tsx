'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from '@/components/LanguageProvider';
import { legalDict } from '@/lib/i18n/dictionaries/legal';

export default function TermosClient() {
  const { locale } = useI18n();
  const root = legalDict[locale];
  const dict = root.terms;

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 font-sans">
      <header className="border-b border-warm-border bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <BrandLogo size="sm" />
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{root.backHome}</span>
            </Link>
            <LanguageSwitcher size="sm" />
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-warm-border text-charcoal-600 text-xs mb-4">
            <FileText className="w-3.5 h-3.5 text-charcoal-700" />
            <span>{dict.badge}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight mb-4">
            {dict.title}
          </h1>

          <p className="text-sm text-charcoal-500 font-sans leading-relaxed max-w-2xl">
            {dict.intro}
          </p>

          <p className="text-xs text-charcoal-400 font-mono mt-3">
            {root.lastUpdatedLabel} {root.lastUpdatedValue}
          </p>
        </div>

        <div className="space-y-10 bg-white rounded-2xl p-8 sm:p-12 border border-warm-border shadow-subtle text-charcoal-700 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">01.</span>
              <span>{dict.s1Title}</span>
            </h2>
            <p>
              {dict.s1P1Before ? `${dict.s1P1Before} ` : ''}
              <strong>{dict.s1P1Brand}</strong> {dict.s1P1Mid}{' '}
              <a href="https://fralda.online" className="text-charcoal-900 underline font-medium">
                fralda.online
              </a>
              {dict.s1P1After}
            </p>
            <p>{dict.s1P2}</p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">02.</span>
              <span>{dict.s2Title}</span>
            </h2>
            <p>
              {dict.s2IntroBefore} <strong>{dict.s2IntroBold}</strong> {dict.s2IntroAfter}
            </p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-600">
              {dict.s2List.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{dict.s2Outro}</p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">03.</span>
              <span>{dict.s3Title}</span>
            </h2>
            <p>{dict.s3Intro}</p>

            <div className="p-4 rounded-xl bg-cream-50 border border-warm-border/80 space-y-2 mt-2">
              <p className="font-medium text-charcoal-900 text-xs font-mono uppercase">
                {dict.s3BoxTitle}
              </p>
              <ul className="list-disc list-inside space-y-1 text-charcoal-600 text-xs">
                {dict.s3BoxItems.map((item) => (
                  <li key={item.label}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-3">{dict.s3OptionsIntro}</p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-600">
              {dict.s3Options.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong> {item.text}
                </li>
              ))}
            </ul>
            <p>
              {dict.s3OutroBefore} <strong>{dict.s3OutroMp}</strong> {dict.s3OutroAfter}
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">04.</span>
              <span>{dict.s4Title}</span>
            </h2>
            <p>{dict.s4Intro}</p>
            <div className="space-y-2 mt-2">
              {dict.s4Forbidden.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-dusty-rose-light border border-dusty-rose/20 text-xs text-dusty-rose"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-2">{dict.s4Outro}</p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">05.</span>
              <span>{dict.s5Title}</span>
            </h2>
            <p>
              {dict.s5Body}{' '}
              <strong className="text-charcoal-900 font-mono text-xs">suporte@fralda.online</strong>.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">06.</span>
              <span>{dict.s6Title}</span>
            </h2>
            <p>{dict.s6Body}</p>
          </section>
        </div>

        <div className="mt-12 text-center text-xs text-charcoal-500 font-sans">
          <p>
            {dict.footerPrompt}{' '}
            <a href="mailto:suporte@fralda.online" className="text-charcoal-900 font-medium underline">
              suporte@fralda.online
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
