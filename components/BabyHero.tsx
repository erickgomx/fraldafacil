'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Sparkles, Clock } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

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

  // Se o sexo já estiver revelado, solta confetes especiais ao carregar a página
  useEffect(() => {
    if (revealedGender === 'BOY') {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0284c7', '#bae6fd', '#facc15'],
      });
    } else if (revealedGender === 'GIRL') {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#db2777', '#fbcfe8', '#facc15'],
      });
    }
  }, [revealedGender]);

  const eventTitle =
    eventType === 'REVELACAO'
      ? 'Chá Revelação'
      : eventType === 'FRALDA'
      ? 'Chá de Fralda'
      : 'Chá de Fralda & Revelação';

  return (
    <section className="relative overflow-hidden pt-8 pb-14 px-4">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 translate-x-1/2 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Banner de Sexo Revelado ou Tag de Boas Vindas */}
        {revealedGender ? (
          <div className="inline-block mb-6 animate-bounce">
            {revealedGender === 'BOY' ? (
              <div className="py-2.5 px-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold shadow-lg shadow-sky-400/30 text-sm md:text-base flex items-center gap-2">
                <span>🎉 É UM MENINO!</span>
                {babyName && <span className="underline underline-offset-2">{babyName}</span>}
                <span>💙</span>
              </div>
            ) : (
              <div className="py-2.5 px-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold shadow-lg shadow-pink-400/30 text-sm md:text-base flex items-center gap-2">
                <span>🎉 É UMA MENINA!</span>
                {babyName && <span className="underline underline-offset-2">{babyName}</span>}
                <span>💖</span>
              </div>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-white/80 border border-slate-200/70 text-slate-700 text-xs font-semibold mb-6 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{eventTitle} Especial</span>
          </div>
        )}

        {/* Nomes dos Pais & Bebê */}
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-4">
          {babyName ? (
            <>
              Bem-vindo ao Chá de{' '}
              <span className="bg-gradient-to-r from-sky-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                {babyName}
              </span>
            </>
          ) : (
            <>
              Chá de Bebê de{' '}
              <span className="bg-gradient-to-r from-sky-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                {parentsNames}
              </span>
            </>
          )}
        </h1>

        <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
          {storyMessage ||
            'Estamos muito felizes e ansiosos pela chegada do nosso maior tesouro! Criamos esta página com muito amor para compartilhar esse momento mágico com você.'}
        </p>

        {/* Foto de Capa (se houver) */}
        {coverImageUrl && (
          <div className="mb-8 max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt={parentsNames} className="w-full h-64 object-cover" />
          </div>
        )}

        {/* Contagem Regressiva */}
        {timeLeft ? (
          <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-6 max-w-lg mx-auto shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              <Clock className="w-4 h-4 text-sky-500" />
              <span>Contagem Regressiva para o Chá</span>
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[
                { label: 'Dias', value: timeLeft.days },
                { label: 'Horas', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Seg', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
                  <span className="block text-xl md:text-3xl font-black text-slate-800 font-mono">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 py-2 px-4 rounded-xl border border-slate-200/60 shadow-sm">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>Data comemorativa: {new Date(eventDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
    </section>
  );
}
