'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useI18n } from '@/components/LanguageProvider';
import { commonDict } from '@/lib/i18n/dictionaries/common';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';

interface LanguageSwitcherProps {
  size?: 'sm' | 'md';
  className?: string;
}

export default function LanguageSwitcher({
  size = 'sm',
  className = '',
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();
  const dict = commonDict[locale].languageSwitcher;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const dimensions =
    size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4 sm:w-[18px] sm:h-[18px]';

  return (
    <div ref={containerRef} className={`relative inline-flex shrink-0 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={dict.ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        title={dict.names[locale]}
        className={`inline-flex items-center justify-center shrink-0 border border-warm-border/80 hover:border-charcoal-400 bg-white/75 hover:bg-cream-100/70 text-charcoal-700 shadow-subtle backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-95 cursor-pointer ${dimensions}`}
      >
        <Globe className={iconSize} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={dict.ariaLabel}
          className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-warm-border bg-white shadow-lg py-1 z-50"
        >
          {SUPPORTED_LOCALES.map((item) => {
            const isActive = locale === item;
            return (
              <button
                key={item}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setLocale(item);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-charcoal-900 font-semibold bg-cream-50'
                    : 'text-charcoal-600 hover:bg-cream-50 hover:text-charcoal-900'
                }`}
              >
                <span>{dict.names[item]}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
