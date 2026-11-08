/**
 * ============================================================================
 * PÁGINA DE GESTÃO DA LISTA DE PRESENTES (/painel/presentes)
 * ============================================================================
 * Busca todos os itens cadastrados no banco para o evento ativo e passa para
 * o componente interativo de gerenciamento.
 */

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import PresentesClient from './PresentesClient';

export default async function PresentesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const event = await prisma.event.findFirst({
    where: { userId: session.userId },
    include: {
      items: {
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!event) redirect('/cadastro');

  return (
    <PresentesClient
      eventId={event.id}
      initialGifts={event.items.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        price: i.price,
        imageUrl: i.imageUrl,
        category: i.category,
        active: i.active,
      }))}
    />
  );
}
