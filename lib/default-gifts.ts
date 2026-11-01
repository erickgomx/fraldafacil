export interface DefaultGiftItem {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'fraldas' | 'higiene' | 'brincadeiras';
}

export const DEFAULT_GIFT_ITEMS: DefaultGiftItem[] = [
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
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-5776d54d1a58?w=500&auto=format&fit=crop&q=80',
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
