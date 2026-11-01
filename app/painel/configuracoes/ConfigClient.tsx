'use client';

import { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConfigClientProps {
  event: {
    id: string;
    parentsNames: string;
    babyName: string | null;
    eventDate: string;
    storyMessage: string | null;
    pixKey: string | null;
  };
}

export default function ConfigClient({ event }: ConfigClientProps) {
  const router = useRouter();
  const [parentsNames, setParentsNames] = useState(event.parentsNames);
  const [babyName, setBabyName] = useState(event.babyName || '');
  const [eventDate, setEventDate] = useState(event.eventDate.split('T')[0] || '');
  const [storyMessage, setStoryMessage] = useState(event.storyMessage || '');
  const [pixKey, setPixKey] = useState(event.pixKey || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          parentsNames,
          babyName,
          eventDate: eventDate || undefined,
          storyMessage,
          pixKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar alterações.');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="pb-4 border-b border-warm-border">
        <h1 className="font-serif text-2xl font-normal text-charcoal-900">
          Configurações da Página & Chave Pix
        </h1>
        <p className="text-xs text-charcoal-500 font-sans mt-0.5">
          Atualize os textos públicos do Chá e a chave onde você receberá o saldo arrecadado
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 border border-warm-border shadow-subtle">
        {success && (
          <div className="mb-5 p-3 rounded-lg bg-cream-100 border border-warm-border text-charcoal-800 text-xs font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-stone-700" />
            <span>Configurações salvas com sucesso.</span>
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
              Nome dos Pais / Organizadores *
            </label>
            <input
              type="text"
              required
              value={parentsNames}
              onChange={(e) => setParentsNames(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              Nome do Bebê (ou opções de nomes)
            </label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Ex: Gabriel (ou Clara / Arthur)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              Data do Chá
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
              Mensagem de Boas-Vindas aos Convidados
            </label>
            <textarea
              rows={3}
              value={storyMessage}
              onChange={(e) => setStoryMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none leading-relaxed"
            />
          </div>

          {/* CHAVE PIX DE REPASSE */}
          <div className="pt-4 border-t border-warm-border">
            <label className="block text-[11px] font-mono uppercase text-charcoal-700 font-medium mb-1">
              Chave Pix dos Pais para Saque
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, E-mail, Celular ou Chave Aleatória"
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border text-xs font-mono text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
            />
            <p className="text-[11px] text-charcoal-400 mt-1 font-sans">
              O saldo líquido arrecadado na sua página será creditado nesta chave Pix.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-subtle transition flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
