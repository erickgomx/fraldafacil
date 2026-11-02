'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, User, Link2, Calendar, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Sugere o slug automaticamente conforme os nomes são preenchidos
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
          noNameYet,
          babyName: noNameYet ? null : babyName,
          boyName: noNameYet ? null : boyName,
          girlName: noNameYet ? null : girlName,
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
    <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header com a nova marca oficial */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex mb-3 group hover:opacity-95 transition">
            <BrandLogo size="md" />
          </Link>
          <p className="text-xs text-charcoal-500 font-sans mt-1">
            Configure sua página com lista de presentes e bolão em 2 minutos
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl p-8 shadow-subtle border border-warm-border">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-warm-border/60">
            <h1 className="font-serif text-xl font-normal text-charcoal-900">
              Criar meu Chá
            </h1>
            <span className="text-[11px] font-mono text-charcoal-500">
              Gratuito para começar
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose text-xs font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo do Evento */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1.5">
                Modalidade do Evento
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

            {/* Nomes dos Pais */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                Nome dos Pais (ou da Mãe) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana e Rafael"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>
            </div>

            {/* Checkbox "Ainda não escolhemos o nome" */}
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
                    Ainda não escolhemos o nome do bebê
                  </span>
                  <span className="text-[11px] text-charcoal-500 block mt-0.5 font-sans leading-relaxed">
                    Tudo bem! O link e a página usarão o nome dos pais (ex: <em>Chá de {name || 'Mariana e Rafael'}</em>) e você poderá cadastrar os nomes nas configurações quando decidir.
                  </span>
                </div>
              </label>
            </div>

            {/* Opções de Nomes dos Bebês (Apenas quando desmarcado) */}
            {!noNameYet && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-dusty-blue font-semibold mb-1">
                      Nome se for Menino 💙
                    </label>
                    <input
                      type="text"
                      value={boyName}
                      onChange={(e) => setBoyName(e.target.value)}
                      placeholder="Ex: Arthur"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-dusty-blue/30 bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-dusty-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-dusty-rose font-semibold mb-1">
                      Nome se for Menina 🌸
                    </label>
                    <input
                      type="text"
                      value={girlName}
                      onChange={(e) => setGirlName(e.target.value)}
                      placeholder="Ex: Helena"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-dusty-rose/30 bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-dusty-rose"
                    />
                  </div>
                </div>

                {eventType === 'FRALDA' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                      Ou Nome Único já Escolhido (Opcional)
                    </label>
                    <input
                      type="text"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="Ex: Theo"
                      className="w-full px-3.5 py-2 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Link Personalizado do Evento */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono uppercase text-charcoal-500">
                  Endereço da Página Pública *
                </label>
                {slugManuallyEdited && (
                  <button
                    type="button"
                    onClick={handleResetSlugToAuto}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 font-sans underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sugerir pelos nomes</span>
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
                  placeholder="ex: revelacao-arthur-ou-helena"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>
              <p className="text-[11px] text-charcoal-500 mt-1.5 font-mono">
                Link: <span className="text-charcoal-900 font-medium">fraldaonline.com.br/{slug || 'seu-link'}</span>
              </p>
            </div>

            {/* Data Prevista */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                Data do Evento (Opcional)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>
            </div>

            {/* Credenciais de Acesso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
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
                  <span>Criando página...</span>
                ) : (
                  <>
                    <span>Criar Minha Página de Chá</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-warm-border/60 text-center">
            <p className="text-xs text-charcoal-500 font-sans">
              Já possui uma página cadastrada?{' '}
              <Link href="/login" className="font-medium text-charcoal-900 underline underline-offset-2">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
