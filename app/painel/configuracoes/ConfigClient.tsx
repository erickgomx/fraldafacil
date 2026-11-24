'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Unlink,
  CreditCard,
  QrCode,
  ArrowRight,
  Loader2,
  ImagePlus,
  Trash2,
  Upload,
  HelpCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/LanguageProvider';
import { painelDict } from '@/lib/i18n/dictionaries/painel';
import { commonDict } from '@/lib/i18n/dictionaries/common';

async function compressCoverImage(file: File, readErrorMsg: string): Promise<File> {
  const MAX_DIMENSION = 1400;
  const QUALITY = 0.82;

  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(readErrorMsg));
      el.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width || 1, img.height || 1));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    const toBlob = (mime: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), mime, QUALITY));

    let blob = await toBlob('image/webp');
    let ext = 'webp';
    let outMime = 'image/webp';

    if (!blob || blob.type !== 'image/webp') {
      blob = await toBlob('image/jpeg');
      ext = 'jpg';
      outMime = 'image/jpeg';
    }

    if (!blob) return file;

    if (file.size <= 3 * 1024 * 1024 && blob.size > file.size && scale === 1) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'capa';
    return new File([blob], `${baseName}.${ext}`, { type: outMime });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

interface ConfigClientProps {
  event: {
    id: string;
    eventType?: string;
    parentsNames: string;
    babyName: string | null;
    boyName?: string | null;
    girlName?: string | null;
    eventDate: string;
    coverImageUrl?: string | null;
    storyMessage: string | null;
    pixKey: string | null;
    mpConnected?: boolean;
    mpUserId?: string | null;
    feePayer?: 'GUEST' | 'PARENTS';
    raffleEnabled?: boolean;
    rafflePrize?: string | null;
    raffleDrawnAt?: string | null;
  };
}

