'use client';

import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import BabyHero from '@/components/BabyHero';
import GenderPoll from '@/components/GenderPoll';
import DiaperCatalog, { GiftItemData } from '@/components/DiaperCatalog';
import GuestbookWall, { GuestMessageData } from '@/components/GuestbookWall';
import PixCheckoutModal from '@/components/PixCheckoutModal';
import Link from 'next/link';
import { ArrowRight, Eye, RefreshCw, Ticket, Trophy } from 'lucide-react';
import { getDefaultGiftItems } from '@/lib/default-gifts';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/LanguageProvider';
import { landingDict } from '@/lib/i18n/dictionaries/landing';
import { eventDict } from '@/lib/i18n/dictionaries/event';

const INITIAL_DEMO_META: Array<{ id: string; hoursAgo: number; guess: 'BOY' | 'GIRL'; amount: number }> = [
  { id: 'msg-1', hoursAgo: 2, guess: 'BOY', amount: 80.0 },
  { id: 'msg-2', hoursAgo: 8, guess: 'BOY', amount: 150.0 },
  { id: 'msg-3', hoursAgo: 24, guess: 'GIRL', amount: 100.0 },
  { id: 'msg-4', hoursAgo: 48, guess: 'BOY', amount: 55.0 },
];

export default function DemoClient() {
  const { locale, t } = useI18n();
  const dict = landingDict[locale].demo;
  const publicDict = eventDict[locale].publicEvent;

  const [selectedGift, setSelectedGift] = useState<GiftItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGuess, setModalGuess] = useState<'BOY' | 'GIRL' | null>(null);
  const [revealedGender, setRevealedGender] = useState<string | null>(null);
  const [demoRaffleDrawn, setDemoRaffleDrawn] = useState(false);
  const [customMessages, setCustomMessages] = useState<GuestMessageData[]>([]);
  const [boyVotes, setBoyVotes] = useState(38);
  const [girlVotes, setGirlVotes] = useState(24);

  const demoDate = useMemo(() => new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), []);

  const demoGifts: GiftItemData[] = useMemo(
    () =>
      getDefaultGiftItems(locale).map((item, index) => ({
        id: `demo-gift-${index + 1}`,
        title: item.title,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
        active: true,
      })),
    [locale]
  );

  const messages: GuestMessageData[] = useMemo(() => {
    const baseMessages: GuestMessageData[] = dict.initialMessages.map((msg, idx) => {
      const meta = INITIAL_DEMO_META[idx] || INITIAL_DEMO_META[0];
      return {
        id: msg.id,
        name: msg.name,
        message: msg.message,
        createdAt: new Date(Date.now() - meta.hoursAgo * 3600000),
        order: { pollGuess: meta.guess, amount: meta.amount },
      };
    });
    return [...customMessages, ...baseMessages];
  }, [dict.initialMessages, customMessages]);

  const handleOpenGiftModal = (gift: GiftItemData | null, guess?: 'BOY' | 'GIRL') => {
    setSelectedGift(gift);
    setModalGuess(guess || null);
    setIsModalOpen(true);
  };

  const handleOpenWithGuessOnly = (guess: 'BOY' | 'GIRL') => {
    setSelectedGift(null);
    setModalGuess(guess);
    setIsModalOpen(true);
  };

  const handleToggleReveal = (gender: 'BOY' | 'GIRL' | null) => {
    setRevealedGender(gender);
    if (gender === 'BOY') {
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#4A6B82', '#7D9EAF', '#FAF8F5'],
      });
    } else if (gender === 'GIRL') {
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#B86B77', '#D6949E', '#FAF8F5'],
      });
    }
  };

  const handleSimulateRaffleDraw = () => {
    setDemoRaffleDrawn(true);
    confetti({
      particleCount: 90,
      spread: 70,
      colors: ['#C2765B', '#4A6B82', '#B86B77', '#FAF8F5'],
    });
  };

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 pb-24 overflow-x-hidden">
      <div className="sticky top-0 z-50 bg-[#F5F1E9] border-b border-warm-border py-2 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-700 shrink-0" />
            <span className="text-xs font-mono text-charcoal-700">
              {dict.topBanner}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/cadastro"
              className="py-1 px-3.5 rounded-lg text-xs font-medium bg-charcoal-900 text-white hover:bg-charcoal-800 transition flex items-center gap-1.5 shadow-subtle shrink-0"
            >
              <span>{dict.createShower}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <LanguageSwitcher size="sm" />
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-4">
        <div className="bg-white rounded-xl p-3 border border-warm-border shadow-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-charcoal-500">
            <Eye className="w-3.5 h-3.5 text-charcoal-400" />
            <span>{dict.simulatorLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleToggleReveal('BOY')}
              className={`py-1 px-2.5 rounded text-[11px] font-medium transition ${
                revealedGender === 'BOY'
                  ? 'bg-dusty-blue text-white'
                  : 'bg-dusty-blue-light text-dusty-blue hover:bg-dusty-blue/20'
              }`}
            >
              {dict.revealBoy}
            </button>

            <button
              type="button"
              onClick={() => handleToggleReveal('GIRL')}
              className={`py-1 px-2.5 rounded text-[11px] font-medium transition ${
                revealedGender === 'GIRL'
                  ? 'bg-dusty-rose text-white'
                  : 'bg-dusty-rose-light text-dusty-rose hover:bg-dusty-rose/20'
              }`}
            >
              {dict.revealGirl}
            </button>

            <button
              type="button"
              onClick={handleSimulateRaffleDraw}
              className={`py-1 px-2.5 rounded text-[11px] font-medium transition inline-flex items-center gap-1 ${
                demoRaffleDrawn
                  ? 'bg-terracotta text-white'
                  : 'bg-cream-100 text-terracotta border border-terracotta/30 hover:bg-terracotta/10'
              }`}
            >
              <Ticket className="w-3 h-3" />
              <span>{demoRaffleDrawn ? dict.raffleDrawnBadge : dict.drawRaffle}</span>
            </button>

            {(revealedGender || demoRaffleDrawn) && (
              <button
                type="button"
                onClick={() => {
                  handleToggleReveal(null);
                  setDemoRaffleDrawn(false);
                }}
                className="py-1 px-2 rounded text-[11px] font-mono text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1"
                title={dict.resetTitle}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{dict.reset}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <BabyHero
        parentsNames="Mariana & Rafael"
        boyName="Leonardo"
        girlName="Helena"
        eventDate={demoDate}
        storyMessage={dict.storyMessage}
        coverImageUrl="https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80"
        themeColor="#4A6B82"
        revealedGender={revealedGender}
        eventType="REVELACAO"
      />

      <GenderPoll
        eventId="demo-event-id"
        revealedGender={revealedGender}
        initialBoyVotes={boyVotes}
        initialGirlVotes={girlVotes}
        onOpenPixModalWithGuess={handleOpenWithGuessOnly}
      />

      <section className="max-w-3xl mx-auto px-6 mt-8">
        {demoRaffleDrawn ? (
          <div className="rounded-2xl bg-white border border-warm-border shadow-subtle p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block">
                  {publicDict.raffleDrawnEyebrow}
                </span>
                <p className="font-serif text-lg text-charcoal-900 font-medium">
                  {t(publicDict.raffleWinnerCongratulation, { winner: dict.raffleWinnerName })}
                </p>
                <p className="text-xs text-charcoal-500 font-sans">
                  {t(publicDict.rafflePrizePrefix, { prize: dict.rafflePrize })}
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-lg bg-charcoal-900 text-white font-mono text-xs font-semibold tabular-nums shrink-0">
              Nº #012
            </span>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/90 border border-warm-border shadow-subtle p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border text-terracotta flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block">
                {publicDict.raffleActiveEyebrow}
              </span>
              <p className="text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed">
                {publicDict.raffleActiveBefore}{' '}
                <strong className="font-semibold text-charcoal-900">
                  {publicDict.raffleActiveHighlight}
                </strong>{' '}
                {publicDict.raffleActiveWithPrize}{' '}
                <strong className="font-semibold text-charcoal-900">{dict.rafflePrize}</strong>.
              </p>
            </div>
          </div>
        )}
      </section>

      <DiaperCatalog
        items={demoGifts}
        onSelectGift={(gift) => handleOpenGiftModal(gift)}
      />

      <GuestbookWall
        messages={messages}
        onOpenGiftModal={() => handleOpenGiftModal(null)}
      />

      <PixCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId="demo-event-id"
        parentsNames="Mariana & Rafael"
        selectedGift={selectedGift}
        initialGuess={modalGuess}
        mpConnected={true}
        isDemo={true}
        eventType="REVELACAO"
        revealedGender={revealedGender}
        raffleEnabled={true}
        rafflePrize={dict.rafflePrize}
        raffleDrawnAt={demoRaffleDrawn ? 'demo-drawn' : null}
        onPaymentSuccess={() => {
          const messageText =
            revealedGender === 'GIRL'
              ? dict.guestYouMessageGirl
              : revealedGender === 'BOY'
              ? dict.guestYouMessageBoy
              : dict.guestYouMessageNeutral;
          setCustomMessages((prev) => [
            {
              id: `msg-${Date.now()}`,
              name: dict.guestYouName,
              message: messageText,
              createdAt: new Date(),
              order: {
                pollGuess: modalGuess || 'BOY',
                amount: selectedGift ? selectedGift.price : 50,
              },
            },
            ...prev,
          ]);

          if (modalGuess === 'BOY') setBoyVotes((v) => v + 1);
          if (modalGuess === 'GIRL') setGirlVotes((v) => v + 1);
        }}
      />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] bg-charcoal-900 text-white p-3.5 rounded-xl shadow-elevated border border-charcoal-800 flex items-center justify-between gap-3">
        <div className="truncate pr-2">
          <span className="font-serif text-sm font-medium block">
            {dict.floatingTitle}
          </span>
          <span className="text-[11px] text-stone-400 font-sans block truncate">
            {dict.floatingSubtitle}
          </span>
        </div>

        <Link
          href="/cadastro"
          className="shrink-0 py-2 px-3.5 rounded-lg text-xs font-medium bg-cream-50 text-charcoal-900 hover:bg-white transition"
        >
          {dict.floatingCta}
        </Link>
      </div>
    </div>
  );
}
