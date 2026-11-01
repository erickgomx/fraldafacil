import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { approveOrder, rejectOrder } from '@/lib/orders';
import { cardStatusMessage, createCardPayment, hasMercadoPagoToken } from '@/lib/mercadopago';
import { calculatePaymentFees } from '@/lib/fees';

export const dynamic = 'force-dynamic';

const MAX_INSTALLMENTS = 12;

/**
 * Processa um presente pago com cartão de crédito.
 *
 * O cartão é tokenizado no navegador pelo Card Payment Brick do Mercado Pago:
 * nenhum dado sensível (número, CVV, validade) passa por este servidor —
 * recebemos apenas o `token` de uso único.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId,
      giftItemId,
      amount,
      payerName,
      payerEmail,
      payerPhone,
      payerMessage,
      pollGuess,
      card,
      simulate,
      idempotencyKey,
    } = body ?? {};

    if (!eventId || !payerName?.trim() || !payerEmail?.trim()) {
      return NextResponse.json(
        { error: 'Por favor, preencha nome, e-mail e o valor do presente.' },
        { status: 400 }
      );
    }

    const tokenConfigured = hasMercadoPagoToken();

    // Modo simulado só é permitido quando não há credencial real no servidor
    if (simulate && tokenConfigured) {
      return NextResponse.json({ error: 'Simulação indisponível em produção.' }, { status: 400 });
    }
    if (!simulate) {
      if (!tokenConfigured) {
        return NextResponse.json(
          { error: 'Pagamento com cartão indisponível no momento. Utilize o Pix.' },
          { status: 503 }
        );
      }
      if (!card?.token || !card?.payment_method_id) {
        return NextResponse.json({ error: 'Dados do cartão incompletos.' }, { status: 400 });
      }
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });
    }

    // O valor é sempre definido pelo servidor quando há um presente do catálogo
    let baseAmount = Number(amount);
    let giftTitle = 'Presente em Dinheiro';
    let validGiftId: string | null = null;
    if (giftItemId) {
      const gift = await prisma.giftItem.findUnique({ where: { id: giftItemId } });
      if (!gift || gift.eventId !== eventId || !gift.active) {
        return NextResponse.json({ error: 'Presente indisponível.' }, { status: 400 });
      }
      baseAmount = gift.price;
      giftTitle = gift.title;
      validGiftId = gift.id;
    }

    if (isNaN(baseAmount) || baseAmount < 1) {
      return NextResponse.json(
        { error: 'O valor mínimo para presentear é de R$ 1,00.' },
        { status: 400 }
      );
    }
    baseAmount = Math.round(baseAmount * 100) / 100;

    // Calcula o split de taxas
    const feePayer = (event.feePayer as 'GUEST' | 'PARENTS') || 'GUEST';
    const feeCalc = calculatePaymentFees({
      baseAmount,
      paymentMethod: 'CREDIT_CARD',
      feePayer,
    });

    const finalChargeAmount = feeCalc.chargeAmount;

    // O Brick calcula as parcelas a partir do valor exibido; se divergir, recusamos
    if (!simulate && card?.transaction_amount != null) {
      const brickAmount = Math.round(Number(card.transaction_amount) * 100) / 100;
      if (Math.abs(brickAmount - finalChargeAmount) > 0.05) {
        return NextResponse.json(
          { error: 'O valor do pagamento não confere. Recarregue a página e tente novamente.' },
          { status: 400 }
        );
      }
    }

    const installments = Math.min(Math.max(Number(card?.installments) || 1, 1), MAX_INSTALLMENTS);

    const order = await prisma.order.create({
      data: {
        eventId,
        giftItemId: validGiftId,
        amount: finalChargeAmount,
        netAmount: feeCalc.parentsNetAmount,
        feeAmount: feeCalc.totalFee,
        platformFee: feeCalc.platformFee,
        gatewayFee: feeCalc.gatewayFee,
        feePayer: feeCalc.feePayer,
        payerName: String(payerName).trim(),
        payerEmail: String(payerEmail).trim().toLowerCase(),
        payerPhone: payerPhone?.trim() || null,
        payerMessage: payerMessage?.trim() || null,
        pollGuess: pollGuess === 'BOY' || pollGuess === 'GIRL' ? pollGuess : null,
        paymentMethod: 'CREDIT_CARD',
        status: 'PENDING',
      },
    });

    // ----- Modo demonstração (sem credenciais) -----
    if (simulate) {
      await prisma.order.update({
        where: { id: order.id },
        data: { mpPaymentId: `sim_card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` },
      });
      await approveOrder(order.id);
      return NextResponse.json({
        orderId: order.id,
        status: 'approved',
        message: cardStatusMessage('approved', ''),
        isSimulated: true,
      });
    }

    // ----- Pagamento real -----
    let result;
    try {
      result = await createCardPayment({
        orderId: order.id,
        amount: finalChargeAmount,
        description: `${giftTitle} - ${event.parentsNames}`,
        token: card.token,
        paymentMethodId: card.payment_method_id,
        issuerId: card.issuer_id,
        installments,
        payerEmail: card.payer?.email || order.payerEmail,
        payerName: order.payerName,
        identification: card.payer?.identification,
        sellerAccessToken: event.mpAccessToken || null,
        applicationFee: feeCalc.platformFee,
        idempotencyKey:
          typeof idempotencyKey === 'string' && idempotencyKey.length >= 8
            ? idempotencyKey
            : randomUUID(),
      });
    } catch (err) {
      console.error('Erro ao criar pagamento com cartão no Mercado Pago:', err);
      await rejectOrder(order.id);
      return NextResponse.json(
        {
          orderId: order.id,
          status: 'rejected',
          message: 'Não foi possível processar o cartão. Revise os dados ou pague via Pix.',
        },
        { status: 200 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPaymentId: result.id },
    });

    if (result.status === 'approved') {
      await approveOrder(order.id);
    } else if (result.status === 'rejected' || result.status === 'cancelled') {
      await rejectOrder(order.id);
    }

    return NextResponse.json({
      orderId: order.id,
      paymentId: result.id,
      status: result.status,
      statusDetail: result.statusDetail,
      message: cardStatusMessage(result.status, result.statusDetail),
    });
  } catch (error) {
    console.error('Erro ao processar pagamento com cartão:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar o pagamento. Tente novamente.' },
      { status: 500 }
    );
  }
}
