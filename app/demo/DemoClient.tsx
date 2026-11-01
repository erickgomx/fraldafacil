'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import BabyHero from '@/components/BabyHero';
import GenderPoll from '@/components/GenderPoll';
import DiaperCatalog, { GiftItemData } from '@/components/DiaperCatalog';
import GuestbookWall, { GuestMessageData } from '@/components/GuestbookWall';
import PixCheckoutModal from '@/components/PixCheckoutModal';
import Link from 'next/link';
import { ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { DEFAULT_GIFT_ITEMS } from '@/lib/default-gifts';

const DEMO_GIFTS: GiftItemData[] = DEFAULT_GIFT_ITEMS.map((item, index) => ({
  id: `demo-gift-${index + 1}`,
  title: item.title,
  description: item.description,
  price: item.price,
  imageUrl: item.imageUrl,
  category: item.category,
  active: true,
}));

const INITIAL_MESSAGES: GuestMessageData[] = [
  {
    id: 'msg-1',
    name: 'Tia Camila & Tio Bruno',
    message: 'Estamos tão ansiosos para ver o rostinho desse anjinho! Que venha com muita saúde para encher a casa de risadas.',
    createdAt: new Date(Date.now() - 2 * 3600000),
    order: { pollGuess: 'BOY', amount: 80.0 },
  },
  {
    id: 'msg-2',
    name: 'Vovó Cida',
    message: 'O coração da vovó já transborda de alegria! Meu palpite é que vai ser um menino com a calma da mãe.',
    createdAt: new Date(Date.now() - 8 * 3600000),
    order: { pollGuess: 'BOY', amount: 150.0 },
  },
  {
    id: 'msg-3',
    name: 'Dinda Carol',
    message: 'Presentinho de coração para o amor da dinda! Mal posso esperar para segurar no colo.',
    createdAt: new Date(Date.now() - 24 * 3600000),
    order: { pollGuess: 'GIRL', amount: 100.0 },
  },
  {
    id: 'msg-4',
    name: 'Lucas & Família',
    message: 'Mari e Rafa, parabéns por esse momento abençoado! Toda a felicidade do mundo para vocês.',
    createdAt: new Date(Date.now() - 48 * 3600000),
    order: { pollGuess: 'BOY', amount: 55.0 },
  },
];

export default function DemoClient() {
  const [selectedGift, setSelectedGift] = useState<GiftItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGuess, setModalGuess] = useState<'BOY' | 'GIRL' | null>(null);
  const [revealedGender, setRevealedGender] = useState<string | null>(null);
  const [messages, setMessages] = useState<GuestMessageData[]>(INITIAL_MESSAGES);
  const [boyVotes, setBoyVotes] = useState(38);
  const [girlVotes, setGirlVotes] = useState(24);

  const demoDate = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000);

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

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 pb-24">
      {/* BARRA SUPERIOR DE DEMONSTRAÇÃO SÓBRIA */}
      <div className="sticky top-0 z-50 bg-[#F5F1E9] border-b border-warm-border py-2 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-700" />
            <span className="text-xs font-mono text-charcoal-700">
              Modo Demonstração Interativo — Esta é a experiência exata que seus convidados terão
            </span>
          </div>

          <Link
            href="/cadastro"
            className="py-1 px-3.5 rounded-lg text-xs font-medium bg-charcoal-900 text-white hover:bg-charcoal-800 transition flex items-center gap-1.5 shadow-subtle shrink-0"
          >
            <span>Criar meu Chá</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* CONTROLE DISCRETO DE SIMULAÇÃO DE REVELAÇÃO */}
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <div className="bg-white rounded-xl p-3 border border-warm-border shadow-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-charcoal-500">
            <Eye className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Simulador do Chá:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleToggleReveal('BOY')}
              className={`py-1 px-2.5 rounded text-[11px] font-medium transition ${
                revealedGender === 'BOY'
                  ? 'bg-dusty-blue text-white'
                  : 'bg-dusty-blue-light text-dusty-blue hover:bg-dusty-blue/20'
              }`}
            >
              Revelar: Menino
            </button>

            <button
              onClick={() => handleToggleReveal('GIRL')}
              className={`py-1 px-2.5 rounded text-[11px] font-medium transition ${
                revealedGender === 'GIRL'
                  ? 'bg-dusty-rose text-white'
                  : 'bg-dusty-rose-light text-dusty-rose hover:bg-dusty-rose/20'
              }`}
            >
              Revelar: Menina
            </button>

            {revealedGender && (
              <button
                onClick={() => handleToggleReveal(null)}
                className="py-1 px-2 rounded text-[11px] font-mono text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1"
                title="Voltar ao início"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resetar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <BabyHero
        parentsNames="Mariana & Rafael"
        babyName="Leonardo"
        eventDate={demoDate}
        storyMessage="Estamos muito felizes e ansiosos pela chegada do nosso primeiro filho. Criamos este espaço para compartilhar essa alegria com quem amamos."
        coverImageUrl="https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80"
        themeColor="#4A6B82"
        revealedGender={revealedGender}
        eventType="REVELACAO"
      />

      {/* BOLÃO */}
      <GenderPoll
        eventId="demo-event-id"
        initialBoyVotes={boyVotes}
        initialGirlVotes={girlVotes}
        onOpenPixModalWithGuess={handleOpenWithGuessOnly}
      />

      {/* CATÁLOGO DE PRESENTES */}
      <DiaperCatalog
        items={DEMO_GIFTS}
        onSelectGift={(gift) => handleOpenGiftModal(gift)}
      />

      {/* MURAL */}
      <GuestbookWall
        messages={messages}
        onOpenGiftModal={() => handleOpenGiftModal(null)}
      />

      {/* CHECKOUT MODAL */}
      <PixCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId="demo-event-id"
        parentsNames="Mariana & Rafael"
        selectedGift={selectedGift}
        initialGuess={modalGuess}
        onPaymentSuccess={() => {
          setMessages((prev) => [
            {
              id: `msg-${Date.now()}`,
              name: 'Você (Convidado)',
              message: 'Parabéns Mariana e Rafael! Muita saúde para o Leonardo!',
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

      {/* BARRA FLUTUANTE DE CONVERSÃO SÓBRIA */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] bg-charcoal-900 text-white p-3.5 rounded-xl shadow-elevated border border-charcoal-800 flex items-center justify-between gap-3">
        <div className="truncate pr-2">
          <span className="font-serif text-sm font-medium block">
            Pronto para o seu próprio Chá?
          </span>
          <span className="text-[11px] text-stone-400 font-sans block truncate">
            Crie sua página e receba via Pix em menos de 2 minutos.
          </span>
        </div>

        <Link
          href="/cadastro"
          className="shrink-0 py-2 px-3.5 rounded-lg text-xs font-medium bg-cream-50 text-charcoal-900 hover:bg-white transition"
        >
          Criar Página
        </Link>
      </div>
    </div>
  );
}
