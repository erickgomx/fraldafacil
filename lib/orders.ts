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
import {
  sendGuestGiftConfirmationEmail,
  sendParentGiftReceivedEmail,
} from '@/lib/email';

/**
 * Marca um pedido como APROVADO e executa os efeitos colaterais
 * (mensagem no mural + voto no bolão) exatamente uma vez.
 *
 * Usa `updateMany` condicional para ser atômico: se o webhook e a resposta
 * síncrona do pagamento com cartão chegarem ao mesmo tempo, apenas um deles
 * consegue fazer a transição e os efeitos não são duplicados.
 */
export async function approveOrder(orderId: string): Promise<boolean> {
  const emailPayload = await prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: {
        id: orderId,
        status: { notIn: ['APPROVED', 'REFUNDED', 'CHARGED_BACK'] },
      },
      data: { status: 'APPROVED' },
    });

    if (count === 0) return null;

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        giftItem: { select: { title: true } },
        event: {
          select: {
            slug: true,
            parentsNames: true,
            raffleEnabled: true,
            raffleDrawnAt: true,
            rafflePrize: true,
            user: { select: { email: true } },
          },
        },
      },
    });
    if (!order) return null;

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

    let assignedTicket: number | null = order.raffleTicketNumber;

    // Atribui 1 Número da Sorte sequencial caso o sorteio esteja ativo e ainda não sorteado
    if (assignedTicket === null) {
      // Lock pessimista por evento para serializar a geração sequencial entre aprovações simultâneas
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${order.eventId} FOR UPDATE`;

      const event = await tx.event.findUnique({
        where: { id: order.eventId },
        select: { raffleEnabled: true, raffleDrawnAt: true },
      });

      if (event?.raffleEnabled && !event.raffleDrawnAt) {
        const agg = await tx.order.aggregate({
          where: { eventId: order.eventId, raffleTicketNumber: { not: null } },
          _max: { raffleTicketNumber: true },
        });
        const nextTicket = (agg._max.raffleTicketNumber ?? 0) + 1;

        await tx.order.update({
          where: { id: order.id },
          data: { raffleTicketNumber: nextTicket },
        });
        assignedTicket = nextTicket;
      }
    }

    return {
      parentEmail: order.event?.user?.email || null,
      parentsNames: order.event?.parentsNames || 'Papais',
      eventSlug: order.event?.slug || '',
      rafflePrize: order.event?.rafflePrize || null,
      guestName: order.payerName,
      payerEmail: order.payerEmail,
      giftTitle: order.giftItem?.title || 'Presente em Dinheiro',
      amountPaid: order.amount,
      netAmount: order.netAmount ?? order.amount,
      paymentMethod: order.paymentMethod,
      pollGuess: order.pollGuess,
      message: order.payerMessage,
      raffleTicketNumber: assignedTicket,
    };
  });

  if (!emailPayload) return false;

  // Dispara notificações por e-mail apenas após o commit da transação
  try {
    const emailTasks: Array<Promise<unknown>> = [];

    if (emailPayload.parentEmail) {
      emailTasks.push(
        sendParentGiftReceivedEmail({
          to: emailPayload.parentEmail,
          parentsNames: emailPayload.parentsNames,
          guestName: emailPayload.guestName,
          giftTitle: emailPayload.giftTitle,
          amountPaid: emailPayload.amountPaid,
          netAmount: emailPayload.netAmount,
          paymentMethod: emailPayload.paymentMethod,
          pollGuess: emailPayload.pollGuess,
          message: emailPayload.message,
          raffleTicketNumber: emailPayload.raffleTicketNumber,
        })
      );
    }

    if (emailPayload.eventSlug) {
      emailTasks.push(
        sendGuestGiftConfirmationEmail({
          to: emailPayload.payerEmail,
          guestName: emailPayload.guestName,
          parentsNames: emailPayload.parentsNames,
          eventSlug: emailPayload.eventSlug,
          giftTitle: emailPayload.giftTitle,
          amountPaid: emailPayload.amountPaid,
          paymentMethod: emailPayload.paymentMethod,
          message: emailPayload.message,
          raffleTicketNumber: emailPayload.raffleTicketNumber,
          rafflePrize: emailPayload.rafflePrize,
        })
      );
    }

    if (emailTasks.length > 0) {
      await Promise.allSettled(emailTasks);
    }
  } catch (err) {
    console.warn('[Approve Order Emails] Falha não bloqueante no envio de notificações:', err);
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

/**
 * Marca um pedido como estornado (REFUNDED) ou contestado (CHARGED_BACK),
 * limpando o Número da Sorte (se o sorteio ainda não foi realizado) e removendo
 * eventual recado público vinculado no mural.
 */
export async function refundOrChargebackOrder(
  orderId: string,
  newStatus: 'REFUNDED' | 'CHARGED_BACK'
): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        eventId: true,
        status: true,
        raffleTicketNumber: true,
        event: {
          select: {
            raffleDrawnAt: true,
          },
        },
      },
    });

    if (!order || order.status === newStatus) {
      return false;
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        ...(!order.event?.raffleDrawnAt ? { raffleTicketNumber: null } : {}),
      },
    });

    await tx.guestMessage.deleteMany({
      where: { orderId: order.id },
    });

    return true;
  });
}
