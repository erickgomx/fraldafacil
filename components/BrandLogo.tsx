'use client';

import React from 'react';
import Image from 'next/image';
import { useI18n } from '@/components/LanguageProvider';
import { commonDict } from '@/lib/i18n/dictionaries/common';

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
  const { locale } = useI18n();
  const tagline = commonDict[locale].brandTagline;
  // Configurações dimensionais por tamanho com proporções equilibradas e encorpadas
  const sizeMap = {
    sm: {
      box: 'w-7 h-7',
      title: 'text-[1.05rem]',
      tagline: 'text-[9px] mt-0.5 tracking-[0.18em]',
      iconWidth: 28,
    },
    md: {
      box: 'w-8 h-8',
      title: 'text-[1.22rem]',
      tagline: 'text-[9.5px] mt-0.5 tracking-[0.2em]',
      iconWidth: 32,
    },
    lg: {
      box: 'w-10 h-10',
      title: 'text-[1.45rem]',
      tagline: 'text-[10.5px] mt-1 tracking-[0.22em]',
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
            className={`font-serif font-semibold tracking-[-0.025em] text-charcoal-900 dark:text-[#FAF8F5] leading-none whitespace-nowrap ${sizeMap.title}`}
          >
            Fralda <span className="text-terracotta dark:text-[#E3A088]">Online</span>
          </span>
          {showTagline && (
            <span
              className={`uppercase font-sans text-charcoal-500 dark:text-stone-400 font-medium leading-none whitespace-nowrap ${sizeMap.tagline}`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
