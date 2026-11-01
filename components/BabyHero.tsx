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
        <div className="absolute -top-24 left-1/2 -translate-x-[70%] w-[420px] h-[420px] rounded-full bg-dusty-rose-light blur-3xl opacity-70 animate-drift" />
        <div className="absolute top-10 left-1/2 translate-x-[5%] w-[380px] h-[380px] rounded-full bg-dusty-blue-light blur-3xl opacity-70 animate-drift [animation-delay:-7s]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-2xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={rise} className="mb-6">
          <AnimatePresence mode="wait" initial={false}>
            {revealedGender ? (
              <motion.div
                key={revealedGender}
                initial={{ opacity: 0, scale: 0.85, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="inline-block"
              >
                {revealedGender === 'BOY' ? (
                  <div className="px-5 py-2 rounded-full bg-dusty-blue-light border border-dusty-blue/30 text-dusty-blue font-serif text-sm sm:text-base font-medium flex items-center gap-2 shadow-subtle">
                    <span>É um menino</span>
                    {babyName && <span className="font-semibold italic">— {babyName}</span>}
                  </div>
                ) : (
                  <div className="px-5 py-2 rounded-full bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose font-serif text-sm sm:text-base font-medium flex items-center gap-2 shadow-subtle">
                    <span>É uma menina</span>
                    {babyName && <span className="font-semibold italic">— {babyName}</span>}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-warm-border text-charcoal-600 text-xs font-mono uppercase tracking-wider shadow-subtle"
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-terracotta animate-pulse-ring" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-terracotta" />
                </span>
                <span>{eventLabel}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Nomes dos Pais & Bebê */}
        <motion.h1
          variants={rise}
          className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight leading-tight mb-4"
        >
          {babyName ? (
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
