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
  const client = new MercadoPagoConfig({ accessToken: token });
  const payment = new Payment(client);

  const nameParts = input.payerName.trim().split(/\s+/);
  const issuer = input.issuerId ? Number(input.issuerId) : undefined;
  const cleanCpf = input.identification?.number
    ? String(input.identification.number).replace(/\D/g, '')
    : '';

  const res = await payment.create({
    body: {
      transaction_amount: Number(input.amount.toFixed(2)),
      token: input.token,
      description: input.description,
      installments: Number(input.installments) || 1,
      payment_method_id: input.paymentMethodId,
      ...(isMarketplace && input.applicationFee && input.applicationFee > 0
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
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fraldafacil.com.br'}/api/webhooks/mercadopago`,
    },
    requestOptions: { idempotencyKey: input.idempotencyKey },
  });

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

export async function createPixPayment(input: CreatePixInput): Promise<PixPaymentResponse> {
  const isMarketplace = Boolean(input.sellerAccessToken && input.sellerAccessToken.trim() !== '');
  const token = input.sellerAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;

  // Se houver token do Mercado Pago configurado, tenta a chamada oficial
  if (token && token.trim() !== '' && !token.includes('SEU_TOKEN')) {
    try {
      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      const client = new MercadoPagoConfig({ accessToken: token });
      const payment = new Payment(client);

      const nameParts = input.payerName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Convidado';
      const lastName = nameParts.slice(1).join(' ') || 'Especial';
      const cleanCpf = input.payerCpf ? input.payerCpf.replace(/\D/g, '') : '';

      const res = await payment.create({
        body: {
          transaction_amount: Number(input.amount.toFixed(2)),
          description: input.description,
          payment_method_id: 'pix',
          ...(isMarketplace && input.applicationFee && input.applicationFee > 0
            ? { application_fee: Number(input.applicationFee.toFixed(2)) }
            : {}),
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
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://fraldafacil.com.br'}/api/webhooks/mercadopago`,
        },
      });

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
    } catch (err) {
      console.error('Erro na API oficial do Mercado Pago, gerando Pix simulado para testes:', err);
    }
  }

  // MODO TESTE / SIMULADO (Local ou sem token configurado)
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
