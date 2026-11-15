/**
 * ============================================================================
 * CLIENTE DO DASHBOARD DO ORGANIZADOR (DashboardClient)
 * ============================================================================
 * Painel interativo dos pais, projetado para máxima clareza:
 * - Checklist inicial para garantir que o recebimento via Pix está pronto.
 * - Resumo financeiro direto ao ponto: quanto já é seu (líquido), presentes e palpites.
 * - Bloco unificado do Bolão + Revelação ao Vivo do sexo do bebê.
 * - Sorteio entre presenteadores (quando ativado nas configurações).
 * - Lista das últimas mensagens e presentes recebidos da família.
 */

'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Share2,
  MessageCircle,
  Ticket,
  Trophy,
  ExternalLink,
  Gift,
  Sparkles,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { shareEvent, buildSharePayload } from '@/lib/share';

interface DashboardClientProps {
  event: {
    id: string;
    slug: string;
    eventType?: string;
    babyName: string | null;
    boyName?: string | null;
    girlName?: string | null;
    parentsNames: string;
    revealedGender: string | null;
    pixKey: string | null;
    mpConnected?: boolean;
    feePayer?: 'GUEST' | 'PARENTS';
    raffleEnabled?: boolean;
    rafflePrize?: string | null;
    raffleWinnerName?: string | null;
    raffleWinnerTicket?: number | null;
    raffleDrawnAt?: string | null;
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
    raffleParticipantsCount?: number;
  };
  recentOrders: Array<{
    id: string;
    amount: number;
    payerName: string;
    pollGuess: string | null;
    raffleTicketNumber?: number | null;
    createdAt: string;
    payerMessage: string | null;
  }>;
}

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function DashboardClient({
  event,
  metrics,
  recentOrders,
}: DashboardClientProps) {
  const [revealed, setRevealed] = useState<string | null>(event.revealedGender);
  const [loadingGender, setLoadingGender] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [raffleWinner, setRaffleWinner] = useState<{
    name: string;
    ticketNumber: number;
    drawnAt: string;
  } | null>(
    event.raffleDrawnAt && event.raffleWinnerName && event.raffleWinnerTicket
      ? {
          name: event.raffleWinnerName,
          ticketNumber: event.raffleWinnerTicket,
          drawnAt: event.raffleDrawnAt,
        }
      : null
  );
  const [confirmDraw, setConfirmDraw] = useState(false);
  const [drawingRaffle, setDrawingRaffle] = useState(false);
  const [raffleError, setRaffleError] = useState('');

  const handleDrawRaffle = async () => {
    setDrawingRaffle(true);
    setRaffleError('');
    try {
      const res = await fetch('/api/events/raffle/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível realizar o sorteio.');
      }
      setRaffleWinner({
        name: data.winner.name,
        ticketNumber: data.winner.ticketNumber,
        drawnAt: data.winner.drawnAt,
      });
      setConfirmDraw(false);
      confetti({
        particleCount: 110,
        spread: 85,
        colors: ['#C2765B', '#4A6B82', '#B86B77', '#FAF8F5'],
      });
    } catch (err: unknown) {
      setRaffleError(err instanceof Error ? err.message : 'Erro ao sortear.');
    } finally {
      setDrawingRaffle(false);
    }
  };

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

  const copyPublicLink = async () => {
    const res = await shareEvent({
      slug: event.slug,
      parentsNames: event.parentsNames,
      babyName: event.babyName,
      boyName: event.boyName,
      girlName: event.girlName,
      eventType: event.eventType,
      revealedGender: event.revealedGender,
    });
    if (res !== 'CANCELLED') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappUrl = buildSharePayload({
    slug: event.slug,
    parentsNames: event.parentsNames,
    babyName: event.babyName,
    boyName: event.boyName,
    girlName: event.girlName,
    eventType: event.eventType,
    revealedGender: event.revealedGender,
  }).whatsappUrl;

  const leadingTeam =
    metrics.totalVotes === 0
      ? 'Nenhum palpite ainda'
      : metrics.boyPercent === metrics.girlPercent
      ? 'Empate técnico (50% a 50%)'
      : metrics.boyPercent > metrics.girlPercent
      ? `Menino na frente (${metrics.boyPercent}%)`
      : `Menina na frente (${metrics.girlPercent}%)`;

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO ACOLHEDOR + COMPARTILHAMENTO DIRETO */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-charcoal-500 mb-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  event.mpConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span>
                {event.mpConnected ? 'Página pronta para receber presentes' : 'Falta conectar seu recebimento'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900">
              Olá, {event.parentsNames}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 font-sans mt-1">
              Endereço do seu chá:{' '}
              <Link
                href={`/${event.slug}`}
                target="_blank"
                className="font-medium text-charcoal-800 underline underline-offset-2 inline-flex items-center gap-1 hover:text-terracotta transition-colors"
              >
                <span>fralda.online/{event.slug}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium text-xs transition shadow-subtle flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="font-semibold">Enviar no WhatsApp</span>
            </a>

            <button
              onClick={copyPublicLink}
              className="py-2.5 px-4 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs transition shadow-subtle flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-stone-200" />
                  <span>Convite Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-300" />
                  <span>Copiar Convite</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. PASSO A PASSO PENDENTE (SÓ APARECE SE FALTAR CONECTAR MERCADO PAGO) */}
      {!event.mpConnected && (
        <div className="bg-amber-50/90 border border-amber-300 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-950 font-semibold text-sm">
              <Wallet className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Passo obrigatório: conecte seu Mercado Pago para receber os Pix</span>
            </div>
            <p className="text-amber-900/80 text-xs leading-relaxed max-w-xl font-sans">
              Sem conectar sua conta, seus convidados não conseguem finalizar o pagamento dos presentes. O dinheiro cai direto na sua conta Mercado Pago.
            </p>
          </div>
          <Link
            href="/painel/configuracoes"
            className="py-2.5 px-5 rounded-xl bg-[#009EE3] hover:bg-[#0082ba] text-white font-semibold text-xs transition shadow-subtle text-center shrink-0 inline-flex items-center justify-center gap-1.5"
          >
            <span>Conectar Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. RESUMO DO SEU CHÁ (3 NÚMEROS SIMPLES E CLAROS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: O dinheiro que vai para os pais */}
        <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-charcoal-600">
                Valor disponível para você
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Direto no seu MP
              </span>
            </div>
            <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block">
              {formatBRL(metrics.netAmount)}
            </strong>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-3 pt-3 border-t border-warm-border/60 font-sans">
            {metrics.totalOrders === 0
              ? 'Assim que o primeiro presente for pago, o valor aparece aqui.'
              : metrics.platformFee > 0
              ? `Total dos presentes: ${formatBRL(metrics.totalGross)} · Taxa: ${formatBRL(metrics.platformFee)}`
              : 'Valor líquido já descontado de taxas.'}
          </p>
        </div>

        {/* Card 2: Presentes */}
        <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-600 block mb-2">
              Presentes confirmados
            </span>
            <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block">
              {metrics.totalOrders}
            </strong>
          </div>
          <div className="mt-3 pt-3 border-t border-warm-border/60 flex items-center justify-between text-[11px] font-sans">
            <span className="text-charcoal-500">Quer editar preços ou itens?</span>
            <Link
              href="/painel/presentes"
              className="font-medium text-charcoal-800 hover:text-terracotta underline underline-offset-2"
            >
              Ver lista
            </Link>
          </div>
        </div>

        {/* Card 3: Bolão */}
        <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-600 block mb-2">
              Palpites no Bolão
            </span>
            <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block">
              {metrics.totalVotes}
            </strong>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-3 pt-3 border-t border-warm-border/60 font-sans">
            {leadingTeam}
          </p>
        </div>
      </div>

      {/* 4. BOLÃO & MOMENTO DA REVELAÇÃO (TUDO NO MESMO LUGAR) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
              Interação com a Família
            </span>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>Placar do Bolão &amp; Revelação ao Vivo</span>
            </h2>
          </div>

          {revealed && (
            <span
              className={`py-1.5 px-3.5 rounded-full text-xs font-mono font-medium border inline-flex items-center gap-1.5 self-start sm:self-auto ${
                revealed === 'BOY'
                  ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                  : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
              }`}
            >
              <span>Revelado:</span>
              <strong>
                {revealed === 'BOY'
                  ? event.boyName
                    ? `Menino (${event.boyName}) 💙`
                    : 'Menino 💙'
                  : event.girlName
                  ? `Menina (${event.girlName}) 🌸`
                  : 'Menina 🌸'}
              </strong>
            </span>
          )}
        </div>

        {/* Barra de Placar */}
        <div className="p-4 rounded-xl bg-cream-50/70 border border-warm-border/80">
          <div className="flex justify-between items-baseline text-xs font-mono mb-2">
            <span className="text-dusty-blue font-medium">
              💙 Menino: {metrics.boyPercent}% ({metrics.boyVotes})
            </span>
            <span className="text-dusty-rose font-medium">
              ({metrics.girlVotes}) {metrics.girlPercent}% :Menina 🌸
            </span>
          </div>
          <div className="h-3 bg-cream-200/70 rounded-full overflow-hidden flex border border-warm-border p-0.5">
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

        {/* Botões de Revelação */}
        <div>
          <p className="text-xs text-charcoal-500 font-sans mb-3">
            Quando chegar a hora da revelação, clique abaixo para anunciar na página pública com chuva de confetes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleRevealGender('BOY')}
              disabled={loadingGender}
              className={`py-3 px-4 rounded-xl font-medium text-xs transition border flex flex-col items-center justify-center gap-0.5 ${
                revealed === 'BOY'
                  ? 'bg-dusty-blue text-white border-dusty-blue shadow-subtle font-semibold'
                  : 'bg-dusty-blue-light/70 text-dusty-blue border-dusty-blue/30 hover:bg-dusty-blue/20'
              }`}
            >
              <span className="font-semibold text-xs">É um Menino 💙</span>
              {event.boyName && (
                <span className="text-[11px] opacity-90 font-serif italic">({event.boyName})</span>
              )}
            </button>

            <button
              onClick={() => handleRevealGender('GIRL')}
              disabled={loadingGender}
              className={`py-3 px-4 rounded-xl font-medium text-xs transition border flex flex-col items-center justify-center gap-0.5 ${
                revealed === 'GIRL'
                  ? 'bg-dusty-rose text-white border-dusty-rose shadow-subtle font-semibold'
                  : 'bg-dusty-rose-light/70 text-dusty-rose border-dusty-rose/30 hover:bg-dusty-rose/20'
              }`}
            >
              <span className="font-semibold text-xs">É uma Menina 🌸</span>
              {event.girlName && (
                <span className="text-[11px] opacity-90 font-serif italic">({event.girlName})</span>
              )}
            </button>

            <button
              onClick={() => handleRevealGender(null)}
              disabled={loadingGender}
              className="py-3 px-4 rounded-xl text-xs text-charcoal-600 bg-cream-100 hover:bg-cream-200 border border-warm-border transition"
            >
              Manter em Segredo
            </button>
          </div>
        </div>
      </div>

      {/* 5. SORTEIO DO CHÁ (QUANDO ATIVADO) OU ATALHO DISCRETO PARA ATIVAR */}
      {event.raffleEnabled ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block mb-1">
                Sorteio entre Presenteadores
              </span>
              <h2 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-terracotta" />
                <span>{event.rafflePrize ? `Prêmio: ${event.rafflePrize}` : 'Sorteio do Chá'}</span>
              </h2>
              <p className="text-xs text-charcoal-500 mt-1 font-sans">
                {raffleWinner
                  ? 'Sorteio realizado. O resultado é definitivo e já aparece na página pública.'
                  : `${metrics.raffleParticipantsCount ?? 0} participante(s) concorrendo com Número da Sorte.`}
              </p>
            </div>

            {!raffleWinner && (
              <div className="shrink-0">
                {!confirmDraw ? (
                  <button
                    type="button"
                    disabled={!metrics.raffleParticipantsCount}
                    onClick={() => setConfirmDraw(true)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-subtle"
                  >
                    Realizar Sorteio
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={drawingRaffle}
                      onClick={handleDrawRaffle}
                      className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-terracotta text-white hover:opacity-90 disabled:opacity-50 transition shadow-subtle"
                    >
                      {drawingRaffle ? 'Sorteando...' : 'Confirmar (Definitivo)'}
                    </button>
                    <button
                      type="button"
                      disabled={drawingRaffle}
                      onClick={() => setConfirmDraw(false)}
                      className="py-2.5 px-3 rounded-xl text-xs text-charcoal-500 bg-cream-100 hover:bg-cream-200 border border-warm-border transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {raffleError && (
            <p className="mt-3 text-xs text-rose-600 font-sans">{raffleError}</p>
          )}

          {raffleWinner && (
            <div className="mt-4 p-4 rounded-xl bg-cream-50 border border-warm-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 block">
                    Ganhador(a) Oficial
                  </span>
                  <strong className="font-serif text-base font-medium text-charcoal-900">
                    {raffleWinner.name}
                  </strong>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-charcoal-900 text-white font-mono text-xs font-semibold tabular-nums">
                Nº #{String(raffleWinner.ticketNumber).padStart(3, '0')}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-cream-100/60 rounded-2xl p-5 border border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-warm-border text-terracotta flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-900">
                Quer fazer um sorteio entre quem presentear?
              </p>
              <p className="text-[11px] text-charcoal-500 font-sans">
                Ative o Sorteio Opcional para gerar 1 Número da Sorte automático a cada presente confirmado.
              </p>
            </div>
          </div>
          <Link
            href="/painel/configuracoes"
            className="text-xs font-medium text-charcoal-800 hover:text-terracotta underline underline-offset-2 shrink-0"
          >
            Ativar em Configurações →
          </Link>
        </div>
      )}

      {/* 6. ÚLTIMOS PRESENTES E RECADOS */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-subtle">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
            <Gift className="w-4 h-4 text-charcoal-500" />
            <span>Últimos Presentes Recebidos</span>
          </h2>
          {recentOrders.length > 0 && (
            <Link
              href="/painel/recados"
              className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 underline underline-offset-2"
            >
              Ver todos os recados
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center bg-cream-50/50 rounded-xl border border-dashed border-warm-border">
            <p className="text-xs text-charcoal-500 font-sans">
              Nenhum presente confirmado ainda. Compartilhe o link no WhatsApp para começar!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-warm-border/60">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-xs sm:text-sm font-medium text-charcoal-900">
                      {order.payerName}
                    </strong>
                    {order.raffleTicketNumber !== null && order.raffleTicketNumber !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cream-100 border border-warm-border text-charcoal-700">
                        Nº #{String(order.raffleTicketNumber).padStart(3, '0')}
                      </span>
                    )}
                    {order.pollGuess && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
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
                  <span className="font-mono text-xs sm:text-sm font-semibold text-charcoal-900 tabular-nums block">
                    {formatBRL(order.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">
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
