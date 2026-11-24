import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signJwt, AUTH_COOKIE_NAME, sanitizeEventPayload } from '@/lib/auth';
import { DEFAULT_GIFT_ITEMS } from '@/lib/default-gifts';
import { sendWelcomeEventEmail } from '@/lib/email';
import {
  isValidEmail,
  isValidEventType,
  parseEventDateInput,
  sanitizeSlug,
  validateSlug,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      confirmPassword,
      slug: rawSlug,
      eventType = 'REVELACAO',
      noNameYet = false,
      babyName,
      boyName,
      girlName,
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

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'As senhas digitadas não coincidem.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    if (!isValidEventType(eventType)) {
      return NextResponse.json(
        { error: 'Modalidade de evento inválida.' },
        { status: 400 }
      );
    }

    const slug = sanitizeSlug(rawSlug);
    const slugCheck = validateSlug(slug);
    if (!slugCheck.valid) {
      return NextResponse.json(
        { error: slugCheck.error || 'Por favor, informe um link válido para o evento.' },
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
    let parsedEventDate: Date;
    if (eventDate !== undefined && eventDate !== null && String(eventDate).trim() !== '') {
      const parsed = parseEventDateInput(eventDate);
      if (!parsed) {
        return NextResponse.json({ error: 'Data do evento inválida.' }, { status: 400 });
      }
      parsedEventDate = parsed;
    } else {
      const defaultDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      parsedEventDate = parseEventDateInput(defaultDateStr)!;
    }

    let resolvedBabyName: string | null = null;
    let resolvedBoyName: string | null = null;
    let resolvedGirlName: string | null = null;

    if (!noNameYet) {
      resolvedBoyName = boyName?.trim() || null;
      resolvedGirlName = girlName?.trim() || null;

      if (babyName?.trim()) {
        resolvedBabyName = babyName.trim();
      } else if (resolvedBoyName && resolvedGirlName) {
        resolvedBabyName = `${resolvedBoyName} ou ${resolvedGirlName}`;
      } else if (resolvedBoyName) {
        resolvedBabyName = resolvedBoyName;
      } else if (resolvedGirlName) {
        resolvedBabyName = resolvedGirlName;
      }
    }

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
            babyName: resolvedBabyName,
            boyName: resolvedBoyName,
            girlName: resolvedGirlName,
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

    const token = signJwt({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tokenVersion: newUser.tokenVersion,
    });

    await sendWelcomeEventEmail({
      to: newUser.email,
      parentsName: newUser.name,
      slug,
      babyName: resolvedBabyName,
    }).catch((err) => {
      console.warn('[Welcome Email] Falha não bloqueante no envio de boas-vindas:', err);
    });

    const response = NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        event: sanitizeEventPayload(newUser.events[0]),
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
  } catch (error: unknown) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Não foi possível completar o cadastro. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
