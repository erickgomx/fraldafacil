import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decodePasswordResetToken, verifyPasswordResetToken, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token de recuperação inválido ou não fornecido.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve conter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // 1. Decodifica para obter o ID do usuário
    const decoded = decodePasswordResetToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'O link de recuperação é inválido ou já expirou. Por favor, solicite um novo link.' },
        { status: 400 }
      );
    }

    // 2. Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Conta de usuário não encontrada.' },
        { status: 404 }
      );
    }

    // 3. Valida se o token ainda é válido com base no hash da senha atual
    const verified = verifyPasswordResetToken(token, user.password);
    if (!verified) {
      return NextResponse.json(
        {
          error:
            'Este link de recuperação expirou ou já foi utilizado para alterar a senha. Solicite uma nova recuperação se necessário.',
        },
        { status: 400 }
      );
    }

    // 4. Criptografa a nova senha com bcrypt (10 rounds)
    const newHashedPassword = await hashPassword(password);

    // 5. Atualiza no banco de dados
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHashedPassword },
    });

    console.log(`[Fralda Online] Senha redefinida com sucesso para o usuário: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode fazer login na sua conta.',
    });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao atualizar sua senha. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
