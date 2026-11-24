/**
 * ============================================================================
 * INTEGRAÇÃO COM MERCADO PAGO (Pix, Cartão de Crédito e Split de Pagamentos)
 * ============================================================================
 * Este módulo é o coração dos pagamentos do Fralda Online.
 *
 * Opera estritamente no MODO MARKETPLACE (Sem Custódia):
 * - Os pais conectam sua própria conta do Mercado Pago via OAuth.
 * - O token do vendedor é armazenado de forma criptografada no banco (AES-256-GCM).
 * - O dinheiro dos presentes cai diretamente na conta Mercado Pago dos pais.
 * - A taxa de 4,99% da plataforma é retida automaticamente via `application_fee`.
 * - Caso o Access Token OAuth expire (HTTP 401), renova automaticamente via
 *   `mpRefreshToken` e persiste as novas credenciais criptografadas no banco.
 *
 * Tecnologias: SDK oficial do Mercado Pago, QRCode generator e chaves de idempotência.
 */

import { randomUUID } from 'crypto';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { decryptSecret, encryptSecret } from '@/lib/crypto';

// Tipo de retorno do Pix gerado
export interface PixPaymentResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  qrCode: string; // Copia e Cola
  qrCodeBase64: string; // Imagem em Base64 para exibir no modal
  ticketUrl?: string;
  splitApplied: boolean;
}

export interface CreatePixInput {
  orderId: string;
  eventId?: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  payerCpf?: string | null;
  sellerAccessToken?: string | null;
  sellerRefreshToken?: string | null;
  applicationFee?: number;
}

export interface MpPaymentStatusInfo {
  id?: string;
  status?: string;
  status_detail?: string;
  external_reference?: string;
}

/** Indica se há um Access Token real do Mercado Pago configurado no servidor. */
export function hasMercadoPagoToken(): boolean {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  return !!token && token.trim() !== '' && !token.includes('SEU_TOKEN');
}

/** Garante chaves de idempotência distintas e dentro do limite de 64 caracteres do Mercado Pago. */
function buildIdempotencyKey(base: string, suffix?: string): string {
  const cleanBase = (base || randomUUID()).trim();
  if (!suffix) {
    return cleanBase.slice(0, 64);
  }
  const maxBaseLen = Math.max(8, 64 - suffix.length - 1);
  return `${cleanBase.slice(0, maxBaseLen)}-${suffix}`.slice(0, 64);
}

/** Constrói a URL oficial de Webhooks v2 quando `NEXT_PUBLIC_APP_URL` é HTTPS público. */
function getNotificationUrl(): string | undefined {
  const rawAppUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  return rawAppUrl.startsWith('https://')
    ? `${rawAppUrl}/api/webhooks/mercadopago?source_news=webhooks`
    : undefined;
}

/** Detecta erros de autenticação/token expirado retornados pela API ou SDK do Mercado Pago. */
export function isMpAuthError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'string') {
    const lower = err.toLowerCase();
    return (
      lower.includes('401') ||
      lower.includes('unauthorized') ||
      lower.includes('invalid_token') ||
      lower.includes('invalid access token') ||
      lower.includes('expired')
    );
  }

  const mpErr = err as {
    status?: number | string;
    statusCode?: number | string;
    error?: string;
    message?: string;
    cause?: Array<{ description?: string; message?: string; code?: string | number }> | string;
  };

  if (Number(mpErr.status) === 401 || Number(mpErr.statusCode) === 401) {
    return true;
  }

  const textParts: string[] = [];
  if (mpErr.error) textParts.push(String(mpErr.error));
  if (mpErr.message) textParts.push(String(mpErr.message));
  if (typeof mpErr.cause === 'string') {
    textParts.push(mpErr.cause);
  } else if (Array.isArray(mpErr.cause)) {
    for (const c of mpErr.cause) {
      if (c?.description) textParts.push(String(c.description));
      if (c?.message) textParts.push(String(c.message));
      if (c?.code) textParts.push(String(c.code));
    }
  }

  const combined = textParts.join(' ').toLowerCase();
  return (
    combined.includes('401') ||
    combined.includes('unauthorized') ||
    combined.includes('invalid_token') ||
    combined.includes('invalid access token') ||
    combined.includes('expired')
  );
}

