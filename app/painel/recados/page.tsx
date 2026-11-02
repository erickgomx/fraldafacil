import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RecadosPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const event = await prisma.event.findFirst({
    where: { userId: session.userId },
    include: {
      guestMessages: {
        orderBy: { createdAt: 'desc' },
        include: {
          order: true,
        },
      },
    },
  });

  if (!event) redirect('/cadastro');

  const messages = event.guestMessages;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-warm-border">
        <h1 className="font-serif text-2xl font-normal text-charcoal-900">
          Livro de Recados dos Convidados
        </h1>
        <p className="text-xs text-charcoal-500 font-sans mt-0.5">
          Todas as mensagens de carinho deixadas pelos convidados durante a confirmação de presentes
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-warm-border shadow-subtle max-w-md mx-auto">
          <h3 className="font-serif text-base text-charcoal-800 font-normal">Nenhum recado ainda</h3>
          <p className="text-xs text-charcoal-500 font-sans mt-1">
            Assim que os convidados presentearem e deixarem uma mensagem, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl p-5 border border-warm-border shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-serif text-sm font-medium text-charcoal-900">{m.name}</h3>
                    <span className="text-[11px] font-mono text-charcoal-400">
                      {new Date(m.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {m.order.pollGuess && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        m.order.pollGuess === 'BOY'
                          ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                          : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                      }`}
                    >
                      {m.order.pollGuess === 'BOY' ? 'Apostou: Menino' : 'Apostou: Menina'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-charcoal-700 italic bg-cream-50/70 p-3.5 rounded-lg border border-warm-border/60 leading-relaxed font-sans">
                  &ldquo;{m.message}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs">
                <span className="text-charcoal-500 text-[11px] font-sans">Presente via Pix:</span>
                <span className="font-mono text-xs font-semibold text-charcoal-900 tabular-nums">
                  R$ {m.order.amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
