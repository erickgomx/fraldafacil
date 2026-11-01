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

// Presentes padrão com IDs fictícios
const DEMO_GIFTS: GiftItemData[] = DEFAULT_GIFT_ITEMS.map((item, index) => ({
  id: `demo-gift-${index + 1}`,
  title: item.title,
  description: item.description,
  price: item.price,
  imageUrl: item.imageUrl,
  category: item.category,
  active: true,
}));

// Mensagens fictícias do mural
const INITIAL_MESSAGES: GuestMessageData[] = [
  {
    id: 'msg-1',
    name: 'Tia Camila & Tio Bruno',
    message: 'Estamos tão ansiosos para ver o rostinho desse anjinho! Que venha com muita saúde para encher a casa de risadas!',
    createdAt: new Date(Date.now() - 2 * 3600000),
    order: { pollGuess: 'BOY', amount: 80.0 },
  },
  {
    id: 'msg-2',
    name: 'Vovó Cida',
    message: 'O coração da vovó já não aguenta de tanto amor! Meu palpite é que vai ser a cara do pai, mas um meninão lindo!',
    createdAt: new Date(Date.now() - 8 * 3600000),
    order: { pollGuess: 'BOY', amount: 150.0 },
  },
  {
    id: 'msg-3',
    name: 'Dinda Carol',
    message: 'Presentinho de coração para o amorzinho da dinda! Já comprei vários laços rosas no meu coração, vamos ver quem ganha o bolão!',
    createdAt: new Date(Date.now() - 24 * 3600000),
    order: { pollGuess: 'GIRL', amount: 100.0 },
  },
  {
    id: 'msg-4',
    name: 'Lucas & Família',
    message: 'Mari e Rafa, parabéns por esse momento abençoado! Que essa nova fase traga uma felicidade sem tamanho para vocês.',
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

  // Data fictícia daqui a 22 dias
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
        particleCount: 120,
        spread: 80,
        colors: ['#38bdf8', '#0284c7', '#ffffff'],
      });
    } else if (gender === 'GIRL') {
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ['#f472b6', '#db2777', '#ffffff'],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-rose-50/40 to-slate-50 text-slate-800">
      {/* BARRA SUPERIOR FIXA DE DEMONSTRAÇÃO */}
      <div className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">
              👀 <span className="text-amber-300 font-extrabold uppercase">Modo Demonstração:</span> Veja como os convidados verão a página do seu Chá!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cadastro"
              className="py-1.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-sky-400 via-purple-400 to-rose-400 text-slate-950 hover:opacity-95 shadow-md transition flex items-center gap-1.5"
            >
              <span>Criar Minha Página Grátis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CONTROLES DE EXPERIMENTAÇÃO (SIMULAR REVELAÇÃO) */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Eye className="w-4 h-4 text-purple-500" />
            <span>Simulador de Revelação:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleReveal('BOY')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                revealedGender === 'BOY'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <span>Testar: Revelar Menino 💙</span>
            </button>

            <button
              onClick={() => handleToggleReveal('GIRL')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                revealedGender === 'GIRL'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <span>Testar: Revelar Menina 💖</span>
            </button>

            {revealedGender && (
              <button
                onClick={() => handleToggleReveal(null)}
                className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1"
                title="Voltar ao estado antes da revelação"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resetar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HERO DA DEMONSTRAÇÃO */}
      <BabyHero
        parentsNames="Mariana & Rafael"
        babyName="Leonardo (Leo)"
        eventDate={demoDate}
        storyMessage="Estamos muito felizes e ansiosos pela chegada do nosso maior tesouro! Criamos esta página com muito amor para compartilhar esse momento mágico com cada um de vocês."
        coverImageUrl="https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80"
        themeColor="#38BDF8"
        revealedGender={revealedGender}
        eventType="REVELACAO"
      />

      {/* BOLÃO INTERATIVO */}
      <GenderPoll
        eventId="demo-event-id"
        initialBoyVotes={boyVotes}
        initialGirlVotes={girlVotes}
        onOpenPixModalWithGuess={handleOpenWithGuessOnly}
      />

      {/* CATÁLOGO DE FRALDAS E MIMOS */}
      <DiaperCatalog
        items={DEMO_GIFTS}
        onSelectGift={(gift) => handleOpenGiftModal(gift)}
      />

      {/* MURAL DE RECADOS */}
      <GuestbookWall
        messages={messages}
        onOpenGiftModal={() => handleOpenGiftModal(null)}
      />

      {/* MODAL DE CHECKOUT PIX */}
      <PixCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId="demo-event-id"
        parentsNames="Mariana & Rafael"
        selectedGift={selectedGift}
        initialGuess={modalGuess}
        onPaymentSuccess={() => {
          // Insere mensagem fictícia no mural
          setMessages((prev) => [
            {
              id: `msg-${Date.now()}`,
              name: 'Você (Convidado Especial)',
              message: 'Parabéns aos papais! Que o Leo traga bênçãos sem medida!',
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

      {/* BANNER FLUTUANTE INCENTIVANDO A CRIAÇÃO */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] bg-slate-900/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
        <div className="truncate pr-2">
          <strong className="text-xs font-bold block text-white">
            Gostou do resultado?
          </strong>
          <span className="text-[11px] text-slate-300 block truncate">
            Crie a sua página em menos de 2 minutos!
          </span>
        </div>

        <Link
          href="/cadastro"
          className="shrink-0 py-2 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-sky-400 to-rose-400 text-slate-950 hover:opacity-95 shadow-md transition"
        >
          Criar Agora
        </Link>
      </div>
    </div>
  );
}
