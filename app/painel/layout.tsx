import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import PainelShell from './PainelShell';

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user || user.events.length === 0) {
    redirect('/cadastro');
  }

  const currentEvent = user.events[0];

  return (
    <PainelShell
      userName={user.name}
      userEmail={user.email}
      eventSlug={currentEvent.slug}
      eventBabyName={currentEvent.babyName}
      eventParentsNames={currentEvent.parentsNames}
    >
      {children}
    </PainelShell>
  );
}
