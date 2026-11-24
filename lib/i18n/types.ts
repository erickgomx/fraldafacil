/**
 * ============================================================================
 * NÚCLEO DE INTERNACIONALIZAÇÃO (i18n) — Fralda Online
 * ============================================================================
 * Define tipos, constantes, normalização de idiomas, detecção automática do
 * navegador, interpolação de templates e formatadores de moeda/data.
 */

export type Locale = 'pt' | 'en' | 'es';

export const SUPPORTED_LOCALES: readonly Locale[] = ['pt', 'en', 'es'] as const;
export const LOCALE_COOKIE_NAME = 'fralda_locale';
export const LOCALE_STORAGE_KEY = 'fralda_locale';

export const HTML_LANG_MAP: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en',
  es: 'es',
};

export const INTL_LOCALE_MAP: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

export const MP_LOCALE_MAP: Record<Locale, 'pt-BR' | 'en-US' | 'es-MX'> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-MX',
};

/**
 * Converte códigos de idioma (ex: "pt-BR", "en-US", "es-MX") para um dos
 * idiomas suportados pela plataforma, ou retorna `null` se não suportado.
 */
export function normalizeLocale(raw: string | null | undefined): Locale | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim().toLowerCase();
  if (!clean) return null;

  const base = clean.split(/[-_]/)[0];
  if (base === 'pt') return 'pt';
  if (base === 'en') return 'en';
  if (base === 'es') return 'es';
  return null;
}

/**
 * Detecta o idioma inicial mais adequado a partir das preferências do navegador,
 * com fallback seguro para Português (`pt`).
 */
export function detectBrowserLocale(
  languages?: readonly string[] | null,
  fallbackLang?: string | null
): Locale {
  if (Array.isArray(languages)) {
    for (const lang of languages) {
      const normalized = normalizeLocale(lang);
      if (normalized) return normalized;
    }
  }

  const fromFallback = normalizeLocale(fallbackLang);
  if (fromFallback) return fromFallback;

  return 'pt';
}

/**
 * Interpola placeholders no formato `{chave}` dentro de strings de tradução.
 */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return String(vars[key]);
    }
    return match;
  });
}

/** Formata valores em Real brasileiro (`BRL`) respeitando o separador do idioma ativo. */
export function formatCurrencyBRL(value: number, locale: Locale): string {
  const safeVal = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat(INTL_LOCALE_MAP[locale], {
    style: 'currency',
    currency: 'BRL',
  }).format(safeVal);
}

/** Formata a data do evento preservando o dia calendário em UTC no idioma ativo. */
export function formatEventDateByLocale(date: string | Date, locale: Locale): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(INTL_LOCALE_MAP[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/** Formata datas/horas locais no idioma ativo. */
export function formatDateByLocale(
  date: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat(INTL_LOCALE_MAP[locale], options).format(d);
}
