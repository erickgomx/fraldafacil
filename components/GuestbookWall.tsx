'use client';

import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

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
    <section className="my-16 max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="text-center mb-10"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
          Livro de Recados
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
          Mensagens da Família & Amigos
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1 font-sans">
          Palavras de afeto deixadas pelos convidados para os pais guardarem
        </p>
      </motion.div>

      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="bg-white rounded-2xl p-10 text-center border border-warm-border shadow-subtle max-w-md mx-auto"
        >
          <p className="font-serif text-lg text-charcoal-800 font-normal mb-1">
            O mural ainda está vazio
          </p>
          <p className="text-xs text-charcoal-500 font-sans mb-5 max-w-xs mx-auto">
            Seja o primeiro a enviar um mimo e deixar uma mensagem especial para a família.
          </p>
          <button
            onClick={onOpenGiftModal}
            className="py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle"
          >
            Deixar a primeira mensagem
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -4, transition: { duration: 0.35, ease: EASE } }}
              transition={{ duration: 0.7, ease: EASE, delay: (i % 2) * 0.08 }}
              className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between transition-[box-shadow,border-color] duration-500 hover:shadow-lift hover:border-stone-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-serif text-base text-charcoal-900 font-medium">
                      {item.name}
                    </h4>
                    <span className="text-[11px] font-mono text-charcoal-400">
                      {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {item.order?.pollGuess && (
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        item.order.pollGuess === 'BOY'
                          ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                          : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                      }`}
                    >
                      {item.order.pollGuess === 'BOY' ? 'Aposta: Menino' : 'Aposta: Menina'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-charcoal-700 leading-relaxed font-sans italic bg-cream-50/70 p-3.5 rounded-lg border border-warm-border/50">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>

              {item.order?.amount && (
                <div className="mt-4 pt-3 border-t border-warm-border/50 flex items-center justify-between text-[11px] font-mono text-charcoal-500">
                  <span>Presente confirmado</span>
                  <span className="font-semibold text-charcoal-800 tabular-nums">
                    R$ {item.order.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
