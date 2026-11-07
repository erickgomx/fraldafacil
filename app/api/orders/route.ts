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

    if (!eventId || !amount || !payerName?.trim() || !payerEmail?.trim()) {
      return NextResponse.json(
        { error: 'Por favor, preencha nome, e-mail e o valor do presente.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(payerEmail)) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    // Validação de CPF (Obrigatório pelo Banco Central e Mercado Pago para emissão de Pix)
    const digitsCpf = cleanDigits(payerCpf);
    if (!digitsCpf || !isValidCpf(digitsCpf)) {
      return NextResponse.json(
        { error: 'Por favor, informe um CPF válido para a emissão segura do Pix.' },
        { status: 400 }
      );
    }

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
        payerName: payerName.trim(),
        payerEmail: payerEmail.trim().toLowerCase(),
        payerPhone: payerPhone?.trim() || null,
        payerCpf: digitsCpf,
        payerMessage: payerMessage?.trim() || null,
        pollGuess: pollGuess === 'BOY' || pollGuess === 'GIRL' ? pollGuess : null,
        paymentMethod: 'PIX',
        status: 'PENDING',
      },
    });

    // 2. Gera o Pix no Mercado Pago com Split Oficial via application_fee
    const pixData = await createPixPayment({
      orderId: order.id,
      amount: feeCalc.chargeAmount,
      description: `${giftTitle} - ${event.parentsNames}`,
      payerEmail: order.payerEmail,
      payerName: order.payerName,
      payerCpf: digitsCpf,
      sellerAccessToken: event.mpAccessToken || null,
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
              netAmount: feeCalc.chargeAmount,
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
