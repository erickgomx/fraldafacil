/**
 * ============================================================================
 * GALERIA PRÉ-DEFINIDA DE IMAGENS PARA PRESENTES
 * ============================================================================
 * Conjunto fixo de 8 imagens curadas para diferentes ocasiões de presentes
 * (fraldas, enxoval, banho, higiene, brincadeiras e mimos para os pais).
 *
 * Mantém o banco de dados leve (apenas URLs estáticas permitidas) e evita
 * uploads ou links externos arbitrários.
 */

import type { Locale } from './i18n/types';

export interface GiftGalleryOption {
  id: string;
  label: string;
  occasion: string;
  category: 'fraldas' | 'higiene' | 'brincadeiras';
  imageUrl: string;
}

const GIFT_GALLERY_PT: GiftGalleryOption[] = [
  {
    id: 'fraldas-rn',
    label: 'Fraldas & RN',
    occasion: 'Primeiros dias e pacotes de fraldas',
    category: 'fraldas',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'crescimento',
    label: 'Crescimento',
    occasion: 'Fraldas P, M, G e fases do bebê',
    category: 'fraldas',
    imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'quartinho',
    label: 'Quartinho',
    occasion: 'Enxoval, berço e aconchego',
    category: 'fraldas',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'banho',
    label: 'Hora do Banho',
    occasion: 'Banho relaxante, toalha e sabonete',
    category: 'higiene',
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'cuidados-pele',
    label: 'Pele & Troca',
    occasion: 'Pomadas, loções e trocador',
    category: 'higiene',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'higiene-saude',
    label: 'Higiene & Saúde',
    occasion: 'Lenços umedecidos e farmacinha',
    category: 'higiene',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'brincadeiras',
    label: 'Brincadeiras',
    occasion: 'Passeios, mordedores e diversão',
    category: 'brincadeiras',
    imageUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'mimo-pais',
    label: 'Mimo aos Pais',
    occasion: 'Café infinito, vale-babá e descanso',
    category: 'brincadeiras',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
  },
];

const GIFT_GALLERY_EN: GiftGalleryOption[] = [
  {
    id: 'fraldas-rn',
    label: 'Newborn & Diapers',
    occasion: 'First days and diaper packs',
    category: 'fraldas',
    imageUrl: GIFT_GALLERY_PT[0].imageUrl,
  },
  {
    id: 'crescimento',
    label: 'Growing Stages',
    occasion: 'Sizes 1, 2, 3 and baby milestones',
    category: 'fraldas',
    imageUrl: GIFT_GALLERY_PT[1].imageUrl,
  },
  {
    id: 'quartinho',
    label: 'Nursery',
    occasion: 'Layette, crib, and cozy blankets',
    category: 'fraldas',
    imageUrl: GIFT_GALLERY_PT[2].imageUrl,
  },
  {
    id: 'banho',
    label: 'Bath Time',
    occasion: 'Relaxing bath, towel, and mild wash',
    category: 'higiene',
    imageUrl: GIFT_GALLERY_PT[3].imageUrl,
  },
  {
    id: 'cuidados-pele',
    label: 'Skin & Changing',
    occasion: 'Diaper cream, lotions, and changing pad',
    category: 'higiene',
    imageUrl: GIFT_GALLERY_PT[4].imageUrl,
  },
  {
    id: 'higiene-saude',
    label: 'Hygiene & Care',
    occasion: 'Baby wipes and health essentials',
    category: 'higiene',
    imageUrl: GIFT_GALLERY_PT[5].imageUrl,
  },
  {
    id: 'brincadeiras',
    label: 'Playtime',
    occasion: 'Outings, teethers, and fun',
    category: 'brincadeiras',
    imageUrl: GIFT_GALLERY_PT[6].imageUrl,
  },
  {
    id: 'mimo-pais',
    label: 'Treat for Parents',
    occasion: 'Endless coffee, babysitting, and rest',
    category: 'brincadeiras',
    imageUrl: GIFT_GALLERY_PT[7].imageUrl,
  },
];

const GIFT_GALLERY_ES: GiftGalleryOption[] = [
  {
    id: 'fraldas-rn',
    label: 'Pañales y RN',
    occasion: 'Primeros días y paquetes de pañales',
    category: 'fraldas',
    imageUrl: GIFT_GALLERY_PT[0].imageUrl,
  },
  {
    id: 'crescimento',
    label: 'Crecimiento',
    occasion: 'Pañales P, M, G y etapas del bebé',
    category: 'fraldas',
    imageUrl: GIFT_GALLERY_PT[1].imageUrl,
  },
  {
    id: 'quartinho',
    label: 'Cuartito',
    occasion: 'Ajuar, cuna y abrigo',
    category: 'fraldas',
    imageUrl: GIFT_GALLERY_PT[2].imageUrl,
  },
  {
    id: 'banho',
    label: 'Hora del Baño',
    occasion: 'Baño relajante, toalla y jabón',
    category: 'higiene',
    imageUrl: GIFT_GALLERY_PT[3].imageUrl,
  },
  {
    id: 'cuidados-pele',
    label: 'Piel y Cambio',
    occasion: 'Cremas, lociones y cambiador',
    category: 'higiene',
    imageUrl: GIFT_GALLERY_PT[4].imageUrl,
  },
  {
    id: 'higiene-saude',
    label: 'Higiene y Salud',
    occasion: 'Toallitas húmedas y botiquín',
    category: 'higiene',
    imageUrl: GIFT_GALLERY_PT[5].imageUrl,
  },
  {
    id: 'brincadeiras',
    label: 'Juegos',
    occasion: 'Paseos, mordedores y diversión',
    category: 'brincadeiras',
    imageUrl: GIFT_GALLERY_PT[6].imageUrl,
  },
  {
    id: 'mimo-pais',
    label: 'Mimo para Padres',
    occasion: 'Café infinito, vale de niñera y descanso',
    category: 'brincadeiras',
    imageUrl: GIFT_GALLERY_PT[7].imageUrl,
  },
];

export const GIFT_GALLERY_OPTIONS: GiftGalleryOption[] = GIFT_GALLERY_PT;

export function getGiftGalleryOptions(locale: Locale = 'pt'): GiftGalleryOption[] {
  if (locale === 'en') return GIFT_GALLERY_EN;
  if (locale === 'es') return GIFT_GALLERY_ES;
  return GIFT_GALLERY_PT;
}

export const DEFAULT_GIFT_IMAGE_URL = GIFT_GALLERY_OPTIONS[0].imageUrl;

export const ALLOWED_GIFT_IMAGE_URLS = new Set(
  GIFT_GALLERY_OPTIONS.map((option) => option.imageUrl)
);
