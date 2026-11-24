'use client';

import { useMemo, useState } from 'react';
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
  Search,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { shareEvent, buildSharePayload, buildThankYouWhatsAppUrl } from '@/lib/share';
import { localizeGiftTitle } from '@/lib/default-gifts';
import { useI18n } from '@/components/LanguageProvider';
import { painelDict } from '@/lib/i18n/dictionaries/painel';
import { commonDict } from '@/lib/i18n/dictionaries/common';

interface DashboardOrderItem {
  id: string;
  amount: number;
  netAmount: number;
  paymentMethod: string;
  payerName: string;
  payerPhone: string | null;
  giftTitle: string;
  pollGuess: string | null;
  raffleTicketNumber?: number | null;
  createdAt: string;
  payerMessage: string | null;
}

interface DashboardPollVote {
  id: string;
  voterName: string;
  guess: string;
  createdAt: string;
}

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
    totalMessages?: number;
    raffleParticipantsCount?: number;
  };
  orders?: DashboardOrderItem[];
  pollVotes?: DashboardPollVote[];
}

export default function DashboardClient({
  event,
  metrics,
  orders = [],
  pollVotes = [],
}: DashboardClientProps) {
  const { locale, t, formatCurrency, formatDate } = useI18n();
  const dict = painelDict[locale].dashboard;
  const gendersDict = commonDict[locale].genders;
  const methodsDict = commonDict[locale].paymentMethods;

  const [revealed, setRevealed] = useState<string | null>(event.revealedGender);
  const [loadingGender, setLoadingGender] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [orderSearch, setOrderSearch] = useState('');
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showPollVoters, setShowPollVoters] = useState(false);
  const [pollFilter, setPollFilter] = useState<'ALL' | 'BOY' | 'GIRL' | 'WINNERS'>('ALL');

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
        throw new Error(data.error || dict.drawErrorFallback);
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
      setRaffleError(err instanceof Error ? err.message : dict.drawUnknownError);
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
      revealedGender: revealed,
      locale,
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
    revealedGender: revealed,
    locale,
  }).whatsappUrl;

  const leadingTeam =
    metrics.totalVotes === 0
      ? dict.leadingNone
      : metrics.boyPercent === metrics.girlPercent
      ? dict.leadingTie
      : metrics.boyPercent > metrics.girlPercent
      ? t(dict.leadingBoy, { percent: metrics.boyPercent })
      : t(dict.leadingGirl, { percent: metrics.girlPercent });

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.payerName.toLowerCase().includes(q) ||
        o.giftTitle.toLowerCase().includes(q) ||
        localizeGiftTitle(o.giftTitle, locale).toLowerCase().includes(q) ||
        (o.payerMessage || '').toLowerCase().includes(q)
    );
  }, [orders, orderSearch, locale]);

  const visibleOrders = useMemo(() => {
    if (showAllOrders || orderSearch.trim() !== '') return filteredOrders;
    return filteredOrders.slice(0, 8);
  }, [filteredOrders, showAllOrders, orderSearch]);

  const filteredPollVotes = useMemo(() => {
    if (pollFilter === 'BOY') return pollVotes.filter((v) => v.guess === 'BOY');
    if (pollFilter === 'GIRL') return pollVotes.filter((v) => v.guess === 'GIRL');
    if (pollFilter === 'WINNERS' && (revealed === 'BOY' || revealed === 'GIRL')) {
      return pollVotes.filter((v) => v.guess === revealed);
    }
    return pollVotes;
  }, [pollVotes, pollFilter, revealed]);

  const winnersCount = useMemo(() => {
    if (revealed !== 'BOY' && revealed !== 'GIRL') return 0;
    return pollVotes.filter((v) => v.guess === revealed).length;
  }, [pollVotes, revealed]);

  return (
    <div className="space-y-6">
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
                {event.mpConnected ? dict.statusReady : dict.statusPending}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900">
              {t(dict.greeting, { parents: event.parentsNames })}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 font-sans mt-1">
              {dict.pageAddressLabel}{' '}
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
              <span className="font-semibold">{dict.sendWhatsApp}</span>
            </a>

            <button
              onClick={copyPublicLink}
              className="py-2.5 px-4 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs transition shadow-subtle flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-stone-200" />
                  <span>{dict.inviteCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-300" />
                  <span>{dict.copyInvite}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!event.mpConnected && (
        <div className="bg-amber-50/90 border border-amber-300 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-950 font-semibold text-sm">
              <Wallet className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{dict.mpRequiredTitle}</span>
            </div>
            <p className="text-amber-900/80 text-xs leading-relaxed max-w-xl font-sans">
              {dict.mpRequiredBody}
            </p>
          </div>
          <Link
            href="/painel/configuracoes"
            className="py-2.5 px-5 rounded-xl bg-[#009EE3] hover:bg-[#0082ba] text-white font-semibold text-xs transition shadow-subtle text-center shrink-0 inline-flex items-center justify-center gap-1.5"
          >
            <span>{dict.connectNow}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-charcoal-600">
                {dict.kpiNetTitle}
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {dict.kpiNetBadge}
              </span>
            </div>
            <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block">
              {formatCurrency(metrics.netAmount)}
            </strong>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-3 pt-3 border-t border-warm-border/60 font-sans">
            {metrics.totalOrders === 0
              ? dict.kpiNetEmpty
              : metrics.platformFee > 0
              ? t(dict.kpiNetBreakdown, {
                  gross: formatCurrency(metrics.totalGross),
                  fee: formatCurrency(metrics.platformFee),
                })
              : dict.kpiNetFallback}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-600 block mb-2">
              {dict.kpiOrdersTitle}
            </span>
            <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block">
              {metrics.totalOrders}
            </strong>
          </div>
          <div className="mt-3 pt-3 border-t border-warm-border/60 flex items-center justify-between text-[11px] font-sans">
            <span className="text-charcoal-500">{dict.kpiOrdersHint}</span>
            <Link
              href="/painel/presentes"
              className="font-medium text-charcoal-800 hover:text-terracotta underline underline-offset-2"
            >
              {dict.kpiOrdersLink}
            </Link>
          </div>
        </div>

        {event.eventType === 'FRALDA' ? (
          <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-charcoal-600 block mb-2">
                {dict.kpiMessagesTitle}
              </span>
              <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block">
                {metrics.totalMessages ?? 0}
              </strong>
            </div>
            <div className="mt-3 pt-3 border-t border-warm-border/60 flex items-center justify-between text-[11px] font-sans">
              <span className="text-charcoal-500">{dict.kpiMessagesHint}</span>
              <Link
                href="/painel/recados"
                className="font-medium text-charcoal-800 hover:text-terracotta underline underline-offset-2"
              >
                {dict.kpiMessagesLink}
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-charcoal-600 block mb-2">
                {dict.kpiPollTitle}
              </span>
              <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block">
                {metrics.totalVotes}
              </strong>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-3 pt-3 border-t border-warm-border/60 font-sans">
              {leadingTeam}
            </p>
          </div>
        )}
      </div>

      {event.eventType !== 'FRALDA' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
                {dict.pollEyebrow}
              </span>
              <h2 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-terracotta" />
                <span>{dict.pollSectionTitle}</span>
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
                <span>{dict.revealedTag}</span>
                <strong>
                  {revealed === 'BOY'
                    ? event.boyName
                      ? `${gendersDict.boy} (${event.boyName}) 💙`
                      : `${gendersDict.boy} 💙`
                    : event.girlName
                    ? `${gendersDict.girl} (${event.girlName}) 🌸`
                    : `${gendersDict.girl} 🌸`}
                </strong>
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-cream-50/70 border border-warm-border/80">
            <div className="flex justify-between items-baseline text-xs font-mono mb-2">
              <span className="text-dusty-blue font-medium">
                {t(dict.pollBarBoy, { percent: metrics.boyPercent, votes: metrics.boyVotes })}
              </span>
              <span className="text-dusty-rose font-medium">
                {t(dict.pollBarGirl, { percent: metrics.girlPercent, votes: metrics.girlVotes })}
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

          <div>
            <p className="text-xs text-charcoal-500 font-sans mb-3">
              {dict.revealInstruction}
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
                <span className="font-semibold text-xs">{dict.revealBoyCta}</span>
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
                <span className="font-semibold text-xs">{dict.revealGirlCta}</span>
                {event.girlName && (
                  <span className="text-[11px] opacity-90 font-serif italic">({event.girlName})</span>
                )}
              </button>

              <button
                onClick={() => handleRevealGender(null)}
                disabled={loadingGender}
                className="py-3 px-4 rounded-xl text-xs text-charcoal-600 bg-cream-100 hover:bg-cream-200 border border-warm-border transition"
              >
                {dict.keepSecretCta}
              </button>
            </div>
          </div>

          {pollVotes.length > 0 && (
            <div className="pt-4 border-t border-warm-border/70">
              <button
                type="button"
                onClick={() => setShowPollVoters((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-medium text-charcoal-800 hover:text-terracotta transition py-1"
              >
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-charcoal-500" />
                  <span>
                    {t(dict.votersToggleLabel, { count: pollVotes.length })}
                    {revealed ? t(dict.votersWinnersSuffix, { count: winnersCount }) : ''}
                  </span>
                </span>
                {showPollVoters ? (
                  <ChevronUp className="w-4 h-4 text-charcoal-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-charcoal-400" />
                )}
              </button>

              {showPollVoters && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPollFilter('ALL')}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border transition ${
                        pollFilter === 'ALL'
                          ? 'bg-charcoal-900 text-white border-charcoal-900'
                          : 'bg-cream-50 text-charcoal-600 border-warm-border hover:bg-cream-100'
                      }`}
                    >
                      {t(dict.filterAll, { count: pollVotes.length })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPollFilter('BOY')}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border transition ${
                        pollFilter === 'BOY'
                          ? 'bg-dusty-blue text-white border-dusty-blue'
                          : 'bg-dusty-blue-light/60 text-dusty-blue border-dusty-blue/30'
                      }`}
                    >
                      {t(dict.filterBoy, {
                        count: pollVotes.filter((v) => v.guess === 'BOY').length,
                      })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPollFilter('GIRL')}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border transition ${
                        pollFilter === 'GIRL'
                          ? 'bg-dusty-rose text-white border-dusty-rose'
                          : 'bg-dusty-rose-light/60 text-dusty-rose border-dusty-rose/30'
                      }`}
                    >
                      {t(dict.filterGirl, {
                        count: pollVotes.filter((v) => v.guess === 'GIRL').length,
                      })}
                    </button>
                    {(revealed === 'BOY' || revealed === 'GIRL') && (
                      <button
                        type="button"
                        onClick={() => setPollFilter('WINNERS')}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                          pollFilter === 'WINNERS'
                            ? 'bg-terracotta text-white border-terracotta'
                            : 'bg-cream-100 text-terracotta border-terracotta/40 hover:bg-cream-200'
                        }`}
                      >
                        {t(dict.filterWinners, { count: winnersCount })}
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-warm-border/50 rounded-xl border border-warm-border/70 bg-cream-50/40 px-3.5">
                    {filteredPollVotes.length === 0 ? (
                      <p className="py-4 text-center text-xs text-charcoal-500 font-sans">
                        {dict.votersEmptyFilter}
                      </p>
                    ) : (
                      filteredPollVotes.map((vote) => {
                        const isWinner = Boolean(revealed && vote.guess === revealed);
                        return (
                          <div
                            key={vote.id}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-medium text-charcoal-900 truncate">
                                {vote.voterName}
                              </span>
                              {isWinner && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-terracotta/10 text-terracotta border border-terracotta/30 font-semibold shrink-0">
                                  {dict.winnerBadge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                  vote.guess === 'BOY'
                                    ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                                    : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                                }`}
                              >
                                {vote.guess === 'BOY'
                                  ? `${gendersDict.boy} 💙`
                                  : `${gendersDict.girl} 🌸`}
                              </span>
                              <span className="text-[10px] font-mono text-charcoal-400">
                                {formatDate(vote.createdAt, {
                                  day: '2-digit',
                                  month: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {event.raffleEnabled ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block mb-1">
                {dict.raffleEyebrow}
              </span>
              <h2 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-terracotta" />
                <span>
                  {event.rafflePrize
                    ? t(dict.rafflePrizeTitle, { prize: event.rafflePrize })
                    : dict.raffleDefaultTitle}
                </span>
              </h2>
              <p className="text-xs text-charcoal-500 mt-1 font-sans">
                {raffleWinner
                  ? dict.raffleDrawnSubtitle
                  : t(dict.raffleCountSubtitle, {
                      count: metrics.raffleParticipantsCount ?? 0,
                    })}
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
                    {dict.drawButton}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={drawingRaffle}
                      onClick={handleDrawRaffle}
                      className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-terracotta text-white hover:opacity-90 disabled:opacity-50 transition shadow-subtle"
                    >
                      {drawingRaffle ? dict.drawingButton : dict.confirmDrawButton}
                    </button>
                    <button
                      type="button"
                      disabled={drawingRaffle}
                      onClick={() => setConfirmDraw(false)}
                      className="py-2.5 px-3 rounded-xl text-xs text-charcoal-500 bg-cream-100 hover:bg-cream-200 border border-warm-border transition"
                    >
                      {dict.cancelButton}
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
                    {dict.officialWinnerLabel}
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
                {dict.rafflePromoTitle}
              </p>
              <p className="text-[11px] text-charcoal-500 font-sans">
                {dict.rafflePromoBody}
              </p>
            </div>
          </div>
          <Link
            href="/painel/configuracoes"
            className="text-xs font-medium text-charcoal-800 hover:text-terracotta underline underline-offset-2 shrink-0"
          >
            {dict.rafflePromoCta}
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-warm-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
            <Gift className="w-4 h-4 text-charcoal-500" />
            <span>{dict.ordersTitle}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cream-100 border border-warm-border text-charcoal-600">
              {orders.length}
            </span>
          </h2>
          {orders.length > 0 && (
            <Link
              href="/painel/recados"
              className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 underline underline-offset-2"
            >
              {dict.viewGuestbookLink}
            </Link>
          )}
        </div>

        {orders.length > 0 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-warm-border bg-cream-50/50 text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>
        )}

        {orders.length === 0 ? (
          <div className="py-8 text-center bg-cream-50/50 rounded-xl border border-dashed border-warm-border">
            <p className="text-xs text-charcoal-500 font-sans">
              {dict.emptyOrders}
            </p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="py-8 text-center bg-cream-50/50 rounded-xl border border-dashed border-warm-border">
            <p className="text-xs text-charcoal-500 font-sans">
              {t(dict.emptySearchOrders, { query: orderSearch })}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-warm-border/60">
              {visibleOrders.map((order) => {
                const localizedGiftTitle = localizeGiftTitle(order.giftTitle, locale);
                const thankYouUrl = buildThankYouWhatsAppUrl({
                  phone: order.payerPhone,
                  guestName: order.payerName,
                  giftTitle: localizedGiftTitle,
                  parentsNames: event.parentsNames,
                  locale,
                });

                return (
                  <div
                    key={order.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <strong className="text-xs sm:text-sm font-medium text-charcoal-900">
                          {order.payerName}
                        </strong>
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-cream-100 border border-warm-border text-charcoal-700">
                          {localizedGiftTitle}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-charcoal-600">
                          {order.paymentMethod === 'CREDIT_CARD'
                            ? methodsDict.CARD_SHORT
                            : methodsDict.PIX}
                        </span>
                        {order.raffleTicketNumber !== null &&
                          order.raffleTicketNumber !== undefined && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cream-100 border border-terracotta/30 text-terracotta font-semibold">
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
                            {order.pollGuess === 'BOY' ? gendersDict.boy : gendersDict.girl}
                          </span>
                        )}
                      </div>
                      {order.payerMessage && (
                        <p className="text-xs text-charcoal-500 italic line-clamp-2 font-sans">
                          &ldquo;{order.payerMessage}&rdquo;
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-mono text-charcoal-400">
                          {formatDate(order.createdAt, {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {thankYouUrl && (
                          <a
                            href={thankYouUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{dict.thankWhatsApp}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-charcoal-900 tabular-nums block">
                        {formatCurrency(order.netAmount)}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono block">
                        {dict.confirmedNetLabel}
                      </span>
                      {Math.abs(order.amount - order.netAmount) > 0.01 && (
                        <span className="text-[10px] text-charcoal-400 font-mono block">
                          {t(dict.paidLabel, { amount: formatCurrency(order.amount) })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredOrders.length > 8 && orderSearch.trim() === '' && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllOrders((prev) => !prev)}
                  className="py-2 px-4 rounded-xl text-xs font-medium bg-cream-50 hover:bg-cream-100 text-charcoal-700 border border-warm-border transition"
                >
                  {showAllOrders
                    ? dict.showTop8
                    : t(dict.showAllOrders, { count: filteredOrders.length })}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
