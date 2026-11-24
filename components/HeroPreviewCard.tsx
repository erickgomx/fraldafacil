'use client';

import { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { useI18n } from '@/components/LanguageProvider';
import { landingDict } from '@/lib/i18n/dictionaries/landing';

export default function HeroPreviewCard() {
  const { locale, t } = useI18n();
  const dict = landingDict[locale].heroPreview;

  const [previewVote, setPreviewVote] = useState<'BOY' | 'GIRL'>('BOY');
  const [boyCount, setBoyCount] = useState(38);
  const [girlCount, setGirlCount] = useState(26);

  const totalVotes = boyCount + girlCount;
  const boyPercent = Math.round((boyCount / totalVotes) * 100);
  const girlPercent = 100 - boyPercent;

  const handleVotePreview = (choice: 'BOY' | 'GIRL') => {
    if (choice === previewVote) return;
    setPreviewVote(choice);
    if (choice === 'BOY') {
      setBoyCount((c) => c + 1);
    } else {
      setGirlCount((c) => c + 1);
    }
  };

  return (
    <div className="lg:col-span-5 relative">
      <div className="relative mx-auto max-w-md rounded-2xl bg-white border border-warm-border shadow-lift p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-warm-border/60">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          </div>
          <div className="px-3 py-1 rounded-full bg-cream-100 border border-warm-border/70 text-[11px] font-mono text-charcoal-600">
            fralda.online/mari-e-rafa
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-terracotta font-semibold">
            {dict.liveBadge}
          </span>
        </div>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center shrink-0 font-serif text-lg text-charcoal-800">
            M&amp;R
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-600 block">
              {dict.eventTypeLabel}
            </span>
            <p className="font-serif text-lg text-charcoal-900 leading-snug">
              Mariana &amp; Rafael
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-cream-50 border border-warm-border/80 p-4 mb-4">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-medium text-charcoal-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" aria-hidden="true" />
              {dict.pollTitle}
            </span>
            <span className="font-mono text-[11px] text-charcoal-600 tabular-nums">
              {t(dict.votesCount, { count: totalVotes })}
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-cream-200 mb-3">
            <div
              style={{ width: `${boyPercent}%` }}
              className="bg-dusty-blue transition-all duration-500"
            />
            <div
              style={{ width: `${girlPercent}%` }}
              className="bg-dusty-rose transition-all duration-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleVotePreview('BOY')}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-between ${
                previewVote === 'BOY'
                  ? 'bg-dusty-blue text-white border-dusty-blue shadow-subtle'
                  : 'bg-white text-charcoal-700 border-warm-border hover:bg-dusty-blue-light/50'
              }`}
            >
              <span>{dict.teamBoy}</span>
              <span className="font-mono tabular-nums">{boyPercent}%</span>
            </button>
            <button
              type="button"
              onClick={() => handleVotePreview('GIRL')}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-between ${
                previewVote === 'GIRL'
                  ? 'bg-dusty-rose text-white border-dusty-rose shadow-subtle'
                  : 'bg-white text-charcoal-700 border-warm-border hover:bg-dusty-rose-light/50'
              }`}
            >
              <span>{dict.teamGirl}</span>
              <span className="font-mono tabular-nums">{girlPercent}%</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-warm-border p-3.5 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cream-100 border border-warm-border flex items-center justify-center text-base shrink-0" aria-hidden="true">
              🧷
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-900">
                {dict.giftTitle}
              </p>
              <p className="text-[11px] text-charcoal-600">
                {dict.giftSubtitle}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-xs font-mono font-semibold text-charcoal-900 tabular-nums">
              {dict.giftPrice}
            </span>
            <span className="inline-block text-[10px] font-medium text-terracotta">
              {dict.giftAction}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-charcoal-900 text-white p-3.5 flex items-center justify-between gap-3 shadow-card border border-transparent dark:border-[#332D28] dark:!bg-[#1A1715]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 dark:bg-white/15 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-[#E3A088]" aria-hidden="true" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate dark:!text-[#FAF8F5]">
                {dict.toastSender}
              </p>
              <p className="text-[11px] text-stone-300 truncate dark:!text-[#D6CEC3]">
                &ldquo;{dict.toastMessage}&rdquo;
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-mono text-xs font-semibold tabular-nums">
            {dict.toastAmount}
          </span>
        </div>
      </div>
    </div>
  );
}
