'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Clock } from 'lucide-react';

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
    <section className="relative pt-10 pb-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Badge Sóbrio */}
        {revealedGender ? (
          <div className="inline-block mb-6">
            {revealedGender === 'BOY' ? (
              <div className="px-5 py-2 rounded-full bg-dusty-blue-light border border-dusty-blue/30 text-dusty-blue font-serif text-sm sm:text-base font-medium flex items-center gap-2">
                <span>É um menino</span>
                {babyName && <span className="font-semibold italic">— {babyName}</span>}
              </div>
            ) : (
              <div className="px-5 py-2 rounded-full bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose font-serif text-sm sm:text-base font-medium flex items-center gap-2">
                <span>É uma menina</span>
                {babyName && <span className="font-semibold italic">— {babyName}</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-warm-border text-charcoal-600 text-xs font-mono uppercase tracking-wider mb-6 shadow-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
            <span>{eventLabel}</span>
          </div>
        )}

        {/* Nomes dos Pais & Bebê */}
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight leading-tight mb-4">
          {babyName ? (
            <>
              Chá de <span className="italic font-normal">{babyName}</span>
            </>
          ) : (
            <>
              Chá de Bebê de <span className="italic font-normal">{parentsNames}</span>
            </>
          )}
        </h1>

        <p className="text-xs sm:text-sm text-charcoal-600 max-w-lg mx-auto leading-relaxed font-sans mb-8">
          {storyMessage ||
            'Criamos este espaço para compartilhar com você a alegria dessa espera e receber seu carinho em forma de fraldas e recados.'}
        </p>

        {/* Foto de Capa (se houver) */}
        {coverImageUrl && (
          <div className="mb-10 max-w-md mx-auto rounded-xl overflow-hidden border border-warm-border shadow-card bg-white p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={parentsNames}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Contagem Regressiva Tipográfica */}
        {timeLeft ? (
          <div className="bg-white rounded-xl p-6 max-w-md mx-auto border border-warm-border shadow-subtle">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-charcoal-500 uppercase tracking-widest mb-4">
              <Clock className="w-3.5 h-3.5 text-charcoal-400" />
              <span>Contagem para o evento</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Dias', value: timeLeft.days },
                { label: 'Horas', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Seg', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-cream-50/80 rounded-lg p-2.5 text-center border border-warm-border/60">
                  <span className="block font-serif text-2xl text-charcoal-900 tabular-nums">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-charcoal-500 uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-mono text-charcoal-600 bg-white py-2 px-4 rounded-lg border border-warm-border shadow-subtle">
            <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Data comemorativa: {new Date(eventDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
    </section>
  );
}