/**
 * Renova o Access Token OAuth do vendedor usando o `mpRefreshToken` salvo
 * e persiste as novas credenciais criptografadas no banco.
 */
export async function refreshSellerAccessToken(
  eventId: string,
  encryptedRefreshToken: string | null | undefined
): Promise<{ accessToken: string; publicKey: string | null } | null> {
  const refreshToken = decryptSecret(encryptedRefreshToken);
  if (!refreshToken || refreshToken.trim() === '') {
    return null;
  }

  const clientId = process.env.MERCADO_PAGO_CLIENT_ID || process.env.NEXT_PUBLIC_MP_CLIENT_ID;
  const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;

  if (!clientId || clientId.trim() === '' || !clientSecret || clientSecret.trim() === '') {
    console.warn('[MP OAuth Refresh] MERCADO_PAGO_CLIENT_ID ou MERCADO_PAGO_CLIENT_SECRET não configurados.');
    return null;
  }

  try {
    const res = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      cache: 'no-store',
    });

    const data = (await res.json().catch(() => null)) as {
      access_token?: string;
      refresh_token?: string;
      public_key?: string;
      message?: string;
      error?: string;
    } | null;

    if (!res.ok || !data?.access_token) {
      console.error('[MP OAuth Refresh] Falha ao renovar token do evento:', {
        eventId,
        status: res.status,
        error: data?.error || data?.message || 'unknown_error',
      });
      return null;
    }

    const nextPublicKey = data.public_key ? String(data.public_key) : null;

    await prisma.event.update({
      where: { id: eventId },
      data: {
        mpAccessToken: encryptSecret(data.access_token),
        ...(data.refresh_token ? { mpRefreshToken: encryptSecret(data.refresh_token) } : {}),
        ...(nextPublicKey ? { mpPublicKey: nextPublicKey } : {}),
      },
    });

    return {
      accessToken: data.access_token,
      publicKey: nextPublicKey,
    };
  } catch (error) {
    console.error('[MP OAuth Refresh] Erro de comunicação ao renovar token:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cartão de crédito (Checkout Transparente via Card Payment Brick)
// ---------------------------------------------------------------------------

export interface CreateCardInput {
  orderId: string;
  eventId?: string;
  amount: number;
  description: string;
  token: string;
  paymentMethodId: string;
  issuerId?: string | number | null;
  installments: number;
  payerEmail: string;
  payerName: string;
  identification?: { type?: string; number?: string } | null;
  idempotencyKey: string;
  sellerAccessToken?: string | null;
  sellerRefreshToken?: string | null;
  applicationFee?: number;
}

export interface CardPaymentResponse {
  id: string;
  /** approved | in_process | pending | rejected | ... */
  status: string;
  statusDetail: string;
  splitApplied: boolean;
}

export async function createCardPayment(input: CreateCardInput): Promise<CardPaymentResponse> {
  const decryptedSellerToken = decryptSecret(input.sellerAccessToken);
  if (!decryptedSellerToken || decryptedSellerToken.trim() === '' || decryptedSellerToken.includes('SEU_TOKEN')) {
    throw new Error('A conta do Mercado Pago dos pais precisa estar conectada para processar pagamentos com cartão.');
  }

  const { MercadoPagoConfig, Payment } = await import('mercadopago');

  const nameParts = input.payerName.trim().split(/\s+/);
  const issuer = input.issuerId ? Number(input.issuerId) : undefined;
  const cleanCpf = input.identification?.number
    ? String(input.identification.number).replace(/\D/g, '')
    : '';
  const notificationUrl = getNotificationUrl();

  const buildBody = (includeFee: boolean) => ({
    transaction_amount: Number(input.amount.toFixed(2)),
    token: input.token,
    description: input.description.slice(0, 120),
    installments: Number(input.installments) || 1,
    payment_method_id: input.paymentMethodId,
    ...(includeFee && input.applicationFee && input.applicationFee > 0
      ? { application_fee: Number(input.applicationFee.toFixed(2)) }
      : {}),
    ...(issuer && !isNaN(issuer) ? { issuer_id: issuer } : {}),
    payer: {
      email: input.payerEmail,
      first_name: nameParts[0] || 'Convidado',
      last_name: nameParts.slice(1).join(' ') || 'Especial',
      ...(cleanCpf
        ? {
            identification: {
              type: input.identification?.type || 'CPF',
              number: cleanCpf,
            },
          }
        : {}),
    },
    external_reference: input.orderId,
    statement_descriptor: 'FRALDAONLINE',
    binary_mode: false,
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  });

  let activeToken = decryptedSellerToken;
  let hasRefreshed = false;

  const runCreate = async (tokenToUse: string, includeFee: boolean, idempotencyKey: string) => {
    const client = new MercadoPagoConfig({ accessToken: tokenToUse });
    const payment = new Payment(client);
    return await payment.create({
      body: buildBody(includeFee),
      requestOptions: { idempotencyKey },
    });
  };

  const executeWithRefresh = async (includeFee: boolean, baseKey: string, refreshSuffix: string) => {
    try {
      return await runCreate(activeToken, includeFee, buildIdempotencyKey(baseKey));
    } catch (err: unknown) {
      if (isMpAuthError(err) && !hasRefreshed && input.eventId && input.sellerRefreshToken) {
        hasRefreshed = true;
        const refreshed = await refreshSellerAccessToken(input.eventId, input.sellerRefreshToken);
        if (refreshed?.accessToken) {
          activeToken = refreshed.accessToken;
          return await runCreate(activeToken, includeFee, buildIdempotencyKey(baseKey, refreshSuffix));
        }
      }
      throw err;
    }
  };

  const shouldAttemptSplit = Boolean(input.applicationFee && input.applicationFee > 0);
  const primaryKey = buildIdempotencyKey(input.idempotencyKey);

  let res;
  let splitApplied = shouldAttemptSplit;

  if (shouldAttemptSplit) {
    try {
      res = await executeWithRefresh(true, primaryKey, 'r1');
    } catch (err: unknown) {
      if (isMpAuthError(err)) {
        throw err;
      }
      console.warn(
        '[MP Split Fallback] Tentativa com application_fee no cartão falhou; tentando sem fee com nova chave de idempotência:',
        extractMpErrorMessage(err)
      );
      res = await executeWithRefresh(false, buildIdempotencyKey(primaryKey, 'nosplit'), 'r2');
      splitApplied = false;
    }
  } else {
    res = await executeWithRefresh(false, primaryKey, 'r1');
    splitApplied = false;
  }

  return {
    id: String(res.id),
    status: res.status || 'pending',
    statusDetail: res.status_detail || '',
    splitApplied,
  };
}

/** Mensagens amigáveis para os principais motivos de recusa do Mercado Pago. */
export function cardStatusMessage(status: string, detail: string): string {
  if (status === 'approved') return 'Pagamento aprovado!';
  if (status === 'in_process' || status === 'pending') {
    return 'Seu pagamento está em análise. Você será avisado assim que for confirmado.';
  }
  const map: Record<string, string> = {
    cc_rejected_bad_filled_card_number: 'Revise o número do cartão.',
    cc_rejected_bad_filled_date: 'Revise a data de validade.',
    cc_rejected_bad_filled_security_code: 'Revise o código de segurança (CVV).',
    cc_rejected_bad_filled_other: 'Revise os dados do cartão.',
    cc_rejected_insufficient_amount: 'O cartão não possui limite suficiente.',
    cc_rejected_call_for_authorize: 'Autorize o pagamento junto ao banco emissor do cartão e tente novamente.',
    cc_rejected_card_disabled: 'Ative seu cartão junto ao banco emissor ou use outro cartão.',
    cc_rejected_duplicated_payment: 'Você já fez um pagamento com esse valor. Use outro cartão ou outro meio.',
    cc_rejected_high_risk: 'O pagamento foi recusado por segurança. Tente com Pix ou outro cartão.',
    cc_rejected_max_attempts: 'Limite de tentativas atingido. Use outro cartão.',
    cc_rejected_blacklist: 'Não foi possível processar o pagamento com este cartão.',
    cc_rejected_invalid_installments: 'O cartão não aceita esse número de parcelas.',
    cc_rejected_card_error: 'Não foi possível processar o pagamento. Tente novamente.',
  };
  return map[detail] || 'O pagamento foi recusado. Tente outro cartão ou pague via Pix.';
}

/** Extrai a mensagem de erro detalhada retornada pela API do Mercado Pago. */
export function extractMpErrorMessage(err: unknown): string {
  if (!err) return 'Erro desconhecido ao comunicar com o Mercado Pago.';
  if (typeof err === 'string') return err;
  const mpErr = err as {
    message?: string;
    cause?: Array<{ description?: string; message?: string; code?: string | number }> | string;
    status?: number;
  };
  if (mpErr.cause) {
    if (Array.isArray(mpErr.cause) && mpErr.cause.length > 0) {
      const descriptions = mpErr.cause
        .map((c) => c.description || c.message || (c.code ? `Código ${c.code}` : ''))
        .filter(Boolean);
      if (descriptions.length > 0) return descriptions.join('; ');
    } else if (typeof mpErr.cause === 'string') {
      return mpErr.cause;
    }
  }
  if (mpErr.message) return mpErr.message;
  return 'Não foi possível gerar a transação no Mercado Pago.';
}

export async function createPixPayment(input: CreatePixInput): Promise<PixPaymentResponse> {
  const decryptedSellerToken = decryptSecret(input.sellerAccessToken);
  if (!decryptedSellerToken || decryptedSellerToken.trim() === '' || decryptedSellerToken.includes('SEU_TOKEN')) {
    throw new Error('A conta do Mercado Pago dos pais precisa estar conectada para gerar pagamentos Pix.');
  }

  const notificationUrl = getNotificationUrl();
  const nameParts = input.payerName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Convidado';
  const lastName = nameParts.slice(1).join(' ') || 'Especial';
  const cleanCpf = input.payerCpf ? input.payerCpf.replace(/\D/g, '') : '';

  const { MercadoPagoConfig, Payment } = await import('mercadopago');

  const callMpApi = async (tokenToUse: string, includeApplicationFee: boolean, idempotencyKey: string) => {
    const client = new MercadoPagoConfig({ accessToken: tokenToUse });
    const payment = new Payment(client);

    const body: Record<string, unknown> = {
      transaction_amount: Number(input.amount.toFixed(2)),
      description: input.description.slice(0, 120),
      payment_method_id: 'pix',
      payer: {
        email: input.payerEmail || 'contato@fralda.online',
        first_name: firstName,
        last_name: lastName,
        ...(cleanCpf && cleanCpf.length === 11
          ? {
              identification: {
                type: 'CPF',
                number: cleanCpf,
              },
            }
          : {}),
      },
      external_reference: input.orderId,
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
    };

    if (includeApplicationFee && input.applicationFee && input.applicationFee > 0) {
      body.application_fee = Number(input.applicationFee.toFixed(2));
    }

    return await payment.create({
      body,
      requestOptions: { idempotencyKey },
    });
  };

  let activeToken = decryptedSellerToken;
  let hasRefreshed = false;

  const executePixAttempt = async (includeFee: boolean, baseKey: string, refreshSuffix: string) => {
    try {
      return await callMpApi(activeToken, includeFee, buildIdempotencyKey(baseKey));
    } catch (err: unknown) {
      if (isMpAuthError(err) && !hasRefreshed && input.eventId && input.sellerRefreshToken) {
        hasRefreshed = true;
        const refreshed = await refreshSellerAccessToken(input.eventId, input.sellerRefreshToken);
        if (refreshed?.accessToken) {
          activeToken = refreshed.accessToken;
          return await callMpApi(activeToken, includeFee, buildIdempotencyKey(baseKey, refreshSuffix));
        }
      }
      throw err;
    }
  };

  const formatPixResult = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res: any,
    splitApplied: boolean
  ): Promise<PixPaymentResponse | null> => {
    const transactionData = res?.point_of_interaction?.transaction_data;
    if (!transactionData?.qr_code) return null;

    let base64 = transactionData.qr_code_base64;
    if (!base64) {
      base64 = await QRCode.toDataURL(transactionData.qr_code);
    }
    return {
      id: String(res.id),
      status: (res.status as 'pending' | 'approved' | 'rejected') || 'pending',
      qrCode: transactionData.qr_code,
      qrCodeBase64: base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`,
      ticketUrl: transactionData.ticket_url,
      splitApplied,
    };
  };

  let lastError: unknown = null;

  // Tentativa 1: Token do vendedor COM application_fee (split nativo)
  if (input.applicationFee && input.applicationFee > 0) {
    try {
      const res = await executePixAttempt(true, buildIdempotencyKey(`pix-${input.orderId}`, 's1'), 'r1');
      const formatted = await formatPixResult(res, true);
      if (formatted) return formatted;
    } catch (err: unknown) {
      lastError = err;
      if (isMpAuthError(err)) {
        throw new Error(`Mercado Pago: ${extractMpErrorMessage(err)}`);
      }
      console.warn(
        '[MP Split Fallback] Tentativa de Pix com application_fee falhou; tentando sem fee com nova chave:',
        extractMpErrorMessage(err)
      );
    }
  }

  // Tentativa 2: Token do vendedor SEM application_fee (ex: mesma conta da aplicação)
  try {
    const res = await executePixAttempt(false, buildIdempotencyKey(`pix-${input.orderId}`, 'ns1'), 'nsr');
    const formatted = await formatPixResult(res, false);
    if (formatted) return formatted;
  } catch (err: unknown) {
    lastError = err;
    console.warn('Tentativa de Pix direto com token do vendedor falhou:', extractMpErrorMessage(err));
  }

  const detailedMsg = extractMpErrorMessage(lastError);
  throw new Error(`Mercado Pago: ${detailedMsg}`);
}

/**
 * Consulta o status real de um pagamento no Mercado Pago, tratando renovação
 * automática de token OAuth expirado (HTTP 401) e fallback opcional para o token
 * da plataforma apenas em consultas de pedidos históricos/legados.
 */
export async function fetchMpPaymentStatus(params: {
  paymentId?: string | null;
  externalReference?: string | null;
  eventId?: string | null;
  sellerAccessToken?: string | null;
  sellerRefreshToken?: string | null;
  allowPlatformFallback?: boolean;
}): Promise<MpPaymentStatusInfo | null> {
  const cleanPaymentId = params.paymentId ? String(params.paymentId).trim() : null;
  const cleanExternalRef = params.externalReference ? String(params.externalReference).trim() : null;

  if (!cleanPaymentId && !cleanExternalRef) {
    return null;
  }

  const rawSellerToken = decryptSecret(params.sellerAccessToken);
  const validSellerToken =
    rawSellerToken && rawSellerToken.trim() !== '' && !rawSellerToken.includes('SEU_TOKEN')
      ? rawSellerToken.trim()
      : null;

  const rawPlatformToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const validPlatformToken =
    rawPlatformToken && rawPlatformToken.trim() !== '' && !rawPlatformToken.includes('SEU_TOKEN')
      ? rawPlatformToken.trim()
      : null;

  const queryByPaymentId = async (token: string) => {
    if (!cleanPaymentId) return { statusCode: 0, payment: null as MpPaymentStatusInfo | null };
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(cleanPaymentId)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (!res.ok) {
      return { statusCode: res.status, payment: null };
    }
    const data = (await res.json().catch(() => null)) as {
      id?: string | number;
      status?: string;
      status_detail?: string;
      external_reference?: string;
    } | null;
    if (!data?.status) {
      return { statusCode: res.status, payment: null };
    }
    return {
      statusCode: res.status,
      payment: {
        id: data.id !== undefined ? String(data.id) : cleanPaymentId,
        status: data.status,
        status_detail: data.status_detail,
        external_reference: data.external_reference,
      },
    };
  };

  const queryByExternalReference = async (token: string) => {
    if (!cleanExternalRef) return { statusCode: 0, payment: null as MpPaymentStatusInfo | null };
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(cleanExternalRef)}&sort=date_created&criteria=desc`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (!res.ok) {
      return { statusCode: res.status, payment: null };
    }
    const searchData = (await res.json().catch(() => null)) as {
      results?: Array<{
        id?: string | number;
        status?: string;
        status_detail?: string;
        external_reference?: string;
      }>;
    } | null;
    const first = searchData?.results?.[0];
    if (!first?.status) {
      return { statusCode: res.status, payment: null };
    }
    return {
      statusCode: res.status,
      payment: {
        id: first.id !== undefined ? String(first.id) : undefined,
        status: first.status,
        status_detail: first.status_detail,
        external_reference: first.external_reference,
      },
    };
  };

  // 1. Consulta prioritária com o token OAuth do vendedor (+ refresh automático se 401)
  if (validSellerToken) {
    let activeSellerToken = validSellerToken;
    let hasRefreshed = false;

    const runSellerQuery = async (
      fn: (token: string) => Promise<{ statusCode: number; payment: MpPaymentStatusInfo | null }>
    ): Promise<MpPaymentStatusInfo | null> => {
      try {
        const result = await fn(activeSellerToken);
        if (result.payment) return result.payment;

        if (result.statusCode === 401 && !hasRefreshed && params.eventId && params.sellerRefreshToken) {
          hasRefreshed = true;
          const refreshed = await refreshSellerAccessToken(params.eventId, params.sellerRefreshToken);
          if (refreshed?.accessToken) {
            activeSellerToken = refreshed.accessToken;
            const retryResult = await fn(activeSellerToken);
            if (retryResult.payment) return retryResult.payment;
          }
        }
      } catch (err) {
        console.warn('[MP Status Check] Falha na consulta com token do vendedor:', err);
      }
      return null;
    };

    if (cleanPaymentId) {
      const foundById = await runSellerQuery(queryByPaymentId);
      if (foundById) return foundById;
    }

    if (cleanExternalRef) {
      const foundByRef = await runSellerQuery(queryByExternalReference);
      if (foundByRef) return foundByRef;
    }
  }

  // 2. Fallback opcional (apenas leitura de pedidos históricos/legados)
  if (params.allowPlatformFallback && validPlatformToken && validPlatformToken !== validSellerToken) {
    try {
      if (cleanPaymentId) {
        const foundById = await queryByPaymentId(validPlatformToken);
        if (foundById.payment) return foundById.payment;
      }
      if (cleanExternalRef) {
        const foundByRef = await queryByExternalReference(validPlatformToken);
        if (foundByRef.payment) return foundByRef.payment;
      }
    } catch (err) {
      console.warn('[MP Status Check] Falha na consulta de fallback:', err);
    }
  }

  return null;
}
