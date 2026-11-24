/**
 * ============================================================================
 * MOTOR DE CÁLCULO FINANCEIRO E TAXAS (Fralda Online)
 * ============================================================================
 * Este módulo centraliza a matemática de divisão de pagamentos (split de recebíveis)
 * entre a plataforma Fralda Online, o gateway de pagamento (Mercado Pago) e os pais.
 *
 * Como funciona a monetização:
 * - A taxa de serviço da nossa plataforma é fixada em 4,99% (PLATFORM_FEE_RATE).
 * - O Mercado Pago cobra taxas de intermediação bancária (0,99% para Pix e 3,99% para Cartão).
 * - Os pais podem escolher quem absorve esses custos:
 *   1) O CONVIDADO: O valor cobrado usa cálculo exato (gross-up) para cobrir
 *      a taxa da plataforma (sobre o valor base) e a tarifa do Mercado Pago
 *      (sobre o total cobrado), garantindo 100% líquido aos pais!
 *   2) OS PAIS: O convidado paga o valor exato do presente e as taxas são descontadas do total.
 */

// Comissão fixa e garantida da plataforma Fralda Online (4,99%)
export const PLATFORM_FEE_RATE = 0.0499; // 4,99%

// Taxas oficiais estimadas de processamento do Mercado Pago no Brasil
export const MP_PIX_FEE_RATE = 0.0099; // 0,99% para transações instantâneas via Pix
export const MP_CARD_FEE_RATE = 0.0399; // 3,99% (crédito à vista liberação imediata)

export interface FeeCalculationInput {
  baseAmount: number; // Valor original do presente (ex: R$ 50,00)
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  feePayer: 'GUEST' | 'PARENTS'; // Quem assume as taxas
}

export interface FeeCalculationResult {
  baseAmount: number; // Valor do presente para os pais (ex: R$ 50.00)
  chargeAmount: number; // Valor total cobrado do pagador (ex: R$ 53.02 ou R$ 50.00)
  platformFee: number; // O seu lucro de 4,99% via application_fee (ex: R$ 2.50)
  gatewayFee: number; // Taxa de processamento do MP (0,99% Pix ou 3,99% Cartão)
  totalFee: number; // platformFee + gatewayFee
  parentsNetAmount: number; // Valor que os pais efetivamente recebem na conta MP
  effectiveFeeRate: number; // Percentual efetivo sobre o baseAmount (ex: 6.04 ou 9.35)
  feePayer: 'GUEST' | 'PARENTS';
}

/**
 * Calcula o split e os valores a serem cobrados no checkout.
 *
 * 1) Se feePayer === 'GUEST' (Repassar para o convidado com gross-up exato):
 *    - Aplica gross-up: chargeAmount = (base + platformFee) / (1 - gatewayRate)
 *      pois o Mercado Pago incide gatewayRate sobre o valor total cobrado.
 *    - Os pais recebem: 100% do valor base do presente líquido na conta MP deles.
 *    - A sua plataforma recebe: 4,99% sobre o valor base via application_fee.
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
  const platformFee = Math.round(base * PLATFORM_FEE_RATE * 100) / 100;

  if (input.feePayer === 'GUEST') {
    // Gross-up exato para compensar a tarifa do MP incidente sobre o total transacionado
    const chargeAmount =
      base > 0 ? Math.round(((base + platformFee) / (1 - gatewayRate)) * 100) / 100 : 0;
    const totalFee = Math.max(0, Math.round((chargeAmount - base) * 100) / 100);
    const gatewayFee = Math.max(0, Math.round((totalFee - platformFee) * 100) / 100);
    const effectiveFeeRate = base > 0 ? Math.round((totalFee / base) * 10000) / 100 : 0;

    return {
      baseAmount: base,
      chargeAmount,
      platformFee,
      gatewayFee,
      totalFee,
      parentsNetAmount: base,
      effectiveFeeRate,
      feePayer: 'GUEST',
    };
  } else {
    // Os pais assumem: o convidado paga o valor base seco
    const chargeAmount = base;
    const gatewayFee = Math.round(base * gatewayRate * 100) / 100;
    const totalFee = Math.round((platformFee + gatewayFee) * 100) / 100;
    const parentsNetAmount = Math.max(0, Math.round((base - totalFee) * 100) / 100);
    const effectiveFeeRate = base > 0 ? Math.round((totalFee / base) * 10000) / 100 : 0;

    return {
      baseAmount: base,
      chargeAmount,
      platformFee,
      gatewayFee,
      totalFee,
      parentsNetAmount,
      effectiveFeeRate,
      feePayer: 'PARENTS',
    };
  }
}
