'use client';

import { Globe } from 'lucide-react';
import { useI18n } from '@/components/LanguageProvider';
import { commonDict } from '@/lib/i18n/dictionaries/common';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/types';

interface LanguageSwitcherProps {
  size?: 'sm' | 'md';
  className?: string;
}

const LOCALE_BADGE_LABEL: Record<Locale, string> = {
  pt: 'PT',
  en: 'EN',
  es: 'ES',
};

export default function LanguageSwitcher({
  size = 'sm',
  className = '',
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();
  const dict = commonDict[locale].languageSwitcher;

  const containerHeight = size === 'sm' ? 'h-8 px-1 rounded-lg' : 'h-9 sm:h-10 px-1.5 rounded-xl';
  const buttonSize =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-[10px] rounded-md'
      : 'px-2 py-1 text-[11px] rounded-lg';

  return (
    <div
      role="group"
      aria-label={dict.ariaLabel}
      className={`inline-flex items-center gap-0.5 border border-warm-border/80 bg-white/75 dark:bg-[#1E1A17]/80 dark:border-[#332D28] shadow-subtle backdrop-blur-md shrink-0 ${containerHeight} ${className}`}
    >
      <Globe
        className="w-3.5 h-3.5 text-charcoal-500 dark:text-stone-400 ml-1 mr-0.5 hidden sm:inline shrink-0"
        aria-hidden="true"
      />
      {SUPPORTED_LOCALES.map((item) => {
        const isActive = locale === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            aria-pressed={isActive}
            aria-label={dict.names[item]}
            title={dict.names[item]}
            className={`font-mono font-semibold uppercase tracking-wide transition-colors cursor-pointer ${buttonSize} ${
              isActive
                ? 'bg-charcoal-900 text-white dark:bg-[#FAF8F5] dark:text-[#1C1917] shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            {LOCALE_BADGE_LABEL[item]}
          </button>
        );
      })}
    </div>
  );
}
