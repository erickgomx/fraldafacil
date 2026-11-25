'use client';

import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Share2,
  MessageCircle,
  Trophy,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  Ticket,
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
  const [pendingReveal, setPendingReveal] = useState<'BOY' | 'GIRL' | 'HIDE' | null>(null);
  const [loadingGender, setLoadingGender] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedInvite, setSharedInvite] = useState(metrics.totalOrders > 0);

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
  const [isRaffleEnabled, setIsRaffleEnabled] = useState(Boolean(event.raffleEnabled));
  const [currentRafflePrize, setCurrentRafflePrize] = useState(event.rafflePrize || '');
  const [enablingRaffle, setEnablingRaffle] = useState(false);

  const handleQuickEnableRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnablingRaffle(true);
    setRaffleError('');
    try {
      const trimmedPrize = currentRafflePrize.trim() || null;
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          raffleEnabled: true,
          rafflePrize: trimmedPrize,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || dict.raffle.drawErrorFallback);
      }
      setCurrentRafflePrize(trimmedPrize || '');
      setIsRaffleEnabled(true);
    } catch (err: unknown) {
      setRaffleError(err instanceof Error ? err.message : dict.raffle.drawUnknownError);
    } finally {
      setEnablingRaffle(false);
    }
  };

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
        throw new Error(data.error || dict.raffle.drawErrorFallback);
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
      setRaffleError(err instanceof Error ? err.message : dict.raffle.drawUnknownError);
    } finally {
      setDrawingRaffle(false);
    }
  };

  const handleConfirmReveal = async () => {
    if (!pendingReveal) return;
    const nextGender = pendingReveal === 'HIDE' ? null : pendingReveal;
    setLoadingGender(true);
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          revealedGender: nextGender,
        }),
      });

      if (res.ok) {
        setRevealed(nextGender);
        setPendingReveal(null);

        if (nextGender === 'BOY') {
          confetti({
            particleCount: 100,
            spread: 80,
            colors: ['#4A6B82', '#7D9EAF', '#FAF8F5'],
          });
        } else if (nextGender === 'GIRL') {
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
      setSharedInvite(true);
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
      ? dict.summary.pollEmpty
      : metrics.boyPercent === metrics.girlPercent
      ? dict.summary.pollTie
      : metrics.boyPercent > metrics.girlPercent
      ? t(dict.summary.pollLeadingBoy, { percent: metrics.boyPercent })
      : t(dict.summary.pollLeadingGirl, { percent: metrics.girlPercent });

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

  const showSetupChecklist = !event.mpConnected || metrics.totalOrders === 0;
  const doneStepsCount = (event.mpConnected ? 1 : 0) + 1 + (sharedInvite || metrics.totalOrders > 0 ? 1 : 0);

  const pageTitle = event.babyName
    ? t(dict.titleWithBaby, { baby: event.babyName })
    : t(dict.titleParents, { parents: event.parentsNames });

  return (
    <div className="space-y-6">
      {/* Cabeçalho do evento */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 border border-warm-border shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  event.mpConnected ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    event.mpConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {event.mpConnected ? dict.statusReady : dict.statusPending}
              </span>
              <span className="text-charcoal-300">·</span>
              <Link
                href={`/${event.slug}`}
                target="_blank"
                className="text-charcoal-600 hover:text-terracotta inline-flex items-center gap-1 underline underline-offset-2"
              >
                <span>fralda.online/{event.slug}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900">
              {pageTitle}
            </h1>
            <p className="text-sm text-charcoal-500 font-sans">
              {t(dict.subtitleGreeting, { parents: event.parentsNames })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSharedInvite(true)}
              className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs sm:text-sm transition shadow-subtle inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{dict.shareWhatsApp}</span>
            </a>

            <button
              type="button"
              onClick={copyPublicLink}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-cream-100 text-charcoal-800 border border-warm-border font-medium text-xs sm:text-sm transition inline-flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{dict.linkCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-charcoal-500" />
                  <span>{dict.copyLink}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Primeiros passos guiados */}
      {showSetupChecklist && (
        <section className="bg-white rounded-2xl border border-warm-border shadow-subtle overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-warm-border/70 flex items-center justify-between gap-2">
            <h2 className="font-serif text-lg font-medium text-charcoal-900">
              {dict.checklist.title}
            </h2>
            <span className="text-xs font-medium text-charcoal-500">
              {t(dict.checklist.progress, { done: doneStepsCount })}
            </span>
          </div>

          <div className="divide-y divide-warm-border/70">
            {/* Passo 1: Mercado Pago */}
            <div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 ${
                    event.mpConnected
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-charcoal-900 text-white'
                  }`}
                >
                  {event.mpConnected ? <Check className="w-3.5 h-3.5" /> : '1'}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-charcoal-900">
                    {event.mpConnected ? dict.checklist.mpTitleDone : dict.checklist.mpTitlePending}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 leading-relaxed">
                    {event.mpConnected ? dict.checklist.mpDescDone : dict.checklist.mpDescPending}
                  </p>
                </div>
              </div>

              {!event.mpConnected && (
                <Link
                  href="/painel/configuracoes?tab=payments"
                  className="py-2 px-4 rounded-xl bg-[#009EE3] hover:bg-[#0082ba] text-white font-semibold text-xs sm:text-sm transition shadow-subtle text-center shrink-0 self-start sm:self-center"
                >
                  {dict.checklist.mpCta}
                </Link>
              )}
            </div>

            {/* Passo 2: Conferir página e lista */}
            <div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-sm font-medium text-charcoal-900">
                    {dict.checklist.customizeTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 leading-relaxed">
                    {dict.checklist.customizeDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <Link
                  href="/painel/configuracoes?tab=page"
                  className="py-2 px-3.5 rounded-xl text-xs font-medium border border-warm-border bg-white hover:bg-cream-100 text-charcoal-800 transition"
                >
                  {dict.checklist.customizeCtaPage}
                </Link>
                <Link
                  href="/painel/presentes"
                  className="py-2 px-3.5 rounded-xl text-xs font-medium border border-warm-border bg-white hover:bg-cream-100 text-charcoal-800 transition"
                >
                  {dict.checklist.customizeCtaGifts}
                </Link>
              </div>
            </div>

            {/* Passo 3: Compartilhar no WhatsApp */}
            <div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 ${
                    sharedInvite || metrics.totalOrders > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-cream-200 text-charcoal-700'
                  }`}
                >
                  {sharedInvite || metrics.totalOrders > 0 ? <Check className="w-3.5 h-3.5" /> : '3'}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-charcoal-900">
                    {dict.checklist.shareTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 leading-relaxed">
                    {dict.checklist.shareDesc}
                  </p>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSharedInvite(true)}
                className="py-2 px-4 rounded-xl text-xs font-semibold border border-warm-border bg-cream-50 hover:bg-cream-100 text-charcoal-800 transition shrink-0 self-start sm:self-center"
              >
                {dict.checklist.shareCta}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Faixa unificada de resumo */}
      <section className="bg-white rounded-2xl border border-warm-border shadow-subtle grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-warm-border/80">
        <div className="p-5 sm:p-6">
          <span className="text-xs font-medium text-charcoal-500 block mb-1.5">
            {dict.summary.receivedLabel}
          </span>
          <strong className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 tabular-nums block">
            {formatCurrency(metrics.netAmount)}
          </strong>
          <p className="text-xs text-charcoal-500 mt-1.5">
            {metrics.totalOrders === 0
              ? dict.summary.receivedHintEmpty
              : metrics.platformFee > 0
              ? t(dict.summary.receivedHintBreakdown, {
                  gross: formatCurrency(metrics.totalGross),
                  fee: formatCurrency(metrics.platformFee),
                })
              : dict.summary.receivedHintNet}
          </p>
        </div>

        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-500 block mb-1.5">
              {dict.summary.giftsLabel}
            </span>
            <strong className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 tabular-nums block">
              {metrics.totalOrders}
            </strong>
          </div>
          <Link
            href="/painel/presentes"
            className="text-xs font-medium text-charcoal-800 hover:text-terracotta underline underline-offset-2 mt-2 inline-block w-fit"
          >
            {dict.summary.giftsLink}
          </Link>
        </div>

        {event.eventType === 'FRALDA' ? (
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-charcoal-500 block mb-1.5">
                {dict.summary.messagesLabel}
              </span>
              <strong className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 tabular-nums block">
                {metrics.totalMessages ?? 0}
              </strong>
            </div>
            <Link
              href="/painel/recados"
              className="text-xs font-medium text-charcoal-800 hover:text-terracotta underline underline-offset-2 mt-2 inline-block w-fit"
            >
              {dict.summary.messagesLink}
            </Link>
          </div>
        ) : (
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-charcoal-500 block mb-1.5">
                {dict.summary.pollLabel}
              </span>
              <strong className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 tabular-nums block">
                {metrics.totalVotes}
              </strong>
            </div>
            <p className="text-xs text-charcoal-500 mt-2">{leadingTeam}</p>
          </div>
        )}
      </section>

      {/* Bolão & Revelação segura em 2 etapas */}
      {event.eventType !== 'FRALDA' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 border border-warm-border shadow-subtle space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900">
                {dict.poll.title}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">{dict.poll.subtitle}</p>
            </div>

            {revealed && (
              <span
                className={`py-1.5 px-3 rounded-full text-xs font-medium border self-start sm:self-auto shrink-0 ${
                  revealed === 'BOY'
                    ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                    : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                }`}
              >
                {t(dict.poll.revealedBadge, {
                  result:
                    revealed === 'BOY'
                      ? event.boyName
                        ? `${gendersDict.boy} (${event.boyName})`
                        : gendersDict.boy
                      : event.girlName
                      ? `${gendersDict.girl} (${event.girlName})`
                      : gendersDict.girl,
                })}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs sm:text-sm gap-2">
              <span className="text-dusty-blue font-medium">
                {t(dict.poll.boyVotesLabel, {
                  votes: metrics.boyVotes,
                  percent: metrics.boyPercent,
                })}
              </span>
              <span className="text-dusty-rose font-medium text-right">
                {t(dict.poll.girlVotesLabel, {
                  votes: metrics.girlVotes,
                  percent: metrics.girlPercent,
                })}
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

          <div className="pt-1 space-y-3">
            <p className="text-xs font-medium text-charcoal-600">{dict.poll.revealPrompt}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPendingReveal('BOY')}
                disabled={loadingGender || revealed === 'BOY'}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition border flex flex-col items-center justify-center ${
                  revealed === 'BOY'
                    ? 'bg-dusty-blue text-white border-dusty-blue shadow-subtle'
                    : 'bg-dusty-blue-light/70 text-dusty-blue border-dusty-blue/30 hover:bg-dusty-blue/15'
                }`}
              >
                <span>{dict.poll.revealBoyBtn}</span>
                {event.boyName && (
                  <span className="text-xs opacity-90 font-serif italic">({event.boyName})</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPendingReveal('GIRL')}
                disabled={loadingGender || revealed === 'GIRL'}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition border flex flex-col items-center justify-center ${
                  revealed === 'GIRL'
                    ? 'bg-dusty-rose text-white border-dusty-rose shadow-subtle'
                    : 'bg-dusty-rose-light/70 text-dusty-rose border-dusty-rose/30 hover:bg-dusty-rose/15'
                }`}
              >
                <span>{dict.poll.revealGirlBtn}</span>
                {event.girlName && (
                  <span className="text-xs opacity-90 font-serif italic">({event.girlName})</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPendingReveal('HIDE')}
                disabled={loadingGender || !revealed}
                className="py-2.5 px-4 rounded-xl text-xs sm:text-sm text-charcoal-600 bg-cream-50 hover:bg-cream-100 border border-warm-border transition disabled:opacity-45"
              >
                {dict.poll.keepSecretBtn}
              </button>
            </div>

            {pendingReveal && (
              <div className="p-4 rounded-xl bg-cream-50 border border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-charcoal-800">
                  {pendingReveal === 'BOY'
                    ? dict.poll.confirmRevealBoy
                    : pendingReveal === 'GIRL'
                    ? dict.poll.confirmRevealGirl
                    : dict.poll.confirmHideReveal}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={loadingGender}
                    onClick={handleConfirmReveal}
                    className="py-2 px-4 rounded-lg text-xs font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition disabled:opacity-50"
                  >
                    {dict.poll.confirmActionBtn}
                  </button>
                  <button
                    type="button"
                    disabled={loadingGender}
                    onClick={() => setPendingReveal(null)}
                    className="py-2 px-3 rounded-lg text-xs font-medium bg-white border border-warm-border text-charcoal-600 hover:bg-cream-100 transition"
                  >
                    {dict.poll.cancelBtn}
                  </button>
                </div>
              </div>
            )}
          </div>

          {pollVotes.length > 0 && (
            <div className="pt-4 border-t border-warm-border/70">
              <button
                type="button"
                onClick={() => setShowPollVoters((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-charcoal-700 hover:text-charcoal-900 transition py-1"
              >
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-charcoal-500" />
                  <span>
                    {t(dict.poll.votersToggle, { count: pollVotes.length })}
                    {revealed ? t(dict.poll.votersWinnersSuffix, { count: winnersCount }) : ''}
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
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        pollFilter === 'ALL'
                          ? 'bg-charcoal-900 text-white border-charcoal-900'
                          : 'bg-cream-50 text-charcoal-600 border-warm-border hover:bg-cream-100'
                      }`}
                    >
                      {t(dict.poll.filterAll, { count: pollVotes.length })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPollFilter('BOY')}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        pollFilter === 'BOY'
                          ? 'bg-dusty-blue text-white border-dusty-blue'
                          : 'bg-dusty-blue-light/60 text-dusty-blue border-dusty-blue/30'
                      }`}
                    >
                      {t(dict.poll.filterBoy, {
                        count: pollVotes.filter((v) => v.guess === 'BOY').length,
                      })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPollFilter('GIRL')}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        pollFilter === 'GIRL'
                          ? 'bg-dusty-rose text-white border-dusty-rose'
                          : 'bg-dusty-rose-light/60 text-dusty-rose border-dusty-rose/30'
                      }`}
                    >
                      {t(dict.poll.filterGirl, {
                        count: pollVotes.filter((v) => v.guess === 'GIRL').length,
                      })}
                    </button>
                    {(revealed === 'BOY' || revealed === 'GIRL') && (
                      <button
                        type="button"
                        onClick={() => setPollFilter('WINNERS')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                          pollFilter === 'WINNERS'
                            ? 'bg-terracotta text-white border-terracotta'
                            : 'bg-cream-100 text-terracotta border-terracotta/40 hover:bg-cream-200'
                        }`}
                      >
                        {t(dict.poll.filterWinners, { count: winnersCount })}
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-warm-border/60 rounded-xl border border-warm-border/80 px-3.5">
                    {filteredPollVotes.length === 0 ? (
                      <p className="py-4 text-center text-xs text-charcoal-500">
                        {dict.poll.votersEmpty}
                      </p>
                    ) : (
                      filteredPollVotes.map((vote) => {
                        const isWinner = Boolean(revealed && vote.guess === revealed);
                        return (
                          <div
                            key={vote.id}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-medium text-charcoal-900 truncate">
                                {vote.voterName}
                              </span>
                              {isWinner && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium shrink-0">
                                  {dict.poll.winnerTag}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full border ${
                                  vote.guess === 'BOY'
                                    ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                                    : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                                }`}
                              >
                                {vote.guess === 'BOY' ? gendersDict.boy : gendersDict.girl}
                              </span>
                              <span className="text-xs text-charcoal-400 tabular-nums">
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
        </section>
      )}

      {/* Sorteio entre convidados (sempre visível para deixar claro e permitir ativar em 1 clique) */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 border border-warm-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Ticket className="w-4 h-4 text-terracotta shrink-0" aria-hidden="true" />
              <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900">
                {isRaffleEnabled && currentRafflePrize.trim()
                  ? t(dict.raffle.titleWithPrize, { prize: currentRafflePrize.trim() })
                  : dict.raffle.titleDefault}
              </h2>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                  !isRaffleEnabled
                    ? 'bg-cream-100 text-charcoal-600 border-warm-border'
                    : raffleWinner
                    ? 'bg-charcoal-900 text-white border-charcoal-900'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {!isRaffleEnabled
                  ? dict.raffle.optionalBadge
                  : raffleWinner
                  ? dict.raffle.drawnBadge
                  : dict.raffle.activeBadge}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
              {!isRaffleEnabled
                ? dict.raffle.inactiveDescription
                : raffleWinner
                ? dict.raffle.drawnSubtitle
                : t(dict.raffle.participantsSubtitle, {
                    count: metrics.raffleParticipantsCount ?? 0,
                  })}
            </p>
          </div>

          {isRaffleEnabled && !raffleWinner && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/painel/configuracoes?tab=extras"
                className="text-xs font-medium text-charcoal-600 hover:text-terracotta underline underline-offset-2"
              >
                {dict.raffle.editSettingsLink}
              </Link>

              {!confirmDraw ? (
                <button
                  type="button"
                  disabled={!metrics.raffleParticipantsCount}
                  onClick={() => setConfirmDraw(true)}
                  className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-subtle"
                >
                  {dict.raffle.drawButton}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={drawingRaffle}
                    onClick={handleDrawRaffle}
                    className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-terracotta text-white hover:opacity-90 disabled:opacity-50 transition shadow-subtle"
                  >
                    {drawingRaffle ? dict.raffle.drawingButton : dict.raffle.confirmDrawButton}
                  </button>
                  <button
                    type="button"
                    disabled={drawingRaffle}
                    onClick={() => setConfirmDraw(false)}
                    className="py-2.5 px-3 rounded-xl text-xs sm:text-sm text-charcoal-600 bg-cream-100 hover:bg-cream-200 border border-warm-border transition"
                  >
                    {dict.raffle.cancelButton}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!isRaffleEnabled && (
          <form
            onSubmit={handleQuickEnableRaffle}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1"
          >
            <input
              type="text"
              value={currentRafflePrize}
              onChange={(e) => setCurrentRafflePrize(e.target.value)}
              placeholder={dict.raffle.prizeInputPlaceholder}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-warm-border bg-cream-50/40 text-xs sm:text-sm text-charcoal-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
            <button
              type="submit"
              disabled={enablingRaffle}
              className="py-2.5 px-5 rounded-xl text-xs sm:text-sm font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 disabled:opacity-50 transition shadow-subtle shrink-0"
            >
              {enablingRaffle ? dict.raffle.enablingButton : dict.raffle.enableNowButton}
            </button>
          </form>
        )}

        {raffleError && <p className="text-xs text-rose-600">{raffleError}</p>}

        {isRaffleEnabled && raffleWinner && (
          <div className="p-4 rounded-xl bg-cream-50 border border-warm-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-charcoal-500 block">
                  {dict.raffle.winnerLabel}
                </span>
                <strong className="font-serif text-base font-medium text-charcoal-900">
                  {raffleWinner.name}
                </strong>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-semibold tabular-nums">
              #{String(raffleWinner.ticketNumber).padStart(3, '0')}
            </span>
          </div>
        )}
      </section>

      {/* Lista de presentes recebidos */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 border border-warm-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900">
              {dict.orders.title}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cream-100 border border-warm-border text-charcoal-600 tabular-nums">
              {orders.length}
            </span>
          </div>

          {orders.length > 0 && (
            <Link
              href="/painel/recados"
              className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 underline underline-offset-2"
            >
              {dict.orders.viewMessagesLink}
            </Link>
          )}
        </div>

        {orders.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder={dict.orders.searchPlaceholder}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-warm-border bg-cream-50/40 text-xs sm:text-sm text-charcoal-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>
        )}

        {orders.length === 0 ? (
          <div className="py-8 px-4 text-center bg-cream-50/40 rounded-xl border border-dashed border-warm-border">
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
              {dict.orders.empty}
            </p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="py-8 px-4 text-center bg-cream-50/40 rounded-xl border border-dashed border-warm-border">
            <p className="text-xs sm:text-sm text-charcoal-500">
              {t(dict.orders.emptySearch, { query: orderSearch })}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-warm-border/70">
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
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-medium text-charcoal-900">
                          {order.payerName}
                        </strong>
                        <span className="text-xs text-charcoal-500">· {localizedGiftTitle}</span>
                        {order.pollGuess && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border ${
                              order.pollGuess === 'BOY'
                                ? 'bg-dusty-blue-light border-dusty-blue/30 text-dusty-blue'
                                : 'bg-dusty-rose-light border-dusty-rose/30 text-dusty-rose'
                            }`}
                          >
                            {order.pollGuess === 'BOY' ? gendersDict.boy : gendersDict.girl}
                          </span>
                        )}
                        {order.raffleTicketNumber !== null &&
                          order.raffleTicketNumber !== undefined && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100 border border-warm-border text-charcoal-700 tabular-nums">
                              #{String(order.raffleTicketNumber).padStart(3, '0')}
                            </span>
                          )}
                      </div>

                      {order.payerMessage && (
                        <p className="text-xs text-charcoal-600 italic line-clamp-2">
                          &ldquo;{order.payerMessage}&rdquo;
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-400">
                        <span className="tabular-nums">
                          {formatDate(order.createdAt, {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ·{' '}
                          {order.paymentMethod === 'CREDIT_CARD'
                            ? methodsDict.CARD_SHORT
                            : methodsDict.PIX}
                        </span>
                        {thankYouUrl && (
                          <a
                            href={thankYouUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{dict.orders.thankWhatsApp}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-sm font-semibold text-charcoal-900 tabular-nums block">
                        {formatCurrency(order.netAmount)}
                      </span>
                      <span className="text-[11px] text-charcoal-400 block">
                        {Math.abs(order.amount - order.netAmount) > 0.01
                          ? t(dict.orders.paidGross, { amount: formatCurrency(order.amount) })
                          : dict.orders.netHint}
                      </span>
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
                    ? dict.orders.showLess
                    : t(dict.orders.showAll, { count: filteredOrders.length })}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
