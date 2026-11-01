'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Unlink,
  CreditCard,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ConfigClientProps {
  event: {
    id: string;
    parentsNames: string;
    babyName: string | null;
    eventDate: string;
    storyMessage: string | null;
    pixKey: string | null;
    mpConnected?: boolean;
    mpUserId?: string | null;
    feePayer?: 'GUEST' | 'PARENTS';
  };
}

export default function ConfigClient({ event }: ConfigClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parentsNames, setParentsNames] = useState(event.parentsNames);
  const [babyName, setBabyName] = useState(event.babyName || '');
  const [eventDate, setEventDate] = useState(event.eventDate.split('T')[0] || '');
  const [storyMessage, setStoryMessage] = useState(event.storyMessage || '');
  const [pixKey, setPixKey] = useState(event.pixKey || '');
  const [feePayer, setFeePayer] = useState<'GUEST' | 'PARENTS'>(event.feePayer || 'GUEST');
  const [mpConnected, setMpConnected] = useState(Boolean(event.mpConnected));

  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [simulatingConnect, setSimulatingConnect] = useState(false);
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
        message:
          'Sua conta do Mercado Pago foi conectada com sucesso! Agora você já pode receber presentes via Pix e Cartão com split automático diretamente na sua conta.',
      });
      setMpConnected(true);
    } else if (searchParams.get('error')) {
      const err = searchParams.get('error');
      const messages: Record<string, string> = {
        oauth_rejected:
          'A autorização foi cancelada ou recusada no Mercado Pago. Clique novamente para autorizar.',
        token_exchange:
          'Não foi possível validar as credenciais do Mercado Pago. Verifique as chaves MERCADO_PAGO_CLIENT_ID e MERCADO_PAGO_CLIENT_SECRET na Vercel.',
        invalid_or_expired_state:
          'A sessão de conexão expirou por segurança. Inicie a conexão novamente.',
        unauthorized_session: 'Sessão inválida ao vincular a conta do Mercado Pago.',
      };
      setOauthNotice({
        type: 'error',
        message: messages[err!] || 'Ocorreu um erro ao conectar sua conta do Mercado Pago.',
      });
    } else if (searchParams.get('oauth_simulated') === 'ready') {
      setOauthNotice({
        type: 'info',
        message:
          'Credenciais de produção do Mercado Pago ainda não foram configuradas na Vercel. Você pode usar a Simulação de Conexão abaixo para testes.',
      });
    }
  }, [searchParams]);

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
          feePayer,
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

  const handleDisconnectMP = async () => {
    if (!confirm('Deseja realmente desconectar sua conta do Mercado Pago? Sua página não poderá receber presentes até ser reconectada.')) {
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

  const handleSimulateMP = async () => {
    setSimulatingConnect(true);
    try {
      const res = await fetch('/api/auth/mercadopago/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE_CONNECT', eventId: event.id }),
      });
      if (res.ok) {
        setMpConnected(true);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulatingConnect(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="pb-4 border-b border-warm-border">
        <h1 className="font-serif text-2xl text-charcoal-900 font-medium">
          Configurações do Chá
        </h1>
        <p className="text-xs text-charcoal-500 mt-1 font-sans">
          Gerencie a conta recebedora do Mercado Pago, regras de taxas e informações da página pública.
        </p>
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
              {oauthNotice.type === 'success' ? 'Vinculação Concluída' : 'Aviso do Sistema'}
            </span>
            <span className="leading-relaxed">{oauthNotice.message}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-sans border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-dusty-rose-light text-dusty-rose text-xs font-sans border border-dusty-rose/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* BLOCO 1: CONEXÃO MERCADO PAGO OBRIGATÓRIA (SPLIT NATIVO) */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cream-100 text-charcoal-600 border border-warm-border">
                Split Oficial
              </span>
              {mpConnected ? (
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Conta Conectada
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                  Pendente de Conexão
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg text-charcoal-900 font-medium">
              Conta do Mercado Pago dos Pais
            </h2>
            <p className="text-xs text-charcoal-500 mt-1 font-sans leading-relaxed">
              Obrigatório para que o dinheiro dos presentes caia diretamente na sua conta bancária sem intermediação de terceiros, com total segurança jurídica e fiscal.
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
                      Pronto para receber presentes!
                    </span>
                    {event.mpUserId && (
                      <span className="text-[10px] font-mono text-charcoal-400 bg-white px-2 py-0.5 rounded border border-warm-border">
                        ID: {event.mpUserId}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-charcoal-500 block mt-1 leading-relaxed">
                    O dinheiro líquido dos presentes é creditado automaticamente na sua conta Mercado Pago. Você pode transferir para qualquer banco via Pix gratuitamente pelo app do Mercado Pago.
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
                <span>{disconnecting ? 'Desconectando...' : 'Desconectar conta'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-warm-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-charcoal-700 shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-charcoal-900 block">Pix Instantâneo</span>
                  <span className="text-[10px] text-charcoal-500 block">Crédito imediato no seu saldo</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-warm-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-charcoal-700 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-charcoal-900 block">Cartão de Crédito</span>
                  <span className="text-[10px] text-charcoal-500 block">Em até 12x para os convidados</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Como funciona para os pais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-cream-50/80 border border-warm-border">
                <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white text-[10px] font-mono flex items-center justify-center mb-1.5">
                  1
                </span>
                <strong className="block text-charcoal-900 mb-0.5">Clique em Conectar</strong>
                <p className="text-[11px] text-charcoal-500 font-sans leading-relaxed">
                  Você será levado para a tela oficial de login do Mercado Pago.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cream-50/80 border border-warm-border">
                <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white text-[10px] font-mono flex items-center justify-center mb-1.5">
                  2
                </span>
                <strong className="block text-charcoal-900 mb-0.5">Autorize o Split</strong>
                <p className="text-[11px] text-charcoal-500 font-sans leading-relaxed">
                  Faça login com sua conta (ou crie uma em instantes) e autorize a vinculação.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cream-50/80 border border-warm-border">
                <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white text-[10px] font-mono flex items-center justify-center mb-1.5">
                  3
                </span>
                <strong className="block text-charcoal-900 mb-0.5">Receba os Presentes</strong>
                <p className="text-[11px] text-charcoal-500 font-sans leading-relaxed">
                  O dinheiro cai na sua conta sem intermediários, pronto para resgate via Pix.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={`/api/auth/mercadopago/connect?eventId=${event.id}`}
                className="py-3 px-5 rounded-xl text-xs font-semibold bg-[#009EE3] hover:bg-[#0082ba] text-white shadow-subtle transition flex items-center justify-center gap-2 group"
              >
                <span>Conectar com Mercado Pago</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <button
                type="button"
                onClick={handleSimulateMP}
                disabled={simulatingConnect}
                className="py-3 px-4 rounded-xl text-xs font-medium bg-cream-100 hover:bg-cream-200/70 border border-warm-border text-charcoal-700 transition"
              >
                {simulatingConnect ? 'Conectando...' : 'Simular Conexão (Ambiente Local/Teste)'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BLOCO 2: REGRA DE REPASSE DAS TAXAS */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
            Políticas Financeiras
          </span>
          <h2 className="font-serif text-lg text-charcoal-900 font-medium">
            Quem assume as taxas de serviço?
          </h2>
          <p className="text-xs text-charcoal-500 mt-1 font-sans">
            A comissão da plataforma é de <strong>4,99%</strong> + as taxas de processamento do Mercado Pago (0,99% Pix ou 3,99% Cartão).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Opção GUEST */}
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
                  Repassar para o Convidado
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed font-sans">
                As taxas são somadas ao valor final do presente no checkout. Você recebe <strong>100% do valor do presente limpo</strong> na sua conta.
              </p>
            </div>
            <span className="mt-3 text-[10px] font-mono text-charcoal-500 block">
              Ex: Presente de R$ 50 → Você recebe R$ 50,00 cheios.
            </span>
          </button>

          {/* Opção PARENTS */}
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
                  Os Pais Assumem as Taxas
                </span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed font-sans">
                O convidado paga o valor exato do presente. As taxas (4,99% + tarifa MP) são descontadas do montante que você recebe.
              </p>
            </div>
            <span className="mt-3 text-[10px] font-mono text-charcoal-500 block">
              Ex: Presente de R$ 50 → Convidado paga R$ 50,00.
            </span>
          </button>
        </div>
      </div>

      {/* BLOCO 3: INFORMAÇÕES DA PÁGINA DO CHÁ */}
      <div className="bg-white p-6 rounded-2xl border border-warm-border shadow-subtle">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              Nome dos Pais *
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
              Nome do Bebê (ou nomes em dúvida)
            </label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Ex: Leonardo ou Arthur / Maya"
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

          {/* CHAVE PIX DE CONTATO / RESERVA */}
          <div className="pt-2">
            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
              Chave Pix de Contato / Reserva (Opcional)
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Chave Pix para referência"
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
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
