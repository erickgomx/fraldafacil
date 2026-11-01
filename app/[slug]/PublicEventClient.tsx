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

interface PublicEventClientProps {
  event: {
    id: string;
    slug: string;
    eventType: string;
    babyName: string | null;
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
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-charcoal-900 text-cream-50 flex items-center justify-center font-serif text-sm font-medium">
              F
            </span>
            <span className="font-serif text-lg tracking-tight font-medium text-charcoal-900">
              Fralda Fácil
            </span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-50 border border-warm-border text-charcoal-700 shadow-subtle transition active:scale-[0.98]"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-stone-900" />
                <span>Link Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-charcoal-400" />
                <span>Compartilhar Chá</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <BabyHero
        parentsNames={event.parentsNames}
        babyName={event.babyName}
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
        onPaymentSuccess={() => {
          router.refresh();
        }}
      />

      {/* Rodapé Discreto */}
      <footer className="mt-24 py-8 border-t border-warm-border/60 bg-cream-100/50 text-center text-xs text-charcoal-500 font-sans">
        <p>
          Página do Chá de {event.parentsNames} — Organizado com carinho via{' '}
          <Link href="/" className="font-serif text-charcoal-800 underline underline-offset-2">
            Fralda Fácil
          </Link>
        </p>
      </footer>
    </div>
  );
}
