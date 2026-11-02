import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export default function BrandLogo({
  size = 'md',
  showTagline = true,
  className = '',
  iconOnly = false,
}: BrandLogoProps) {
  // Configurações dimensionais por tamanho
  const sizeMap = {
    sm: {
      box: 'w-7 h-7 rounded-lg',
      title: 'text-base',
      tagline: 'text-[9px] -mt-0.5',
      iconWidth: 28,
    },
    md: {
      box: 'w-8 h-8 rounded-xl',
      title: 'text-xl',
      tagline: 'text-[10px] -mt-1',
      iconWidth: 32,
    },
    lg: {
      box: 'w-10 h-10 rounded-2xl',
      title: 'text-2xl',
      tagline: 'text-[11px] -mt-0.5',
      iconWidth: 40,
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblema Vetorial: Alfinete Nobre de Bebê & Coração de Afeto */}
      <div
        className={`${sizeMap.box} bg-[#FAF7F2] border border-[#E6DDCF] shadow-sm flex items-center justify-center shrink-0 p-1 transition-transform group-hover:scale-105`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#C5A059" />
              <stop offset="100%" stopColor="#9E7B35" />
            </linearGradient>
          </defs>

          {/* Arco do Coração */}
          <path
            d="M 50, 31 C 43, 21, 29, 23, 24, 34 C 18, 47, 28, 62, 50, 75 C 72, 62, 82, 47, 76, 34 C 71, 23, 57, 21, 50, 31 Z"
            stroke="url(#logoGold)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Fecho do Alfinete */}
          <path
            d="M 42, 25 C 42, 21, 58, 21, 58, 25 L 57, 34 C 57, 36, 43, 36, 43, 34 Z"
            fill="#1C1917"
            stroke="#1C1917"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Pérola central */}
          <circle cx="50" cy="28.5" r="2.2" fill="#FAF7F2" />

          {/* Haste do Alfinete */}
          <path
            d="M 50, 36 L 50, 60"
            stroke="#1C1917"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left">
          <span
            className={`font-serif tracking-tight font-medium text-charcoal-900 leading-none ${sizeMap.title}`}
          >
            Fralda Online
          </span>
          {showTagline && (
            <span
              className={`tracking-widest uppercase font-sans text-charcoal-500 font-medium ${sizeMap.tagline}`}
            >
              Chá &amp; Revelação
            </span>
          )}
        </div>
      )}
    </div>
  );
}
