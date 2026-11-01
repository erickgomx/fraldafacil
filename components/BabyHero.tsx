'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } },
};

/** Dígito que desliza verticalmente quando o valor muda */
function RollingNumber({ value }: { value: number }) {
  const text = String(value).padStart(2, '0');
  return (
    <span className="relative block h-8 overflow-hidden font-serif text-2xl text-charcoal-900 tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="block leading-8"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface BabyHeroProps {
  parentsNames: string;
  babyName?: string | null;
  boyName?: string | null;
  girlName?: string | null;
  eventDate: string | Date;
  storyMessage?: string | null;
  coverImageUrl?: string | null;
  themeColor?: string;
  revealedGender?: string | null;
  eventType?: string;
}

export default function BabyHero({
  parentsNames,
  babyName,
  boyName,
  girlName,
  eventDate,
  storyMessage,
  coverImageUrl,
  revealedGender,
  eventType = 'REVELACAO',
}: BabyHeroProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(eventDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  useEffect(() => {
    if (revealedGender === 'BOY') {
      confetti({
        particleCount: 70,
        spread: 60,
        colors: ['#4A6B82', '#6C8EA4', '#FAF8F5'],
      });
    } else if (revealedGender === 'GIRL') {
      confetti({
        particleCount: 70,
        spread: 60,
        colors: ['#B86B77', '#D18D97', '#FAF8F5'],
      });
    }
  }, [revealedGender]);

  const isBoy = revealedGender === 'BOY';
  const isGirl = revealedGender === 'GIRL';
  const isRevealed = Boolean(isBoy || isGirl);

  // Nome do bebê revelado em destaque absoluto
  const winnerName = isBoy
    ? (boyName?.trim() || babyName?.trim() || 'Nosso Menino')
    : (girlName?.trim() || babyName?.trim() || 'Nossa Menina');

  const eventLabel =
    eventType === 'REVELACAO'
      ? 'Chá Revelação'
      : eventType === 'FRALDA'
      ? 'Chá de Fralda'
      : 'Chá de Fralda & Revelação';

  return (
    <section className="relative pt-10 pb-16 px-6 overflow-hidden">
      {/* Atmosfera suave ao fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className={`absolute -top-24 left-1/2 -translate-x-[70%] w-[420px] h-[420px] rounded-full blur-3xl transition-opacity duration-1000 ${
          isRevealed ? (isGirl ? 'bg-dusty-rose-light opacity-90' : 'opacity-20') : 'bg-dusty-rose-light opacity-70 animate-drift'
        }`} />
        <div className={`absolute top-10 left-1/2 translate-x-[5%] w-[380px] h-[380px] rounded-full blur-3xl transition-opacity duration-1000 ${
          isRevealed ? (isBoy ? 'bg-dusty-blue-light opacity-90' : 'opacity-20') : 'bg-dusty-blue-light opacity-70 animate-drift [animation-delay:-7s]'
        }`} />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-2xl mx-auto text-center"
      >
        {isRevealed ? (
          /* QUANDO REVELADO: NOME DO BEBÊ EM DESTAQUE CINEMATOGRÁFICO ASSIM QUE ABRIR A PÁGINA */
          <motion.div
            variants={rise}
            className={`p-6 sm:p-10 rounded-3xl border shadow-card mb-8 text-center relative overflow-hidden backdrop-blur-md transition-all duration-700 ${
              isBoy
                ? 'bg-gradient-to-b from-dusty-blue-light/90 via-cream-50/80 to-white border-dusty-blue/30 shadow-dusty-blue/10'
                : 'bg-gradient-to-b from-dusty-rose-light/90 via-cream-50/80 to-white border-dusty-rose/30 shadow-dusty-rose/10'
            }`}
          >
            {/* Tag Festiva */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-widest font-semibold mb-3 border bg-white/90 shadow-subtle text-charcoal-700">
              <span className={`w-2 h-2 rounded-full animate-ping ${isBoy ? 'bg-dusty-blue' : 'bg-dusty-rose'}`} />
              <span>O Segredo Foi Revelado!</span>
            </div>

            {/* Subtítulo de Anúncio */}
            <span
              className={`block text-xs sm:text-sm font-mono uppercase tracking-widest font-bold mb-2 ${
                isBoy ? 'text-dusty-blue' : 'text-dusty-rose'
              }`}
            >
              {isBoy ? '💙 É UM MENINO! 💙' : '🌸 É UMA MENINA! 🌸'}
            </span>

            {/* O Nome do Bebê em Destaque Absoluto */}
            <h1 className="font-serif text-4xl sm:text-6xl text-charcoal-900 font-normal tracking-tight leading-tight mb-3">
              {isBoy ? 'O ' : 'A '}
              <span
                className={`italic font-medium underline decoration-2 underline-offset-8 ${
                  isBoy
                    ? 'text-dusty-blue decoration-dusty-blue/40'
                    : 'text-dusty-rose decoration-dusty-rose/40'
                }`}
              >
                {winnerName}
              </span>{' '}
              vem aí!
            </h1>

            <p className="text-xs sm:text-sm text-charcoal-600 font-sans max-w-md mx-auto leading-relaxed">
              Com todo o carinho e amor de <strong className="font-medium text-charcoal-900">{parentsNames}</strong> para celebrar essa bênção com você.
            </p>
          </motion.div>
        ) : (
          /* ANTES DA REVELAÇÃO */
          <>
            {/* Badge */}
            <motion.div variants={rise} className="mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-warm-border text-charcoal-600 text-xs font-mono uppercase tracking-wider shadow-subtle">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-terracotta animate-pulse-ring" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-terracotta" />
                </span>
                <span>{eventLabel}</span>
              </div>
            </motion.div>

            {/* Nomes dos Pais & Opções Menino / Menina */}
            <motion.h1
              variants={rise}
              className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight leading-tight mb-4"
            >
              {boyName && girlName ? (
                <>
                  <span className="text-dusty-blue italic font-medium">{boyName}</span>
                  <span className="text-charcoal-400 font-sans text-xl sm:text-2xl font-light mx-2.5">ou</span>
                  <span className="text-dusty-rose italic font-medium">{girlName}</span>
                  <span className="text-charcoal-400">?</span>
                </>
              ) : babyName ? (
                <>
                  Chá de <span className="italic font-normal">{babyName}</span>
                </>
              ) : (
                <>
                  Chá de Bebê de <span className="italic font-normal">{parentsNames}</span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={rise}
              className="text-xs sm:text-sm text-charcoal-600 max-w-lg mx-auto leading-relaxed font-sans mb-8"
            >
              {storyMessage ||
                'Criamos este espaço para compartilhar com você a alegria dessa espera e receber seu carinho em forma de fraldas e recados.'}
            </motion.p>
          </>
        )}

        {/* Foto de Capa (se houver) */}
        {coverImageUrl && (
          <motion.div
            variants={rise}
            className="group mb-10 max-w-md mx-auto rounded-2xl overflow-hidden border border-warm-border shadow-card bg-white p-1.5"
          >
            <div className="overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={coverImageUrl}
                alt={parentsNames}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.8, ease: EASE }}
                className="w-full h-64 object-cover rounded-xl transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </div>
          </motion.div>
        )}

        {/* Contagem Regressiva Tipográfica */}
        <motion.div variants={rise}>
          {timeLeft ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-warm-border shadow-card">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-charcoal-500 uppercase tracking-widest mb-4">
                <Clock className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Contagem para o evento</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Dias', value: timeLeft.days },
                  { label: 'Horas', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Seg', value: timeLeft.seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="bg-cream-50/80 rounded-xl p-2.5 text-center border border-warm-border/60"
                  >
                    <RollingNumber value={unit.value} />
                    <span className="text-[10px] font-mono text-charcoal-500 uppercase">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-mono text-charcoal-600 bg-white py-2 px-4 rounded-lg border border-warm-border shadow-subtle">
              <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Data comemorativa: {new Date(eventDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
