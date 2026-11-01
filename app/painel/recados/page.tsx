import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

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
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Mural de Mensagens dos Convidados
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Todas as palavras de carinho e votos de felicidade enviados pelos amigos e família
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nenhum recado ainda</h3>
          <p className="text-xs text-slate-500 mt-1">
            Assim que os convidados presentearem e deixarem uma mensagem, ela aparecerá aqui em tempo real!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{m.name}</h3>
                    <span className="text-[11px] text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {m.order.pollGuess && (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        m.order.pollGuess === 'BOY'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {m.order.pollGuess === 'BOY' ? '💙 Apostou Menino' : '💖 Apostou Menina'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  &ldquo;{m.message}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Presente enviado:</span>
                <span className="font-extrabold text-emerald-600">
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
