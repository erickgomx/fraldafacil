import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sendGuestGiftConfirmationEmail,
  sendParentGiftReceivedEmail,
  sendWelcomeEventEmail,
} from '../lib/email';

const originalFetch = global.fetch;
const originalResendKey = process.env.RESEND_API_KEY;
const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  global.fetch = originalFetch;
  if (originalResendKey === undefined) {
    delete process.env.RESEND_API_KEY;
  } else {
    process.env.RESEND_API_KEY = originalResendKey;
  }
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

describe('transactional email service', () => {
  it('ignora e-mails placeholder ou inválidos sem chamar a API do Resend', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    let fetchCalls = 0;

    global.fetch = (async () => {
      fetchCalls += 1;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    for (const ignored of [
      'convidado@fralda.online',
      'expirado@anonimizado.invalid',
      'masked@lgpd.invalid',
      null,
      'invalido',
    ]) {
      const res = await sendGuestGiftConfirmationEmail({
        to: ignored,
        guestName: 'Tia Ana',
        parentsNames: 'Carla e João',
        eventSlug: 'cha-da-alice',
        giftTitle: 'Pacote P',
        amountPaid: 55,
        paymentMethod: 'PIX',
      });
      assert.equal(res.success, true);
    }

    assert.equal(fetchCalls, 0);
  });

  it('envia comprovante ao convidado com número da sorte e escapa XSS', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.fralda.online';

    let capturedPayload: { to: string[]; subject: string; html: string } | null = null;
    global.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      capturedPayload = JSON.parse(String(init?.body || '{}'));
      return new Response(JSON.stringify({ id: 'email_123' }), { status: 200 });
    }) as typeof fetch;

    const result = await sendGuestGiftConfirmationEmail({
      to: 'convidado.real@exemplo.com',
      guestName: '<script>alert(1)</script>Tio Pedro',
      parentsNames: 'Ana & Marcos',
      eventSlug: 'cha-do-noah',
      giftTitle: 'Fralda P',
      amountPaid: 106.04,
      paymentMethod: 'PIX',
      message: '<img src=x onerror=alert(2)>Parabéns!',
      raffleTicketNumber: 7,
      rafflePrize: 'Cafeteira <script>',
    });

    assert.equal(result.success, true);
    assert.ok(capturedPayload);
    const payload = capturedPayload as { to: string[]; subject: string; html: string };
    assert.deepEqual(payload.to, ['convidado.real@exemplo.com']);
    assert.ok(payload.subject.includes('#007'));
    assert.ok(payload.html.includes('Nº #007'));
    assert.ok(payload.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.ok(!payload.html.includes('<script>'));
    assert.ok(!payload.html.includes('<img src=x'));
    assert.ok(payload.html.includes('https://www.fralda.online/cha-do-noah'));
  });

  it('envia notificação aos pais e boas-vindas com conteúdo escapado', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    const capturedHtmls: string[] = [];

    global.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      const parsed = JSON.parse(String(init?.body || '{}')) as { html: string };
      capturedHtmls.push(parsed.html);
      return new Response(JSON.stringify({ id: 'email_ok' }), { status: 200 });
    }) as typeof fetch;

    const parentRes = await sendParentGiftReceivedEmail({
      to: 'pais@exemplo.com',
      parentsNames: 'Julia & Leo',
      guestName: 'Vovó <b>Cida</b>',
      giftTitle: 'Kit Banho',
      amountPaid: 109.35,
      netAmount: 100,
      paymentMethod: 'CREDIT_CARD',
      pollGuess: 'GIRL',
      message: 'Muita saúde! <script>x</script>',
      raffleTicketNumber: 12,
    });
    assert.equal(parentRes.success, true);

    const welcomeRes = await sendWelcomeEventEmail({
      to: 'pais@exemplo.com',
      parentsName: 'Julia & Leo',
      slug: 'cha-da-clara',
      babyName: 'Clara <img onerror=1>',
    });
    assert.equal(welcomeRes.success, true);

    assert.equal(capturedHtmls.length, 2);
    assert.ok(capturedHtmls[0].includes('Menina'));
    assert.ok(capturedHtmls[0].includes('Nº #012'));
    assert.ok(capturedHtmls[0].includes('Cartão de Crédito'));
    assert.ok(!capturedHtmls[0].includes('<script>'));
    assert.ok(capturedHtmls[1].includes('cha-da-clara'));
    assert.ok(!capturedHtmls[1].includes('<img onerror=1>'));
  });
});
