import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signPasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Resposta uniforme contra enumeração de contas de usuários (OWASP Top 10)
      return NextResponse.json({
        success: true,
        message: 'Se este endereço estiver cadastrado, você receberá um link seguro de recuperação em instantes.',
      });
    }

    const token = signPasswordResetToken({
      userId: user.id,
      email: user.email,
      currentPasswordHash: user.password,
    });

    const defaultBase = 'https://fralda.online';
    const envBase = process.env.NEXT_PUBLIC_APP_URL;
    const baseUrl =
      envBase && !envBase.includes('localhost') && !envBase.includes('vercel.app')
        ? envBase
        : defaultBase;

    // Se for local dev ou teste, preserva a origem local para conseguir clicar
    const hostHeader = req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const requestOrigin = hostHeader ? `${proto}://${hostHeader}` : baseUrl;

    const finalBase = process.env.NODE_ENV === 'production' ? baseUrl : requestOrigin;
    const resetLink = `${finalBase.replace(/\/$/, '')}/redefinir-senha?token=${encodeURIComponent(token)}`;

    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetLink,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error:
            emailResult.error ||
            'Não foi possível enviar o e-mail no momento. Tente novamente em instantes.',
        },
        { status: 502 }
      );
    }

    let devResetUrl: string | undefined;
    if (process.env.NODE_ENV !== 'production') {
      devResetUrl = resetLink;
    }

    return NextResponse.json({
      success: true,
      message: 'Enviamos as instruções e o link seguro de recuperação para o seu e-mail.',
      ...(devResetUrl ? { devResetUrl } : {}),
    });
  } catch (err) {
    console.error('Erro na solicitação de recuperação de senha:', err);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
