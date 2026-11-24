'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import BrandLoader from '@/components/BrandLoader';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/LanguageProvider';
import { authDict } from '@/lib/i18n/dictionaries/auth';

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const dict = authDict[locale].forgot;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || dict.requestErrorFallback);
      }

      setSubmitted(true);
      if (data.devResetUrl) {
        setDevLink(data.devResetUrl);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(dict.processErrorFallback);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BrandLoader visible={loading} fullScreen minDurationMs={500} />
      <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6 pt-20 sm:pt-12 relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
          <LanguageSwitcher size="sm" />
          <ThemeToggle size="sm" />
        </div>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs text-charcoal-500 font-sans mt-2">
              {dict.pageSubtitle}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-subtle border border-warm-border">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <h1 className="font-serif text-xl font-normal text-charcoal-900">
                  {dict.submittedTitle}
                </h1>

                <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                  {dict.submittedBodyBefore}{' '}
                  <strong className="text-charcoal-900">{email}</strong>.
                </p>

                <div className="p-3 bg-cream-50 rounded-xl border border-warm-border/80 text-[11px] text-charcoal-500 text-left space-y-1">
                  <p>💡 <strong>{dict.tipValidity}</strong></p>
                  <p>
                    {dict.tipSpamPrefix} <em>{dict.tipSpamFolder}</em> {dict.tipOr}{' '}
                    <em>{dict.tipPromoFolder}</em>.
                  </p>
                </div>

                {devLink && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 text-left">
                    <span className="font-bold block mb-1">{dict.devLinkTitle}</span>
                    <a
                      href={devLink}
                      className="underline text-amber-900 break-all hover:text-amber-950 font-mono"
                    >
                      {dict.devLinkCta}
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{dict.backToLogin}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-xl font-normal text-charcoal-900 mb-2">
                  {dict.title}
                </h1>
                <p className="text-xs text-charcoal-500 font-sans mb-6 leading-relaxed">
                  {dict.subtitle}
                </p>

                {error && (
                  <div className="mb-5 p-3 rounded-lg bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose text-xs font-sans leading-relaxed">
                    <p>{error}</p>
                    {error.includes('Não encontramos') && (
                      <div className="mt-2 pt-2 border-t border-dusty-rose/20">
                        <Link
                          href="/cadastro"
                          className="font-medium underline hover:text-charcoal-900 transition-colors"
                        >
                          {dict.createNowLink}
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60"
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
                </form>

                <div className="mt-6 pt-5 border-t border-warm-border/60 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{dict.backToLogin}</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
