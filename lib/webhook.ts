/**
 * ============================================================================
 * VALIDAÇÃO CRIPTOGRÁFICA DE WEBHOOK DO MERCADO PAGO (Fralda Online)
 * ============================================================================
 * Implementa validação HMAC SHA-256 oficial da assinatura `x-signature`
 * enviada pelo Mercado Pago em Webhooks v2, com janela anti-replay.
 */

import crypto from 'crypto';

export const WEBHOOK_MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
export const WEBHOOK_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Valida assinatura `x-signature` do Mercado Pago usando comparação em tempo constante
 * e defesa anti-replay (+5 minutos futuro, -24 horas passado para suportar retentativas).
 */
export function verifyMercadoPagoWebhookSignature(
  xSignature: string | null,
  requestId: string | null,
  dataId: string,
  secret: string,
  nowMs: number = Date.now()
): boolean {
  if (!xSignature || !requestId || !dataId || !secret) return false;

  const parts = xSignature.split(',');
  let ts: string | undefined;
  let v1: string | undefined;

  for (const part of parts) {
    const eqIndex = part.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = part.slice(0, eqIndex).trim();
    const val = part.slice(eqIndex + 1).trim();
    if (key === 'ts') ts = val;
    if (key === 'v1') v1 = val;
  }

  if (!ts || !v1 || !/^\d+$/.test(ts)) return false;

  // Defesa Anti-Replay: rejeita timestamps futuros > 5min e notificações > 24h
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || tsNum <= 0) return false;
  const tsMs = tsNum < 1e11 ? tsNum * 1000 : tsNum;
  if (tsMs - nowMs > WEBHOOK_MAX_FUTURE_SKEW_MS || nowMs - tsMs > WEBHOOK_MAX_AGE_MS) {
    console.warn('[Webhook MP] Notificação expirada ou relógio dessincronizado.');
    return false;
  }

  // Formato oficial do Mercado Pago: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const computedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  const bufComputed = Buffer.from(computedHash, 'utf8');
  const bufReceived = Buffer.from(v1.toLowerCase(), 'utf8');

  if (bufComputed.length !== bufReceived.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufComputed, bufReceived);
}
