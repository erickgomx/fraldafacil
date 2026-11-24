/**
 * ============================================================================
 * CLIENTE DE EDIÇÃO DA LISTA DE PRESENTES (PresentesClient)
 * ============================================================================
 * Permite aos pais:
 * - Adicionar novos presentes personalizados com título, valor e foto.
 * - Ativar ou desativar itens da lista com um switch toggle em tempo real.
 * - Excluir presentes não desejados da vitrine.
 */

'use client';

import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { DEFAULT_GIFT_IMAGE_URL, GIFT_GALLERY_OPTIONS } from '@/lib/gift-gallery';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<AdminGiftItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('50');
  const [category, setCategory] = useState<'fraldas' | 'higiene' | 'brincadeiras'>('fraldas');
  const [imageUrl, setImageUrl] = useState(DEFAULT_GIFT_IMAGE_URL);
  const [hasPickedImage, setHasPickedImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    if (!confirm('Deseja remover este presente da lista?')) return;

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

  const handleCategoryChange = (nextCategory: 'fraldas' | 'higiene' | 'brincadeiras') => {
    setCategory(nextCategory);
    if (!hasPickedImage && !editingGift) {
      const match = GIFT_GALLERY_OPTIONS.find((opt) => opt.category === nextCategory);
      if (match) setImageUrl(match.imageUrl);
    }
  };

  const resetForm = () => {
    setEditingGift(null);
    setTitle('');
    setDescription('');
    setPrice('50');
    setCategory('fraldas');
    setImageUrl(DEFAULT_GIFT_IMAGE_URL);
    setHasPickedImage(false);
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminGiftItem) => {
    const validCat = (['fraldas', 'higiene', 'brincadeiras'].includes(item.category)
      ? item.category
      : 'fraldas') as 'fraldas' | 'higiene' | 'brincadeiras';
    setEditingGift(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setPrice(String(item.price));
    setCategory(validCat);
    setImageUrl(item.imageUrl || DEFAULT_GIFT_IMAGE_URL);
    setHasPickedImage(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = parseFloat(String(price).replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice < 1 || parsedPrice > 50000) {
      setFormError('Informe um valor válido entre R$ 1,00 e R$ 50.000,00.');
      return;
    }

    setLoading(true);
    try {
      const isEditing = Boolean(editingGift);
      const res = await fetch('/api/events/gifts', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing
            ? {
                id: editingGift!.id,
                title,
                description: description.trim() ? description.trim() : null,
                price: parsedPrice,
                category,
                imageUrl,
              }
            : {
                eventId,
                title,
                description,
                price: parsedPrice,
                category,
                imageUrl,
              }
        ),
      });

      const data = await res.json();
      if (res.ok && data.gift) {
        if (isEditing) {
          setGifts((prev) => prev.map((g) => (g.id === editingGift!.id ? data.gift : g)));
        } else {
          setGifts((prev) => [...prev, data.gift]);
        }
        setIsModalOpen(false);
        resetForm();
      } else {
        setFormError(data.error || 'Não foi possível salvar o presente.');
      }
    } catch (err) {
      console.error('Erro ao salvar presente:', err);
      setFormError('Erro de conexão ao salvar o presente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedGalleryOption =
    GIFT_GALLERY_OPTIONS.find((opt) => opt.imageUrl === imageUrl) ?? GIFT_GALLERY_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
        <div>
          <h1 className="font-serif text-2xl font-normal text-charcoal-900">
            Itens da Vitrine de Presentes
          </h1>
          <p className="text-xs text-charcoal-500 font-sans mt-0.5">
            Gerencie, edite ou personalize quais fraldas e mimos estão visíveis para os convidados
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Presente</span>
        </button>
      </div>

      {/* Grid de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl p-4 border transition flex flex-col justify-between ${
              item.active ? 'border-warm-border shadow-subtle' : 'border-warm-border/60 opacity-60 bg-cream-50/50'
            }`}
          >
            <div>
              <div className="relative h-28 w-full rounded-lg overflow-hidden bg-cream-100 mb-3 border border-warm-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl || DEFAULT_GIFT_IMAGE_URL}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_GIFT_IMAGE_URL;
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-charcoal-700 border border-warm-border/60">
                  {item.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(item.id, item.active)}
                  className={`absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded transition border ${
                    item.active
                      ? 'bg-white/95 text-charcoal-800 border-warm-border font-medium'
                      : 'bg-stone-100/95 text-charcoal-500 border-stone-200'
                  }`}
                >
                  {item.active ? 'Visível' : 'Oculto'}
                </button>
              </div>

              <h3 className="font-serif text-sm font-medium text-charcoal-900 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 font-sans">
                {item.description || 'Presente especial para a chegada do bebê.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-warm-border/60 flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-charcoal-900 tabular-nums">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  title="Editar presente"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-charcoal-700 bg-cream-50 hover:bg-cream-100 border border-warm-border transition"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  title="Excluir presente"
                  className="w-7 h-7 rounded-lg text-charcoal-400 hover:text-dusty-rose hover:bg-dusty-rose-light/60 flex items-center justify-center transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-card border border-warm-border relative">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-cream-100 text-charcoal-500 flex items-center justify-center hover:bg-cream-200 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-serif text-xl font-normal text-charcoal-900 mb-1">
              {editingGift ? 'Editar Presente' : 'Cadastrar Presente'}
            </h2>
            <p className="text-xs text-charcoal-500 mb-5 font-sans">
              {editingGift
                ? 'Atualize o título, descrição, categoria, valor ou foto do presente'
                : 'Insira o título, categoria, valor sugerido e escolha uma foto da galeria'}
            </p>

            {formError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-dusty-rose/10 border border-dusty-rose/30 text-xs text-dusty-rose font-sans">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGift} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  Título do Presente *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Fralda Tamanho GG"
                  className="w-full px-3.5 py-2 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  Descrição Curta
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Para a fase das primeiras brincadeiras no chão"
                  className="w-full px-3.5 py-2 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
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
                    className="w-full px-3.5 py-2 rounded-lg border border-warm-border text-xs font-mono font-semibold text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value as 'fraldas' | 'higiene' | 'brincadeiras')
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900 bg-white"
                  >
                    <option value="fraldas">Fraldas</option>
                    <option value="higiene">Higiene</option>
                    <option value="brincadeiras">Cuidados</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500">
                    Foto do Presente (Galeria) *
                  </label>
                  <span className="text-[11px] text-charcoal-500 font-sans">
                    {selectedGalleryOption.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GIFT_GALLERY_OPTIONS.map((option) => {
                    const isSelected = imageUrl === option.imageUrl;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setImageUrl(option.imageUrl);
                          setHasPickedImage(true);
                        }}
                        title={option.occasion}
                        className={`group relative rounded-lg overflow-hidden border text-left transition ${
                          isSelected
                            ? 'border-charcoal-900 ring-2 ring-charcoal-900/20'
                            : 'border-warm-border hover:border-charcoal-400'
                        }`}
                      >
                        <div className="relative h-16 w-full bg-cream-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={option.imageUrl}
                            alt={option.label}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-charcoal-900 text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="px-2 py-1.5 bg-white">
                          <span className="block text-[11px] font-medium text-charcoal-800 truncate">
                            {option.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-charcoal-400 mt-1.5 font-sans">
                  Ocasião: {selectedGalleryOption.occasion}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle mt-4"
              >
                {loading
                  ? 'Salvando...'
                  : editingGift
                  ? 'Salvar Alterações'
                  : 'Salvar Presente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
