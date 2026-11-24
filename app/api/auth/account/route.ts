import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, comparePassword, getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deleteCoverFromSupabaseByUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * Exclui definitivamente a conta do organizador e todos os dados vinculados (LGPD Art. 18),
 * mediante confirmação da senha atual.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { password?: string };
    const password = body?.password;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Informe sua senha atual para confirmar o encerramento da conta.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        events: {
          select: { coverImageUrl: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Senha incorreta. Não foi possível encerrar a conta.' },
        { status: 403 }
      );
    }

    if (user.events.length > 0) {
      await Promise.allSettled(
        user.events.map((ev) => deleteCoverFromSupabaseByUrl(ev.coverImageUrl))
      );
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Sua conta e seus eventos foram excluídos permanentemente.',
    });

    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Erro ao excluir conta do usuário:', error);
    return NextResponse.json(
      { error: 'Não foi possível excluir sua conta no momento.' },
      { status: 500 }
    );
  }
}
