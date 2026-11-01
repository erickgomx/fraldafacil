import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPixPayment } from '@/lib/mercadopago';

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
      payerMessage,
      pollGuess,
    } = body;

    if (!eventId || !amount || !payerName || !payerEmail) {
      return NextResponse.json(
        { error: 'Por favor, preencha nome, e-mail e o valor do presente.' },
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

    // Se houver giftItemId, busca o título do presente
    let giftTitle = 'Presente em Dinheiro';
    if (giftItemId) {
      const gift = await prisma.giftItem.findUnique({
        where: { id: giftItemId },
      });
      if (gift) giftTitle = gift.title;
    }

    // 1. Cria a Order no banco de dados com status PENDING
    const order = await prisma.order.create({
      data: {
        eventId,
        giftItemId: giftItemId || null,
        amount: numAmount,
        payerName: payerName.trim(),
        payerEmail: payerEmail.trim().toLowerCase(),
        payerPhone: payerPhone?.trim() || null,
        payerMessage: payerMessage?.trim() || null,
        pollGuess: pollGuess === 'BOY' || pollGuess === 'GIRL' ? pollGuess : null,
        paymentMethod: 'PIX',
        status: 'PENDING',
      },
    });

    // 2. Gera o Pix no Mercado Pago (ou simulador caso em desenvolvimento)
    const pixData = await createPixPayment({
      orderId: order.id,
      amount: numAmount,
      description: `${giftTitle} - ${event.parentsNames}`,
      payerEmail: order.payerEmail,
      payerName: order.payerName,
    });

    // 3. Atualiza o pedido com o ID da transação
    await prisma.order.update({
      where: { id: order.id },
      data: { mpPaymentId: pixData.id },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentId: pixData.id,
      status: pixData.status,
      qrCode: pixData.qrCode,
      qrCodeBase64: pixData.qrCodeBase64,
      isSimulated: pixData.isSimulated || false,
    });
  } catch (error) {
    console.error('Erro ao criar pedido Pix:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao gerar o pagamento Pix. Tente novamente.' },
      { status: 500 }
    );
  }
}
