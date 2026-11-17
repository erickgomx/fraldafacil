'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openFaq === idx;
        return (
          <div
            key={idx}
            className="rounded-xl bg-white border border-warm-border overflow-hidden transition"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenFaq(isOpen ? null : idx)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-cream-50/60 transition"
            >
              <span className="font-serif text-base sm:text-lg text-charcoal-900">
                {item.q}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`w-4 h-4 text-charcoal-600 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm text-charcoal-600 leading-relaxed border-t border-warm-border/40 pt-3">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
