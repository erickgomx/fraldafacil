'use client';

import { useState } from 'react';
import { Save, CheckCircle2, QrCode } from 'lucide-react';
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
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Configurações do Evento & Chave Pix
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Atualize os dados que aparecem na sua página pública e configure onde receberá o repasse
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        {success && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Nome dos Pais / Organizadores *
            </label>
            <input
              type="text"
              required
              value={parentsNames}
              onChange={(e) => setParentsNames(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Nome do Bebê (ou prováveis opções)
            </label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Ex: Gabriel (ou Clara / Arthur)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Data do Chá / Evento
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              História ou Mensagem de Boas-Vindas
            </label>
            <textarea
              rows={3}
              value={storyMessage}
              onChange={(e) => setStoryMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 resize-none"
            />
          </div>

          {/* CHAVE PIX DOS PAIS PARA REPASSE */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Sua Chave Pix para Repasse (Saque)
              </label>
            </div>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, E-mail, Celular ou Chave Aleatória"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Esta é a chave Pix onde a plataforma transferirá o saldo líquido arrecadado no seu Chá.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
