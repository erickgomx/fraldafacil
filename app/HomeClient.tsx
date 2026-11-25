'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  QrCode,
  Share2,
  ShieldCheck,
  Gift,
  MessageSquareHeart,
  Ticket,
  Menu,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MercadoPagoLogo from '@/components/MercadoPagoLogo';
import HeroPreviewCard from '@/components/HeroPreviewCard';
import FaqAccordion from '@/components/FaqAccordion';
import { useI18n } from '@/components/LanguageProvider';
import { landingDict } from '@/lib/i18n/dictionaries/landing';

export default function HomeClient() {
  const { locale } = useI18n();
  const dict = landingDict[locale];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 overflow-x-hidden">
      {/* Topo / Navegação */}
      <header className="sticky top-0 z-40 bg-cream-50/85 backdrop-blur-md border-b border-warm-border/70">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <Link href="/" className="group shrink-0">
            <BrandLogo size="sm" showTagline={false} className="sm:hidden" />
            <BrandLogo size="md" className="hidden sm:inline-flex" />
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0" aria-label={dict.nav.ariaLabel}>
            <Link
              href="#taxas"
              className="hidden lg:inline-flex text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900 px-2.5 py-2 transition whitespace-nowrap"
            >
              {dict.nav.fees}
            </Link>
            <Link
              href="/demo"
              className="hidden md:inline-flex text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900 px-3 py-2 transition whitespace-nowrap"
            >
              {dict.nav.viewDemo}
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-charcoal-700 hover:text-charcoal-900 px-3 py-1.5 transition whitespace-nowrap"
            >
              {dict.nav.login}
            </Link>
            <Link
              href="/cadastro"
              className="hidden sm:flex text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle whitespace-nowrap shrink-0 items-center gap-1.5"
            >
              <span>{dict.nav.createShower}</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300" aria-hidden="true" />
            </Link>
            <LanguageSwitcher size="sm" />
            <ThemeToggle size="sm" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={dict.nav.ariaLabel}
              aria-expanded={mobileMenuOpen}
              className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg border border-warm-border/80 bg-white/80 text-charcoal-700 hover:bg-cream-100 transition shrink-0"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-warm-border/70 bg-cream-50/95 backdrop-blur-md px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-center">
              <Link
                href="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-white border border-warm-border text-charcoal-700 hover:bg-cream-100 transition"
              >
                {dict.nav.viewDemo}
              </Link>
              <Link
                href="#taxas"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-white border border-warm-border text-charcoal-700 hover:bg-cream-100 transition"
              >
                {dict.nav.fees}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-xs font-medium text-center bg-white border border-warm-border text-charcoal-800 hover:bg-cream-100 transition"
              >
                {dict.nav.login}
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition flex items-center justify-center gap-1.5 shadow-subtle"
              >
                <span>{dict.nav.createShower}</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-300" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-10 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-6 border-b border-warm-border/60 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[360px] rounded-full bg-gradient-to-tr from-dusty-rose-light/70 via-cream-200/50 to-dusty-blue-light/70 dark:from-dusty-rose/10 dark:via-transparent dark:to-dusty-blue/10 blur-3xl opacity-80 dark:opacity-30"
          />

          <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.35rem] text-charcoal-900 font-medium tracking-[-0.025em] leading-[1.12] mb-6">
                {dict.hero.titlePrefix}{' '}
                <span className="italic text-terracotta">{dict.hero.titleHighlight}</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                {dict.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/cadastro"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-elevated flex items-center justify-center gap-2.5 group"
                >
                  <span>{dict.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>

                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-medium bg-white text-charcoal-800 border border-warm-border hover:bg-cream-100 transition shadow-subtle flex items-center justify-center gap-2"
                >
                  <span>{dict.hero.secondaryCta}</span>
                </Link>
              </div>

              <div className="mt-10 pt-7 border-t border-warm-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto lg:mx-0">
                {dict.hero.pills.map((pill) => (
                  <div key={pill} className="flex items-center gap-2.5 text-xs text-charcoal-600">
                    <span className="w-5 h-5 rounded-full bg-cream-200/80 text-charcoal-800 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" aria-hidden="true" />
                    </span>
                    <span>{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            <HeroPreviewCard />
          </div>
        </section>

        {/* SEÇÃO DE CONTRASTE VISUAL */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white border-b border-warm-border/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-terracotta font-semibold block mb-2.5">
                {dict.contrast.eyebrow}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight mb-4">
                {dict.contrast.title}
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 font-sans">
                {dict.contrast.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-cream-50/70 dark:bg-[#161412] border border-warm-border dark:border-[#2A2521] p-7 sm:p-8">
                <span className="inline-block text-xs font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400 mb-4">
                  {dict.contrast.traditional.badge}
                </span>
                <h3 className="font-serif text-xl text-charcoal-800 dark:text-stone-200 mb-5">
                  {dict.contrast.traditional.title}
                </h3>
                <ul className="space-y-3.5 text-sm text-charcoal-600 dark:text-stone-400">
                  {dict.contrast.traditional.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-charcoal-600 dark:text-stone-400 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3" aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-cream-100/70 dark:bg-[#201C19] border-2 border-charcoal-900 dark:border-stone-400/80 p-7 sm:p-8 shadow-card relative">
                <span className="inline-block text-xs font-mono uppercase tracking-wider text-terracotta dark:text-[#E8957D] font-semibold mb-4">
                  {dict.contrast.online.badge}
                </span>
                <h3 className="font-serif text-xl text-charcoal-900 dark:text-[#FAF8F5] mb-5">
                  {dict.contrast.online.title}
                </h3>
                <ul className="space-y-3.5 text-sm text-charcoal-800 dark:text-[#F0ECE4]">
                  {dict.contrast.online.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-charcoal-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-400/40 text-white dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA EM 3 PASSOS */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-cream-50 border-b border-warm-border/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-600 block mb-2">
                {dict.steps.eyebrow}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
                {dict.steps.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                      <Gift className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-charcoal-600">{dict.steps.cards[0].step}</span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                    {dict.steps.cards[0].title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {dict.steps.cards[0].description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-warm-border/60 text-xs font-mono text-charcoal-600">
                  {dict.steps.cards[0].footer}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                      <Share2 className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-charcoal-600">{dict.steps.cards[1].step}</span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                    {dict.steps.cards[1].title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {dict.steps.cards[1].description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-warm-border/60 text-xs font-mono text-dusty-blue font-medium">
                  {dict.steps.cards[1].footer}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                      <QrCode className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-charcoal-600">{dict.steps.cards[2].step}</span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                    {dict.steps.cards[2].title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {dict.steps.cards[2].description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-warm-border/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-terracotta font-medium">{dict.steps.cards[2].footer}</span>
                  <MercadoPagoLogo size="xs" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERMEDIAÇÃO FINANCEIRA & SEGURANÇA BANCÁRIA */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FAF7F2] dark:bg-[#151311] border-b border-warm-border/60">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-white dark:bg-[#1C1917] border border-warm-border dark:border-[#2D2824] p-7 sm:p-10 shadow-subtle relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-warm-border/60">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 dark:bg-stone-800/80 border border-warm-border dark:border-stone-700 text-xs text-charcoal-700 dark:text-stone-300 mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-wider text-[11px]">{dict.security.badge}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-900 dark:text-stone-100 font-normal">
                    {dict.security.title}
                  </h2>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400">
                    {dict.security.processorLabel}
                  </span>
                  <MercadoPagoLogo size="md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg text-charcoal-900 dark:text-stone-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" aria-hidden="true" />
                    {dict.security.leftTitle}
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-stone-400 leading-relaxed font-sans">
                    {dict.security.leftBody}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg text-charcoal-900 dark:text-stone-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" aria-hidden="true" />
                    {dict.security.rightTitle}
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-stone-400 leading-relaxed font-sans">
                    {dict.security.rightBody}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-warm-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal-600 dark:text-stone-400">
                {dict.security.checks.map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PILARES VISUAIS DO PRODUTO */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white border-b border-warm-border/60">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-600 block mb-2">
                {dict.pillars.eyebrow}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
                {dict.pillars.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-charcoal-600 block mb-3">{dict.pillars.card1.tag}</span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                    {dict.pillars.card1.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                    {dict.pillars.card1.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {dict.pillars.card1.samples.map((sample) => (
                    <div key={sample.title} className="bg-white rounded-xl p-3 border border-warm-border text-center">
                      <span className="block text-xs font-medium text-charcoal-800">{sample.title}</span>
                      <span className="block text-xs font-mono text-terracotta font-semibold mt-0.5">{sample.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-charcoal-600 block mb-3">{dict.pillars.card2.tag}</span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                    {dict.pillars.card2.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                    {dict.pillars.card2.description}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-warm-border">
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-dusty-blue">{dict.pillars.card2.boyLabel}</span>
                    <span className="text-dusty-rose">{dict.pillars.card2.girlLabel}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex bg-cream-100">
                    <div className="w-[58%] bg-dusty-blue" />
                    <div className="w-[42%] bg-dusty-rose" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-charcoal-600 block mb-3">
                    {dict.pillars.cardRaffle.tag}
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                    {dict.pillars.cardRaffle.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                    {dict.pillars.cardRaffle.description}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-warm-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-cream-100 border border-warm-border text-terracotta flex items-center justify-center shrink-0">
                      <Ticket className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-charcoal-900 truncate">
                        {dict.pillars.cardRaffle.prizeLabel}
                      </span>
                      <span className="block text-[11px] text-charcoal-500 truncate">
                        {dict.pillars.cardRaffle.prizeHint}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-charcoal-900 text-white font-mono text-xs font-semibold tabular-nums shrink-0">
                    {dict.pillars.cardRaffle.ticketSample}
                  </span>
                </div>
              </div>

              <div className="md:col-span-6 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-charcoal-600 block mb-3">{dict.pillars.card3.tag}</span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                    {dict.pillars.card3.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                    {dict.pillars.card3.description}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-warm-border shadow-subtle">
                  <div className="flex items-center gap-2 text-xs font-medium text-charcoal-900 mb-2">
                    <MessageSquareHeart className="w-4 h-4 text-terracotta" aria-hidden="true" />
                    <span>{dict.pillars.card3.author}</span>
                    <span className="ml-auto text-[11px] font-mono text-charcoal-600">{dict.pillars.card3.badge}</span>
                  </div>
                  <p className="text-xs text-charcoal-600 italic leading-relaxed">
                    &ldquo;{dict.pillars.card3.quote}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TAXAS TRANSPARENTES */}
        <section id="taxas" className="py-20 sm:py-24 px-4 sm:px-6 bg-[#FAF7F2] dark:bg-[#151311] border-b border-warm-border/60 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-terracotta dark:text-[#E8957D] font-semibold block mb-2.5">
                {dict.fees.eyebrow}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 dark:text-[#FAF8F5] font-normal tracking-tight mb-4">
                {dict.fees.title}
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 dark:text-stone-300 font-sans leading-relaxed">
                {dict.fees.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-white dark:bg-[#1C1917] border border-warm-border dark:border-[#2D2824] p-7 shadow-subtle flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[11px] font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400 mb-3">
                    {dict.fees.freeCard.badge}
                  </span>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-serif text-3xl text-charcoal-900 dark:text-[#FAF8F5] font-medium">
                      {dict.fees.freeCard.price}
                    </span>
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                      {dict.fees.freeCard.priceTag}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-600 dark:text-stone-300 leading-relaxed font-sans mb-5">
                    {dict.fees.freeCard.description}
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-charcoal-700 dark:text-stone-300 pt-4 border-t border-warm-border/60 dark:border-[#2D2824]">
                  {dict.fees.freeCard.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-cream-100/70 dark:bg-[#201C19] border-2 border-charcoal-900 dark:border-stone-400/80 p-7 shadow-card flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-terracotta dark:text-[#E8957D] font-semibold">
                      {dict.fees.guestCard.badge}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">
                      {dict.fees.guestCard.recommended}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 dark:text-[#FAF8F5] mb-2.5">
                    {dict.fees.guestCard.title}
                  </h3>
                  <p className="text-sm text-charcoal-700 dark:text-stone-300 leading-relaxed font-sans mb-5">
                    {dict.fees.guestCard.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-warm-border/70 dark:border-[#332D28] text-xs font-sans">
                  <div className="rounded-xl bg-white dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      {dict.fees.guestCard.pixLabel}
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      {dict.fees.guestCard.pixTextBefore} <strong>{dict.fees.guestCard.pixPaid}</strong> {dict.fees.guestCard.pixTextMid}{' '}
                      <strong>{dict.fees.guestCard.pixReceived}</strong>
                    </span>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      {dict.fees.guestCard.cardLabel}
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      {dict.fees.guestCard.cardTextBefore} <strong>{dict.fees.guestCard.cardPaid}</strong> {dict.fees.guestCard.cardTextMid}{' '}
                      <strong>{dict.fees.guestCard.cardReceived}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#1C1917] border border-warm-border dark:border-[#2D2824] p-7 shadow-subtle flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[11px] font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400 mb-3">
                    {dict.fees.parentsCard.badge}
                  </span>
                  <h3 className="font-serif text-xl text-charcoal-900 dark:text-[#FAF8F5] mb-2.5">
                    {dict.fees.parentsCard.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-stone-300 leading-relaxed font-sans mb-5">
                    {dict.fees.parentsCard.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-warm-border/60 dark:border-[#2D2824] text-xs font-sans">
                  <div className="rounded-xl bg-cream-50 dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      {dict.fees.parentsCard.pixLabel}
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      {dict.fees.parentsCard.pixPrefix} <strong>{dict.fees.parentsCard.pixNet}</strong>
                    </span>
                  </div>
                  <div className="rounded-xl bg-cream-50 dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      {dict.fees.parentsCard.cardLabel}
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      {dict.fees.parentsCard.cardPrefix} <strong>{dict.fees.parentsCard.cardNet}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-charcoal-600 dark:text-stone-400 font-sans">
              {dict.fees.footnote}
            </p>
          </div>
        </section>

        {/* DÚVIDAS FREQUENTES */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-cream-50 border-b border-warm-border/60">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-600 block mb-2">
                {dict.faq.eyebrow}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
                {dict.faq.title}
              </h2>
            </div>

            <FaqAccordion items={dict.faq.items} />
          </div>
        </section>

        {/* CTA FINAL DE DESTAQUE */}
        <section className="py-20 px-4 sm:px-6 bg-white dark:bg-[#12100E]">
          <div className="max-w-4xl mx-auto rounded-3xl bg-charcoal-900 text-white p-8 sm:p-14 text-center shadow-lift relative overflow-hidden dark:!bg-[#1A1715] dark:border dark:border-[#332D28]">
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/15 text-stone-200 dark:!text-[#E8E2D8] text-xs font-mono mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E3A088]" aria-hidden="true" />
                {dict.ctaFinal.badge}
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl text-white dark:!text-[#FAF8F5] font-normal tracking-tight mb-4">
                {dict.ctaFinal.title}
              </h2>

              <p className="text-sm sm:text-base text-stone-300 dark:!text-[#D6CEC3] font-sans leading-relaxed mb-8">
                {dict.ctaFinal.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/cadastro"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-semibold bg-cream-50 text-charcoal-900 hover:bg-white transition flex items-center justify-center gap-2 dark:!bg-[#FAF8F5] dark:!text-[#1C1917]"
                >
                  <span className="dark:!text-[#1C1917]">{dict.ctaFinal.primary}</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-900 dark:!text-[#1C1917]" aria-hidden="true" />
                </Link>
                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-medium bg-white/10 text-white hover:bg-white/15 border border-white/15 transition flex items-center justify-center dark:!text-[#FAF8F5] dark:border-white/20"
                >
                  {dict.ctaFinal.secondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé Editorial */}
      <footer className="py-12 px-6 border-t border-warm-border bg-[#F7F3EC] text-charcoal-600 text-xs font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-semibold text-sm tracking-[-0.02em] text-charcoal-900 dark:text-[#FAF8F5]">
              Fralda <span className="text-terracotta dark:text-[#E3A088]">Online</span>
            </span>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <span>{dict.footer.tagline}</span>
            <span className="text-charcoal-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 text-charcoal-600">
              <span>{dict.footer.paymentsVia}</span>
              <MercadoPagoLogo size="xs" />
            </span>
          </div>

          <div className="flex items-center gap-3 text-charcoal-600 text-xs">
            <a href="mailto:suporte@fralda.online" className="hover:text-charcoal-900 transition-colors">
              {dict.footer.support}
            </a>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <Link href="/termos" className="hover:text-charcoal-900 transition-colors">
              {dict.footer.terms}
            </Link>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <Link href="/privacidade" className="hover:text-charcoal-900 transition-colors">
              {dict.footer.privacy}
            </Link>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
