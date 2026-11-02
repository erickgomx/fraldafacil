'use client';

import { useState } from 'react';
import BabyHero from '@/components/BabyHero';
import GenderPoll from '@/components/GenderPoll';
import DiaperCatalog, { GiftItemData } from '@/components/DiaperCatalog';
import GuestbookWall, { GuestMessageData } from '@/components/GuestbookWall';
import PixCheckoutModal from '@/components/PixCheckoutModal';
import { useRouter } from 'next/navigation';
import { Share2, Check } from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900">
      {/* Top Bar Sóbria */}
      <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-warm-border/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="group shrink-0">
            <BrandLogo size="sm" />
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 sm:px-3.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-50 border border-warm-border text-charcoal-700 shadow-subtle transition active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-stone-900" />
                <span className="hidden sm:inline">Link Copiado</span>
                <span className="sm:hidden">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-charcoal-400" />
                <span className="hidden sm:inline">Compartilhar Chá</span>
                <span className="sm:hidden">Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
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

      {/* Bolão */}
      {event.eventType !== 'FRALDA' && (
        <GenderPoll
          eventId={event.id}
          boyName={event.boyName}
          girlName={event.girlName}
          initialBoyVotes={initialBoyVotes}
          initialGirlVotes={initialGirlVotes}
          onOpenPixModalWithGuess={handleOpenWithGuessOnly}
        />
      )}

      {/* Catálogo de Presentes */}
      <DiaperCatalog
        items={initialItems}
        onSelectGift={(gift) => handleOpenPixModal(gift)}
      />

      {/* Mural de Recados */}
      <GuestbookWall
        messages={initialMessages}
        onOpenGiftModal={() => handleOpenPixModal(null)}
      />

      {/* Checkout Modal */}
      <PixCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={event.id}
        parentsNames={event.parentsNames}
        selectedGift={selectedGift}
        initialGuess={modalGuess}
        feePayer={event.feePayer || 'GUEST'}
        mpConnected={event.mpConnected}
        onPaymentSuccess={() => {
          router.refresh();
        }}
      />

      {/* Rodapé Discreto */}
      <footer className="mt-24 py-8 border-t border-warm-border/60 bg-cream-100/50 text-center text-xs text-charcoal-500 font-sans">
        <p>
          Página do Chá de {event.parentsNames} — Organizado com carinho via{' '}
          <Link href="/" className="font-serif text-charcoal-800 underline underline-offset-2">
            Fralda Online
          </Link>
        </p>
      </footer>
    </div>
  );
}
