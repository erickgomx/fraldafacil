'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, User, Link2, Calendar, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import BrandLoader from '@/components/BrandLoader';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/LanguageProvider';
import { authDict } from '@/lib/i18n/dictionaries/auth';
import { commonDict } from '@/lib/i18n/dictionaries/common';
import { isReservedSlug, sanitizeSlug, validateSlug } from '@/lib/validation';

function generateSuggestedSlug({
  parentsName,
  boyName,
  girlName,
  babyName,
  noNameYet,
  eventType,
}: {
  parentsName: string;
  boyName: string;
  girlName: string;
  babyName: string;
  noNameYet: boolean;
  eventType: 'REVELACAO' | 'FRALDA' | 'AMBOS';
}): string {
  if (noNameYet) {
    const parents = sanitizeSlug(parentsName);
    return parents ? `cha-de-${parents}` : '';
  }

  const boy = sanitizeSlug(boyName);
  const girl = sanitizeSlug(girlName);
  const single = sanitizeSlug(babyName);

  if (eventType === 'REVELACAO' || eventType === 'AMBOS') {
    if (boy && girl) return `revelacao-${boy}-ou-${girl}`;
    if (boy) return `cha-do-${boy}`;
    if (girl) return `cha-da-${girl}`;
    if (single) return `cha-${single}`;
  } else {
    if (single) return `cha-do-${single}`;
    if (boy) return `cha-do-${boy}`;
    if (girl) return `cha-da-${girl}`;
  }

  const parents = sanitizeSlug(parentsName);
  return parents ? `cha-de-${parents}` : '';
}

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const dict = authDict[locale].register;
  const eventTypesShort = commonDict[locale].eventTypes.short;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [noNameYet, setNoNameYet] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [boyName, setBoyName] = useState('');
  const [girlName, setGirlName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [eventType, setEventType] = useState<'REVELACAO' | 'FRALDA' | 'AMBOS'>('REVELACAO');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slugManuallyEdited) {
      const suggested = generateSuggestedSlug({
        parentsName: name,
        boyName,
        girlName,
        babyName,
        noNameYet,
        eventType,
      });
      setSlug(suggested);
    }
  }, [name, boyName, girlName, babyName, noNameYet, eventType, slugManuallyEdited]);

  const handleSlugInputChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(sanitizeSlug(val));
  };

  const handleResetSlugToAuto = () => {
    setSlugManuallyEdited(false);
    const suggested = generateSuggestedSlug({
      parentsName: name,
      boyName,
      girlName,
      babyName,
      noNameYet,
      eventType,
    });
    setSlug(suggested);
  };

  const getLocalizedSlugError = (val: string): string | null => {
    const clean = val.trim().toLowerCase();
    if (clean.length < 3) return dict.slugMinLengthError;
    if (clean.length > 80) return dict.slugMaxLengthError;
    if (isReservedSlug(clean)) return dict.slugReservedError;
    return validateSlug(clean).valid ? null : dict.slugErrorFallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const slugError = getLocalizedSlugError(slug);
    if (slugError) {
      setError(slugError);
      return;
    }

    if (password.length < 6) {
      setError(dict.passwordMinError);
      return;
    }

    if (password !== confirmPassword) {
      setError(dict.passwordMismatchError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          slug,
          noNameYet,
          babyName: noNameYet ? null : babyName,
          boyName: noNameYet ? null : boyName,
          girlName: noNameYet ? null : girlName,
          eventType,
          eventDate: eventDate || undefined,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || dict.createErrorFallback);
      }

      router.push('/painel');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(dict.unexpectedError);
      }
    } finally {
      setLoading(false);
    }
  };

  const inlineSlugError = slug.length > 0 ? getLocalizedSlugError(slug) : null;

  return (
    <>
      <BrandLoader visible={loading} fullScreen minDurationMs={500} />
      <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6 pt-20 pb-12 sm:py-12 relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
          <LanguageSwitcher size="sm" />
          <ThemeToggle size="sm" />
        </div>
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 flex flex-col items-center">
            <Link href="/" className="inline-flex mb-3 group hover:opacity-95 transition">
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs text-charcoal-500 font-sans mt-1">
              {dict.pageSubtitle}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-subtle border border-warm-border">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-warm-border/60">
              <h1 className="font-serif text-xl font-normal text-charcoal-900">
                {dict.cardTitle}
              </h1>
              <span className="text-[11px] font-mono text-charcoal-500">
                {dict.freeBadge}
              </span>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose text-xs font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1.5">
                  {dict.eventTypeLabel}
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
                  {dict.parentsLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={dict.parentsPlaceholder}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
              </div>

              <div className="bg-cream-50 p-3.5 rounded-xl border border-warm-border">
                <label className="flex items-start gap-3 cursor-pointer select-none">
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
                      {dict.noNameCheckboxTitle}
                    </span>
                    <span className="text-[11px] text-charcoal-500 block mt-0.5 font-sans leading-relaxed">
                      {dict.noNameCheckboxHintBefore}{' '}
                      <em>
                        {dict.noNameCheckboxExamplePrefix} {name || dict.noNameCheckboxDefaultParents}
                      </em>
                      {dict.noNameCheckboxHintAfter}
                    </span>
                  </div>
                </label>
              </div>

              {!noNameYet && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-dusty-blue font-semibold mb-1">
                        {dict.boyNameLabel}
                      </label>
                      <input
                        type="text"
                        value={boyName}
                        onChange={(e) => setBoyName(e.target.value)}
                        placeholder={dict.boyNamePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-dusty-blue/30 bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-dusty-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-dusty-rose font-semibold mb-1">
                        {dict.girlNameLabel}
                      </label>
                      <input
                        type="text"
                        value={girlName}
                        onChange={(e) => setGirlName(e.target.value)}
                        placeholder={dict.girlNamePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-dusty-rose/30 bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-dusty-rose"
                      />
                    </div>
                  </div>

                  {eventType === 'FRALDA' && (
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                        {dict.singleBabyNameLabel}
                      </label>
                      <input
                        type="text"
                        value={babyName}
                        onChange={(e) => setBabyName(e.target.value)}
                        placeholder={dict.singleBabyNamePlaceholder}
                        className="w-full px-3.5 py-2 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500">
                    {dict.slugLabel}
                  </label>
                  {slugManuallyEdited && (
                    <button
                      type="button"
                      onClick={handleResetSlugToAuto}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 font-sans underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{dict.suggestSlugButton}</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => handleSlugInputChange(e.target.value)}
                    placeholder={dict.slugPlaceholder}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
                <p className="text-[11px] text-charcoal-500 mt-1.5 font-mono">
                  {dict.slugPreviewPrefix}{' '}
                  <span className="text-charcoal-900 font-medium">
                    fralda.online/{slug || dict.slugPreviewPlaceholder}
                  </span>
                </p>
                {inlineSlugError && (
                  <p className="text-[11px] text-dusty-rose mt-1 font-sans">
                    {inlineSlugError}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  {dict.eventDateLabel}
                </label>
                <div className="relative w-full min-w-0 overflow-hidden rounded-lg">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="block w-full min-w-0 max-w-full box-border appearance-none pl-9 pr-3.5 py-2.5 min-h-[42px] rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs text-left focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                    {dict.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={dict.emailPlaceholder}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                      {dict.passwordLabel}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={dict.passwordPlaceholder}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                      {dict.confirmPasswordLabel}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={dict.confirmPasswordPlaceholder}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                      />
                    </div>
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <p className="text-[11px] text-dusty-rose mt-1 font-sans">
                        {dict.passwordMismatchInline}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span>{dict.submitting}</span>
                  ) : (
                    <>
                      <span>{dict.submit}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-charcoal-500 font-sans text-center mt-3 leading-relaxed">
                  {dict.legalPrefix}{' '}
                  <Link href="/termos" target="_blank" className="underline hover:text-charcoal-900 transition-colors">
                    {dict.terms}
                  </Link>{' '}
                  {dict.legalAnd}{' '}
                  <Link href="/privacidade" target="_blank" className="underline hover:text-charcoal-900 transition-colors">
                    {dict.privacy}
                  </Link>
                  .
                </p>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-warm-border/60 text-center">
              <p className="text-xs text-charcoal-500 font-sans">
                {dict.alreadyHaveAccount}{' '}
                <Link href="/login" className="font-medium text-charcoal-900 underline underline-offset-2">
                  {dict.signInLink}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
