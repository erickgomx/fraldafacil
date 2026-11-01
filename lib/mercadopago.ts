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
}

export async function createPixPayment(input: CreatePixInput): Promise<PixPaymentResponse> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  // Se houver token do Mercado Pago configurado, tenta a chamada oficial
  if (token && token.trim() !== '' && !token.includes('SEU_TOKEN')) {
    try {
      const { MercadoPagoConfig, Payment } = await import('mercadopago');
      const client = new MercadoPagoConfig({ accessToken: token });
      const payment = new Payment(client);

      const nameParts = input.payerName.trim().split(' ');
      const firstName = nameParts[0] || 'Convidado';
      const lastName = nameParts.slice(1).join(' ') || 'Especial';

      const res = await payment.create({
        body: {
          transaction_amount: Number(input.amount.toFixed(2)),
          description: input.description,
          payment_method_id: 'pix',
          payer: {
            email: input.payerEmail || 'contato@fraldafacil.com.br',
            first_name: firstName,
            last_name: lastName,
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
