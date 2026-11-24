import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  WEBHOOK_MAX_AGE_MS,
  WEBHOOK_MAX_FUTURE_SKEW_MS,
  verifyMercadoPagoWebhookSignature,
} from '../lib/webhook';

function buildSignedHeader(dataId: string, requestId: string, ts: string | number, secret: string): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return `ts=${ts},v1=${v1}`;
}

describe('verifyMercadoPagoWebhookSignature', () => {
  const secret = 'mp_webhook_secret_test_123456';
  const nowMs = 1_795_500_000_000;
  const dataId = '9876543210';
  const requestId = 'req-abc-123';

  it('aceita assinatura HMAC SHA-256 válida com ts em segundos e milissegundos', () => {
    const tsSec = Math.floor(nowMs / 1000);
    const sigSec = buildSignedHeader(dataId, requestId, tsSec, secret);
    assert.equal(
      verifyMercadoPagoWebhookSignature(sigSec, requestId, dataId, secret, nowMs),
      true
    );

    const sigMs = buildSignedHeader(dataId, requestId, nowMs, secret);
    assert.equal(
      verifyMercadoPagoWebhookSignature(sigMs, requestId, dataId, secret, nowMs),
      true
    );
  });

  it('rejeita assinatura adulterada, segredo errado, dataId distinto ou headers ausentes', () => {
    const tsSec = Math.floor(nowMs / 1000);
    const validSig = buildSignedHeader(dataId, requestId, tsSec, secret);
    const tamperedSig = validSig.replace(/v1=([a-f0-9])/, (_, ch) => `v1=${ch === 'a' ? 'b' : 'a'}`);

    assert.equal(verifyMercadoPagoWebhookSignature(tamperedSig, requestId, dataId, secret, nowMs), false);
    assert.equal(verifyMercadoPagoWebhookSignature(validSig, requestId, dataId, 'wrong-secret', nowMs), false);
    assert.equal(verifyMercadoPagoWebhookSignature(validSig, requestId, '1111111', secret, nowMs), false);
    assert.equal(verifyMercadoPagoWebhookSignature(validSig, 'other-req', dataId, secret, nowMs), false);
    assert.equal(verifyMercadoPagoWebhookSignature(null, requestId, dataId, secret, nowMs), false);
    assert.equal(verifyMercadoPagoWebhookSignature(validSig, null, dataId, secret, nowMs), false);
    assert.equal(verifyMercadoPagoWebhookSignature('ts=abc,v1=deadbeef', requestId, dataId, secret, nowMs), false);
  });

  it('permite retentativa dentro de 24h e bloqueia replay > 24h ou futuro > 5min', () => {
    const retryAgeSec = Math.floor((nowMs - (WEBHOOK_MAX_AGE_MS - 60 * 60 * 1000)) / 1000);
    const retrySig = buildSignedHeader(dataId, requestId, retryAgeSec, secret);
    assert.equal(
      verifyMercadoPagoWebhookSignature(retrySig, requestId, dataId, secret, nowMs),
      true
    );

    const expiredSec = Math.floor((nowMs - (WEBHOOK_MAX_AGE_MS + 60 * 1000)) / 1000);
    const expiredSig = buildSignedHeader(dataId, requestId, expiredSec, secret);
    assert.equal(
      verifyMercadoPagoWebhookSignature(expiredSig, requestId, dataId, secret, nowMs),
      false
    );

    const futureSec = Math.floor((nowMs + WEBHOOK_MAX_FUTURE_SKEW_MS + 60 * 1000) / 1000);
    const futureSig = buildSignedHeader(dataId, requestId, futureSec, secret);
    assert.equal(
      verifyMercadoPagoWebhookSignature(futureSig, requestId, dataId, secret, nowMs),
      false
    );
  });
});
