import QRCode from 'qrcode';

// Tipo de retorno do Pix gerado
export interface PixPaymentResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  qrCode: string; // Copia e Cola
  qrCodeBase64: string; // Imagem em Base64 para exibir no modal
  ticketUrl?: string;
  isSimulated?: boolean;
}

export interface CreatePixInput {
  orderId: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  payerCpf?: string | null;
  sellerAccessToken?: string | null;
  applicationFee?: number;
}

/** Indica se há um Access Token real do Mercado Pago configurado no servidor. */
export function hasMercadoPagoToken(): boolean {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  return !!token && token.trim() !== '' && !token.includes('SEU_TOKEN');
}

// ---------------------------------------------------------------------------
// Cartão de crédito (Checkout Transparente via Card Payment Brick)
// ---------------------------------------------------------------------------

export interface CreateCardInput {
  orderId: string;
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
  applicationFee?: number;
}

export interface CardPaymentResponse {
  id: string;
  /** approved | in_process | pending | rejected | ... */
  status: string;
  statusDetail: string;
}

export async function createCardPayment(input: CreateCardInput): Promise<CardPaymentResponse> {
  const isMarketplace = Boolean(input.sellerAccessToken && input.sellerAccessToken.trim() !== '');
  const token = input.sellerAccessToken || (process.env.MERCADO_PAGO_ACCESS_TOKEN as string);
  const { MercadoPagoConfig, Payment } = await import('mercadopago');

  const nameParts = input.payerName.trim().split(/\s+/);
  const issuer = input.issuerId ? Number(input.issuerId) : undefined;
  const cleanCpf = input.identification?.number
    ? String(input.identification.number).replace(/\D/g, '')
    : '';

  const rawAppUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const notificationUrl = rawAppUrl.startsWith('https://')
    ? `${rawAppUrl}/api/webhooks/mercadopago`
    : undefined;

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
    statement_descriptor: 'FRALDAFACIL',
    binary_mode: false,
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  });

  const client = new MercadoPagoConfig({ accessToken: token });
  const payment = new Payment(client);

  let res;
  try {
    res = await payment.create({
      body: buildBody(isMarketplace && Boolean(input.applicationFee && input.applicationFee > 0)),
      requestOptions: { idempotencyKey: input.idempotencyKey },
    });
  } catch (err: unknown) {
    if (isMarketplace && input.applicationFee && input.applicationFee > 0) {
      console.warn('Tentativa com application_fee no cartão falhou, tentando direto sem fee...');
      res = await payment.create({
        body: buildBody(false),
        requestOptions: { idempotencyKey: input.idempotencyKey },
      });
    } else {
      throw err;
    }
  }

  return {
    id: String(res.id),
    status: res.status || 'pending',
    statusDetail: res.status_detail || '',
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
  const isMarketplace = Boolean(input.sellerAccessToken && input.sellerAccessToken.trim() !== '');
  const primaryToken = input.sellerAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const platformToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  // Sanitiza URL de notificação webhook (somente envia se for uma URL HTTPS pública válida)
  const rawAppUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const notificationUrl = rawAppUrl.startsWith('https://')
    ? `${rawAppUrl}/api/webhooks/mercadopago`
    : undefined;

  const nameParts = input.payerName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Convidado';
  const lastName = nameParts.slice(1).join(' ') || 'Especial';
  const cleanCpf = input.payerCpf ? input.payerCpf.replace(/\D/g, '') : '';

  // Se houver qualquer token real (do vendedor conectado ou da plataforma), tenta a emissão oficial
  if (primaryToken && primaryToken.trim() !== '' && !primaryToken.includes('SEU_TOKEN')) {
    const { MercadoPagoConfig, Payment } = await import('mercadopago');

    // Função interna para criar pagamento no MP
    const callMpApi = async (tokenToUse: string, includeApplicationFee: boolean) => {
      const client = new MercadoPagoConfig({ accessToken: tokenToUse });
      const payment = new Payment(client);

      const body: Record<string, unknown> = {
        transaction_amount: Number(input.amount.toFixed(2)),
        description: input.description.slice(0, 120),
        payment_method_id: 'pix',
        payer: {
          email: input.payerEmail || 'contato@fraldafacil.com.br',
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

      return await payment.create({ body });
    };

    let lastError: unknown = null;

    // Tentativa 1: Token do vendedor COM application_fee (split nativo)
    if (isMarketplace && input.applicationFee && input.applicationFee > 0) {
      try {
        const res = await callMpApi(primaryToken, true);
        const pointOfInteraction = res.point_of_interaction;
        const transactionData = pointOfInteraction?.transaction_data;

        if (transactionData?.qr_code) {
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
            isSimulated: false,
          };
        }
      } catch (err: unknown) {
        lastError = err;
        console.warn('Tentativa de Pix com application_fee falhou, tentando direto sem fee:', extractMpErrorMessage(err));
      }
    }

    // Tentativa 2: Token do vendedor SEM application_fee (ex: mesma conta da aplicação ou sem permissão de fee)
    try {
      const res = await callMpApi(primaryToken, false);
      const pointOfInteraction = res.point_of_interaction;
      const transactionData = pointOfInteraction?.transaction_data;

      if (transactionData?.qr_code) {
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
          isSimulated: false,
        };
      }
    } catch (err: unknown) {
      lastError = err;
      console.warn('Tentativa de Pix direto com token do vendedor falhou:', extractMpErrorMessage(err));
    }

    // Tentativa 3: Se houver token da plataforma configurado e for diferente do vendedor, tenta como contingência
    if (platformToken && platformToken !== primaryToken && !platformToken.includes('SEU_TOKEN')) {
      try {
        console.log('Tentando Pix com token de contingência da plataforma...');
        const res = await callMpApi(platformToken, false);
        const pointOfInteraction = res.point_of_interaction;
        const transactionData = pointOfInteraction?.transaction_data;

        if (transactionData?.qr_code) {
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
            isSimulated: false,
          };
        }
      } catch (err: unknown) {
        lastError = err;
        console.error('Tentativa com token da plataforma falhou:', extractMpErrorMessage(err));
      }
    }

    // Se falhou em todas as tentativas oficiais com credenciais reais, lança o erro real em vez de gerar Pix falso!
    const detailedMsg = extractMpErrorMessage(lastError);
    throw new Error(`Mercado Pago: ${detailedMsg}`);
  }

  // MODO TESTE / SIMULADO (Apenas se nenhuma credencial real existir no ambiente)
  const mockPixPayload = `00020126580014br.gov.bcb.pix0136fraldafacil-${input.orderId.slice(0, 8)}520400005303986540${input.amount.toFixed(2).replace('.', '')}5802BR5916FRALDA FACIL SAAS6009SAO PAULO62070503***6304ABCD`;
  const qrBase64 = await QRCode.toDataURL(mockPixPayload, { width: 300, margin: 2 });

  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: 'pending',
    qrCode: mockPixPayload,
    qrCodeBase64: qrBase64,
    isSimulated: true,
  };
}
