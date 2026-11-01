'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

export interface AdminGiftItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  category: string;
  active: boolean;
}

interface PresentesClientProps {
  eventId: string;
  initialGifts: AdminGiftItem[];
}

export default function PresentesClient({ eventId, initialGifts }: PresentesClientProps) {
  const [gifts, setGifts] = useState<AdminGiftItem[]>(initialGifts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('50');
  const [category, setCategory] = useState<'fraldas' | 'higiene' | 'brincadeiras'>('fraldas');
  const [imageUrl, setImageUrl] = useState('');

  const handleToggleActive = async (giftId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/events/gifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: giftId,
          active: !currentActive,
        }),
      });

      if (res.ok) {
        setGifts((prev) =>
          prev.map((g) => (g.id === giftId ? { ...g, active: !currentActive } : g))
        );
      }
    } catch (err) {
      console.error('Erro ao atualizar presente:', err);
    }
  };

  const handleDelete = async (giftId: string) => {
    if (!confirm('Tem certeza que deseja excluir este presente?')) return;

    try {
      const res = await fetch(`/api/events/gifts?id=${giftId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setGifts((prev) => prev.filter((g) => g.id !== giftId));
      }
    } catch (err) {
      console.error('Erro ao excluir presente:', err);
    }
  };

  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/events/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          title,
          description,
          price: parseFloat(price),
          category,
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.gift) {
        setGifts((prev) => [...prev, data.gift]);
        setIsAddModalOpen(false);
        setTitle('');
        setDescription('');
        setPrice('50');
        setImageUrl('');
      }
    } catch (err) {
      console.error('Erro ao criar presente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Gerenciar Presentes & Fraldas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ative, desative ou adicione novos mimos e fraldas à sua vitrine pública
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Novo Presente</span>
        </button>
      </div>

      {/* Grid de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between ${
              item.active ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {item.category}
                </span>

                <button
                  onClick={() => handleToggleActive(item.id, item.active)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                    item.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.active ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <span>{item.active ? 'Ativo na Vitrine' : 'Inativo (Oculto)'}</span>
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-base font-black text-slate-800">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Excluir Presente"
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Adicionar Presente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black text-slate-800 mb-1">Novo Presente ou Fralda</h2>
            <p className="text-xs text-slate-500 mb-5">
              Cadastre um novo mimo para os convidados presentearem
            </p>

            <form onSubmit={handleCreateGift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Título do Presente *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Fralda Tamanho GG"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Descrição Curta
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Pacote para a fase dos primeiros passos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50,00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as 'fraldas' | 'higiene' | 'brincadeiras')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                  >
                    <option value="fraldas">Fraldas 🍼</option>
                    <option value="higiene">Higiene 🛁</option>
                    <option value="brincadeiras">Brincadeiras ☕</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  URL da Imagem (Opcional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Salvando...' : 'Salvar Presente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
