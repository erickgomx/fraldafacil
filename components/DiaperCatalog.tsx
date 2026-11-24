'use client';

import { forwardRef, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, type Variants } from 'framer-motion';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import { useI18n } from '@/components/LanguageProvider';
import { eventDict } from '@/lib/i18n/dictionaries/event';
import { localizeGiftContent } from '@/lib/default-gifts';

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

const EASE = [0.22, 1, 0.36, 1] as const;

const headerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: Math.min(i, 8) * 0.06 },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.25, ease: EASE } },
};

const FEATURED_KEY = '__custom-value__';

function getFeaturedIndex(count: number) {
  const totalCells = count + 1;
  const rows = Math.ceil(totalCells / 3);
  const middleRow = Math.floor((rows - 1) / 2);
  return Math.min(middleRow * 3 + 1, count);
}

export default function DiaperCatalog({ items, onSelectGift }: DiaperCatalogProps) {
  const { locale, formatCurrency } = useI18n();
  const dict = eventDict[locale].catalog;
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: dict.categories.todos },
    { id: 'fraldas', label: dict.categories.fraldas },
    { id: 'higiene', label: dict.categories.higiene },
    { id: 'brincadeiras', label: dict.categories.brincadeiras },
  ];

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (!item.active) return false;
        if (selectedCategory === 'todos') return true;
        return item.category === selectedCategory;
      }),
    [items, selectedCategory]
  );

  const gridEntries = useMemo(() => {
    const entries: Array<{ type: 'gift'; item: GiftItemData } | { type: 'featured' }> =
      filteredItems.map((item) => ({ type: 'gift' as const, item }));
    entries.splice(getFeaturedIndex(filteredItems.length), 0, { type: 'featured' });
    return entries;
  }, [filteredItems]);

  return (
    <section className="relative my-20 max-w-5xl mx-auto px-6">
      <motion.div
        variants={headerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-10"
      >
        <motion.span
          variants={fadeUp}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-charcoal-500 block mb-2"
        >
          {dict.eyebrow}
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal"
        >
          {dict.titlePrefix} <span className="italic">{dict.titleHighlight}</span>
        </motion.h2>
        <motion.div
          variants={fadeUp}
          className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-charcoal-500/40 to-transparent"
        />
        <motion.p
          variants={fadeUp}
          className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto mt-4 font-sans"
        >
          {dict.subtitle}
        </motion.p>
      </motion.div>

      <LayoutGroup id="gift-categories">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex flex-wrap justify-center gap-1 p-1 rounded-xl bg-white/80 backdrop-blur-sm border border-warm-border shadow-subtle">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 rounded-lg bg-charcoal-900 shadow-subtle"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </LayoutGroup>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <AnimatePresence mode="popLayout">
          {gridEntries.map((entry, i) =>
            entry.type === 'featured' ? (
              <FeaturedCustomCard
                key={FEATURED_KEY}
                index={i}
                onClick={() => onSelectGift(null)}
                labels={dict.featured}
              />
            ) : (
              (() => {
                const localized = localizeGiftContent(entry.item, locale);
                const localizedItem: GiftItemData = {
                  ...entry.item,
                  title: localized.title,
                  description: localized.description,
                };
                return (
                  <GiftCard
                    key={entry.item.id}
                    item={localizedItem}
                    index={i}
                    onClick={() => onSelectGift(localizedItem)}
                    categoryBadge={
                      dict.categoryBadge[entry.item.category as keyof typeof dict.categoryBadge] ??
                      entry.item.category
                    }
                    defaultDescription={dict.defaultDescription}
                    suggestedValueLabel={dict.suggestedValue}
                    giftButtonLabel={dict.giftButton}
                    formattedPrice={formatCurrency(entry.item.price)}
                  />
                );
              })()
            )
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

const GiftCard = forwardRef<
  HTMLElement,
  {
    item: GiftItemData;
    index: number;
    onClick: () => void;
    categoryBadge: string;
    defaultDescription: string;
    suggestedValueLabel: string;
    giftButtonLabel: string;
    formattedPrice: string;
  }
>(function GiftCard(
  {
    item,
    index,
    onClick,
    categoryBadge,
    defaultDescription,
    suggestedValueLabel,
    giftButtonLabel,
    formattedPrice,
  },
  ref
) {
  return (
    <motion.article
      ref={ref}
      layout
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      exit="exit"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -6 }}
      transition={{ layout: { duration: 0.5, ease: EASE } }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-warm-border shadow-subtle flex flex-col justify-between transition-[box-shadow,border-color] duration-500 hover:shadow-lift hover:border-stone-300"
    >
      <div className="relative h-48 w-full overflow-hidden bg-cream-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-charcoal-600 border border-warm-border/50">
          {categoryBadge}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-base text-charcoal-900 font-medium line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed font-sans">
            {item.description || defaultDescription}
          </p>
        </div>

        <div className="mt-5 pt-3.5 border-t border-warm-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-charcoal-500 block uppercase tracking-wider">
              {suggestedValueLabel}
            </span>
            <span className="font-mono text-sm font-semibold text-charcoal-900 tabular-nums">
              {formattedPrice}
            </span>
          </div>

          <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.96 }}
            className="relative overflow-hidden inline-flex items-center gap-1 py-2 pl-3.5 pr-3 rounded-lg text-xs font-medium text-white bg-charcoal-900 hover:bg-charcoal-800 transition-colors shadow-subtle"
          >
            <span>{giftButtonLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});

const FeaturedCustomCard = forwardRef<
  HTMLElement,
  {
    index: number;
    onClick: () => void;
    labels: {
      badge: string;
      titlePrefix: string;
      titleHighlight: string;
      description: string;
      button: string;
      footer: string;
    };
  }
>(function FeaturedCustomCard({ index, onClick, labels }, ref) {
  return (
    <motion.article
      ref={ref}
      layout
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      exit="exit"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -8 }}
      transition={{ layout: { duration: 0.5, ease: EASE } }}
      className="group relative z-10 rounded-2xl p-[1.5px] overflow-hidden shadow-featured lg:scale-[1.04] min-h-[360px]"
    >
      <div className="pointer-events-none absolute -inset-[60%] featured-ring animate-spin-slow opacity-80" />

      <div className="relative h-full rounded-[15px] bg-charcoal-900 text-cream-50 overflow-hidden flex flex-col">
        <div className="pointer-events-none absolute inset-0 grain opacity-60" />
        <div className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-terracotta/30 blur-3xl animate-drift" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-dusty-rose/25 blur-3xl animate-drift [animation-delay:-7s]" />

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent animate-shimmer" />

        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-6">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-cream-200/80 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] mb-6">
            <Sparkles className="w-3 h-3 text-terracotta" />
            {labels.badge}
          </span>

          <div className="relative mb-6">
            <span className="absolute inset-0 rounded-full bg-terracotta/40 animate-pulse-ring" />
            <span className="absolute inset-0 rounded-full bg-terracotta/30 animate-pulse-ring [animation-delay:1.2s]" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-terracotta to-dusty-rose flex items-center justify-center shadow-lg animate-float">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>

          <h3 className="font-serif text-2xl font-normal leading-tight">
            {labels.titlePrefix} <span className="italic text-cream-200">{labels.titleHighlight}</span>
          </h3>
          <p className="text-xs text-stone-400 mt-2.5 leading-relaxed font-sans max-w-[240px]">
            {labels.description}
          </p>
        </div>

        <div className="relative px-5 pb-5">
          <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
            className="group/btn relative w-full overflow-hidden inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-semibold bg-cream-50 text-charcoal-900 hover:bg-white transition-colors shadow-lg"
          >
            <span>{labels.button}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </motion.button>
          <p className="mt-2.5 text-center text-[10px] font-mono uppercase tracking-wider text-stone-500">
            {labels.footer}
          </p>
        </div>
      </div>
    </motion.article>
  );
});
