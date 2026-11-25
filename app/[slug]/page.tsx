/**
 * ============================================================================
 * PÁGINA PÚBLICA DO CHÁ DE BEBÊ OU REVELAÇÃO (/[slug])
 * ============================================================================
 * A página compartilhada com amigos e família (ex: fralda.online/mariana-e-lucas).
 *
 * Funcionalidades:
 * - Geração dinâmica de metadados OpenGraph (`generateMetadata`) para que,
 *   ao colar o link no WhatsApp, apareça o card com a foto do casal ou a nova
 *   logo oficial da plataforma, título do chá e status de revelação.
 * - Carregamento otimizado de presentes e livro de recados no Server Component.
 * - Suporta 404 instantâneo (`notFound()`) caso o slug não exista.
 */

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
      title: 'Chá de Bebê - Fralda Online',
      robots: { index: false, follow: false },
    };
  }

  let title = `Chá de Bebê de ${event.parentsNames} - Fralda Online`;
  if (event.revealedGender === 'BOY' && (event.boyName || event.babyName)) {
    title = `É Menino! Chá de ${event.boyName || event.babyName} (${event.parentsNames}) - Fralda Online`;
  } else if (event.revealedGender === 'GIRL' && (event.girlName || event.babyName)) {
    title = `É Menina! Chá de ${event.girlName || event.babyName} (${event.parentsNames}) - Fralda Online`;
  } else if (event.boyName && event.girlName) {
    title = `Chá Revelação: ${event.boyName} ou ${event.girlName}? (${event.parentsNames}) - Fralda Online`;
  } else if (event.babyName) {
    title = `Chá de ${event.babyName} (${event.parentsNames}) - Fralda Online`;
  }

  const ogImages = event.coverImageUrl
    ? [
        {
          url: event.coverImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: title,
        },
      ];

  const description =
    event.storyMessage ||
    'Acesse nossa página para ver a lista de presentes de fraldas via Pix e deixar seu recado de carinho!';

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `/${event.slug}`,
      siteName: 'Fralda Online',
      locale: 'pt_BR',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages,
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
        mpPublicKey: event.mpPublicKey,
        raffleEnabled: event.raffleEnabled,
        rafflePrize: event.rafflePrize,
        raffleWinnerName: event.raffleWinnerName,
        raffleWinnerTicket: event.raffleWinnerTicket,
        raffleDrawnAt: event.raffleDrawnAt ? event.raffleDrawnAt.toISOString() : null,
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
