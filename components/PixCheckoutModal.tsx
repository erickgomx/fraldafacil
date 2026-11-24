'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  QrCode,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Ticket,
} from 'lucide-react';
import { GiftItemData } from './DiaperCatalog';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import type { ICardPaymentFormData, ICardPaymentBrickPayer } from '@mercadopago/sdk-react/esm/bricks/cardPayment/type';
import { calculatePaymentFees } from '@/lib/fees';
import {
  cleanDigits,
  formatCpf,
  formatPhone,
  isValidCpf,
  isValidEmail,
} from '@/lib/validation';
import { useI18n } from '@/components/LanguageProvider';
import { eventDict } from '@/lib/i18n/dictionaries/event';
import { commonDict } from '@/lib/i18n/dictionaries/common';

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  parentsNames: string;
  selectedGift: GiftItemData | null;
  initialGuess?: 'BOY' | 'GIRL' | null;
  feePayer?: 'GUEST' | 'PARENTS';
  mpConnected?: boolean;
  mpPublicKey?: string | null;
  isDemo?: boolean;
  eventType?: string;
  revealedGender?: string | null;
  raffleEnabled?: boolean;
  rafflePrize?: string | null;
  raffleDrawnAt?: string | null;
  onPaymentSuccess?: () => void;
}

export default function PixCheckoutModal({
  isOpen,
  onClose,
  eventId,
  parentsNames,
  selectedGift,
  initialGuess = null,
  feePayer = 'GUEST',
  mpConnected = false,
  mpPublicKey = null,
  isDemo = false,
  eventType = 'REVELACAO',
  revealedGender = null,
  raffleEnabled = false,
  rafflePrize = null,
  raffleDrawnAt = null,
  onPaymentSuccess,
}: PixCheckoutModalProps) {
  const { locale, mpLocale, t, formatCurrency } = useI18n();
  const dict = eventDict[locale].checkout;
  const gendersDict = commonDict[locale].genders;

  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX');
  const [step, setStep] = useState<'FORM' | 'PIX' | 'CARD_BRICK' | 'SUCCESS'>('FORM');
  const [customAmount, setCustomAmount] = useState<string>(
    selectedGift ? String(selectedGift.price) : '50'
  );
  const [showContactFields, setShowContactFields] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerCpf, setPayerCpf] = useState('');
  const [payerMessage, setPayerMessage] = useState('');
  const [pollGuess, setPollGuess] = useState<'BOY' | 'GIRL' | ''>(initialGuess || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showPollOption = eventType !== 'FRALDA' && !revealedGender;
  const isRaffleActive = Boolean(raffleEnabled && !raffleDrawnAt);

  const [orderId, setOrderId] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const [cardBrickReady, setCardBrickReady] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [raffleTicketNumber, setRaffleTicketNumber] = useState<number | null>(null);
  const [readyPublicKey, setReadyPublicKey] = useState<string>('');

  const effectivePublicKey = useMemo(
    () => (mpPublicKey && mpPublicKey.trim() !== '' ? mpPublicKey.trim() : ''),
    [mpPublicKey]
  );
  const hasPublicKey = Boolean(effectivePublicKey);

  const handleSuccess = useCallback(() => {
    setStep('SUCCESS');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  const handleClose = useCallback(() => {
    if (step === 'SUCCESS' && onPaymentSuccess) {
      onPaymentSuccess();
    }
    onClose();
  }, [step, onPaymentSuccess, onClose]);

  useEffect(() => {
    if (typeof window !== 'undefined' && effectivePublicKey) {
      try {
        initMercadoPago(effectivePublicKey, { locale: mpLocale });
        setReadyPublicKey(effectivePublicKey);
      } catch (e) {
        console.error('Erro ao inicializar SDK Mercado Pago:', e);
        setReadyPublicKey('');
      }
    } else {
      setReadyPublicKey('');
    }
  }, [effectivePublicKey, mpLocale]);

  const wasOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!justOpened) return;

    if (selectedGift) {
      setCustomAmount(String(selectedGift.price));
    } else {
      setCustomAmount('50');
    }
    setPollGuess(showPollOption ? initialGuess || '' : '');
    setStep('FORM');
    setShowContactFields(false);
    setError('');
    setCardBrickReady(false);
    setCardProcessing(false);
    setRaffleTicketNumber(null);
  }, [selectedGift, initialGuess, isOpen, showPollOption]);

  const checkStatus = useCallback(
    async (isManual = false) => {
      if (!orderId) return;

      if (isManual) {
        setCheckingPayment(true);
        setError('');
      }

      try {
        const queryParams = new URLSearchParams({
          t: String(Date.now()),
          ...(isManual ? { force: 'true' } : {}),
        });

        const res = await fetch(`/api/orders/${orderId}?${queryParams.toString()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' },
        });

        if (res.status === 429) {
          if (isManual) {
            setError(dict.errors.tooManyChecks);
            setTimeout(() => setError(''), 5000);
          }
          return;
        }

        if (!res.ok) {
          if (isManual) {
            setError(dict.errors.networkUnstable);
            setTimeout(() => setError(''), 5000);
          }
          return;
        }

        const data = await res.json();

        if (data.status === 'APPROVED') {
          if (typeof data.raffleTicketNumber === 'number') {
            setRaffleTicketNumber(data.raffleTicketNumber);
          }
          handleSuccess();
        } else if (data.status === 'REJECTED') {
          if (isManual) {
            setError(dict.errors.rejectedOrExpired);
          }
        } else if (isManual) {
          setError(dict.errors.stillPending);
          setTimeout(() => setError(''), 4500);
        }
      } catch (err) {
        console.error('Erro ao verificar status do pedido:', err);
        if (isManual) {
          setError(dict.errors.noInternet);
          setTimeout(() => setError(''), 5000);
        }
      } finally {
        if (isManual) {
          setCheckingPayment(false);
        }
      }
    },
    [orderId, handleSuccess, dict.errors]
  );

  useEffect(() => {
    if (step !== 'PIX' || !orderId) return;

    const interval = setInterval(() => {
      checkStatus(false);
    }, 3000);

    const handleOnline = () => {
      checkStatus(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus(false);
      }
    };

    const handleFocus = () => {
      checkStatus(false);
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [step, orderId, checkStatus]);

  const finalNumericAmount = useMemo(() => {
    if (selectedGift) return selectedGift.price;
    const parsed = parseFloat(customAmount.replace(',', '.'));
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }, [selectedGift, customAmount]);

  const feeCalculation = useMemo(() => {
    return calculatePaymentFees({
      baseAmount: finalNumericAmount,
      paymentMethod: paymentMethod === 'PIX' ? 'PIX' : 'CREDIT_CARD',
      feePayer,
    });
  }, [finalNumericAmount, paymentMethod, feePayer]);

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (finalNumericAmount < 1) {
      setError(dict.errors.minAmount);
      return;
    }

    const trimmedName = payerName.trim();
    const trimmedEmail = payerEmail.trim();
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError(dict.errors.invalidEmail);
      return;
    }

    const digitsCpf = cleanDigits(payerCpf);
    if (digitsCpf && !isValidCpf(digitsCpf)) {
      setError(dict.errors.invalidCpf);
      return;
    }

    const phoneDigits = cleanDigits(payerPhone);
    if (isRaffleActive) {
      if (trimmedName.length < 2 || trimmedName.toLowerCase() === 'convidado anônimo') {
        setError(dict.errors.raffleNeedName);
        return;
      }
      if ((!trimmedEmail || !isValidEmail(trimmedEmail)) && phoneDigits.length < 10) {
        setError(dict.errors.raffleNeedContact);
        return;
      }
    }

    if (isDemo) {
      handleSuccess();
      return;
    }

    if (paymentMethod === 'CARD') {
      if (effectivePublicKey) {
        try {
          initMercadoPago(effectivePublicKey, { locale: mpLocale });
          setReadyPublicKey(effectivePublicKey);
        } catch (err) {
          console.error('Erro ao preparar SDK Mercado Pago:', err);
        }
      }
      setCardBrickReady(false);
      setStep('CARD_BRICK');
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
          amount: finalNumericAmount,
          payerName: trimmedName || dict.errors.anonymousName,
          payerEmail: trimmedEmail,
          payerPhone: payerPhone.trim() || null,
          payerCpf: digitsCpf || null,
          payerMessage: payerMessage.trim() || null,
          pollGuess: showPollOption ? pollGuess || null : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || dict.errors.pixFallback);
      }

      setOrderId(data.orderId);
      setQrCode(data.qrCode);
      setQrCodeBase64(data.qrCodeBase64);
      setStep('PIX');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(dict.errors.genericError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardBrickSubmit = async (formData: ICardPaymentFormData<ICardPaymentBrickPayer>) => {
    setError('');
    setCardProcessing(true);

    try {
      const res = await fetch('/api/orders/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          giftItemId: selectedGift ? selectedGift.id : null,
          amount: finalNumericAmount,
          payerName: payerName.trim() || dict.errors.anonymousName,
          payerEmail: payerEmail.trim(),
          payerPhone: payerPhone.trim() || null,
          payerCpf: cleanDigits(payerCpf),
          payerMessage: payerMessage.trim() || null,
          pollGuess: showPollOption ? pollGuess || null : null,
          card: formData,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || dict.errors.cardFallback);
      }

      if (data.status === 'approved') {
        if (typeof data.raffleTicketNumber === 'number') {
          setRaffleTicketNumber(data.raffleTicketNumber);
        }
        handleSuccess();
      } else if (data.status === 'in_process' || data.status === 'pending') {
        setOrderId(data.orderId);
        setError(data.message || dict.errors.cardPending);
      } else {
        setError(data.message || dict.errors.cardRejected);
      }
    } catch (err: unknown) {
      console.error('Erro ao enviar pagamento com cartão:', err);
      const msg = err instanceof Error ? err.message : dict.errors.cardSubmitFail;
      setError(msg);
    } finally {
      setCardProcessing(false);
    }
  };

  const cardSubmitRef = useRef(handleCardBrickSubmit);
  cardSubmitRef.current = handleCardBrickSubmit;

  const stableCardOnSubmit = useCallback(
    (formData: ICardPaymentFormData<ICardPaymentBrickPayer>) => cardSubmitRef.current(formData),
    []
  );

  const stableCardOnReady = useCallback(() => {
    setCardBrickReady(true);
  }, []);

  const brickErrorRef = useRef(dict.errors.brickError);
  brickErrorRef.current = dict.errors.brickError;

  const stableCardOnError = useCallback((brickError: unknown) => {
    console.error('Erro no CardPayment Brick:', brickError);
    setCardBrickReady(true);
    setError(brickErrorRef.current);
  }, []);

  const cardInitialization = useMemo(() => {
    const cleanCpf = cleanDigits(payerCpf);
    const hasEmail = isValidEmail(payerEmail);
    const hasCpf = cleanCpf.length === 11;

    return {
      amount: feeCalculation.chargeAmount,
      payer: {
        email: hasEmail ? payerEmail.trim() : 'convidado@fralda.online',
        ...(hasCpf
          ? {
              identification: {
                type: 'CPF',
                number: cleanCpf,
              },
            }
          : {}),
      },
    };
  }, [feeCalculation.chargeAmount, payerEmail, payerCpf]);

  const cardCustomization = useMemo(
    () => ({
      paymentMethods: {
        minInstallments: 1,
        maxInstallments: 12,
      },
      visual: {
        hideFormTitle: true,
      },
    }),
    []
  );

  useEffect(() => {
    if (step !== 'CARD_BRICK' || !hasPublicKey || readyPublicKey !== effectivePublicKey || cardBrickReady) {
      return;
    }
    const timeout = setTimeout(() => {
      setError(dict.errors.brickTimeout);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [step, hasPublicKey, readyPublicKey, effectivePublicKey, cardBrickReady, dict.errors.brickTimeout]);

  const handleManualCheck = () => {
    checkStatus(true);
  };

  const handleCopyPix = () => {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  const formattedEffectiveRate =
    locale === 'en'
      ? feeCalculation.effectiveFeeRate.toFixed(2)
      : feeCalculation.effectiveFeeRate.toFixed(2).replace('.', ',');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-elevated border border-warm-border relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center transition"
          aria-label={dict.closeAria}
        >
          <X className="w-4 h-4" />
        </button>

        {!isDemo && !mpConnected ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-4 border border-amber-200">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 block mb-1">
              {dict.blocked.eyebrow}
            </span>
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal mb-2">
              {dict.blocked.title}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm mx-auto mb-6 leading-relaxed font-sans">
              {dict.blocked.bodyBefore}
              <strong className="font-medium text-charcoal-800">{parentsNames}</strong>
              {dict.blocked.bodyAfter}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-6 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle"
            >
              {dict.blocked.backButton}
            </button>
          </div>
        ) : (
          <>
            {step === 'FORM' && (
              <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
                    {dict.form.eyebrow}
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                    {selectedGift ? selectedGift.title : dict.form.customGiftTitle}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-1 font-sans">
                    {dict.form.forShowerOf}{' '}
                    <strong className="font-medium text-charcoal-800">{parentsNames}</strong>
                  </p>
                </div>

                {locale !== 'pt' && (
                  <div className="mb-4 px-3 py-2 rounded-lg bg-cream-50 border border-warm-border text-[11px] text-charcoal-600 font-sans text-center">
                    {dict.form.brlCurrencyNotice}
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-2">
                    {dict.form.paymentMethodLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PIX')}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                        paymentMethod === 'PIX'
                          ? 'border-charcoal-900 bg-cream-100/80 shadow-subtle text-charcoal-900 font-medium'
                          : 'border-warm-border bg-white text-charcoal-600 hover:bg-stone-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          paymentMethod === 'PIX'
                            ? 'bg-charcoal-900 text-white'
                            : 'bg-cream-100 text-charcoal-600'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold leading-tight">
                          {dict.form.pixTitle}
                        </span>
                        <span className="text-[10px] text-charcoal-400 leading-tight block">
                          {dict.form.pixSubtitle}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                        paymentMethod === 'CARD'
                          ? 'border-charcoal-900 bg-cream-100/80 shadow-subtle text-charcoal-900 font-medium'
                          : 'border-warm-border bg-white text-charcoal-600 hover:bg-stone-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          paymentMethod === 'CARD'
                            ? 'bg-charcoal-900 text-white'
                            : 'bg-cream-100 text-charcoal-600'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold leading-tight">
                          {dict.form.cardTitle}
                        </span>
                        <span className="text-[10px] text-charcoal-400 leading-tight block">
                          {dict.form.cardSubtitle}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-dusty-rose-light text-dusty-rose text-xs font-sans border border-dusty-rose/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                      {dict.form.giftAmountLabel}
                    </label>
                    {selectedGift ? (
                      <div className="p-3 bg-cream-50 rounded-lg border border-warm-border font-mono text-base font-semibold text-charcoal-900 tabular-nums">
                        {formatCurrency(selectedGift.price)}
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
                          placeholder={dict.form.giftAmountPlaceholder}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-warm-border bg-cream-50/50 text-charcoal-900 font-mono text-sm font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-cream-50/70 p-3.5 rounded-xl border border-warm-border text-xs space-y-1.5 font-sans">
                    <div className="flex justify-between text-charcoal-600">
                      <span>{dict.form.summaryGiftValue}</span>
                      <span className="font-mono font-medium text-charcoal-900">
                        {formatCurrency(feeCalculation.baseAmount)}
                      </span>
                    </div>

                    {feeCalculation.feePayer === 'GUEST' ? (
                      <div className="flex justify-between text-charcoal-500 text-[11px]">
                        <span>{t(dict.form.summaryFeeLine, { rate: formattedEffectiveRate })}</span>
                        <span className="font-mono">+ {formatCurrency(feeCalculation.totalFee)}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 italic">
                        {dict.form.summaryParentsCover}
                      </div>
                    )}

                    <div className="pt-2 border-t border-warm-border/60 flex justify-between items-baseline">
                      <span className="font-medium text-charcoal-900">
                        {dict.form.summaryTotalToPay}
                      </span>
                      <span className="font-mono text-base font-semibold text-charcoal-900">
                        {formatCurrency(feeCalculation.chargeAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-warm-border bg-cream-50/40 space-y-4">
                    {isRaffleActive && (
                      <div className="p-3 rounded-xl bg-cream-100/80 border border-terracotta/30 flex items-start gap-2.5">
                        <Ticket className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                        <div className="text-left">
                          <span className="block text-[11px] font-semibold text-charcoal-900">
                            {dict.form.raffleBannerTitle}
                          </span>
                          <span className="block text-[11px] text-charcoal-600 font-sans leading-relaxed">
                            {rafflePrize
                              ? t(dict.form.raffleBannerWithPrize, { prize: rafflePrize })
                              : dict.form.raffleBannerWithoutPrize}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                        {isRaffleActive ? dict.form.nameLabelRequired : dict.form.nameLabelOptional}
                      </label>
                      <input
                        type="text"
                        required={isRaffleActive}
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder={
                          isRaffleActive
                            ? dict.form.namePlaceholderRequired
                            : dict.form.namePlaceholderOptional
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                      />
                    </div>

                    {showPollOption && (
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1.5">
                          {dict.form.pollGuessLabel}
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
                            {gendersDict.boy}
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
                            {gendersDict.girl}
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
                            {dict.form.noGuess}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                        {dict.form.messageLabel}
                      </label>
                      <textarea
                        rows={3}
                        value={payerMessage}
                        onChange={(e) => setPayerMessage(e.target.value)}
                        placeholder={dict.form.messagePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none"
                      />
                    </div>

                    {isRaffleActive ? (
                      <div className="space-y-3 pt-2 border-t border-warm-border/60">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                              {dict.form.emailLabel}
                            </label>
                            <input
                              type="email"
                              value={payerEmail}
                              onChange={(e) => setPayerEmail(e.target.value)}
                              placeholder={dict.form.emailPlaceholderRaffle}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                              {dict.form.whatsappLabel}
                            </label>
                            <input
                              type="tel"
                              maxLength={15}
                              value={payerPhone}
                              onChange={(e) => setPayerPhone(formatPhone(e.target.value))}
                              placeholder="(11) 99999-9999"
                              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-charcoal-500 font-sans">
                          {dict.form.raffleContactHint}
                        </p>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                            {dict.form.cpfOptionalLabel}
                          </label>
                          <input
                            type="text"
                            maxLength={14}
                            value={payerCpf}
                            onChange={(e) => setPayerCpf(formatCpf(e.target.value))}
                            placeholder="000.000.000-00"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-warm-border/60">
                        <button
                          type="button"
                          onClick={() => setShowContactFields((prev) => !prev)}
                          className="w-full flex items-center justify-between text-left text-[11px] text-charcoal-600 hover:text-charcoal-900 py-1 transition"
                        >
                          <span className="font-sans">
                            {dict.form.optionalContactToggle}{' '}
                            <span className="text-charcoal-400">{dict.form.optionalContactHint}</span>
                          </span>
                          {showContactFields ? (
                            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </button>

                        {showContactFields && (
                          <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                                  {dict.form.yourEmailLabel}
                                </label>
                                <input
                                  type="email"
                                  value={payerEmail}
                                  onChange={(e) => setPayerEmail(e.target.value)}
                                  placeholder={dict.form.yourEmailPlaceholder}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                                  {dict.form.yourCpfLabel}
                                </label>
                                <input
                                  type="text"
                                  maxLength={14}
                                  value={payerCpf}
                                  onChange={(e) => setPayerCpf(formatCpf(e.target.value))}
                                  placeholder="000.000.000-00"
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono uppercase text-charcoal-500 mb-1">
                                {dict.form.whatsappLabel}
                              </label>
                              <input
                                type="tel"
                                maxLength={15}
                                value={payerPhone}
                                onChange={(e) => setPayerPhone(formatPhone(e.target.value))}
                                placeholder="(11) 99999-9999"
                                className="w-full px-3.5 py-2.5 rounded-lg border border-warm-border bg-white text-charcoal-900 text-xs focus:outline-none focus:ring-1 focus:ring-charcoal-900"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{dict.form.processingButton}</span>
                      </>
                    ) : paymentMethod === 'PIX' ? (
                      dict.form.submitPixButton
                    ) : (
                      dict.form.submitCardButton
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-sans text-charcoal-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                    <span>{dict.form.securityFooter}</span>
                  </div>
                </form>
              </div>
            )}

            {step === 'PIX' && (
              <div className="p-6 sm:p-8 text-center max-h-[90vh] overflow-y-auto">
                <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
                  {dict.pixStep.eyebrow}
                </span>
                <h3 className="font-serif text-2xl text-charcoal-900 font-normal mb-1">
                  {dict.pixStep.title}
                </h3>
                <p className="text-xs text-charcoal-500 mb-6 font-sans">
                  {dict.pixStep.subtitle}
                </p>

                {qrCodeBase64 && (
                  <div className="mx-auto w-48 h-48 bg-white p-2 rounded-lg border border-warm-border shadow-subtle mb-6 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeBase64} alt={dict.pixStep.qrAlt} className="w-full h-full object-contain" />
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
                        <span>{dict.pixStep.copiedButton}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        <span>{dict.pixStep.copyButton}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-mono text-charcoal-600 bg-cream-100/70 py-2.5 px-4 rounded-lg border border-warm-border mb-3">
                  <span className="w-2 h-2 rounded-full bg-stone-500 animate-pulse" />
                  <span>{dict.pixStep.waitingText}</span>
                </div>

                {error && (
                  <div className="mb-3 p-2.5 rounded-lg bg-cream-100 text-charcoal-700 text-xs font-sans border border-warm-border flex items-center justify-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={checkingPayment}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-medium text-charcoal-700 bg-cream-50 hover:bg-cream-100 border border-warm-border transition flex items-center justify-center gap-2 mb-4"
                >
                  {checkingPayment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{dict.pixStep.checkingButton}</span>
                    </>
                  ) : (
                    <span>{dict.pixStep.manualCheckButton}</span>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-warm-border">
                  <button
                    type="button"
                    onClick={() => setStep('FORM')}
                    className="text-xs text-charcoal-500 hover:text-charcoal-800 underline underline-offset-2"
                  >
                    {dict.pixStep.changeDataButton}
                  </button>
                </div>
              </div>
            )}

            {step === 'CARD_BRICK' && (
              <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-400 block mb-1">
                    {dict.cardStep.eyebrow}
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                    {dict.cardStep.title}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-1 font-sans">
                    {dict.cardStep.totalPrefix}{' '}
                    <strong className="font-semibold text-charcoal-900">
                      {formatCurrency(feeCalculation.chargeAmount)}
                    </strong>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-dusty-rose-light text-dusty-rose text-xs font-sans border border-dusty-rose/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {hasPublicKey && readyPublicKey === effectivePublicKey ? (
                  <div className="relative min-h-[300px]">
                    {cardProcessing && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 text-xs text-charcoal-700">
                        <Loader2 className="w-6 h-6 animate-spin text-charcoal-800 mb-2" />
                        <span className="font-medium">{dict.cardStep.processingOperator}</span>
                      </div>
                    )}

                    {!cardBrickReady && (
                      <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center py-12 text-xs text-charcoal-500">
                        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400 mb-2" />
                        <span>{dict.cardStep.loadingBrick}</span>
                      </div>
                    )}

                    <div className={cardBrickReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}>
                      <CardPayment
                        key={`${effectivePublicKey}-${mpLocale}`}
                        initialization={cardInitialization}
                        customization={cardCustomization}
                        onSubmit={stableCardOnSubmit}
                        onReady={stableCardOnReady}
                        onError={stableCardOnError}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-cream-100/60 p-5 rounded-xl border border-warm-border text-center space-y-4">
                    <div className="w-10 h-10 rounded-full bg-cream-200 text-charcoal-700 mx-auto flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base text-charcoal-900 font-medium">
                        {dict.cardStep.unavailableTitle}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
                        {dict.cardStep.unavailableDescription}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('FORM')}
                      className="w-full py-3 px-4 rounded-lg font-medium text-xs text-white bg-charcoal-900 hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2"
                    >
                      {dict.cardStep.backToPixCta}
                    </button>
                  </div>
                )}

                <div className="mt-5 pt-3 border-t border-warm-border flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setStep('FORM')}
                    className="text-charcoal-500 hover:text-charcoal-800 underline underline-offset-2"
                  >
                    {dict.cardStep.backChoosePix}
                  </button>
                  <div className="flex items-center gap-1 text-[11px] font-sans text-charcoal-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                    <span>{dict.cardStep.encryptedBadge}</span>
                  </div>
                </div>
              </div>
            )}

            {step === 'SUCCESS' && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-cream-100 text-charcoal-900 mx-auto flex items-center justify-center mb-4 border border-warm-border">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>

                {isDemo && (
                  <span className="inline-block mb-3 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-cream-100 border border-warm-border text-charcoal-600">
                    {dict.successStep.demoBadge}
                  </span>
                )}

                <h3 className="font-serif text-2xl text-charcoal-900 font-normal mb-2">
                  {dict.successStep.title}
                </h3>

                <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm mx-auto mb-6 leading-relaxed font-sans">
                  {payerMessage.trim()
                    ? dict.successStep.bodyWithMessage
                    : dict.successStep.bodyWithoutMessage}
                </p>

                {raffleTicketNumber !== null && (
                  <div className="mb-6 mx-auto max-w-xs rounded-xl bg-cream-50 border-2 border-terracotta/40 p-4 shadow-subtle">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta block mb-1">
                      {dict.successStep.raffleBadge}
                    </span>
                    <strong className="font-serif text-3xl font-semibold text-charcoal-900 tabular-nums block my-1">
                      Nº #{String(raffleTicketNumber).padStart(3, '0')}
                    </strong>
                    <p className="text-[11px] text-charcoal-600 mt-1 font-sans">
                      {dict.successStep.raffleParticipating}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-warm-border/70 text-[11px] font-medium text-terracotta font-sans">
                      {isValidEmail(payerEmail)
                        ? t(dict.successStep.raffleCopySent, { email: payerEmail.trim() })
                        : dict.successStep.raffleScreenshotHint}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="py-2.5 px-6 rounded-lg font-medium text-xs bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle"
                >
                  {dict.successStep.backButton}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
