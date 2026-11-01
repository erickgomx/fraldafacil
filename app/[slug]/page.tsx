import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PublicEventClient from './PublicEventClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
  });

  if (!event) {
    return {
      title: 'Chá de Bebê - Fralda Fácil',
    };
  }

  let title = `Chá de Bebê de ${event.parentsNames} - Fralda Fácil`;
  if (event.revealedGender === 'BOY' && (event.boyName || event.babyName)) {
    title = `É Menino! Chá de ${event.boyName || event.babyName} (${event.parentsNames}) - Fralda Fácil`;
  } else if (event.revealedGender === 'GIRL' && (event.girlName || event.babyName)) {
    title = `É Menina! Chá de ${event.girlName || event.babyName} (${event.parentsNames}) - Fralda Fácil`;
  } else if (event.boyName && event.girlName) {
    title = `Chá Revelação: ${event.boyName} ou ${event.girlName}? (${event.parentsNames}) - Fralda Fácil`;
  } else if (event.babyName) {
    title = `Chá de ${event.babyName} (${event.parentsNames}) - Fralda Fácil`;
  }

  return {
    title,
    description: event.storyMessage || 'Contribua com fraldas e participe do bolão!',
    openGraph: {
      title,
      description: event.storyMessage || 'Contribua com fraldas e participe do bolão!',
      images: event.coverImageUrl ? [event.coverImageUrl] : [],
    },
  };
}

export default async function PublicEventPage({ params }: Props) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      items: {
        orderBy: { price: 'asc' },
      },
      guestMessages: {
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              pollGuess: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Contagem de votos do bolão
  const [boyVotes, girlVotes] = await Promise.all([
    prisma.pollVote.count({ where: { eventId: event.id, guess: 'BOY' } }),
    prisma.pollVote.count({ where: { eventId: event.id, guess: 'GIRL' } }),
  ]);

  return (
    <PublicEventClient
      event={{
        id: event.id,
        slug: event.slug,
        eventType: event.eventType,
        babyName: event.babyName,
        boyName: event.boyName,
        girlName: event.girlName,
        parentsNames: event.parentsNames,
        eventDate: event.eventDate.toISOString(),
        coverImageUrl: event.coverImageUrl,
        storyMessage: event.storyMessage,
        themeColor: event.themeColor,
        revealedGender: event.revealedGender,
        feePayer: (event.feePayer as 'GUEST' | 'PARENTS') || 'GUEST',
        mpConnected: event.mpConnected,
      }}
      initialItems={event.items}
      initialMessages={event.guestMessages.map((m) => ({
        id: m.id,
        name: m.name,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
        order: m.order,
      }))}
      initialBoyVotes={boyVotes}
      initialGirlVotes={girlVotes}
    />
  );
}
