'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Baby, Lock, Mail, ArrowRight, Sparkles, User, Link2, Calendar, Heart } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [babyName, setBabyName] = useState('');
  const [slug, setSlug] = useState('');
  const [eventType, setEventType] = useState<'REVELACAO' | 'FRALDA' | 'AMBOS'>('REVELACAO');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-gerar sugestão de slug ao digitar o nome dos pais ou do bebê
  const handleBabyNameChange = (val: string) => {
    setBabyName(val);
    if (!slug || slug.startsWith('cha-do-') || slug.startsWith('cha-da-')) {
      const clean = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-');
      if (clean) setSlug(`cha-do-${clean}`);
    }
  };

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setSlug(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          slug,
          babyName,
          eventType,
          eventDate: eventDate || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta.');
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
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-rose-50/40 to-amber-50/50 flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-800 hover:opacity-90 transition">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Baby className="w-6 h-6" />
            </span>
            <span>Fralda<span className="text-rose-500">Fácil</span></span>
          </Link>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Crie a página do seu Chá com arrecadação Pix e bolão interativo em 2 minutos!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Criar meu Chá
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-semibold">
              Grátis para começar
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo do Evento */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Tipo do Evento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'REVELACAO', label: 'Chá Revelação' },
                  { id: 'FRALDA', label: 'Chá de Fralda' },
                  { id: 'AMBOS', label: 'Ambos Juntos' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEventType(type.id as 'REVELACAO' | 'FRALDA' | 'AMBOS')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition ${
                      eventType === type.id
                        ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-300/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nomes dos Pais */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nome dos Pais (ou da Mãe) *
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana e Rafael"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition"
                />
              </div>
            </div>

            {/* Nome do Bebê */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nome do Bebê (ou prováveis nomes)
              </label>
              <div className="relative">
                <Heart className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => handleBabyNameChange(e.target.value)}
                  placeholder="Ex: Leo (ou Noah / Maya)"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition"
                />
              </div>
            </div>

            {/* Link Personalizado */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Link da sua página pública *
              </label>
              <div className="relative">
                <Link2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ex: cha-do-leo"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition font-mono text-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Seu link será: <span className="text-sky-600 font-bold">fraldafacil.com.br/{slug || 'seu-link'}</span>
              </p>
            </div>

            {/* Data Prevista do Evento */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Data do Evento ou do Chá
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition"
                />
              </div>
            </div>

            {/* Credenciais de Acesso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 via-purple-500 to-rose-500 hover:opacity-95 shadow-lg shadow-rose-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Criar Minha Página Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-4">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
