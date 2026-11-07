import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Inicialização/Promoção de Superusuário.
 * 
 * Permite promover um usuário a ADMIN remotamente ou via script
 * mediante fornecimento da chave secreta configurada no ambiente (ADMIN_SETUP_SECRET).
 */
export async function POST(req: NextRequest) {
  try {
    // Bloqueia endpoint remoto em produção por padrão (Princípio do Menor Privilégio e CIS Benchmark)
    // Provisionamento seguro de administradores em produção deve ser feito via CLI no servidor (scripts/create-admin.js)
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_REMOTE_ADMIN_SETUP !== 'true') {
      return NextResponse.json(
        {
          error:
            'Endpoint de setup remoto desativado em produção por política de segurança. Utilize o script CLI oficial no terminal do servidor: node scripts/create-admin.js',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password, name, secretKey } = body;

    const expectedSecret = process.env.ADMIN_SETUP_SECRET;

    if (!expectedSecret || expectedSecret.trim() === '' || !secretKey || typeof secretKey !== 'string') {
      return NextResponse.json(
        { error: 'Chave secreta inválida ou endpoint de setup não configurado.' },
        { status: 401 }
      );
    }

    const bufExpected = Buffer.from(expectedSecret, 'utf8');
    const bufSecret = Buffer.from(secretKey, 'utf8');

    if (bufExpected.length !== bufSecret.length || !crypto.timingSafeEqual(bufExpected, bufSecret)) {
      return NextResponse.json(
        { error: 'Chave secreta inválida ou não autorizada.' },
        { status: 401 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Por favor, informe um e-mail válido.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          role: 'ADMIN',
          ...(password && password.length >= 6 ? { password: await hashPassword(password) } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return NextResponse.json({
        message: `Usuário ${updatedUser.name} (${updatedUser.email}) agora é SUPER ADMINISTRADOR!`,
        user: updatedUser,
      });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Para criar um novo administrador, informe uma senha com no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name: name?.trim() || 'Super Administrador',
        email: normalizedEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: `Super Administrador ${newUser.name} (${newUser.email}) criado com sucesso!`,
      user: newUser,
    });
  } catch (error) {
    console.error('Erro no setup de administrador:', error);
    return NextResponse.json(
      { error: 'Erro ao processar setup de administrador.' },
      { status: 500 }
    );
  }
}
