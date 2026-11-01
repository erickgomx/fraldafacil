'use client';

import { useState } from 'react';
import { Gift, Heart, Sparkles, PlusCircle } from 'lucide-react';

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
    { id: 'todos', label: 'Todos os Mimos' },
    { id: 'fraldas', label: 'Pacotes de Fraldas 🍼' },
    { id: 'higiene', label: 'Banho & Higiene 🛁' },
    { id: 'brincadeiras', label: 'Brincadeiras & Pais ☕' },
  ];

  const filteredItems = items.filter((item) => {
    if (!item.active) return false;
    if (selectedCategory === 'todos') return true;
    return item.category === selectedCategory;
  });

  return (
    <section className="my-12 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <Gift className="w-3.5 h-3.5 text-rose-500" />
          <span>Lista de Presentes & Fraldas</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
          Escolha um mimo para abençoar essa nova vida
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2">
          Os presentes são convertidos em dinheiro via Pix diretamente para os pais comprarem tudo no tamanho certo!
        </p>
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`py-2 px-4 rounded-full text-xs md:text-sm font-bold transition shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Presentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
          >
            {/* Imagem */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
                {item.category}
              </span>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description || 'Presente com muito amor para a chegada do bebê.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Valor Simbólico</span>
                  <span className="text-lg font-black text-slate-800">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={() => onSelectGift(item)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-rose-500 hover:opacity-95 shadow-md shadow-sky-500/20 active:scale-95 transition flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Presentear</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Contribuição Livre */}
      <div className="mt-10 max-w-xl mx-auto bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-6 text-center shadow-sm">
        <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-slate-800">Quer contribuir com outro valor?</h3>
        <p className="text-xs text-slate-600 mt-1 mb-4">
          Você pode escolher qualquer quantia livre para enviar diretamente no Pix dos pais.
        </p>
        <button
          onClick={() => onSelectGift(null)}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-95 transition"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Presentear com Valor Personalizado</span>
        </button>
      </div>
    </section>
  );
}
