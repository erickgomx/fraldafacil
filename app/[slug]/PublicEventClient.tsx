'use client';

import { useState } from 'react';
import BabyHero from '@/components/BabyHero';
import GenderPoll from '@/components/GenderPoll';
import DiaperCatalog, { GiftItemData } from '@/components/DiaperCatalog';
import GuestbookWall, { GuestMessageData } from '@/components/GuestbookWall';
import PixCheckoutModal from '@/components/PixCheckoutModal';
import { useRouter } from 'next/navigation';
import { Baby, Share2, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-rose-50/40 to-slate-50 text-slate-800">
      {/* Top Bar com Compartilhamento */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-rose-400 flex items-center justify-center text-white shadow-sm">
              <Baby className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-sm tracking-tight text-slate-800">
              Fralda<span className="text-rose-500">Fácil</span>
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition active:scale-95"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Compartilhar Chá</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero do Chá */}
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

      {/* Bolão Menino ou Menina (visível principalmente se for Chá Revelação ou Ambos) */}
      {event.eventType !== 'FRALDA' && (
        <GenderPoll
          eventId={event.id}
          initialBoyVotes={initialBoyVotes}
          initialGirlVotes={initialGirlVotes}
          onOpenPixModalWithGuess={handleOpenWithGuessOnly}
        />
      )}

      {/* Catálogo de Fraldas e Mimos */}
      <DiaperCatalog
        items={initialItems}
        onSelectGift={(gift) => handleOpenPixModal(gift)}
      />

      {/* Mural de Mensagens */}
      <GuestbookWall
        messages={initialMessages}
        onOpenGiftModal={() => handleOpenPixModal(null)}
      />

      {/* Modal de Checkout Pix */}
      <PixCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={event.id}
        parentsNames={event.parentsNames}
        selectedGift={selectedGift}
        initialGuess={modalGuess}
        onPaymentSuccess={() => {
          router.refresh();
        }}
      />

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200/60 bg-white/50 text-center text-xs text-slate-400">
        <p className="font-medium">
          Criado com muito carinho através do{' '}
          <strong className="text-slate-600">Fralda Fácil</strong> — Plataforma para Chás de Bebê & Revelação.
        </p>
      </footer>
    </div>
  );
}