export default function ConfigClient({ event }: ConfigClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const dict = painelDict[locale].config;
  const eventTypesShort = commonDict[locale].eventTypes.short;
  const orJoiner = locale === 'en' ? 'or' : locale === 'es' ? 'o' : 'ou';

  const initialEventType = (
    event.eventType === 'FRALDA' || event.eventType === 'AMBOS' ? event.eventType : 'REVELACAO'
  ) as 'REVELACAO' | 'FRALDA' | 'AMBOS';
  const [eventType, setEventType] = useState<'REVELACAO' | 'FRALDA' | 'AMBOS'>(initialEventType);
  const [parentsNames, setParentsNames] = useState(event.parentsNames);
  const [noNameYet, setNoNameYet] = useState(!event.babyName && !event.boyName && !event.girlName);
  const [babyName, setBabyName] = useState(event.babyName || '');
  const [boyName, setBoyName] = useState(event.boyName || '');
  const [girlName, setGirlName] = useState(event.girlName || '');
  const [eventDate, setEventDate] = useState(event.eventDate.split('T')[0] || '');
  const [storyMessage, setStoryMessage] = useState(event.storyMessage || '');
  const [pixKey, setPixKey] = useState(event.pixKey || '');
  const [feePayer, setFeePayer] = useState<'GUEST' | 'PARENTS'>(event.feePayer || 'GUEST');
  const [mpConnected, setMpConnected] = useState(Boolean(event.mpConnected));
  const [raffleEnabled, setRaffleEnabled] = useState(Boolean(event.raffleEnabled));
  const [rafflePrize, setRafflePrize] = useState(event.rafflePrize || '');
  const isRaffleLocked = Boolean(event.raffleDrawnAt);

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(event.coverImageUrl || null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [coverNotice, setCoverNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [oauthNotice, setOauthNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get('oauth_success') === 'true') {
      setOauthNotice({
        type: 'success',
        message: dict.oauthMessages.success,
      });
      setMpConnected(true);
    } else if (searchParams.get('error')) {
      const err = searchParams.get('error') || '';
      const message =
        dict.oauthMessages[err as keyof typeof dict.oauthMessages] ||
        dict.oauthMessages.fallback;
      setOauthNotice({
        type: 'error',
        message,
      });
    }
  }, [searchParams, dict]);

  const currentPayload = useMemo(
    () => ({
      id: event.id,
      eventType,
      parentsNames,
      babyName: noNameYet
        ? null
        : babyName.trim() ||
          (boyName && girlName ? `${boyName.trim()} ${orJoiner} ${girlName.trim()}` : null),
      boyName: noNameYet ? null : boyName.trim() || null,
      girlName: noNameYet ? null : girlName.trim() || null,
      eventDate: eventDate || undefined,
      storyMessage,
      pixKey,
      feePayer,
      ...(!isRaffleLocked && {
        raffleEnabled,
        rafflePrize: raffleEnabled ? rafflePrize : null,
      }),
    }),
    [
      event.id,
      eventType,
      parentsNames,
      noNameYet,
      babyName,
      boyName,
      girlName,
      orJoiner,
      eventDate,
      storyMessage,
      pixKey,
      feePayer,
      isRaffleLocked,
      raffleEnabled,
      rafflePrize,
    ]
  );

  const serializedPayload = useMemo(() => JSON.stringify(currentPayload), [currentPayload]);
  const lastSavedPayloadRef = useRef<string>(serializedPayload);
  const hasUnsavedChanges = serializedPayload !== lastSavedPayloadRef.current;

  const saveChanges = useCallback(
    async (payloadToSave = currentPayload, serialized = serializedPayload) => {
      if (!payloadToSave.parentsNames || !payloadToSave.parentsNames.trim()) {
        setError(dict.parentsRequiredError);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: serialized,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || dict.saveErrorFallback);
        }

        lastSavedPayloadRef.current = serialized;
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(dict.genericError);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      currentPayload,
      serializedPayload,
      router,
      dict.parentsRequiredError,
      dict.saveErrorFallback,
      dict.genericError,
    ]
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (!currentPayload.parentsNames || !currentPayload.parentsNames.trim()) return;

    const timer = setTimeout(() => {
      void saveChanges(currentPayload, serializedPayload);
    }, 700);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, currentPayload, serializedPayload, saveChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveChanges(currentPayload, serializedPayload);
  };

  const handleDisconnectMP = async () => {
    if (!confirm(dict.confirmDisconnectMP)) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch('/api/auth/mercadopago/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DISCONNECT', eventId: event.id }),
      });
      if (res.ok) {
        setMpConnected(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleCoverFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setCoverNotice(null);
    setUploadingCover(true);
    try {
      const processed = await compressCoverImage(file, dict.imageReadError);
      if (processed.size > 3 * 1024 * 1024) {
        throw new Error(dict.coverMaxSizeError);
      }

      const formData = new FormData();
      formData.append('eventId', event.id);
      formData.append('file', processed);

      const res = await fetch('/api/events/cover', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || dict.coverUploadErrorFallback);
      }

      setCoverImageUrl(data.coverImageUrl || null);
      setCoverNotice({
        type: 'success',
        message: dict.coverUploadSuccess,
      });
      router.refresh();
    } catch (err: unknown) {
      setCoverNotice({
        type: 'error',
        message: err instanceof Error ? err.message : dict.coverUploadGenericError,
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!coverImageUrl) return;
    if (!confirm(dict.confirmRemoveCover)) return;

    setRemovingCover(true);
    setCoverNotice(null);
    try {
      const res = await fetch(`/api/events/cover?eventId=${encodeURIComponent(event.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || dict.coverRemoveErrorFallback);
      }

      setCoverImageUrl(null);
      setCoverNotice({
        type: 'success',
        message: dict.coverRemovedSuccess,
      });
      router.refresh();
    } catch (err: unknown) {
      setCoverNotice({
        type: 'error',
        message: err instanceof Error ? err.message : dict.coverRemoveGenericError,
      });
    } finally {
      setRemovingCover(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError(dict.deleteAccountPasswordRequired);
      return;
    }

    setDeletingAccount(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || dict.deleteAccountErrorFallback);
      }

      window.location.href = '/';
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : dict.deleteAccountGenericError);
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="sticky top-0 z-20 bg-cream-50/95 backdrop-blur-sm py-3 -mx-2 px-2 border-b border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-charcoal-900 font-medium">
            {dict.pageTitle}
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5 font-sans">
            {dict.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {loading ? (
            <span className="text-[11px] font-mono text-charcoal-500 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {dict.savingStatus}
            </span>
          ) : success ? (
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {dict.savedStatus}
            </span>
          ) : hasUnsavedChanges ? (
            <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {dict.pendingChangesStatus}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-charcoal-400">
              {dict.allSavedStatus}
            </span>
          )}

          <button
            type="button"
            onClick={() => void saveChanges()}
            disabled={loading || !hasUnsavedChanges}
            className="py-2 px-4 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-subtle transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? dict.savingStatus : dict.saveButton}</span>
          </button>
        </div>
      </div>

      {oauthNotice && (
        <div
          className={`p-4 rounded-xl text-xs font-sans border flex items-start gap-3 shadow-subtle ${
            oauthNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : oauthNotice.type === 'error'
              ? 'bg-dusty-rose-light text-dusty-rose border-dusty-rose/30'
              : 'bg-cream-100 text-charcoal-700 border-warm-border'
          }`}
        >
          {oauthNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-medium block mb-0.5">
              {oauthNotice.type === 'success' ? dict.oauthSuccessTitle : dict.oauthWarningTitle}
            </span>
            <span className="leading-relaxed">{oauthNotice.message}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-sans border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{dict.savedToast}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-dusty-rose-light text-dusty-rose text-xs font-sans border border-dusty-rose/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* BLOCO 1: MERCADO PAGO */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cream-100 text-charcoal-600 border border-warm-border">
                {dict.mpSection.badge}
              </span>
              {mpConnected ? (
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {dict.mpSection.connectedBadge}
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                  {dict.mpSection.pendingBadge}
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg text-charcoal-900 font-medium">
              {dict.mpSection.title}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1 font-sans leading-relaxed">
              {dict.mpSection.subtitle}
            </p>
          </div>
        </div>

        {mpConnected ? (
          <div className="space-y-3">
            <div className="bg-cream-50 p-4 rounded-xl border border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-charcoal-900">
                      {dict.mpSection.readyTitle}
                    </span>
                    {event.mpUserId && (
                      <span className="text-[10px] font-mono text-charcoal-400 bg-white px-2 py-0.5 rounded border border-warm-border">
                        ID: {event.mpUserId}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-charcoal-500 block mt-1 leading-relaxed">
                    {dict.mpSection.readyDescription}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDisconnectMP}
                disabled={disconnecting}
                className="py-1.5 px-3 rounded-lg text-xs font-medium text-dusty-rose bg-white hover:bg-dusty-rose-light border border-dusty-rose/30 transition flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>
                  {disconnecting ? dict.mpSection.disconnecting : dict.mpSection.disconnectButton}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-warm-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-charcoal-700 shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-charcoal-900 block">
                    {dict.mpSection.pixCardTitle}
                  </span>
                  <span className="text-[10px] text-charcoal-500 block">
                    {dict.mpSection.pixCardSubtitle}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-warm-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-charcoal-700 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-charcoal-900 block">
                    {dict.mpSection.cardCardTitle}
                  </span>
                  <span className="text-[10px] text-charcoal-500 block">
                    {dict.mpSection.cardCardSubtitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {dict.mpSection.steps.map((step, idx) => (
                <div key={step.title} className="p-3 rounded-xl bg-cream-50/80 border border-warm-border">
                  <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white text-[10px] font-mono flex items-center justify-center mb-1.5">
                    {idx + 1}
                  </span>
                  <strong className="block text-charcoal-900 mb-0.5">{step.title}</strong>
                  <p className="text-[11px] text-charcoal-500 font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={`/api/auth/mercadopago/connect?eventId=${event.id}`}
                className="py-3 px-5 rounded-xl text-xs font-semibold bg-[#009EE3] hover:bg-[#0082ba] text-white shadow-subtle transition flex items-center justify-center gap-2 group"
              >
                <span>{dict.mpSection.connectButton}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-cream-50/90 border border-warm-border/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-900">
                <HelpCircle className="w-3.5 h-3.5 text-charcoal-600 shrink-0" />
                <span>{dict.mpSection.helpTitle}</span>
              </div>
              <ul className="space-y-1 text-[11px] text-charcoal-600 font-sans leading-relaxed list-disc pl-4">
                <li>{dict.mpSection.helpTip1}</li>
                <li>{dict.mpSection.helpTip2}</li>
              </ul>
              <a
                href="mailto:suporte@fralda.online?subject=Ajuda%20para%20conectar%20Mercado%20Pago%20-%20Fralda%20Online"
                className="inline-block text-[11px] font-medium text-[#007eb5] hover:underline pt-0.5"
              >
                {dict.mpSection.helpSupportLink}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* BLOCO 2: TAXAS */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
            {dict.feesSection.eyebrow}
          </span>
          <h2 className="font-serif text-lg text-charcoal-900 font-medium">
            {dict.feesSection.title}
          </h2>
          <p className="text-xs text-charcoal-500 mt-1 font-sans">
            {dict.feesSection.subtitleBefore} <strong>{dict.feesSection.subtitleBold}</strong>{' '}
            {dict.feesSection.subtitleAfter}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setFeePayer('GUEST')}
            className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
              feePayer === 'GUEST'
                ? 'border-charcoal-900 bg-cream-100/70 shadow-subtle'
                : 'border-warm-border bg-white hover:bg-stone-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-charcoal-900">
                  {dict.feesSection.guestTitle}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                  {dict.feesSection.recommendedBadge}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed font-sans">
                {dict.feesSection.guestBodyBefore}{' '}
                <strong>{dict.feesSection.guestBodyBold}</strong>{' '}
                {dict.feesSection.guestBodyAfter}
              </p>
            </div>
            <span className="mt-3 text-[10px] font-mono text-charcoal-500 block">
              {dict.feesSection.guestExample}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFeePayer('PARENTS')}
            className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
              feePayer === 'PARENTS'
                ? 'border-charcoal-900 bg-cream-100/70 shadow-subtle'
                : 'border-warm-border bg-white hover:bg-stone-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-charcoal-900">
                  {dict.feesSection.parentsTitle}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed font-sans">
                {dict.feesSection.parentsBody}
              </p>
            </div>
            <span className="mt-3 text-[10px] font-mono text-charcoal-500 block">
              {dict.feesSection.parentsExample}
            </span>
          </button>
        </div>
      </div>

      {/* BLOCO 2B: SORTEIO */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
              {dict.raffleSection.eyebrow}
            </span>
            <h2 className="font-serif text-lg text-charcoal-900 font-medium">
              {dict.raffleSection.title}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1 font-sans leading-relaxed">
              {dict.raffleSection.bodyBefore}{' '}
              <strong>{dict.raffleSection.bodyBold}</strong>
              {dict.raffleSection.bodyAfter}
            </p>
          </div>

          <button
            type="button"
            disabled={isRaffleLocked}
            onClick={() => setRaffleEnabled((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              isRaffleLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            } ${raffleEnabled ? 'bg-charcoal-900' : 'bg-stone-200'}`}
            aria-label={dict.raffleSection.toggleAria}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                raffleEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {raffleEnabled && (
          <div className="pt-2 border-t border-warm-border/60 space-y-2">
            <label className="block text-[11px] font-mono uppercase text-charcoal-500">
              {dict.raffleSection.prizeLabel}
            </label>
            <input
              type="text"
              disabled={isRaffleLocked}
              value={rafflePrize}
              onChange={(e) => setRafflePrize(e.target.value)}
              placeholder={dict.raffleSection.prizePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900 disabled:opacity-60"
            />
            {isRaffleLocked && (
              <p className="text-[11px] text-amber-700 font-sans">
                {dict.raffleSection.lockedNotice}
              </p>
            )}
          </div>
        )}
      </div>

      {/* BLOCO 2C: FOTO DE CAPA */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
              {dict.coverSection.eyebrow}
            </span>
            <h2 className="font-serif text-lg text-charcoal-900 font-medium">
              {dict.coverSection.title}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1 font-sans leading-relaxed">
              {dict.coverSection.subtitle}
            </p>
          </div>
        </div>

        {coverNotice && (
          <div
            className={`p-3 rounded-lg text-xs font-sans border flex items-center gap-2 ${
              coverNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-dusty-rose-light text-dusty-rose border-dusty-rose/30'
            }`}
          >
            {coverNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{coverNotice.message}</span>
          </div>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverFileSelected}
          className="hidden"
        />

        {coverImageUrl ? (
          <div className="space-y-3">
            <div className="relative w-full h-52 rounded-xl overflow-hidden border border-warm-border bg-cream-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt={t(dict.coverSection.imageAlt, { parents: parentsNames })}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={uploadingCover || removingCover}
                onClick={() => coverInputRef.current?.click()}
                className="py-2 px-4 rounded-xl text-xs font-medium bg-charcoal-900 text-white hover:bg-charcoal-800 transition inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                {uploadingCover ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{dict.coverSection.uploading}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{dict.coverSection.changePhoto}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={uploadingCover || removingCover}
                onClick={handleRemoveCover}
                className="py-2 px-3.5 rounded-xl text-xs font-medium text-dusty-rose bg-white hover:bg-dusty-rose-light border border-dusty-rose/30 transition inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {removingCover ? dict.coverSection.removing : dict.coverSection.removePhoto}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploadingCover}
            onClick={() => coverInputRef.current?.click()}
            className="w-full py-7 px-4 rounded-xl border-2 border-dashed border-warm-border bg-cream-50/50 hover:bg-cream-100/70 transition flex flex-col items-center justify-center text-center gap-2 disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-warm-border text-charcoal-700 flex items-center justify-center shadow-subtle">
              {uploadingCover ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImagePlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-charcoal-900 block">
                {uploadingCover
                  ? dict.coverSection.emptyUploading
                  : dict.coverSection.emptyPrompt}
              </span>
              <span className="text-[11px] text-charcoal-500 font-sans block mt-0.5">
                {dict.coverSection.emptyHint}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* BLOCO 3: INFORMAÇÕES DO EVENTO */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1.5">
              {dict.eventForm.eventTypeLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'REVELACAO', label: eventTypesShort.REVELACAO },
                { id: 'FRALDA', label: eventTypesShort.FRALDA },
                { id: 'AMBOS', label: eventTypesShort.AMBOS },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setEventType(type.id as 'REVELACAO' | 'FRALDA' | 'AMBOS')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition ${
                    eventType === type.id
                      ? 'border-charcoal-900 bg-charcoal-900 text-white shadow-subtle'
                      : 'border-warm-border bg-white text-charcoal-600 hover:bg-stone-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              {dict.eventForm.parentsNamesLabel}
            </label>
            <input
              type="text"
              required
              value={parentsNames}
              onChange={(e) => setParentsNames(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>

          <div className="p-4 bg-cream-50/70 rounded-xl border border-warm-border space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
                {dict.eventForm.identityEyebrow}
              </span>
              <span className="text-xs font-semibold text-charcoal-900 block">
                {dict.eventForm.identityTitle}
              </span>
              <p className="text-[11px] text-charcoal-500 font-sans mt-0.5">
                {dict.eventForm.identityHint}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-warm-border">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={noNameYet}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setNoNameYet(checked);
                    if (checked) {
                      setBabyName('');
                      setBoyName('');
                      setGirlName('');
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-warm-border text-charcoal-900 focus:ring-charcoal-900 cursor-pointer accent-charcoal-900"
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-charcoal-900 block">
                    {dict.eventForm.noNameTitle}
                  </span>
                  <span className="text-[11px] text-charcoal-500 block mt-0.5 font-sans leading-relaxed">
                    {dict.eventForm.noNameExamplePrefix}{' '}
                    <em>
                      {dict.eventForm.noNameExampleShower}{' '}
                      {parentsNames || dict.eventForm.noNameDefaultParents}
                    </em>
                    ).
                  </span>
                </div>
              </label>
            </div>

            {!noNameYet && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-dusty-blue mb-1 font-semibold">
                      {dict.eventForm.boyLabel}
                    </label>
                    <input
                      type="text"
                      value={boyName}
                      onChange={(e) => setBoyName(e.target.value)}
                      placeholder={dict.eventForm.boyPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-dusty-blue/30 bg-white text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-dusty-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-dusty-rose mb-1 font-semibold">
                      {dict.eventForm.girlLabel}
                    </label>
                    <input
                      type="text"
                      value={girlName}
                      onChange={(e) => setGirlName(e.target.value)}
                      placeholder={dict.eventForm.girlPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-dusty-rose/30 bg-white text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-dusty-rose"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                    {dict.eventForm.generalNameLabel}
                  </label>
                  <input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder={dict.eventForm.generalNamePlaceholder}
                    className="w-full px-3.5 py-2 rounded-lg border border-warm-border bg-white text-xs text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              {dict.eventForm.eventDateLabel}
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              {dict.eventForm.welcomeMessageLabel}
            </label>
            <textarea
              rows={3}
              value={storyMessage}
              onChange={(e) => setStoryMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              {dict.eventForm.pixKeyLabel}
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder={dict.eventForm.pixKeyPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs font-mono text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>

          <div className="pt-4 border-t border-warm-border">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-subtle transition flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {loading ? dict.eventForm.savingButton : dict.eventForm.saveChangesButton}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* BLOCO 4: LGPD CONTA */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
              {dict.deleteSection.eyebrow}
            </span>
            <h2 className="font-serif text-lg text-charcoal-900 font-medium">
              {dict.deleteSection.title}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1 font-sans leading-relaxed">
              {dict.deleteSection.description}
            </p>
          </div>

          {!showDeleteAccount && (
            <button
              type="button"
              onClick={() => {
                setShowDeleteAccount(true);
                setDeleteError('');
              }}
              className="py-2 px-3.5 rounded-xl text-xs font-medium text-dusty-rose bg-white hover:bg-dusty-rose-light border border-dusty-rose/30 transition shrink-0 self-start sm:self-center"
            >
              {dict.deleteSection.openButton}
            </button>
          )}
        </div>

        {showDeleteAccount && (
          <form
            onSubmit={handleDeleteAccount}
            className="p-4 rounded-xl bg-dusty-rose-light/50 border border-dusty-rose/30 space-y-3"
          >
            <p className="text-xs text-charcoal-800 font-sans leading-relaxed">
              {dict.deleteSection.confirmPrompt}
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-white border border-dusty-rose/40 text-xs text-dusty-rose font-sans">
                {deleteError}
              </div>
            )}

            <input
              type="password"
              required
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={dict.deleteSection.passwordPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-dusty-rose"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={deletingAccount}
                className="py-2 px-4 rounded-lg text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white transition disabled:opacity-60"
              >
                {deletingAccount
                  ? dict.deleteSection.deletingButton
                  : dict.deleteSection.confirmDeleteButton}
              </button>
              <button
                type="button"
                disabled={deletingAccount}
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="py-2 px-3.5 rounded-lg text-xs text-charcoal-600 bg-white border border-warm-border hover:bg-cream-50 transition"
              >
                {dict.deleteSection.cancelButton}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
