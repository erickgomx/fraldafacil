import prisma from '@/lib/prisma';

/**
 * Marca um pedido como APROVADO e executa os efeitos colaterais
 * (mensagem no mural + voto no bolão) exatamente uma vez.
 *
 * Usa `updateMany` condicional para ser atômico: se o webhook e a resposta
 * síncrona do pagamento com cartão chegarem ao mesmo tempo, apenas um deles
 * consegue fazer a transição e os efeitos não são duplicados.
 */
export async function approveOrder(orderId: string): Promise<boolean> {
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: { not: 'APPROVED' } },
    data: { status: 'APPROVED' },
  });

  if (count === 0) return false;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return false;

  if (order.payerMessage && order.payerMessage.trim() !== '') {
    await prisma.guestMessage.upsert({
      where: { orderId: order.id },
      update: { name: order.payerName, message: order.payerMessage },
      create: {
        eventId: order.eventId,
        orderId: order.id,
        name: order.payerName,
        message: order.payerMessage,
      },
    });
  }

  if (order.pollGuess === 'BOY' || order.pollGuess === 'GIRL') {
    await prisma.pollVote.create({
      data: {
        eventId: order.eventId,
        voterName: order.payerName,
        guess: order.pollGuess,
      },
    });
  }

  return true;
}

/** Marca o pedido como recusado, sem sobrescrever um pedido já aprovado. */
export async function rejectOrder(orderId: string) {
  await prisma.order.updateMany({
    where: { id: orderId, status: 'PENDING' },
    data: { status: 'REJECTED' },
  });
}
