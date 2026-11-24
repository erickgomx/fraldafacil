/**
 * ============================================================================
 * PÁGINA DO LIVRO DE RECADOS DOS PAIS (/painel/recados)
 * ============================================================================
 * Exibe todas as mensagens de afeto e votos deixados pelos convidados
 * junto com os presentes enviados pelo Pix.
 */

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import RecadosClient from './RecadosClient';

export const dynamic = 'force-dynamic';

export default async function RecadosPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const event = await prisma.event.findFirst({
    where: { userId: session.userId },
    include: {
      guestMessages: {
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              giftItem: {
                select: { title: true },
              },
            },
          },
        },
      },
    },
  });

  if (!event) redirect('/cadastro');

  return (
    <RecadosClient
      event={{
        slug: event.slug,
        parentsNames: event.parentsNames,
        babyName: event.babyName,
        boyName: event.boyName,
        girlName: event.girlName,
        revealedGender: event.revealedGender,
        eventDate: event.eventDate.toISOString(),
      }}
      initialMessages={event.guestMessages.map((m) => ({
        id: m.id,
        name: m.name,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
        amount: m.order.amount,
        paymentMethod: m.order.paymentMethod,
        pollGuess: m.order.pollGuess,
        payerPhone: m.order.payerPhone,
        giftTitle: m.order.giftItem?.title || 'Presente em Dinheiro',
      }))}
    />
  );
}
