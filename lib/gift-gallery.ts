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

export interface GiftGalleryOption {
  id: string;
  label: string;
  occasion: string;
  category: 'fraldas' | 'higiene' | 'brincadeiras';
  imageUrl: string;
}

export const GIFT_GALLERY_OPTIONS: GiftGalleryOption[] = [
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

export const DEFAULT_GIFT_IMAGE_URL = GIFT_GALLERY_OPTIONS[0].imageUrl;

export const ALLOWED_GIFT_IMAGE_URLS = new Set(
  GIFT_GALLERY_OPTIONS.map((option) => option.imageUrl)
);
