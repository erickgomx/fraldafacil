'use client';

import { useState } from 'react';
import BabyHero from '@/components/BabyHero';
import GenderPoll from '@/components/GenderPoll';
import DiaperCatalog, { GiftItemData } from '@/components/DiaperCatalog';
import GuestbookWall, { GuestMessageData } from '@/components/GuestbookWall';
import PixCheckoutModal from '@/components/PixCheckoutModal';
import { useRouter } from 'next/navigation';
import { Share2, Check, Ticket, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { shareEvent } from '@/lib/share';
import { useI18n } from '@/components/LanguageProvider';
import { eventDict } from '@/lib/i18n/dictionaries/event';

interface PublicEventClientProps {
  event: {
    id: string;
    slug: string;
    eventType: string;
    babyName: string | null;
    boyName?: string | null;
    girlName?: string | null;
    parentsNames: string;
    eventDate: Date | string;
    coverImageUrl: string | null;
    storyMessage: string | null;
    themeColor: string;
    revealedGender: string | null;
    feePayer?: 'GUEST' | 'PARENTS';
    mpConnected?: boolean;
    mpPublicKey?: string | null;
    raffleEnabled?: boolean;
    rafflePrize?: string | null;
    raffleWinnerName?: string | null;
    raffleWinnerTicket?: number | null;
    raffleDrawnAt?: string | null;
  };
  initialItems: GiftItemData[];
  initialMessages: GuestMessageData[];
  initialBoyVotes: number;
  initialGirlVotes: number;
}

export default function PublicEventClient({
  event,
  initialItems,
  initialMessages,
  initialBoyVotes,
  initialGirlVotes,
}: PublicEventClientProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const dict = eventDict[locale].publicEvent;

  const [selectedGift, setSelectedGift] = useState<GiftItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGuess, setModalGuess] = useState<'BOY' | 'GIRL' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleOpenPixModal = (gift: GiftItemData | null, guess?: 'BOY' | 'GIRL') => {
    setSelectedGift(gift);
    setModalGuess(guess || null);
    setIsModalOpen(true);
  };

  const handleOpenWithGuessOnly = (guess: 'BOY' | 'GIRL') => {
    setSelectedGift(null);
    setModalGuess(guess);
    setIsModalOpen(true);
  };

  const handleShare = async () => {
    const res = await shareEvent({
      slug: event.slug,
      parentsNames: event.parentsNames,
      babyName: event.babyName,
      boyName: event.boyName,
      girlName: event.girlName,
      eventType: event.eventType,
      revealedGender: event.revealedGender,
      locale,
    });
    if (res !== 'CANCELLED') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-warm-border/70">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="group shrink-0">
            <BrandLogo size="sm" showTagline={false} className="sm:hidden" />
            <BrandLogo size="sm" className="hidden sm:inline-flex" />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleShare}
              aria-label={copiedLink ? dict.linkCopiedDesktop : dict.shareDesktop}
              title={copiedLink ? dict.linkCopiedDesktop : dict.shareDesktop}
              className="inline-flex items-center justify-center sm:justify-start gap-1.5 w-8 h-8 px-0 sm:w-auto sm:h-auto sm:py-1.5 sm:px-3.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-50 border border-warm-border text-charcoal-700 shadow-subtle transition active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-stone-900" />
                  <span className="hidden sm:inline">{dict.linkCopiedDesktop}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-charcoal-400" />
                  <span className="hidden sm:inline">{dict.shareDesktop}</span>
                </>
              )}
            </button>
            <LanguageSwitcher size="sm" />
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      <BabyHero
        parentsNames={event.parentsNames}
        babyName={event.babyName}
        boyName={event.boyName}
        girlName={event.girlName}
        eventDate={event.eventDate}
        storyMessage={event.storyMessage}
        coverImageUrl={event.coverImageUrl}
        themeColor={event.themeColor}
        revealedGender={event.revealedGender}
        eventType={event.eventType}
      />

      {event.eventType !== 'FRALDA' && (
        <GenderPoll
          eventId={event.id}
          boyName={event.boyName}
          girlName={event.girlName}
          revealedGender={event.revealedGender}
          initialBoyVotes={initialBoyVotes}
          initialGirlVotes={initialGirlVotes}
          onOpenPixModalWithGuess={handleOpenWithGuessOnly}
        />
      )}

      {event.raffleEnabled && (
        <section className="max-w-3xl mx-auto px-6 mt-8">
          {event.raffleDrawnAt && event.raffleWinnerName && event.raffleWinnerTicket ? (
            <div className="rounded-2xl bg-white border border-warm-border shadow-subtle p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block">
                    {dict.raffleDrawnEyebrow}
                  </span>
                  <p className="font-serif text-lg text-charcoal-900 font-medium">
                    {t(dict.raffleWinnerCongratulation, { winner: event.raffleWinnerName })}
                  </p>
                  {event.rafflePrize && (
                    <p className="text-xs text-charcoal-500 font-sans">
                      {t(dict.rafflePrizePrefix, { prize: event.rafflePrize })}
                    </p>
                  )}
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-lg bg-charcoal-900 text-white font-mono text-xs font-semibold tabular-nums shrink-0">
                Nº #{String(event.raffleWinnerTicket).padStart(3, '0')}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/90 border border-warm-border shadow-subtle p-5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border text-terracotta flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block">
                  {dict.raffleActiveEyebrow}
                </span>
                <p className="text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed">
                  {dict.raffleActiveBefore}{' '}
                  <strong className="font-semibold text-charcoal-900">
                    {dict.raffleActiveHighlight}
                  </strong>
                  {event.rafflePrize ? (
                    <>
                      {' '}
                      {dict.raffleActiveWithPrize}{' '}
                      <strong className="font-semibold text-charcoal-900">
                        {event.rafflePrize}
                      </strong>
                      .
                    </>
                  ) : (
                    dict.raffleActiveWithoutPrize
                  )}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {!event.mpConnected && (
        <section className="max-w-3xl mx-auto px-6 mt-8">
          <div className="rounded-2xl bg-amber-50/90 border border-amber-200/90 p-5 flex items-start gap-3.5 shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 block font-semibold">
                {dict.mpPendingTitle}
              </span>
              <p className="text-xs sm:text-sm text-amber-950/85 font-sans leading-relaxed mt-0.5">
                {event.eventType !== 'FRALDA' ? dict.mpPendingWithPoll : dict.mpPendingNoPoll}
              </p>
            </div>
          </div>
        </section>
      )}

      <DiaperCatalog
        items={initialItems}
        onSelectGift={(gift) => handleOpenPixModal(gift)}
      />

      <GuestbookWall
        messages={initialMessages}
        onOpenGiftModal={() => handleOpenPixModal(null)}
      />

      <PixCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={event.id}
        parentsNames={event.parentsNames}
        selectedGift={selectedGift}
        initialGuess={modalGuess}
        feePayer={event.feePayer || 'GUEST'}
        mpConnected={event.mpConnected}
        mpPublicKey={event.mpPublicKey}
        eventType={event.eventType}
        revealedGender={event.revealedGender}
        raffleEnabled={event.raffleEnabled}
        rafflePrize={event.rafflePrize}
        raffleDrawnAt={event.raffleDrawnAt}
        onPaymentSuccess={() => {
          router.refresh();
        }}
      />

      <footer className="mt-24 py-8 border-t border-warm-border/60 bg-cream-100/50 text-center text-xs text-charcoal-500 font-sans">
        <p>
          {t(dict.footerPrefix, { parents: event.parentsNames })}{' '}
          <Link href="/" className="font-serif text-charcoal-800 underline underline-offset-2">
            Fralda Online
          </Link>
        </p>
      </footer>
    </div>
  );
}
