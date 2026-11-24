'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from '@/components/LanguageProvider';
import { legalDict } from '@/lib/i18n/dictionaries/legal';

export default function PrivacidadeClient() {
  const { locale } = useI18n();
  const root = legalDict[locale];
  const dict = root.privacy;

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
            <Shield className="w-3.5 h-3.5 text-charcoal-700" />
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
              {dict.s1P1Before} <strong>{dict.s1P1Brand}</strong> {dict.s1P1Mid}{' '}
              <a href="https://fralda.online" className="text-charcoal-900 underline font-medium">
                fralda.online
              </a>
              {dict.s1P1Between} <strong>{dict.s1P1Bold}</strong> {dict.s1P1After}
            </p>
            <p>
              {dict.s1P2}{' '}
              <strong className="text-charcoal-900 font-mono text-xs">suporte@fralda.online</strong>.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">02.</span>
              <span>{dict.s2Title}</span>
            </h2>
            <p>{dict.s2Intro}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl bg-cream-50 border border-warm-border/80">
                <h3 className="font-medium text-charcoal-900 text-xs font-mono uppercase mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-charcoal-600" />
                  <span>{dict.s2ParentsTitle}</span>
                </h3>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 text-xs">
                  {dict.s2ParentsItems.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-warm-border/80">
                <h3 className="font-medium text-charcoal-900 text-xs font-mono uppercase mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-charcoal-600" />
                  <span>{dict.s2GuestsTitle}</span>
                </h3>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 text-xs">
                  {dict.s2GuestsItems.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">03.</span>
              <span>{dict.s3Title}</span>
            </h2>
            <p>
              {dict.s3P1Before} <strong>{dict.s3P1Bold}</strong>
              {dict.s3P1After}
            </p>
            <p>{dict.s3P2}</p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">04.</span>
              <span>{dict.s4Title}</span>
            </h2>
            <p>{dict.s4Intro}</p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-600">
              {dict.s4Items.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong> {item.text}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">05.</span>
              <span>{dict.s5Title}</span>
            </h2>
            <p>
              {dict.s5Before} <strong>{dict.s5Bold}</strong>
              {dict.s5After}
            </p>
            <div className="space-y-2 mt-2">
              {dict.s5Operators.map((op) => (
                <div key={op.label} className="p-3 bg-cream-50/60 rounded-lg border border-warm-border/60 text-xs">
                  <strong>{op.label}</strong> {op.text}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">06.</span>
              <span>{dict.s6Title}</span>
            </h2>
            <p>{dict.s6Intro}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {dict.s6Rights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-cream-50/40 border border-warm-border/40 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">
              {dict.s6OutroBefore}{' '}
              <strong className="text-charcoal-900 font-mono text-xs">suporte@fralda.online</strong>{' '}
              {dict.s6OutroAfter}
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">07.</span>
              <span>{dict.s7Title}</span>
            </h2>
            <p>{dict.s7P1}</p>
            <p>
              {dict.s7P2Before}
              <code className="bg-cream-100 px-1.5 py-0.5 rounded text-xs font-mono">auth_token</code>{' '}
              {dict.s7P2Mid1}{' '}
              <code className="bg-cream-100 px-1.5 py-0.5 rounded text-xs font-mono">HttpOnly</code>{' '}
              {dict.s7P2And}{' '}
              <code className="bg-cream-100 px-1.5 py-0.5 rounded text-xs font-mono">Secure</code>
              {dict.s7P2After}
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">08.</span>
              <span>{dict.s8Title}</span>
            </h2>
            <p>{dict.s8Body}</p>
          </section>
        </div>

        <div className="mt-12 text-center text-xs text-charcoal-500 font-sans">
          <p>{dict.footerTitle}</p>
          <p className="mt-1">
            {dict.footerContactPrefix}{' '}
            <a href="mailto:suporte@fralda.online" className="text-charcoal-900 font-medium underline">
              suporte@fralda.online
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
