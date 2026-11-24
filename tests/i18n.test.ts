import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_LOCALES,
  normalizeLocale,
  detectBrowserLocale,
  interpolate,
  formatCurrencyBRL,
  formatEventDateByLocale,
  MP_LOCALE_MAP,
  type Locale,
} from '../lib/i18n/types';
import { getDefaultGiftItems } from '../lib/default-gifts';
import { buildSharePayload, buildThankYouWhatsAppUrl } from '../lib/share';
import { commonDict } from '../lib/i18n/dictionaries/common';
import { landingDict } from '../lib/i18n/dictionaries/landing';
import { eventDict } from '../lib/i18n/dictionaries/event';
import { authDict } from '../lib/i18n/dictionaries/auth';
import { painelDict } from '../lib/i18n/dictionaries/painel';
import { legalDict } from '../lib/i18n/dictionaries/legal';
import { adminDict } from '../lib/i18n/dictionaries/admin';

function extractPlaceholders(value: string): string[] {
  const matches = new Set<string>();
  const regex = /\{([a-zA-Z0-9_]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches).sort();
}

const OPTIONAL_EMPTY_PATHS = new Set([
  'eventDict.babyHero.boyArticle',
  'eventDict.babyHero.girlArticle',
  'legalDict.terms.s1P1Before',
]);

function assertDictionaryParity(
  dictName: string,
  ptNode: unknown,
  enNode: unknown,
  esNode: unknown,
  path = dictName
) {
  if (typeof ptNode === 'string') {
    assert.equal(typeof enNode, 'string', `${path}.en must be a string`);
    assert.equal(typeof esNode, 'string', `${path}.es must be a string`);

    if (!OPTIONAL_EMPTY_PATHS.has(path)) {
      assert.ok(ptNode.trim().length > 0, `${path}.pt must not be empty`);
      assert.ok((enNode as string).trim().length > 0, `${path}.en must not be empty`);
      assert.ok((esNode as string).trim().length > 0, `${path}.es must not be empty`);
    }

    const ptVars = extractPlaceholders(ptNode);
    const enVars = extractPlaceholders(enNode as string);
    const esVars = extractPlaceholders(esNode as string);

    assert.deepEqual(enVars, ptVars, `${path}.en placeholders mismatch pt: ${enVars} vs ${ptVars}`);
    assert.deepEqual(esVars, ptVars, `${path}.es placeholders mismatch pt: ${esVars} vs ${ptVars}`);
    return;
  }

  if (Array.isArray(ptNode)) {
    assert.ok(Array.isArray(enNode), `${path}.en must be an array`);
    assert.ok(Array.isArray(esNode), `${path}.es must be an array`);
    assert.equal(
      (enNode as unknown[]).length,
      ptNode.length,
      `${path}.en array length (${(enNode as unknown[]).length}) != pt (${ptNode.length})`
    );
    assert.equal(
      (esNode as unknown[]).length,
      ptNode.length,
      `${path}.es array length (${(esNode as unknown[]).length}) != pt (${ptNode.length})`
    );

    for (let i = 0; i < ptNode.length; i++) {
      assertDictionaryParity(
        dictName,
        ptNode[i],
        (enNode as unknown[])[i],
        (esNode as unknown[])[i],
        `${path}[${i}]`
      );
    }
    return;
  }

  assert.ok(ptNode && typeof ptNode === 'object', `${path}.pt must be an object`);
  assert.ok(enNode && typeof enNode === 'object' && !Array.isArray(enNode), `${path}.en must be an object`);
  assert.ok(esNode && typeof esNode === 'object' && !Array.isArray(esNode), `${path}.es must be an object`);

  const ptObj = ptNode as Record<string, unknown>;
  const enObj = enNode as Record<string, unknown>;
  const esObj = esNode as Record<string, unknown>;

  const ptKeys = Object.keys(ptObj).sort();
  const enKeys = Object.keys(enObj).sort();
  const esKeys = Object.keys(esObj).sort();

  assert.deepEqual(enKeys, ptKeys, `${path}.en keys mismatch pt`);
  assert.deepEqual(esKeys, ptKeys, `${path}.es keys mismatch pt`);

  for (const key of ptKeys) {
    assertDictionaryParity(dictName, ptObj[key], enObj[key], esObj[key], `${path}.${key}`);
  }
}

test('normalizeLocale resolves supported locale variants safely', () => {
  assert.equal(normalizeLocale('pt-BR'), 'pt');
  assert.equal(normalizeLocale('pt_PT'), 'pt');
  assert.equal(normalizeLocale('en-US'), 'en');
  assert.equal(normalizeLocale('en'), 'en');
  assert.equal(normalizeLocale('es-MX'), 'es');
  assert.equal(normalizeLocale('ES_AR'), 'es');
  assert.equal(normalizeLocale('fr-FR'), null);
  assert.equal(normalizeLocale(''), null);
  assert.equal(normalizeLocale(undefined), null);
  assert.equal(normalizeLocale(null), null);
});

test('detectBrowserLocale selects first matching supported language with pt fallback', () => {
  assert.equal(detectBrowserLocale(['fr-FR', 'en-US', 'pt-BR']), 'en');
  assert.equal(detectBrowserLocale(['de-DE', 'es-ES']), 'es');
  assert.equal(detectBrowserLocale(['ja-JP'], 'en-GB'), 'en');
  assert.equal(detectBrowserLocale(['fr-FR', 'de-DE']), 'pt');
  assert.equal(detectBrowserLocale(undefined, undefined), 'pt');
});

test('interpolate replaces placeholders and leaves unknown placeholders intact', () => {
  assert.equal(
    interpolate('Exibindo {shown} de {total} pedidos ({missing})', { shown: 5, total: 20 }),
    'Exibindo 5 de 20 pedidos ({missing})'
  );
  assert.equal(interpolate('Sem placeholders', { shown: 1 }), 'Sem placeholders');
});

test('formatCurrencyBRL formats BRL values across pt, en, and es', () => {
  const ptFormatted = formatCurrencyBRL(1234.5, 'pt');
  const enFormatted = formatCurrencyBRL(1234.5, 'en');
  const esFormatted = formatCurrencyBRL(1234.5, 'es');

  assert.match(ptFormatted, /R\$\s*1\.234,50/);
  assert.match(enFormatted, /1,234\.50/);
  assert.match(esFormatted, /1234,50|1\.234,50/);
  assert.ok(MP_LOCALE_MAP.pt === 'pt-BR' && MP_LOCALE_MAP.en === 'en-US' && MP_LOCALE_MAP.es === 'es-MX');
});

test('formatEventDateByLocale preserves UTC calendar date across pt, en, and es', () => {
  const isoMidnight = '2026-06-15T00:00:00.000Z';
  assert.equal(formatEventDateByLocale(isoMidnight, 'pt'), '15/06/2026');
  assert.equal(formatEventDateByLocale(isoMidnight, 'en'), '06/15/2026');
  assert.equal(formatEventDateByLocale(isoMidnight, 'es'), '15/06/2026');
});

test('getDefaultGiftItems returns localized catalog parity across pt, en, and es', () => {
  const ptGifts = getDefaultGiftItems('pt');
  const enGifts = getDefaultGiftItems('en');
  const esGifts = getDefaultGiftItems('es');

  assert.equal(ptGifts.length, enGifts.length);
  assert.equal(ptGifts.length, esGifts.length);
  assert.ok(ptGifts.length >= 10);

  for (let i = 0; i < ptGifts.length; i++) {
    assert.ok(ptGifts[i].price > 0);
    assert.equal(ptGifts[i].price, enGifts[i].price);
    assert.equal(ptGifts[i].price, esGifts[i].price);
    assert.match(ptGifts[i].imageUrl, /^https:\/\//);
    assert.notEqual(ptGifts[i].title, enGifts[i].title);
    assert.notEqual(ptGifts[i].title, esGifts[i].title);
  }
});

test('buildSharePayload and buildThankYouWhatsAppUrl localize messages across pt, en, and es', () => {
  const baseInput = {
    slug: 'cha-da-luna',
    parentsNames: 'Ana e Lucas',
    babyName: 'Luna',
    eventType: 'FRALDA',
  };

  for (const locale of SUPPORTED_LOCALES) {
    const payload = buildSharePayload({ ...baseInput, locale });
    assert.ok(payload.title.includes('Luna'));
    assert.ok(payload.message.includes('cha-da-luna'));
  }

  assert.notEqual(
    buildSharePayload({ ...baseInput, locale: 'pt' }).message,
    buildSharePayload({ ...baseInput, locale: 'en' }).message
  );
  assert.notEqual(
    buildSharePayload({ ...baseInput, locale: 'pt' }).message,
    buildSharePayload({ ...baseInput, locale: 'es' }).message
  );

  assert.equal(
    buildThankYouWhatsAppUrl({
      phone: '12345',
      guestName: 'Maria',
      parentsNames: 'Ana e Lucas',
      locale: 'pt',
    }),
    null
  );

  const waEn = buildThankYouWhatsAppUrl({
    phone: '(11) 99999-8888',
    guestName: 'John Smith',
    giftTitle: 'Newborn Diaper Pack',
    parentsNames: 'Ana & Lucas',
    locale: 'en',
  });
  assert.ok(waEn && waEn.includes('phone=5511999998888'));
  assert.ok(decodeURIComponent(waEn!).includes('Thank you so much'));

  const waEs = buildThankYouWhatsAppUrl({
    phone: '11999998888',
    guestName: 'Carlos',
    giftTitle: 'Paquete Pañales RN',
    parentsNames: 'Ana y Lucas',
    locale: 'es',
  });
  assert.ok(waEs && waEs.includes('phone=5511999998888'));
  assert.ok(decodeURIComponent(waEs!).includes('Muchas gracias'));
});

test('all 7 i18n dictionaries maintain complete structural, non-empty, and placeholder parity', () => {
  const dictionaries: Record<string, Record<Locale, unknown>> = {
    commonDict,
    landingDict,
    eventDict,
    authDict,
    painelDict,
    legalDict,
    adminDict,
  };

  for (const [name, dict] of Object.entries(dictionaries)) {
    assertDictionaryParity(name, dict.pt, dict.en, dict.es);
  }
});
