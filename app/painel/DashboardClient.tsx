'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  DollarSign,
  TrendingUp,
  Gift,
  Sparkles,
  Users,
  CheckCircle,
  Check,
  Share2,
} from 'lucide-react';

interface DashboardClientProps {
  event: {
    id: string;
    slug: string;
    babyName: string | null;
    parentsNames: string;
    revealedGender: string | null;
    pixKey: string | null;
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
            particleCount: 150,
            spread: 90,
            colors: ['#38bdf8', '#0284c7', '#ffffff'],
          });
        } else if (gender === 'GIRL') {
          confetti({
            particleCount: 150,
            spread: 90,
            colors: ['#f472b6', '#db2777', '#ffffff'],
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
      {/* Banner de Boas-Vindas & Link de Compartilhamento */}
      <div className="bg-gradient-to-r from-sky-500 via-purple-500 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-purple-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 py-1 px-3 rounded-full inline-block mb-2">
            Painel dos Pais
          </span>
          <h1 className="text-2xl md:text-3xl font-black">
            Olá, {event.parentsNames}! 👋
          </h1>
          <p className="text-xs md:text-sm text-white/90 mt-1 max-w-lg">
            Aqui você acompanha a arrecadação das fraldas, as apostas do bolão e pode revelar o sexo oficial do bebê!
          </p>
        </div>

        <button
          onClick={copyPublicLink}
          className="shrink-0 py-3 px-5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-50 transition shadow-md flex items-center gap-2 active:scale-95"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Link Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>Copiar Link do Chá</span>
            </>
          )}
        </button>
      </div>

      {/* METRICAS FINANCEIRAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Arrecadado */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 block uppercase">
            Total Arrecadado Bruto
          </span>
          <strong className="text-2xl font-black text-slate-800">
            R$ {metrics.totalGross.toFixed(2).replace('.', ',')}
          </strong>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 block uppercase">
              Saldo Líquido dos Pais
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              94.1%
            </span>
          </div>
          <strong className="text-2xl font-black text-sky-600">
            R$ {metrics.netAmount.toFixed(2).replace('.', ',')}
          </strong>
        </div>

        {/* Taxa da Plataforma */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 block uppercase">
            Taxa Fralda Fácil (5,9%)
          </span>
          <strong className="text-xl font-bold text-slate-600">
            R$ {metrics.platformFee.toFixed(2).replace('.', ',')}
          </strong>
        </div>

        {/* Presentes Aprovados */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 block uppercase">
            Presentes Recebidos
          </span>
          <strong className="text-2xl font-black text-slate-800">
            {metrics.totalOrders} presentes
          </strong>
        </div>
      </div>

      {/* ÁREA DA REVELAÇÃO OFICIAL DO SEXO */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Momento Mágico</span>
            </div>
            <h2 className="text-xl font-black text-slate-800">
              Botão Oficial de Revelação do Sexo
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              No momento do Chá, acione o botão para liberar a celebração com confetes e anunciar o sexo oficial na página pública!
            </p>
          </div>

          {revealed && (
            <span
              className={`py-1.5 px-4 rounded-full text-xs font-black shadow-sm ${
                revealed === 'BOY'
                  ? 'bg-sky-500 text-white'
                  : 'bg-pink-500 text-white'
              }`}
            >
              Atualmente Revelado: {revealed === 'BOY' ? '💙 MENINO' : '💖 MENINA'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleRevealGender('BOY')}
            disabled={loadingGender}
            className={`py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-95 ${
              revealed === 'BOY'
                ? 'bg-sky-600 text-white ring-4 ring-sky-300/40'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
            }`}
          >
            <span className="text-xl">👦</span>
            <span>É UM MENINO! 💙</span>
          </button>

          <button
            onClick={() => handleRevealGender('GIRL')}
            disabled={loadingGender}
            className={`py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-95 ${
              revealed === 'GIRL'
                ? 'bg-pink-600 text-white ring-4 ring-pink-300/40'
                : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/20'
            }`}
          >
            <span className="text-xl">👧</span>
            <span>É UMA MENINA! 💖</span>
          </button>

          <button
            onClick={() => handleRevealGender(null)}
            disabled={loadingGender}
            className="py-4 px-4 rounded-2xl font-bold text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition"
          >
            Ocultar Revelação (Manter Segredo)
          </button>
        </div>
      </div>

      {/* PLACAR DO BOLÃO */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-500" />
          <span>Placar do Bolão dos Convidados</span>
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Total de {metrics.totalVotes} votos registrados até o momento
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center text-sm font-bold mb-2">
            <span className="text-sky-600">
              💙 Menino: {metrics.boyPercent}% ({metrics.boyVotes} votos)
            </span>
            <span className="text-pink-600">
              Menina: {metrics.girlPercent}% ({metrics.girlVotes} votos) 💖
            </span>
          </div>

          <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
            <div
              style={{ width: `${metrics.boyPercent}%` }}
              className="h-full bg-sky-500 rounded-l-full transition-all duration-500"
            />
            <div
              style={{ width: `${metrics.girlPercent}%` }}
              className="h-full bg-pink-500 rounded-r-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* ÚLTIMOS PRESENTES RECEBIDOS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-rose-500" />
          <span>Últimos Presentes & Mimos Recebidos</span>
        </h2>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            Nenhum presente recebido ainda. Compartilhe o link do seu Chá com os convidados!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-slate-800">
                      {order.payerName}
                    </strong>
                    {order.pollGuess && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.pollGuess === 'BOY'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {order.pollGuess === 'BOY' ? '💙 Menino' : '💖 Menina'}
                      </span>
                    )}
                  </div>
                  {order.payerMessage && (
                    <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">
                      &ldquo;{order.payerMessage}&rdquo;
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-emerald-600 block">
                    + R$ {order.amount.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Aprovado</span>
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
