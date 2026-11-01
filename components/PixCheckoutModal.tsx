'use client';

import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  Copy,
  Check,
  Heart,
  Sparkles,
  MessageSquare,
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

  // Dados do Pix gerado
  const [orderId, setOrderId] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  const handleSuccess = useCallback(() => {
    setStep('SUCCESS');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  }, [onPaymentSuccess]);

  // Sincroniza presente selecionado
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

  // Polling de verificação de pagamento Pix quando no step PIX
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ETAPA 1: FORMULÁRIO DE PRESENTE */}
        {step === 'FORM' && (
          <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <span className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 inline-flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 fill-rose-400 text-rose-400" />
              </span>
              <h3 className="text-xl font-black text-slate-800">
                {selectedGift ? selectedGift.title : 'Presentear com Valor Livre'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Para o Chá de <strong className="text-slate-700">{parentsNames}</strong>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleGeneratePix} className="space-y-4">
              {/* Valor */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Valor do Presente (R$)
                </label>
                {selectedGift ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-lg font-black text-slate-800">
                    R$ {selectedGift.price.toFixed(2).replace('.', ',')}
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
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
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                    />
                  </div>
                )}
              </div>

              {/* Nome do Padrinho / Convidado */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ex: Tio Ricardo e Família"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                />
              </div>

              {/* E-mail & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Seu E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                  />
                </div>
              </div>

              {/* Palpite no Bolão (Opcional) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Aproveitar e dar palpite no Bolão?</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPollGuess('BOY')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                      pollGuess === 'BOY'
                        ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-300/40'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    👦 Menino
                  </button>
                  <button
                    type="button"
                    onClick={() => setPollGuess('GIRL')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                      pollGuess === 'GIRL'
                        ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-300/40'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    👧 Menina
                  </button>
                  <button
                    type="button"
                    onClick={() => setPollGuess('')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                      pollGuess === ''
                        ? 'border-slate-400 bg-slate-100 text-slate-700'
                        : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    Sem Palpite
                  </button>
                </div>
              </div>

              {/* Mensagem no Mural */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mensagem para os Pais (Aparece no Mural)</span>
                </label>
                <textarea
                  rows={3}
                  value={payerMessage}
                  onChange={(e) => setPayerMessage(e.target.value)}
                  placeholder="Deixe aqui uma mensagem carinhosa para os pais lerem..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Gerar Pix do Presente</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pagamento instantâneo e seguro via Pix</span>
              </div>
            </form>
          </div>
        )}

        {/* ETAPA 2: QR CODE & COPIA E COLA PIX */}
        {step === 'PIX' && (
          <div className="p-6 md:p-8 text-center max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-800 mb-1">
              Escaneie o QR Code ou Copie o Código
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Abra o app do seu banco e selecione a opção Pix
            </p>

            {/* Imagem do QR Code */}
            {qrCodeBase64 && (
              <div className="mx-auto w-52 h-52 bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm mb-5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeBase64} alt="QR Code Pix" className="w-full h-full object-contain" />
              </div>
            )}

            {/* Botão Copia e Cola */}
            <div className="mb-6">
              <button
                onClick={handleCopyPix}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Código Pix Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Código Pix (Copia e Cola)</span>
                  </>
                )}
              </button>
            </div>

            {/* Indicador de Aguardando Pagamento */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sky-700 bg-sky-50 py-2.5 px-4 rounded-xl border border-sky-200 mb-4 animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
              <span>Aguardando confirmação do Pix em tempo real...</span>
            </div>

            {/* Simulação em Ambiente de Teste */}
            {isSimulated && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 mb-2">
                  Ambiente de demonstração / testes rápidos:
                </p>
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulatingPayment}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200/70 transition flex items-center justify-center gap-1.5 border border-amber-300/60"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span>{simulatingPayment ? 'Confirmando...' : '⚡ Confirmar Pagamento de Teste (Simulador)'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 3: SUCESSO & AGRADECIMENTO */}
        {step === 'SUCCESS' && (
          <div className="p-8 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2">
              Presente Confirmado! 🎉
            </h3>

            <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
              Muito obrigado pelo carinho com os futuros pais e com o bebê! Sua mensagem já está disponível no mural de recados.
            </p>

            <button
              onClick={onClose}
              className="py-3 px-8 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition shadow-md shadow-slate-900/10"
            >
              Voltar para o Chá
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
