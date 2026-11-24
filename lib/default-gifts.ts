/**
 * ============================================================================
 * CATÁLOGO DE PRESENTES PADRÃO (Sugestões Iniciais)
 * ============================================================================
 * Quando uma futura mãe ou pai cria a sua página no Fralda Online, nós
 * pré-povoamos a lista com estes itens essenciais de maternidade.
 *
 * Dessa forma, a página já nasce linda, completa e pronta para receber mimos,
 * mas os pais continuam livres para editar valores, desativar itens ou criar novos!
 */

import type { Locale } from './i18n/types';

export interface DefaultGiftItem {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'fraldas' | 'higiene' | 'brincadeiras';
}

const DEFAULT_GIFTS_PT: DefaultGiftItem[] = [
  {
    title: 'Pacote Fralda RN (Primeiros Dias)',
    description: 'Para o comecinho de vida, super macia e com corte para o umbigo.',
    price: 35.0,
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Pacote Fralda P (Crescendo Rápido)',
    description: 'As fraldas mais usadas nos primeiros 2 meses de vida!',
    price: 45.0,
    imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Pacote Fralda M (A Queridinha)',
    description: 'O tamanho que os bebês mais usam. Nunca é demais!',
    price: 55.0,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Pacote Fralda G (Para Explorar)',
    description: 'Para a fase onde começam a rolar, engatinhar e se divertir.',
    price: 60.0,
    imageUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Estoque de Lenços Umedecidos',
    description: 'Kit com toalhinhas hipoalergênicas e 99% à base de água.',
    price: 40.0,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Kit Pomadas e Cuidados com a Pele',
    description: 'Pomada preventiva contra assaduras, óleo vegetal e sabonete neutro.',
    price: 75.0,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Kit Hora do Banho Relaxante',
    description: 'Shampoo cheirinho suave, toalha com capuz e brinquedo de banho.',
    price: 65.0,
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Termômetro Digital & Higiene do Bebê',
    description: 'Acessórios essenciais para o bem-estar e tranquilidade dos pais.',
    price: 50.0,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Noite de Sono Extra dos Pais (Café Infinito)',
    description: 'Um mimo simbólico para dar energia aos papais nas madrugadas!',
    price: 80.0,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    category: 'brincadeiras',
  },
  {
    title: 'Vale Babá por 1 Hora',
    description: 'Brincadeira carinhosa para ajudar os papais a respirarem um pouquinho!',
    price: 100.0,
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    category: 'brincadeiras',
  },
];

const DEFAULT_GIFTS_EN: DefaultGiftItem[] = [
  {
    title: 'Newborn Diaper Pack (First Days)',
    description: 'Ultra-soft comfort with an umbilical cord cutout for the very first days.',
    price: 35.0,
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Size 1 Diaper Pack (Growing Fast)',
    description: 'The diapers babies use the most during their first 2 months!',
    price: 45.0,
    imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Size 2 Diaper Pack (Parent Favorite)',
    description: 'The size babies wear the longest. You can never have too many!',
    price: 55.0,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Size 3 Diaper Pack (Ready to Explore)',
    description: 'For the exciting stage of rolling, crawling, and discovering the world.',
    price: 60.0,
    imageUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Sensitive Baby Wipes Stock',
    description: 'Hypoallergenic, fragrance-free wipes made with 99% pure water.',
    price: 40.0,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Diaper Cream & Skincare Kit',
    description: 'Rash-prevention cream, soothing botanical oil, and gentle baby wash.',
    price: 75.0,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Relaxing Bath Time Kit',
    description: 'Mild tear-free shampoo, hooded towel, and cute bath toy.',
    price: 65.0,
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Digital Thermometer & Baby Care',
    description: 'Essential care accessories for baby comfort and parents’ peace of mind.',
    price: 50.0,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Extra Parents’ Sleep (Endless Coffee)',
    description: 'A playful treat to keep Mom and Dad energized during midnight feedings!',
    price: 80.0,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    category: 'brincadeiras',
  },
  {
    title: '1-Hour Babysitting Voucher',
    description: 'A thoughtful gift to give the new parents a much-deserved breather!',
    price: 100.0,
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    category: 'brincadeiras',
  },
];

const DEFAULT_GIFTS_ES: DefaultGiftItem[] = [
  {
    title: 'Paquete Pañales RN (Primeros Días)',
    description: 'Para los primeros días de vida, ultrasuaves y con corte para el ombligo.',
    price: 35.0,
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Paquete Pañales P (Creciendo Rápido)',
    description: '¡Los pañales más usados durante los primeros 2 meses del bebé!',
    price: 45.0,
    imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Paquete Pañales M (El Favorito)',
    description: 'La talla que más usan los bebés. ¡Nunca sobran en casa!',
    price: 55.0,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Paquete Pañales G (Para Explorar)',
    description: 'Ideal para la etapa en que empiezan a girar, gatear y divertirse.',
    price: 60.0,
    imageUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&auto=format&fit=crop&q=80',
    category: 'fraldas',
  },
  {
    title: 'Reserva de Toallitas Húmedas',
    description: 'Pack de toallitas hipoalergénicas con 99% de agua pura.',
    price: 40.0,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Kit Cremas y Cuidado de la Piel',
    description: 'Crema protectora contra rozaduras, aceite natural y jabón neutro.',
    price: 75.0,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Kit Hora del Baño Relajante',
    description: 'Champú de aroma suave, toalla con capucha y juguete de baño.',
    price: 65.0,
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Termómetro Digital e Higiene del Bebé',
    description: 'Accesorios esenciales para el bienestar y tranquilidad de los padres.',
    price: 50.0,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80',
    category: 'higiene',
  },
  {
    title: 'Noche Extra de Sueño (Café Infinito)',
    description: '¡Un detalle simbólico para dar energía a mamá y papá en las madrugadas!',
    price: 80.0,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    category: 'brincadeiras',
  },
  {
    title: 'Vale Niñera por 1 Hora',
    description: '¡Un mimo divertido para que los padres respiren tranquilos un ratito!',
    price: 100.0,
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    category: 'brincadeiras',
  },
];

