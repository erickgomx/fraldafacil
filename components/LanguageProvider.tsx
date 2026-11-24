'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  detectBrowserLocale,
  formatCurrencyBRL,
  formatDateByLocale,
  formatEventDateByLocale,
  HTML_LANG_MAP,
  interpolate,
  INTL_LOCALE_MAP,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  MP_LOCALE_MAP,
  normalizeLocale,
  type Locale,
} from '@/lib/i18n/types';

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  hydrated: boolean;
  htmlLang: string;
  intlLocale: string;
  mpLocale: 'pt-BR' | 'en-US' | 'es-MX';
  t: (template: string, vars?: Record<string, string | number>) => string;
  formatCurrency: (value: number) => string;
  formatEventDate: (date: string | Date) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  try {
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const entry of cookies) {
      const idx = entry.indexOf('=');
      if (idx <= 0) continue;
      const key = entry.slice(0, idx).trim();
      if (key === LOCALE_COOKIE_NAME) {
        return normalizeLocale(decodeURIComponent(entry.slice(idx + 1).trim()));
      }
    }
  } catch {
    // Ignora leitura restrita de cookies
  }
  return null;
}

function readStoredLocale(): Locale | null {
  const fromCookie = readLocaleCookie();
  if (fromCookie) return fromCookie;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    }
  } catch {
    // Ignora localStorage indisponível (modo privado estrito)
  }

  return null;
}

function persistLocale(next: Locale): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
  } catch {
    // Ignora erro de storage
  }

  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.lang = HTML_LANG_MAP[next];
    }
  } catch {
    // Ignora erro de cookie/DOM
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredLocale();
    const resolved =
      stored ||
      detectBrowserLocale(
        typeof navigator !== 'undefined' ? navigator.languages : undefined,
        typeof navigator !== 'undefined' ? navigator.language : undefined
      );

    setLocaleState(resolved);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = HTML_LANG_MAP[resolved];
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      hydrated,
      htmlLang: HTML_LANG_MAP[locale],
      intlLocale: INTL_LOCALE_MAP[locale],
      mpLocale: MP_LOCALE_MAP[locale],
      t: interpolate,
      formatCurrency: (val: number) => formatCurrencyBRL(val, locale),
      formatEventDate: (date: string | Date) => formatEventDateByLocale(date, locale),
      formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) =>
        formatDateByLocale(date, locale, options),
    }),
    [locale, setLocale, hydrated]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const FALLBACK_I18N: I18nContextValue = {
  locale: 'pt',
  setLocale: () => {},
  hydrated: false,
  htmlLang: 'pt-BR',
  intlLocale: 'pt-BR',
  mpLocale: 'pt-BR',
  t: interpolate,
  formatCurrency: (val: number) => formatCurrencyBRL(val, 'pt'),
  formatEventDate: (date: string | Date) => formatEventDateByLocale(date, 'pt'),
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) =>
    formatDateByLocale(date, 'pt', options),
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  return ctx ?? FALLBACK_I18N;
}
