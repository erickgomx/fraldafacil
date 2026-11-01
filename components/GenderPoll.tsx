'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, User } from 'lucide-react';

interface GenderPollProps {
  eventId: string;
  initialBoyVotes?: number;
  initialGirlVotes?: number;
  onOpenPixModalWithGuess?: (guess: 'BOY' | 'GIRL') => void;
}

export default function GenderPoll({
  eventId,
  initialBoyVotes = 0,
  initialGirlVotes = 0,
  onOpenPixModalWithGuess,
}: GenderPollProps) {
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

        // Confetes coloridos
        const colors =
          selectedGuess === 'BOY'
            ? ['#38bdf8', '#0284c7', '#ffffff']
            : ['#f472b6', '#db2777', '#ffffff'];

        confetti({
          particleCount: 70,
          spread: 60,
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
    <section className="my-10 max-w-3xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-white">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>O Grande Bolão</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">
            Menino ou Menina? Qual é o seu palpite?
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Participe do bolão e deixe sua aposta gravada com carinho no coração dos pais!
          </p>
        </div>

        {/* Barra de Porcentagem */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm md:text-base font-extrabold mb-2.5">
            <span className="text-sky-600 flex items-center gap-1.5">
              <span>💙 Menino</span>
              <span className="text-xs bg-sky-100 text-sky-700 py-0.5 px-2 rounded-full font-bold">
                {boyPercent}% ({boyVotes} votos)
              </span>
            </span>
            <span className="text-pink-600 flex items-center gap-1.5">
              <span className="text-xs bg-pink-100 text-pink-700 py-0.5 px-2 rounded-full font-bold">
                {girlPercent}% ({girlVotes} votos)
              </span>
              <span>Menina 💖</span>
            </span>
          </div>

          <div className="h-5 bg-slate-100 rounded-full overflow-hidden flex p-1 border border-slate-200">
            <div
              style={{ width: `${boyPercent}%` }}
              className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-l-full transition-all duration-700 shadow-sm"
            />
            <div
              style={{ width: `${girlPercent}%` }}
              className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-r-full transition-all duration-700 shadow-sm"
            />
          </div>
        </div>

        {/* Botões de Aposta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <button
            onClick={() => handleOpenVoteModal('BOY')}
            className="py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-400/25 active:scale-[0.98] transition flex items-center justify-center gap-2 group"
          >
            <span className="text-xl group-hover:scale-125 transition-transform">👦</span>
            <span>Apostar em Menino</span>
          </button>

          <button
            onClick={() => handleOpenVoteModal('GIRL')}
            className="py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-400/25 active:scale-[0.98] transition flex items-center justify-center gap-2 group"
          >
            <span className="text-xl group-hover:scale-125 transition-transform">👧</span>
            <span>Apostar em Menina</span>
          </button>
        </div>

        {hasVoted && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Seu palpite foi registrado com sucesso! Obrigado por participar!</span>
          </div>
        )}
      </div>

      {/* Modal de Voto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="text-center mb-6">
              <span className="text-4xl inline-block mb-2">
                {selectedGuess === 'BOY' ? '👦' : '👧'}
              </span>
              <h3 className="text-xl font-black text-slate-800">
                Seu palpite é {selectedGuess === 'BOY' ? 'Menino 💙' : 'Menina 💖'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Como você prefere registrar o seu voto no bolão?
              </p>
            </div>

            <form onSubmit={handleFreeVote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Seu Nome ou Apelido
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    placeholder="Ex: Tio Lucas / Vovó Cida"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 shadow-md ${
                    selectedGuess === 'BOY'
                      ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20'
                      : 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20'
                  }`}
                >
                  {loading ? 'Registrando...' : 'Confirmar Voto Grátis no Bolão'}
                </button>

                {onOpenPixModalWithGuess && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      onOpenPixModalWithGuess(selectedGuess);
                    }}
                    className="w-full py-3 px-4 rounded-xl font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition text-xs flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Votar e Enviar um Presente Pix Junto!</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
