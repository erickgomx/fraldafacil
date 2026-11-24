'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, User } from 'lucide-react';
import { useI18n } from '@/components/LanguageProvider';
import { eventDict } from '@/lib/i18n/dictionaries/event';

const EASE = [0.22, 1, 0.36, 1] as const;

interface GenderPollProps {
  eventId: string;
  boyName?: string | null;
  girlName?: string | null;
  revealedGender?: string | null;
  initialBoyVotes?: number;
  initialGirlVotes?: number;
  onOpenPixModalWithGuess?: (guess: 'BOY' | 'GIRL') => void;
}

export default function GenderPoll({
  eventId,
  boyName,
  girlName,
  revealedGender = null,
  initialBoyVotes = 0,
  initialGirlVotes = 0,
  onOpenPixModalWithGuess,
}: GenderPollProps) {
  const { locale } = useI18n();
  const dict = eventDict[locale].poll;

  const [boyVotes, setBoyVotes] = useState(initialBoyVotes);
  const [girlVotes, setGirlVotes] = useState(initialGirlVotes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<'BOY' | 'GIRL'>('BOY');
  const [voterName, setVoterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const total = boyVotes + girlVotes;
  const boyPercent = total > 0 ? Math.round((boyVotes / total) * 100) : 50;
  const girlPercent = total > 0 ? 100 - boyPercent : 50;
  const isRevealed = Boolean(revealedGender);

  const handleOpenVoteModal = (guess: 'BOY' | 'GIRL') => {
    setSelectedGuess(guess);
    setIsModalOpen(true);
  };

  const handleFreeVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          voterName,
          guess: selectedGuess,
        }),
      });

      const data = await res.json();
      if (res.ok && data.stats) {
        setBoyVotes(data.stats.boyVotes);
        setGirlVotes(data.stats.girlVotes);
        setHasVoted(true);
        setIsModalOpen(false);

        const colors =
          selectedGuess === 'BOY'
            ? ['#4A6B82', '#7D9EAF', '#FAF8F5']
            : ['#B86B77', '#D6949E', '#FAF8F5'];

        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.7 },
          colors,
        });
      }
    } catch (err) {
      console.error('Erro ao votar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-12 max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-card"
      >
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
            {dict.eyebrow}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal">
            {isRevealed ? dict.titleRevealed : dict.titleOpen}
          </h2>
          <p className="text-xs text-charcoal-500 mt-1 font-sans">
            {isRevealed ? dict.subtitleRevealed : dict.subtitleOpen}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-baseline text-xs font-mono mb-2">
            <span className="text-dusty-blue font-medium flex items-center gap-1.5">
              <span>{dict.boy}</span>
              <span className="text-charcoal-500 tabular-nums font-normal">
                {boyPercent}% ({boyVotes} {boyVotes === 1 ? dict.voteSingular : dict.votePlural})
              </span>
            </span>
            <span className="text-dusty-rose font-medium flex items-center gap-1.5">
              <span className="text-charcoal-500 tabular-nums font-normal">
                ({girlVotes} {girlVotes === 1 ? dict.voteSingular : dict.votePlural}) {girlPercent}%
              </span>
              <span>{dict.girl}</span>
            </span>
          </div>

          <div className="h-3 bg-cream-100 rounded-full overflow-hidden flex border border-warm-border p-0.5">
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${boyPercent}%` }}
              transition={{ duration: 1.1, ease: EASE }}
              className="h-full bg-gradient-to-r from-dusty-blue/80 to-dusty-blue rounded-l-full"
            />
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${girlPercent}%` }}
              transition={{ duration: 1.1, ease: EASE }}
              className="h-full bg-gradient-to-l from-dusty-rose/80 to-dusty-rose rounded-r-full"
            />
          </div>
        </div>

        {isRevealed ? (
          <div className="p-3.5 rounded-xl bg-cream-50 border border-warm-border text-center text-xs text-charcoal-600 font-sans">
            {dict.closedNotice}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleOpenVoteModal('BOY')}
              className="py-3 px-4 rounded-xl font-medium text-xs bg-dusty-blue-light border border-dusty-blue/30 text-dusty-blue hover:bg-dusty-blue/20 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center gap-0.5"
            >
              <span className="font-semibold">{dict.cheerBoy}</span>
              {boyName && <span className="text-[11px] font-serif italic text-dusty-blue/90">({boyName})</span>}
            </button>

            <button
              onClick={() => handleOpenVoteModal('GIRL')}
              className="py-3 px-4 rounded-xl font-medium text-xs bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose hover:bg-dusty-rose/20 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center gap-0.5"
            >
              <span className="font-semibold">{dict.cheerGirl}</span>
              {girlName && <span className="text-[11px] font-serif italic text-dusty-rose/90">({girlName})</span>}
            </button>
          </div>
        )}

        <AnimatePresence>
          {hasVoted && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-4 p-3 rounded-lg bg-cream-50 border border-warm-border text-charcoal-700 text-xs font-sans flex items-center justify-center gap-2 text-center"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-700" />
              <span>{dict.voteSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-elevated border border-warm-border"
            >
              <div className="text-center mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-charcoal-400 block mb-1">
                  {dict.modalEyebrow}
                </span>
                <h3 className="font-serif text-xl text-charcoal-900 font-normal">
                  {dict.modalBetPrefix}{' '}
                  {selectedGuess === 'BOY'
                    ? boyName
                      ? `${dict.boy} (${boyName})`
                      : dict.boy
                    : girlName
                    ? `${dict.girl} (${girlName})`
                    : dict.girl}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 font-sans">
                  {dict.modalSubtitle}
                </p>
              </div>

              <form onSubmit={handleFreeVote} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                    {dict.modalNameLabel}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="text"
                      required
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      placeholder={dict.modalNamePlaceholder}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition"
                  >
                    {loading ? dict.modalSubmitting : dict.modalSubmit}
                  </button>

                  {onOpenPixModalWithGuess && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        onOpenPixModalWithGuess(selectedGuess);
                      }}
                      className="w-full py-2.5 px-4 rounded-lg font-medium text-charcoal-700 bg-cream-100 hover:bg-cream-200/80 border border-warm-border text-xs transition"
                    >
                      {dict.modalVoteAndGift}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition"
                  >
                    {dict.modalCancel}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
