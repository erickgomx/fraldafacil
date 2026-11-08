import React from 'react';
import Image from 'next/image';

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
      box: 'w-7 h-7',
      title: 'text-base',
      tagline: 'text-[9px] -mt-0.5',
      iconWidth: 28,
    },
    md: {
      box: 'w-8 h-8',
      title: 'text-xl',
      tagline: 'text-[10px] -mt-1',
      iconWidth: 32,
    },
    lg: {
      box: 'w-10 h-10',
      title: 'text-2xl',
      tagline: 'text-[11px] -mt-0.5',
      iconWidth: 40,
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblema Oficial Fralda Online (Modo Claro & Modo Escuro) */}
      <div
        className={`relative ${sizeMap.box} shrink-0 transition-transform group-hover:scale-105 flex items-center justify-center`}
        aria-hidden="true"
      >
        <Image
          src="/logo-light.png"
          alt="Fralda Online"
          width={sizeMap.iconWidth * 2}
          height={sizeMap.iconWidth * 2}
          className="w-full h-full object-contain dark:hidden"
          priority
        />
        <Image
          src="/logo-dark.png"
          alt="Fralda Online"
          width={sizeMap.iconWidth * 2}
          height={sizeMap.iconWidth * 2}
          className="w-full h-full object-contain hidden dark:block"
          priority
        />
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left whitespace-nowrap">
          <span
            className={`font-serif tracking-tight font-medium text-charcoal-900 dark:text-[#FAF8F5] leading-none whitespace-nowrap ${sizeMap.title}`}
          >
            Fralda Online
          </span>
          {showTagline && (
            <span
              className={`tracking-widest uppercase font-sans text-charcoal-500 dark:text-stone-400 font-medium whitespace-nowrap ${sizeMap.tagline}`}
            >
              Chá &amp; Revelação
            </span>
          )}
        </div>
      )}
    </div>
  );
}