export const DEFAULT_GIFT_ITEMS: DefaultGiftItem[] = DEFAULT_GIFTS_PT;

export function getDefaultGiftItems(locale: Locale = 'pt'): DefaultGiftItem[] {
  if (locale === 'en') return DEFAULT_GIFTS_EN;
  if (locale === 'es') return DEFAULT_GIFTS_ES;
  return DEFAULT_GIFTS_PT;
}

export const DEFAULT_STORY_MESSAGES: Record<Locale, string> = {
  pt: 'Estamos muito felizes e ansiosos pela chegada do nosso maior tesouro! Criamos esta página com muito amor para compartilhar esse momento mágico com você.',
  en: 'We are so happy and excited for the arrival of our greatest blessing! We created this page with all our love to share this magical moment with you.',
  es: '¡Estamos muy felices y emocionados por la llegada de nuestro mayor tesoro! Creamos esta página con mucho amor para compartir este momento mágico contigo.',
};

const BABY_HERO_FALLBACK_STORIES: readonly string[] = [
  'Criamos este espaço para compartilhar com você a alegria dessa espera e receber seu carinho em forma de fraldas e recados.',
  'We created this space to share the joy of waiting for our little one and receive your love through diapers and warm notes.',
  'Creamos este espacio para compartir contigo la alegría de esta espera y recibir tu cariño en forma de pañales y mensajes.',
];

export const CASH_GIFT_TITLES: Record<Locale, string> = {
  pt: 'Presente em Dinheiro',
  en: 'Cash Gift',
  es: 'Regalo en Efectivo',
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

const DEFAULT_GIFT_LISTS: readonly (readonly DefaultGiftItem[])[] = [
  DEFAULT_GIFTS_PT,
  DEFAULT_GIFTS_EN,
  DEFAULT_GIFTS_ES,
];

const DEFAULT_GIFT_TITLE_INDEX = new Map<string, number>();
for (const list of DEFAULT_GIFT_LISTS) {
  list.forEach((item, index) => {
    DEFAULT_GIFT_TITLE_INDEX.set(normalizeText(item.title), index);
  });
}

const DEFAULT_GIFT_DESCRIPTION_SETS: readonly Set<string>[] = DEFAULT_GIFTS_PT.map((_, index) => {
  return new Set(
    DEFAULT_GIFT_LISTS.map((list) => normalizeText(list[index].description))
  );
});

const CASH_GIFT_TITLE_SET = new Set(
  Object.values(CASH_GIFT_TITLES).map(normalizeText)
);

const CANONICAL_STORY_SET = new Set([
  ...Object.values(DEFAULT_STORY_MESSAGES).map(normalizeText),
  ...BABY_HERO_FALLBACK_STORIES.map(normalizeText),
]);

export function localizeGiftTitle(title: string, locale: Locale): string {
  if (!title) return title;
  const normalized = normalizeText(title);
  if (CASH_GIFT_TITLE_SET.has(normalized)) {
    return CASH_GIFT_TITLES[locale];
  }
  const index = DEFAULT_GIFT_TITLE_INDEX.get(normalized);
  if (index !== undefined) {
    return getDefaultGiftItems(locale)[index].title;
  }
  return title;
}

export function localizeGiftContent(
  gift: { title: string; description?: string | null },
  locale: Locale
): { title: string; description: string | null } {
  const normalizedTitle = normalizeText(gift.title || '');
  const index = DEFAULT_GIFT_TITLE_INDEX.get(normalizedTitle);

  if (index === undefined) {
    return {
      title: localizeGiftTitle(gift.title, locale),
      description: gift.description ?? null,
    };
  }

  const targetItem = getDefaultGiftItems(locale)[index];
  const rawDescription = gift.description ?? null;
  const isCanonicalDescription =
    Boolean(rawDescription && rawDescription.trim()) &&
    DEFAULT_GIFT_DESCRIPTION_SETS[index].has(normalizeText(rawDescription!));

  return {
    title: targetItem.title,
    description: isCanonicalDescription ? targetItem.description : rawDescription,
  };
}

export function localizeDefaultStoryMessage(
  storyMessage: string | null | undefined,
  locale: Locale
): string | null {
  if (!storyMessage || !storyMessage.trim()) return null;
  if (CANONICAL_STORY_SET.has(normalizeText(storyMessage))) {
    return DEFAULT_STORY_MESSAGES[locale];
  }
  return storyMessage;
}
