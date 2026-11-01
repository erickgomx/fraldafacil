'use client';

import { MessageSquare, Heart, Sparkles } from 'lucide-react';

export interface GuestMessageData {
  id: string;
  name: string;
  message: string;
  createdAt: string | Date;
  order?: {
    pollGuess?: string | null;
    amount?: number | null;
  } | null;
}

interface GuestbookWallProps {
  messages: GuestMessageData[];
  onOpenGiftModal: () => void;
}

export default function GuestbookWall({ messages, onOpenGiftModal }: GuestbookWallProps) {
  return (
    <section className="my-16 max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
          <span>Mural do Bebê</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800">
          Mensagens de Carinho & Recados
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Palavras de afeto e votos de felicidades deixados pelos amigos e familiares
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 text-center border border-dashed border-slate-300 max-w-md mx-auto">
          <Heart className="w-10 h-10 text-rose-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">O mural ainda está em branco</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Presenteie os pais e seja a primeira pessoa a deixar uma mensagem especial que ficará guardada para sempre!
          </p>
          <button
            onClick={onOpenGiftModal}
            className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-rose-500 shadow-md shadow-sky-500/20 active:scale-95 transition"
          >
            Deixar a Primeira Mensagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{item.name}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {item.order?.pollGuess && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.order.pollGuess === 'BOY'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {item.order.pollGuess === 'BOY' ? '💙 Menino' : '💖 Menina'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>

              <div className="mt-3 flex items-center justify-end text-[11px] text-rose-500 font-semibold gap-1">
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>Presente de coração</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
