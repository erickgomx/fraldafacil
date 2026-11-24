import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePaymentFees,
  MP_CARD_FEE_RATE,
  MP_PIX_FEE_RATE,
} from '../lib/fees';

describe('calculatePaymentFees', () => {
  it('aplica gross-up exato para Pix pago pelo convidado (R$ 100,00)', () => {
    const result = calculatePaymentFees({
      baseAmount: 100,
      paymentMethod: 'PIX',
      feePayer: 'GUEST',
    });

    assert.equal(result.baseAmount, 100);
    assert.equal(result.platformFee, 4.99);
    assert.equal(result.chargeAmount, 106.04);
    assert.equal(result.gatewayFee, 1.05);
    assert.equal(result.totalFee, 6.04);
    assert.equal(result.parentsNetAmount, 100);
    assert.equal(result.effectiveFeeRate, 6.04);
    assert.equal(result.feePayer, 'GUEST');

    const realMpDiscount = Math.round(result.chargeAmount * MP_PIX_FEE_RATE * 100) / 100;
    const netReceived = Math.round((result.chargeAmount - result.platformFee - realMpDiscount) * 100) / 100;
    assert.ok(netReceived >= 100, `Esperado líquido >= R$ 100,00, obtido ${netReceived}`);
  });

  it('aplica gross-up exato para Cartão pago pelo convidado (R$ 100,00)', () => {
    const result = calculatePaymentFees({
      baseAmount: 100,
      paymentMethod: 'CREDIT_CARD',
      feePayer: 'GUEST',
    });

    assert.equal(result.baseAmount, 100);
    assert.equal(result.platformFee, 4.99);
    assert.equal(result.chargeAmount, 109.35);
    assert.equal(result.gatewayFee, 4.36);
    assert.equal(result.totalFee, 9.35);
    assert.equal(result.parentsNetAmount, 100);
    assert.equal(result.effectiveFeeRate, 9.35);

    const realMpDiscount = Math.round(result.chargeAmount * MP_CARD_FEE_RATE * 100) / 100;
    const netReceived = Math.round((result.chargeAmount - result.platformFee - realMpDiscount) * 100) / 100;
    assert.ok(netReceived >= 100, `Esperado líquido >= R$ 100,00, obtido ${netReceived}`);
  });

  it('calcula desconto líquido quando os pais assumem no Pix (R$ 50,00 e R$ 100,00)', () => {
    const fifty = calculatePaymentFees({
      baseAmount: 50,
      paymentMethod: 'PIX',
      feePayer: 'PARENTS',
    });

    assert.equal(fifty.chargeAmount, 50);
    assert.equal(fifty.platformFee, 2.5);
    assert.equal(fifty.gatewayFee, 0.5);
    assert.equal(fifty.totalFee, 3);
    assert.equal(fifty.parentsNetAmount, 47);

    const hundred = calculatePaymentFees({
      baseAmount: 100,
      paymentMethod: 'PIX',
      feePayer: 'PARENTS',
    });
    assert.equal(hundred.chargeAmount, 100);
    assert.equal(hundred.platformFee, 4.99);
    assert.equal(hundred.gatewayFee, 0.99);
    assert.equal(hundred.parentsNetAmount, 94.02);
  });

  it('calcula desconto líquido quando os pais assumem no Cartão (R$ 100,00)', () => {
    const result = calculatePaymentFees({
      baseAmount: 100,
      paymentMethod: 'CREDIT_CARD',
      feePayer: 'PARENTS',
    });

    assert.equal(result.chargeAmount, 100);
    assert.equal(result.platformFee, 4.99);
    assert.equal(result.gatewayFee, 3.99);
    assert.equal(result.totalFee, 8.98);
    assert.equal(result.parentsNetAmount, 91.02);
  });

  it('trata corretamente valor zero, negativo e centavos quebrados', () => {
    const zero = calculatePaymentFees({
      baseAmount: 0,
      paymentMethod: 'PIX',
      feePayer: 'GUEST',
    });
    assert.equal(zero.chargeAmount, 0);
    assert.equal(zero.totalFee, 0);
    assert.equal(zero.effectiveFeeRate, 0);

    const negative = calculatePaymentFees({
      baseAmount: -45,
      paymentMethod: 'CREDIT_CARD',
      feePayer: 'PARENTS',
    });
    assert.equal(negative.baseAmount, 0);
    assert.equal(negative.chargeAmount, 0);
    assert.equal(negative.parentsNetAmount, 0);

    const broken = calculatePaymentFees({
      baseAmount: 37.89,
      paymentMethod: 'PIX',
      feePayer: 'GUEST',
    });
    assert.equal(broken.baseAmount, 37.89);
    assert.equal(broken.parentsNetAmount, 37.89);
    assert.equal(
      Math.round((broken.chargeAmount - broken.totalFee) * 100) / 100,
      37.89
    );
  });
});
