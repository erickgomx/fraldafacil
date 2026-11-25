'use client';

import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { DEFAULT_GIFT_IMAGE_URL, getGiftGalleryOptions } from '@/lib/gift-gallery';
import { localizeGiftContent } from '@/lib/default-gifts';
import { useI18n } from '@/components/LanguageProvider';
import { painelDict } from '@/lib/i18n/dictionaries/painel';

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
  const { locale, t, formatCurrency } = useI18n();
  const dict = painelDict[locale].gifts;
  const galleryOptions = getGiftGalleryOptions(locale);

  const [gifts, setGifts] = useState<AdminGiftItem[]>(initialGifts);
  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | 'fraldas' | 'higiene' | 'brincadeiras'
  >('ALL');
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

  const filteredGifts = useMemo(() => {
    if (categoryFilter === 'ALL') return gifts;
    return gifts.filter((g) => g.category === categoryFilter);
  }, [gifts, categoryFilter]);

  const activeGiftsCount = useMemo(() => gifts.filter((g) => g.active).length, [gifts]);

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
    if (!confirm(dict.confirmDelete)) return;

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
      const match = galleryOptions.find((opt) => opt.category === nextCategory);
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
    const localizedGift = localizeGiftContent(item, locale);
    setEditingGift(item);
    setTitle(localizedGift.title);
    setDescription(localizedGift.description || '');
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
      setFormError(dict.invalidPriceError);
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
        setFormError(data.error || dict.saveErrorFallback);
      }
    } catch (err) {
      console.error('Erro ao salvar presente:', err);
      setFormError(dict.saveConnectionError);
    } finally {
      setLoading(false);
    }
  };

  const selectedGalleryOption =
    galleryOptions.find((opt) => opt.imageUrl === imageUrl) ?? galleryOptions[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal-900">
            {dict.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-sans mt-1">
            {dict.pageSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.newGiftButton}</span>
        </button>
      </div>

      {/* Filtros simples por categoria e contagem */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              categoryFilter === 'ALL'
                ? 'bg-charcoal-900 text-white border-charcoal-900'
                : 'bg-white text-charcoal-600 border-warm-border hover:bg-cream-100'
            }`}
          >
            {t(dict.filterAll, { count: gifts.length })}
          </button>
          {(['fraldas', 'higiene', 'brincadeiras'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                categoryFilter === cat
                  ? 'bg-charcoal-900 text-white border-charcoal-900'
                  : 'bg-white text-charcoal-600 border-warm-border hover:bg-cream-100'
              }`}
            >
              {dict.categories[cat]}
            </button>
          ))}
        </div>

        <span className="text-xs text-charcoal-500">
          {t(dict.activeCount, { count: activeGiftsCount })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGifts.map((item) => {
          const localizedGift = localizeGiftContent(item, locale);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between ${
                item.active
                  ? 'border-warm-border shadow-subtle'
                  : 'border-warm-border/60 opacity-65 bg-cream-50/50'
              }`}
            >
              <div>
                <div className="relative h-32 w-full rounded-xl overflow-hidden bg-cream-100 mb-3 border border-warm-border/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl || DEFAULT_GIFT_IMAGE_URL}
                    alt={localizedGift.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_GIFT_IMAGE_URL;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-charcoal-700 border border-warm-border/60">
                    {dict.categories[item.category as keyof typeof dict.categories] ?? item.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id, item.active)}
                    className={`absolute top-2.5 right-2.5 text-[11px] px-2.5 py-0.5 rounded-full transition border ${
                      item.active
                        ? 'bg-emerald-50/95 text-emerald-800 border-emerald-200 font-medium'
                        : 'bg-stone-100/95 text-charcoal-600 border-stone-200'
                    }`}
                  >
                    {item.active ? dict.visibleBadge : dict.hiddenBadge}
                  </button>
                </div>

                <h3 className="font-serif text-base font-medium text-charcoal-900 line-clamp-1">
                  {localizedGift.title}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed">
                  {localizedGift.description || dict.defaultDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-warm-border/60 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-charcoal-900 tabular-nums">
                  {formatCurrency(item.price)}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    title={dict.editTitle}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-700 bg-cream-50 hover:bg-cream-100 border border-warm-border transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{dict.editButton}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    title={dict.deleteTitle}
                    className="w-8 h-8 rounded-lg text-charcoal-400 hover:text-dusty-rose hover:bg-dusty-rose-light/60 flex items-center justify-center transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-card border border-warm-border relative">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-cream-100 text-charcoal-600 flex items-center justify-center hover:bg-cream-200 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-1">
              {editingGift ? dict.modalEditTitle : dict.modalCreateTitle}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mb-5">
              {editingGift ? dict.modalEditSubtitle : dict.modalCreateSubtitle}
            </p>

            {formError && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-dusty-rose/10 border border-dusty-rose/30 text-xs text-dusty-rose">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGift} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1.5">
                  {dict.fieldTitleLabel}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={dict.fieldTitlePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-sm text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1.5">
                  {dict.fieldDescriptionLabel}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={dict.fieldDescriptionPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-sm text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal-700 mb-1.5">
                    {dict.fieldPriceLabel}
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={dict.fieldPricePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-sm font-semibold text-charcoal-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-700 mb-1.5">
                    {dict.fieldCategoryLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value as 'fraldas' | 'higiene' | 'brincadeiras')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border text-sm text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900 bg-white"
                  >
                    <option value="fraldas">{dict.categories.fraldas}</option>
                    <option value="higiene">{dict.categories.higiene}</option>
                    <option value="brincadeiras">{dict.categories.brincadeiras}</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-charcoal-700">
                    {dict.fieldPhotoLabel}
                  </label>
                  <span className="text-xs text-charcoal-500">{selectedGalleryOption.label}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {galleryOptions.map((option) => {
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
                        className={`group relative rounded-xl overflow-hidden border text-left transition ${
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

                <p className="text-xs text-charcoal-400 mt-2">
                  {dict.occasionPrefix} {selectedGalleryOption.occasion}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle mt-2 disabled:opacity-60"
              >
                {loading
                  ? dict.savingButton
                  : editingGift
                  ? dict.saveChangesButton
                  : dict.saveCreateButton}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
