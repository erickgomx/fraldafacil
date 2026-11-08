/**
 * 📦 Gerenciamento de Transição de Estado de Pedidos (Order Lifecycle & Idempotency)
 *
 * Este módulo orquestra a aprovação e rejeição de pedidos no banco de dados com
 * garantias estritas de atomicidade e concorrência:
 * 1. Previne race conditions entre Webhook assíncrono do Mercado Pago e retorno síncrono da API
 * 2. Garante que efeitos colaterais (publicação de recado carinhoso no mural e voto no bolão)
 *    ocorram estritamente uma única vez (idempotência transacional)
 * 3. Protege pedidos já aprovados contra sobrescrita acidental por notificações atrasadas
 */
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
  return await prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { not: 'APPROVED' } },
      data: { status: 'APPROVED' },
    });

    if (count === 0) return false;

    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return false;

    if (order.payerMessage && order.payerMessage.trim() !== '') {
      await tx.guestMessage.upsert({
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
      await tx.pollVote.create({
        data: {
          eventId: order.eventId,
          voterName: order.payerName,
          guess: order.pollGuess,
        },
      });
    }

    return true;
  });
}

/** Marca o pedido como recusado, sem sobrescrever um pedido já aprovado. */
export async function rejectOrder(orderId: string) {
  await prisma.order.updateMany({
    where: { id: orderId, status: 'PENDING' },
    data: { status: 'REJECTED' },
  });
}
