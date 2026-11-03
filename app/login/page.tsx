'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setResetSuccess(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao entrar. Verifique seus dados.');
      }

      router.push('/painel');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-subtle border border-warm-border">
      <h1 className="font-serif text-xl font-normal text-charcoal-900 mb-6">
        Entrar na sua conta
      </h1>

      {resetSuccess && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Sua senha foi redefinida com sucesso! Você já pode entrar com a nova senha.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose text-xs font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
            E-mail
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-mono uppercase text-charcoal-500">
              Senha
            </label>
            <Link
              href="/recuperar-senha"
              className="text-[11px] font-sans text-charcoal-500 hover:text-charcoal-900 underline underline-offset-2 transition"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            <span>Entrando...</span>
          ) : (
            <>
              <span>Entrar no Painel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-warm-border/60 text-center">
        <p className="text-xs text-charcoal-500 font-sans">
          Ainda não tem página?{' '}
          <Link href="/cadastro" className="font-medium text-charcoal-900 underline underline-offset-2">
            Criar meu Chá
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <BrandLogo size="md" />
          </Link>
          <p className="text-xs text-charcoal-500 font-sans mt-2">
            Acesse o painel para gerenciar seu Chá e acompanhar os presentes
          </p>
        </div>

        <Suspense fallback={<div className="bg-white rounded-2xl p-8 border border-warm-border text-center text-xs text-charcoal-400">Carregando formulário...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
