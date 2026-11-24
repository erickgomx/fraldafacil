import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPixPayment } from '@/lib/mercadopago';
import { calculatePaymentFees } from '@/lib/fees';
import { cleanDigits, isValidCpf, isValidEmail } from '@/lib/validation';

export const dynamic = 'force-dynamic';

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
      payerCpf,
      payerMessage,
      pollGuess,
    } = body;

    if (!eventId || !amount) {
      return NextResponse.json(
        { error: 'Por favor, informe o evento e o valor do presente.' },
        { status: 400 }
      );
    }

    const trimmedEmail = payerEmail?.trim() || '';
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // CPF opcional: valida apenas se o convidado optar por informar
    const digitsCpf = cleanDigits(payerCpf);
    if (digitsCpf && !isValidCpf(digitsCpf)) {
      return NextResponse.json(
        { error: 'Por favor, informe um CPF válido.' },
        { status: 400 }
      );
    }

    const resolvedPayerName = payerName?.trim() || 'Convidado Anônimo';
    const resolvedPayerEmail = (trimmedEmail || 'convidado@fralda.online').toLowerCase();

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json(
        { error: 'O valor mínimo para presentear é de R$ 1,00.' },
        { status: 400 }
      );
    }

    // Verifica se o evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { user: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });
    }

    if (!event.mpConnected || !event.mpAccessToken) {
      return NextResponse.json(
        {
          error:
            'Os pais ainda estão finalizando a configuração de recebimento deste chá. Tente novamente em breve.',
        },
        { status: 409 }
      );
    }

    // Se o sorteio estiver ativo, exige identificação mínima (nome + e-mail ou WhatsApp)
    const isRaffleActive = Boolean(event.raffleEnabled && !event.raffleDrawnAt);
    if (isRaffleActive) {
      const trimmedName = payerName?.trim() || '';
      const hasValidName =
        trimmedName.length >= 2 && trimmedName.toLowerCase() !== 'convidado anônimo';
      const cleanPhoneDigits = cleanDigits(payerPhone);
      const hasValidContact =
        (trimmedEmail !== '' && isValidEmail(trimmedEmail)) || cleanPhoneDigits.length >= 10;

      if (!hasValidName || !hasValidContact) {
        return NextResponse.json(
          {
            error:
              'Para concorrer ao sorteio deste chá, informe seu nome e pelo menos um e-mail ou WhatsApp de contato.',
          },
          { status: 400 }
        );
      }
    }

    const allowPollGuess = event.eventType !== 'FRALDA' && !event.revealedGender;

    // Se houver giftItemId, busca o presente, valida propriedade e preço
    let giftTitle = 'Presente em Dinheiro';
    let basePresentAmount = numAmount;
    let validGiftId: string | null = null;
    if (giftItemId) {
      const gift = await prisma.giftItem.findUnique({
        where: { id: giftItemId },
      });
      if (!gift || gift.eventId !== eventId || !gift.active) {
        return NextResponse.json({ error: 'Presente indisponível.' }, { status: 400 });
      }
      giftTitle = gift.title;
      basePresentAmount = gift.price;
      validGiftId = gift.id;
    }

    // Calcula o split de taxas
    const feePayer = (event.feePayer as 'GUEST' | 'PARENTS') || 'GUEST';
    const feeCalc = calculatePaymentFees({
      baseAmount: basePresentAmount,
      paymentMethod: 'PIX',
      feePayer,
    });

    // 1. Cria a Order no banco de dados com status PENDING
    const order = await prisma.order.create({
      data: {
        eventId,
        giftItemId: validGiftId,
        amount: feeCalc.chargeAmount,
        netAmount: feeCalc.parentsNetAmount,
        feeAmount: feeCalc.totalFee,
        platformFee: feeCalc.platformFee,
        gatewayFee: feeCalc.gatewayFee,
        feePayer: feeCalc.feePayer,
        payerName: resolvedPayerName,
        payerEmail: resolvedPayerEmail,
        payerPhone: payerPhone?.trim() || null,
        payerCpf: digitsCpf || null,
        payerMessage: payerMessage?.trim() || null,
        pollGuess: allowPollGuess && (pollGuess === 'BOY' || pollGuess === 'GIRL') ? pollGuess : null,
        paymentMethod: 'PIX',
        status: 'PENDING',
      },
    });

    // 2. Gera o Pix no Mercado Pago com Split Oficial via application_fee
    const pixData = await createPixPayment({
      orderId: order.id,
      eventId: event.id,
      amount: feeCalc.chargeAmount,
      description: `${giftTitle} - ${event.parentsNames}`,
      payerEmail: order.payerEmail,
      payerName: order.payerName,
      payerCpf: digitsCpf || null,
      sellerAccessToken: event.mpAccessToken || null,
      sellerRefreshToken: event.mpRefreshToken || null,
      applicationFee: feeCalc.platformFee,
    });

    // 3. Atualiza o pedido com o ID da transação e integridade contábil do split efetivo
    await prisma.order.update({
      where: { id: order.id },
      data: {
        mpPaymentId: pixData.id,
        ...(!pixData.splitApplied
          ? {
              platformFee: 0,
              feeAmount: feeCalc.gatewayFee,
              netAmount: Math.max(
                0,
                Math.round((feeCalc.chargeAmount - feeCalc.gatewayFee) * 100) / 100
              ),
            }
          : {}),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentId: pixData.id,
      status: pixData.status,
      qrCode: pixData.qrCode,
      qrCodeBase64: pixData.qrCodeBase64,
      chargeAmount: feeCalc.chargeAmount,
      baseAmount: feeCalc.baseAmount,
      feePayer: feeCalc.feePayer,
    });
  } catch (error: unknown) {
    console.error('Erro ao criar pedido Pix:', error);
    const msg =
      process.env.NODE_ENV === 'production'
        ? 'Não foi possível gerar o pagamento Pix no momento. Por favor, tente novamente em instantes.'
        : (error instanceof Error ? error.message : 'Erro ao processar Pix.');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
