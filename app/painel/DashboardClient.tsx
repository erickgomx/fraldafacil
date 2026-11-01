'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardClientProps {
  event: {
    id: string;
    slug: string;
    babyName: string | null;
    parentsNames: string;
    revealedGender: string | null;
    pixKey: string | null;
    mpConnected?: boolean;
    feePayer?: 'GUEST' | 'PARENTS';
  };
  metrics: {
    totalGross: number;
    platformFee: number;
    netAmount: number;
    totalOrders: number;
    boyVotes: number;
    girlVotes: number;
    totalVotes: number;
    boyPercent: number;
    girlPercent: number;
  };
  recentOrders: Array<{
    id: string;
    amount: number;
    payerName: string;
    pollGuess: string | null;
    createdAt: string;
    payerMessage: string | null;
  }>;
}

export default function DashboardClient({
  event,
  metrics,
  recentOrders,
}: DashboardClientProps) {
  const [revealed, setRevealed] = useState<string | null>(event.revealedGender);
  const [loadingGender, setLoadingGender] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleRevealGender = async (gender: 'BOY' | 'GIRL' | null) => {
    setLoadingGender(true);
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          revealedGender: gender,
        }),
      });

      if (res.ok) {
        setRevealed(gender);

        if (gender === 'BOY') {
          confetti({
            particleCount: 100,
            spread: 80,
            colors: ['#4A6B82', '#7D9EAF', '#FAF8F5'],
          });
        } else if (gender === 'GIRL') {
          confetti({
            particleCount: 100,
            spread: 80,
            colors: ['#B86B77', '#D6949E', '#FAF8F5'],
          });
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar sexo revelado:', err);
    } finally {
      setLoadingGender(false);
    }
  };

  const copyPublicLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/${event.slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner Sóbrio de Boas-Vindas */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-warm-border shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-400 block mb-1">
            Painel de Controle
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
            Olá, {event.parentsNames}
          </h1>
          <p className="text-xs text-charcoal-500 font-sans mt-1 max-w-lg">
            Acompanhe o saldo arrecadado, as mensagens dos convidados e o resultado do bolão em tempo real.
          </p>
        </div>

        <button
          onClick={copyPublicLink}
          className="shrink-0 py-2.5 px-4 rounded-lg bg-cream-100 hover:bg-cream-200/80 border border-warm-border text-charcoal-800 font-medium text-xs transition shadow-subtle flex items-center gap-2"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-stone-900" />
              <span>Link Copiado</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Copiar Link da Página</span>
            </>
          )}
        </button>
      </div>

      {/* AVISO SE A CONTA MP NÃO ESTIVER CONECTADA */}
      {!event.mpConnected && (
        <div className="bg-amber-50 border border-amber-250 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              <strong>Atenção:</strong> Conecte sua conta do Mercado Pago para receber o dinheiro dos presentes diretamente e liberar a página para arrecadação.
            </span>
          </div>
          <Link
            href="/painel/configuracoes"
            className="py-1.5 px-3 rounded-lg bg-amber-900 text-white font-medium hover:bg-amber-800 transition text-center shrink-0"
          >
            Conectar Mercado Pago
          </Link>
        </div>
      )}

      {/* MÉTRICAS FINANCEIRAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Arrecadado */}
        <div className="bg-white p-5 rounded-xl border border-warm-border shadow-subtle">
          <span className="text-[11px] font-mono text-charcoal-500 block uppercase mb-1">
            Total Arrecadado
          </span>
          <strong className="font-mono text-2xl font-semibold text-charcoal-900 tabular-nums">
            R$ {metrics.totalGross.toFixed(2).replace('.', ',')}
          </strong>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white p-5 rounded-xl border border-warm-border shadow-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-charcoal-500 block uppercase">
              Saldo Líquido dos Pais
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Direto no MP
            </span>
          </div>
          <strong className="font-mono text-2xl font-semibold text-charcoal-900 tabular-nums">
            R$ {metrics.netAmount.toFixed(2).replace('.', ',')}
          </strong>
        </div>

        {/* Taxa da Plataforma */}
        <div className="bg-white p-5 rounded-xl border border-warm-border shadow-subtle">
          <span className="text-[11px] font-mono text-charcoal-500 block uppercase mb-1">
            Comissão Plataforma (4,99%)
          </span>
          <strong className="font-mono text-xl font-medium text-charcoal-500 tabular-nums">
            R$ {metrics.platformFee.toFixed(2).replace('.', ',')}
          </strong>
        </div>

        {/* Total de Presentes */}
        <div className="bg-white p-5 rounded-xl border border-warm-border shadow-subtle">
          <span className="text-[11px] font-mono text-charcoal-500 block uppercase mb-1">
            Presentes Recebidos
          </span>
          <strong className="font-mono text-2xl font-semibold text-charcoal-900 tabular-nums">
            {metrics.totalOrders}
          </strong>
        </div>
      </div>

      {/* REVELAÇÃO OFICIAL DO SEXO */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-warm-border shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-warm-border/60">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-400 block mb-1">
              Momento da Revelação
            </span>
            <h2 className="font-serif text-xl text-charcoal-900 font-normal">
              Anunciar Sexo Oficial do Bebê
            </h2>
            <p className="text-xs text-charcoal-500 font-sans mt-0.5">
              Ao acionar um dos botões, a página pública exibe o banner oficial e dispara confetes aos convidados.
            </p>
          </div>

          {revealed && (
            <span
              className={`py-1 px-3 rounded-full text-xs font-mono border ${
                revealed === 'BOY'
                  ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                  : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
              }`}
            >
              Atualmente revelado: {revealed === 'BOY' ? 'Menino' : 'Menina'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleRevealGender('BOY')}
            disabled={loadingGender}
            className={`py-3 px-4 rounded-lg font-medium text-xs transition border flex items-center justify-center gap-2 ${
              revealed === 'BOY'
                ? 'bg-dusty-blue text-white border-dusty-blue'
                : 'bg-dusty-blue-light text-dusty-blue border-dusty-blue/30 hover:bg-dusty-blue/20'
            }`}
          >
            <span>É um Menino</span>
          </button>

          <button
            onClick={() => handleRevealGender('GIRL')}
            disabled={loadingGender}
            className={`py-3 px-4 rounded-lg font-medium text-xs transition border flex items-center justify-center gap-2 ${
              revealed === 'GIRL'
                ? 'bg-dusty-rose text-white border-dusty-rose'
                : 'bg-dusty-rose-light text-dusty-rose border-dusty-rose/30 hover:bg-dusty-rose/20'
            }`}
          >
            <span>É uma Menina</span>
          </button>

          <button
            onClick={() => handleRevealGender(null)}
            disabled={loadingGender}
            className="py-3 px-4 rounded-lg text-xs text-charcoal-500 bg-cream-100 hover:bg-cream-200 border border-warm-border transition"
          >
            Manter em Segredo (Ocultar)
          </button>
        </div>
      </div>

      {/* PLACAR DO BOLÃO */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-warm-border shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-normal text-charcoal-900">
            Placar do Bolão dos Convidados
          </h2>
          <span className="text-xs font-mono text-charcoal-500">
            {metrics.totalVotes} votos registrados
          </span>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-baseline text-xs font-mono mb-2">
            <span className="text-dusty-blue">
              Menino: {metrics.boyPercent}% ({metrics.boyVotes} votos)
            </span>
            <span className="text-dusty-rose">
              ({metrics.girlVotes} votos) {metrics.girlPercent}% :Menina
            </span>
          </div>

          <div className="h-3 bg-cream-100 rounded-full overflow-hidden flex border border-warm-border p-0.5">
            <div
              style={{ width: `${metrics.boyPercent}%` }}
              className="h-full bg-dusty-blue rounded-l-full transition-all duration-500"
            />
            <div
              style={{ width: `${metrics.girlPercent}%` }}
              className="h-full bg-dusty-rose rounded-r-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* ÚLTIMAS CONTRIBUIÇÕES */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-warm-border shadow-subtle">
        <h2 className="font-serif text-lg font-normal text-charcoal-900 mb-4">
          Últimos Presentes Recebidos
        </h2>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-charcoal-400 py-6 text-center italic font-sans">
            Nenhum presente registrado ainda. Compartilhe o link com os amigos e familiares.
          </p>
        ) : (
          <div className="divide-y divide-warm-border/60">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-medium text-charcoal-900">
                      {order.payerName}
                    </strong>
                    {order.pollGuess && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.2 rounded border ${
                          order.pollGuess === 'BOY'
                            ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                            : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                        }`}
                      >
                        {order.pollGuess === 'BOY' ? 'Menino' : 'Menina'}
                      </span>
                    )}
                  </div>
                  {order.payerMessage && (
                    <p className="text-xs text-charcoal-500 italic mt-0.5 line-clamp-1 font-sans">
                      &ldquo;{order.payerMessage}&rdquo;
                    </p>
                  )}
                  <span className="text-[10px] font-mono text-charcoal-400">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-semibold text-charcoal-900 tabular-nums block">
                    R$ {order.amount.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-stone-600 font-mono">
                    Confirmado
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
