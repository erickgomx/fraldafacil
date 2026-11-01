import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ConfigClient from './ConfigClient';

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const event = await prisma.event.findFirst({
    where: { userId: session.userId },
  });

  if (!event) redirect('/cadastro');

  return (
    <ConfigClient
      event={{
        id: event.id,
        parentsNames: event.parentsNames,
        babyName: event.babyName,
        eventDate: event.eventDate.toISOString(),
        storyMessage: event.storyMessage,
        pixKey: event.pixKey,
        mpConnected: event.mpConnected,
        mpUserId: event.mpUserId,
        feePayer: (event.feePayer as 'GUEST' | 'PARENTS') || 'GUEST',
      }}
    />
  );
}
