'use client';

import React from 'react';

interface BrandLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function BrandLoader({
  message = 'Carregando com carinho...',
  fullScreen = false,
  className = '',
}: BrandLoaderProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      {/* Container da Logo com Efeito de Levitação e Pulso Suave */}
      <div className="relative mb-5 flex items-center justify-center">
        {/* Halo de luz sutil no fundo */}
        <div className="absolute w-20 h-20 rounded-full bg-cream-200/60 blur-xl animate-pulse" />

        {/* Emblema com a Chupeta-Globo Oficial */}
        <div className="relative w-16 h-16 rounded-2xl bg-white border border-warm-border shadow-card flex items-center justify-center p-2 animate-float">
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="loader-globe-clip">
                <circle cx="0" cy="95" r="75" />
              </clipPath>
            </defs>

            <g transform="translate(250, 250) rotate(45)">
              {/* Bico da Chupeta */}
              <path
                d="M -30,-45 C -45,-80 -55,-130 0,-155 C 55,-130 45,-80 30,-45 Z"
                fill="#FFFFFF"
                stroke="#111111"
                strokeWidth="16"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M -12,-140 C -26,-125 -28,-105 -24,-90"
                fill="none"
                stroke="#111111"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Base Protetora Labial */}
              <rect
                x="-95"
                y="-45"
                width="190"
                height="46"
                rx="23"
                fill="#D1D5DB"
                stroke="#111111"
                strokeWidth="16"
                strokeLinejoin="round"
              />

              {/* Conector */}
              <rect
                x="-24"
                y="0"
                width="48"
                height="28"
                rx="6"
                fill="#6B7280"
                stroke="#111111"
                strokeWidth="14"
                strokeLinejoin="round"
              />

              {/* Globo da Internet */}
              <circle cx="0" cy="95" r="85" fill="none" stroke="#111111" strokeWidth="14" />
              <circle cx="0" cy="95" r="75" fill="#FFFFFF" stroke="#111111" strokeWidth="14" />

              <g clipPath="url(#loader-globe-clip)" stroke="#111111" strokeWidth="10" fill="none">
                <line x1="0" y1="20" x2="0" y2="170" />
                <line x1="-75" y1="95" x2="75" y2="95" />
                <line x1="-65" y1="65" x2="65" y2="65" />
                <line x1="-65" y1="125" x2="65" y2="125" />
                <ellipse cx="0" cy="95" rx="42" ry="75" />
              </g>

              <path
                d="M -68,148 A 86 86 0 0 0 25,180"
                fill="none"
                stroke="#111111"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Nome da Marca */}
      <h3 className="font-serif text-lg font-medium text-charcoal-900 tracking-tight">
        Fralda Online
      </h3>
      <span className="text-[10px] uppercase font-mono tracking-widest text-charcoal-500 mb-4 block">
        Chá &amp; Revelação
      </span>

      {/* Linha Minimalista de Progresso */}
      <div className="w-36 h-1 bg-cream-200/80 rounded-full overflow-hidden relative border border-warm-border/50">
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-transparent via-charcoal-900 to-transparent rounded-full animate-shimmer" />
      </div>

      {/* Mensagem Opcional */}
      {message && (
        <p className="text-xs text-charcoal-500 font-sans mt-3 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
