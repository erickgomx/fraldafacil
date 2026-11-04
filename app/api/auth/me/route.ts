import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      events: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          eventType: true,
          babyName: true,
          parentsNames: true,
          eventDate: true,
          coverImageUrl: true,
          storyMessage: true,
          themeColor: true,
          revealedGender: true,
          pixKey: true,
          mpConnected: true,
          feePayer: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user, currentEvent: user.events[0] || null });
}
