'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export interface GiftItemData {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  category: string;
  active: boolean;
}

interface DiaperCatalogProps {
  items: GiftItemData[];
  onSelectGift: (gift: GiftItemData | null) => void;
}

export default function DiaperCatalog({ items, onSelectGift }: DiaperCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Itens' },
    { id: 'fraldas', label: 'Fraldas' },
    { id: 'higiene', label: 'Higiene & Banho' },
    { id: 'brincadeiras', label: 'Cuidados com os Pais' },
  ];

  const filteredItems = items.filter((item) => {
    if (!item.active) return false;
    if (selectedCategory === 'todos') return true;
    return item.category === selectedCategory;
  });

  return (
    <section className="my-16 max-w-5xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
          Lista de Presentes
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
          Fraldas & Mimos para o Bebê
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto mt-2 font-sans">
          Os valores são repassados aos pais via Pix para que possam adquirir cada item no momento e tamanho exatos.
        </p>
      </div>

      {/* Categorias Sóbrias */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-charcoal-900 text-white shadow-subtle'
                : 'bg-white text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-50 border border-warm-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grade de Presentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-xl overflow-hidden border border-warm-border shadow-subtle flex flex-col justify-between hover:border-stone-300 transition"
          >
            {/* Imagem */}
            <div className="relative h-44 w-full overflow-hidden bg-cream-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition duration-300 group-hover:opacity-95"
              />
              <span className="absolute top-2.5 right-2.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-charcoal-600 border border-warm-border/50">
                {item.category}
              </span>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base text-charcoal-900 font-medium line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed font-sans">
                  {item.description || 'Presente especial para a chegada do bebê.'}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-warm-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-charcoal-400 block uppercase">
                    Valor sugerido
                  </span>
                  <span className="font-mono text-sm font-semibold text-charcoal-900 tabular-nums">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={() => onSelectGift(item)}
                  className="py-2 px-3.5 rounded-lg text-xs font-medium text-white bg-charcoal-900 hover:bg-charcoal-800 transition active:scale-[0.98] shadow-subtle"
                >
                  Presentear
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Caixa de Contribuição Livre */}
      <div className="mt-12 max-w-xl mx-auto bg-white border border-warm-border rounded-xl p-6 text-center shadow-subtle">
        <h3 className="font-serif text-lg text-charcoal-900 font-normal">
          Deseja contribuir com outro valor?
        </h3>
        <p className="text-xs text-charcoal-500 mt-1 mb-4 font-sans max-w-md mx-auto">
          Você pode definir qualquer quantia livre para enviar diretamente pelo Pix aos pais.
        </p>
        <button
          onClick={() => onSelectGift(null)}
          className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg text-xs font-medium bg-cream-100 hover:bg-cream-200/70 border border-warm-border text-charcoal-800 transition"
        >
          <Plus className="w-3.5 h-3.5 text-charcoal-500" />
          <span>Presentear com valor personalizado</span>
        </button>
      </div>
    </section>
  );
}
