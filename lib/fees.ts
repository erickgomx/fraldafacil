/**
 * Taxas oficiais e regras de split da plataforma Fralda Fácil
 */

// Comissão fixa e garantida da plataforma Fralda Fácil
export const PLATFORM_FEE_RATE = 0.0499; // 4,99%

// Taxas oficiais estimadas de processamento do Mercado Pago no Brasil
export const MP_PIX_FEE_RATE = 0.0099; // 0,99%
export const MP_CARD_FEE_RATE = 0.0399; // 3,99% (crédito à vista liberação imediata)

export interface FeeCalculationInput {
  baseAmount: number; // Valor original do presente (ex: R$ 50,00)
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  feePayer: 'GUEST' | 'PARENTS'; // Quem assume as taxas
}

export interface FeeCalculationResult {
  baseAmount: number; // Valor do presente para os pais (ex: R$ 50.00)
  chargeAmount: number; // Valor total cobrado do pagador (ex: R$ 52.99 ou R$ 50.00)
  platformFee: number; // O seu lucro de 4,99% via application_fee (ex: R$ 2.50)
  gatewayFee: number; // Taxa de processamento do MP (0,99% Pix ou 3,99% Cartão)
  totalFee: number; // platformFee + gatewayFee
  parentsNetAmount: number; // Valor que os pais efetivamente recebem na conta MP
  feePayer: 'GUEST' | 'PARENTS';
}

/**
 * Calcula o split e os valores a serem cobrados no checkout.
 *
 * 1) Se feePayer === 'GUEST' (Repassar para o convidado):
 *    - O convidado paga: baseAmount + taxa da plataforma (4,99%) + taxa MP (0,99% Pix / 3,99% Cartão).
 *    - Os pais recebem: 100% do valor do presente na conta MP deles.
 *    - A sua plataforma recebe: 4,99% líquidos via application_fee.
 *
 * 2) Se feePayer === 'PARENTS' (Pais assumem):
 *    - O convidado paga: exatamente baseAmount.
 *    - A sua plataforma retém: 4,99% via application_fee.
 *    - O MP desconta a taxa de processamento dele na conta dos pais.
 *    - Os pais recebem: baseAmount - 4,99% - taxa MP.
 */
export function calculatePaymentFees(input: FeeCalculationInput): FeeCalculationResult {
  const base = Math.max(0, Math.round(Number(input.baseAmount) * 100) / 100);
  const isPix = input.paymentMethod === 'PIX';
  const gatewayRate = isPix ? MP_PIX_FEE_RATE : MP_CARD_FEE_RATE;

  if (input.feePayer === 'GUEST') {
    // Adiciona as duas taxas ao valor pago pelo convidado
    const platformFee = Math.round(base * PLATFORM_FEE_RATE * 100) / 100;
    const gatewayFee = Math.round(base * gatewayRate * 100) / 100;
    const totalFee = Math.round((platformFee + gatewayFee) * 100) / 100;
    const chargeAmount = Math.round((base + totalFee) * 100) / 100;

    return {
      baseAmount: base,
      chargeAmount,
      platformFee,
      gatewayFee,
      totalFee,
      parentsNetAmount: base,
      feePayer: 'GUEST',
    };
  } else {
    // Os pais assumem: o convidado paga o valor base seco
    const chargeAmount = base;
    const platformFee = Math.round(base * PLATFORM_FEE_RATE * 100) / 100;
    const gatewayFee = Math.round(base * gatewayRate * 100) / 100;
    const totalFee = Math.round((platformFee + gatewayFee) * 100) / 100;
    const parentsNetAmount = Math.max(0, Math.round((base - totalFee) * 100) / 100);

    return {
      baseAmount: base,
      chargeAmount,
      platformFee,
      gatewayFee,
      totalFee,
      parentsNetAmount,
      feePayer: 'PARENTS',
    };
  }
}
