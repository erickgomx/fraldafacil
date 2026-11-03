'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-xl font-normal text-charcoal-900">
          Link inválido ou ausente
        </h1>
        <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
          O link de recuperação acessado não possui o código de segurança necessário ou está incompleto.
        </p>
        <div className="pt-2">
          <Link
            href="/recuperar-senha"
            className="w-full py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2"
          >
            <span>Solicitar Novo Link</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao atualizar a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-xl font-normal text-charcoal-900">
          Senha alterada com sucesso!
        </h1>
        <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
          Sua nova senha já está ativa. Estamos redirecionando você para a tela de login...
        </p>
        <div className="pt-2">
          <Link
            href="/login?reset=success"
            className="w-full py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2"
          >
            <span>Fazer Login Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-xl font-normal text-charcoal-900 mb-2">
        Criar Nova Senha
      </h1>
      <p className="text-xs text-charcoal-500 font-sans mb-6 leading-relaxed">
        Digite sua nova senha abaixo para restaurar o acesso à sua conta.
      </p>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose text-xs font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
            Nova Senha (Mínimo 6 dígitos)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            <span>Atualizando senha...</span>
          ) : (
            <>
              <span>Salvar Nova Senha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <BrandLogo size="md" />
          </Link>
          <p className="text-xs text-charcoal-500 font-sans mt-2">
            Segurança da sua conta no Fralda Online
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-subtle border border-warm-border">
          <Suspense fallback={<div className="text-center text-xs py-8 text-charcoal-400">Carregando formulário...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
