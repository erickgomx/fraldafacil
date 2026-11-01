'use client';

import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { GiftItemData } from './DiaperCatalog';

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  parentsNames: string;
  selectedGift: GiftItemData | null;
  initialGuess?: 'BOY' | 'GIRL' | null;
  onPaymentSuccess?: () => void;
}

export default function PixCheckoutModal({
  isOpen,
  onClose,
  eventId,
  parentsNames,
  selectedGift,
  initialGuess = null,
  onPaymentSuccess,
}: PixCheckoutModalProps) {
  const [step, setStep] = useState<'FORM' | 'PIX' | 'SUCCESS'>('FORM');
  const [customAmount, setCustomAmount] = useState<string>(selectedGift ? String(selectedGift.price) : '50');
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerMessage, setPayerMessage] = useState('');
  const [pollGuess, setPollGuess] = useState<'BOY' | 'GIRL' | ''>(initialGuess || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dados do Pix
  const [orderId, setOrderId] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  const handleSuccess = useCallback(() => {
    setStep('SUCCESS');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  }, [onPaymentSuccess]);

  useEffect(() => {
    if (selectedGift) {
      setCustomAmount(String(selectedGift.price));
    } else {
      setCustomAmount('50');
    }
    if (initialGuess) {
      setPollGuess(initialGuess);
    }
    setStep('FORM');
    setError('');
  }, [selectedGift, initialGuess, isOpen]);

  useEffect(() => {
    if (step !== 'PIX' || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (data.status === 'APPROVED') {
          clearInterval(interval);
          handleSuccess();
        }
      } catch (err) {
        console.error('Erro no polling do pedido:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [step, orderId, handleSuccess]);

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalAmount = selectedGift ? selectedGift.price : parseFloat(customAmount.replace(',', '.'));
    if (isNaN(finalAmount) || finalAmount < 1) {
      setError('Por favor, informe um valor válido a partir de R$ 1,00.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          giftItemId: selectedGift ? selectedGift.id : null,
          amount: finalAmount,
          payerName,
          payerEmail,
          payerPhone,
          payerMessage,
          pollGuess: pollGuess || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar o Pix.');
      }

      setOrderId(data.orderId);
      setQrCode(data.qrCode);
      setQrCodeBase64(data.qrCodeBase64);
      setIsSimulated(data.isSimulated || false);
      setStep('PIX');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao processar o presente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setSimulatingPayment(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/simulate`, {
        method: 'POST',
      });
      if (res.ok) {
        handleSuccess();
      }
    } catch (err) {
      console.error('Erro ao simular pagamento:', err);
    } finally {
      setSimulatingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-card border border-warm-border relative">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center transition"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ETAPA 1: FORMULÁRIO */}
        {step === 'FORM' && (
          <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
                Presentear via Pix
              </span>
              <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                {selectedGift ? selectedGift.title : 'Presentear com Valor Livre'}
              </h3>
              <p className="text-xs text-charcoal-500 mt-1 font-sans">
                Para o Chá de <strong className="font-medium text-charcoal-800">{parentsNames}</strong>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-dusty-rose-light text-dusty-rose text-xs font-sans border border-dusty-rose/30">
                {error}
              </div>
            )}

            <form onSubmit={handleGeneratePix} className="space-y-4">
              {/* Valor */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  Valor do Presente (R$)
                </label>
                {selectedGift ? (
                  <div className="p-3 bg-cream-50 rounded-lg border border-warm-border font-mono text-base font-semibold text-charcoal-900 tabular-nums">
                    R$ {selectedGift.price.toFixed(2).replace('.', ',')}
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-charcoal-400">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.50"
                      min="1"
                      required
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="50,00"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 font-mono text-sm font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                    />
                  </div>
                )}
              </div>

              {/* Nome */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ex: Tio Ricardo e Família"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                />
              </div>

              {/* E-mail & Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                    Seu E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                  />
                </div>
              </div>

              {/* Palpite no Bolão */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1.5">
                  Registrar palpite no bolão com este presente:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPollGuess('BOY')}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition ${
                      pollGuess === 'BOY'
                        ? 'border-dusty-blue bg-dusty-blue-light text-dusty-blue'
                        : 'border-warm-border bg-white text-charcoal-600 hover:bg-stone-50'
                    }`}
                  >
                    Menino
                  </button>
                  <button
                    type="button"
                    onClick={() => setPollGuess('GIRL')}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition ${
                      pollGuess === 'GIRL'
                        ? 'border-dusty-rose bg-dusty-rose-light text-dusty-rose'
                        : 'border-warm-border bg-white text-charcoal-600 hover:bg-stone-50'
                    }`}
                  >
                    Menina
                  </button>
                  <button
                    type="button"
                    onClick={() => setPollGuess('')}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition ${
                      pollGuess === ''
                        ? 'border-charcoal-900 bg-charcoal-900 text-white'
                        : 'border-warm-border bg-white text-charcoal-400 hover:bg-stone-50'
                    }`}
                  >
                    Sem palpite
                  </button>
                </div>
              </div>

              {/* Mensagem no Mural */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                  Mensagem para os Pais (Aparece no Mural)
                </label>
                <textarea
                  rows={3}
                  value={payerMessage}
                  onChange={(e) => setPayerMessage(e.target.value)}
                  placeholder="Escreva aqui uma mensagem carinhosa para os pais lerem..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Gerando código Pix...' : 'Avançar para Pagamento Pix'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-sans text-charcoal-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                <span>Transação segura processada via Pix transparente</span>
              </div>
            </form>
          </div>
        )}

        {/* ETAPA 2: QR CODE */}
        {step === 'PIX' && (
          <div className="p-6 sm:p-8 text-center max-h-[90vh] overflow-y-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
              Pagamento Pix
            </span>
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal mb-1">
              Escaneie ou copie o código
            </h3>
            <p className="text-xs text-charcoal-500 mb-6 font-sans">
              Abra o aplicativo do seu banco para concluir a transferência
            </p>

            {qrCodeBase64 && (
              <div className="mx-auto w-48 h-48 bg-white p-2 rounded-lg border border-warm-border shadow-subtle mb-6 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeBase64} alt="QR Code Pix" className="w-full h-full object-contain" />
              </div>
            )}

            <div className="mb-6">
              <button
                onClick={handleCopyPix}
                className="w-full py-3 px-4 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 transition flex items-center justify-center gap-2 shadow-subtle"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Código Pix copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                    <span>Copiar código Pix (Copia e Cola)</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-charcoal-600 bg-cream-100/70 py-2.5 px-4 rounded-lg border border-warm-border mb-4">
              <span className="w-2 h-2 rounded-full bg-stone-500 animate-pulse" />
              <span>Aguardando confirmação do pagamento...</span>
            </div>

            {isSimulated && (
              <div className="pt-3 border-t border-warm-border">
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulatingPayment}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium text-charcoal-700 bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center gap-1.5 border border-stone-250"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>{simulatingPayment ? 'Confirmando...' : 'Confirmar pagamento de teste (Demonstração)'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 3: SUCESSO */}
        {step === 'SUCCESS' && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-cream-100 text-charcoal-900 mx-auto flex items-center justify-center mb-4 border border-warm-border">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h3 className="font-serif text-2xl text-charcoal-900 font-normal mb-2">
              Presente confirmado
            </h3>

            <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm mx-auto mb-6 leading-relaxed font-sans">
              Muito obrigado pelo carinho com a família! Sua mensagem já está disponível no mural de recados.
            </p>

            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle"
            >
              Voltar à página do Chá
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
