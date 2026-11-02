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
      {/* Emblema Vetorial Oficial: Chupeta com Globo da Internet */}
      <div
        className={`${sizeMap.box} bg-white border border-[#E6DDCF] shadow-sm flex items-center justify-center shrink-0 p-0.5 transition-transform group-hover:scale-105 overflow-hidden`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="brand-globe-clip">
              <circle cx="0" cy="95" r="75" />
            </clipPath>
          </defs>

          <g transform="translate(250, 250) rotate(45)">
            {/* 1. BICO DA CHUPETA */}
            <path
              d="M -30,-45 C -45,-80 -55,-130 0,-155 C 55,-130 45,-80 30,-45 Z"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="16"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Brilho no bico */}
            <path
              d="M -12,-140 C -26,-125 -28,-105 -24,-90"
              fill="none"
              stroke="#111111"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* 2. BASE PROTETORA LABIAL */}
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

            {/* 3. CONECTOR ENTRE BASE E GLOBO */}
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

            {/* 4. ARGOLA / GLOBO DA INTERNET */}
            <circle cx="0" cy="95" r="85" fill="none" stroke="#111111" strokeWidth="14" />
            <circle cx="0" cy="95" r="75" fill="#FFFFFF" stroke="#111111" strokeWidth="14" />

            <g clipPath="url(#brand-globe-clip)" stroke="#111111" strokeWidth="10" fill="none">
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

      {!iconOnly && (
        <div className="flex flex-col text-left whitespace-nowrap">
          <span
            className={`font-serif tracking-tight font-medium text-charcoal-900 leading-none whitespace-nowrap ${sizeMap.title}`}
          >
            Fralda Online
          </span>
          {showTagline && (
            <span
              className={`tracking-widest uppercase font-sans text-charcoal-500 font-medium whitespace-nowrap ${sizeMap.tagline}`}
            >
              Chá &amp; Revelação
            </span>
          )}
        </div>
      )}
    </div>
  );
}
