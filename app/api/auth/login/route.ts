import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signJwt, AUTH_COOKIE_NAME, sanitizeEventPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Por favor, informe e-mail e senha.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'E-mail ou senha inválidos.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'E-mail ou senha inválidos.' },
        { status: 401 }
      );
    }

    const token = signJwt({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      event: sanitizeEventPayload(user.events[0]),
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar o login. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
