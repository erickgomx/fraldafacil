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
  // Configurações dimensionais por tamanho com proporções ópticas editoriais
  const sizeMap = {
    sm: {
      box: 'w-7 h-7',
      title: 'text-[1.22rem]',
      tagline: 'text-[8.5px] mt-1 tracking-[0.24em]',
      iconWidth: 28,
    },
    md: {
      box: 'w-8 h-8',
      title: 'text-[1.45rem]',
      tagline: 'text-[9.5px] mt-1 tracking-[0.26em]',
      iconWidth: 32,
    },
    lg: {
      box: 'w-10 h-10',
      title: 'text-[1.75rem]',
      tagline: 'text-[10.5px] mt-1.5 tracking-[0.28em]',
      iconWidth: 40,
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblema Oficial Fralda Online (Modo Claro & Modo Escuro) */}
      <div
        className={`relative ${sizeMap.box} shrink-0 transition-transform group-hover:scale-105 flex items-center justify-center border-0 !outline-none`}
        aria-hidden="true"
      >
        <Image
          src="/logo-light.png"
          alt="Fralda Online"
          width={sizeMap.iconWidth * 2}
          height={sizeMap.iconWidth * 2}
          className="w-full h-full object-contain dark:hidden no-outline !outline-none !border-none"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          priority
        />
        <Image
          src="/logo-dark.png"
          alt="Fralda Online"
          width={sizeMap.iconWidth * 2}
          height={sizeMap.iconWidth * 2}
          className="w-full h-full object-contain hidden dark:block no-outline !outline-none !border-none"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          priority
        />
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left whitespace-nowrap">
          <span
            className={`font-serif tracking-[-0.02em] text-charcoal-900 dark:text-[#FAF8F5] leading-[0.95] whitespace-nowrap ${sizeMap.title}`}
          >
            <span className="font-semibold">Fralda</span>{' '}
            <span className="italic font-normal text-terracotta dark:text-[#E3A088]">Online</span>
          </span>
          {showTagline && (
            <span
              className={`uppercase font-sans text-charcoal-500 dark:text-stone-400 font-normal leading-none whitespace-nowrap ${sizeMap.tagline}`}
            >
              Chá &amp; Revelação
            </span>
          )}
        </div>
      )}
    </div>
  );
}
