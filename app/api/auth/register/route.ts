import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signJwt, AUTH_COOKIE_NAME } from '@/lib/auth';
import { DEFAULT_GIFT_ITEMS } from '@/lib/default-gifts';

export const dynamic = 'force-dynamic';

function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      slug: rawSlug,
      eventType = 'REVELACAO',
      babyName,
      eventDate,
    } = body;

    if (!name || !email || !password || !rawSlug) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const slug = sanitizeSlug(rawSlug);

    if (!slug) {
      return NextResponse.json(
        { error: 'Por favor, informe um link válido para o evento.' },
        { status: 400 }
      );
    }

    // Verifica se já existe usuário com esse e-mail
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado. Faça login ou utilize outro.' },
        { status: 409 }
      );
    }

    // Verifica se o slug já está em uso
    const existingEvent = await prisma.event.findUnique({
      where: { slug },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: `O link "${slug}" já está em uso. Por favor, escolha outro link.` },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const parsedEventDate = eventDate ? new Date(eventDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Criação atômica do usuário, evento e presentes padrão
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        events: {
          create: {
            slug,
            eventType,
            babyName: babyName?.trim() || null,
            parentsNames: name.trim(),
            eventDate: parsedEventDate,
            themeColor: '#38BDF8',
            storyMessage: 'Estamos muito felizes e ansiosos pela chegada do nosso maior tesouro! Criamos esta página com muito amor para compartilhar esse momento mágico com você.',
            items: {
              create: DEFAULT_GIFT_ITEMS.map((item) => ({
                title: item.title,
                description: item.description,
                price: item.price,
                imageUrl: item.imageUrl,
                category: item.category,
                active: true,
              })),
            },
          },
        },
      },
      include: {
        events: true,
      },
    });

    const token = signJwt({ userId: newUser.id, email: newUser.email });

    const response = NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        event: newUser.events[0],
      },
      { status: 201 }
    );

    // Salva o cookie de sessão
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao criar sua conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
