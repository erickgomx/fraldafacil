import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, verifyOAuthState } from '@/lib/auth';
import { encryptSecret } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

/**
 * Callback oficial do OAuth 2.0 do Mercado Pago.
 * Recebe o authorization `code`, troca por `access_token` e salva na conta do evento.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code || !state) {
    console.error('Erro retornado pelo OAuth Mercado Pago:', error);
    return NextResponse.redirect(
      new URL('/painel/configuracoes?error=oauth_rejected', appUrl)
    );
  }

  try {
    // 1. Validação Criptográfica do State (Assinado via JWT com expiração de 15 min)
    const parsedState = verifyOAuthState(state);
    if (!parsedState) {
      console.error('State inválido ou expirado no callback OAuth.');
      return NextResponse.redirect(
        new URL('/painel/configuracoes?error=invalid_or_expired_state', appUrl)
      );
    }

    const { eventId, userId } = parsedState;

    // 2. Validação da Sessão do Usuário
    const session = await getSession();
    if (!session || session.userId !== userId) {
      console.error('Sessão ativa não corresponde ao iniciador do OAuth.');
      return NextResponse.redirect(
        new URL('/painel/configuracoes?error=unauthorized_session', appUrl)
      );
    }

    // 3. Garante que o evento pertence ao usuário antes de salvar
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.userId },
    });

    if (!event) {
      return NextResponse.redirect(
        new URL('/painel/configuracoes?error=event_not_found', appUrl)
      );
    }

    const clientId = process.env.MERCADO_PAGO_CLIENT_ID || process.env.NEXT_PUBLIC_MP_CLIENT_ID;
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/auth/mercadopago/callback`;

    // Troca o authorization code pelo access token permanente do vendedor
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: new URLSearchParams({
        client_secret: clientSecret || '',
        client_id: clientId || '',
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Erro na troca do token Mercado Pago:', tokenData);
      return NextResponse.redirect(
        new URL('/painel/configuracoes?error=token_exchange', appUrl)
      );
    }

    // Salva o token criptografado do vendedor vinculado ao Chá com validação de propriedade
    await prisma.event.update({
      where: { id: event.id },
      data: {
        mpAccessToken: encryptSecret(tokenData.access_token),
        mpRefreshToken: encryptSecret(tokenData.refresh_token),
        mpPublicKey: tokenData.public_key || null,
        mpUserId: String(tokenData.user_id || ''),
        mpConnected: true,
      },
    });

    return NextResponse.redirect(
      new URL('/painel/configuracoes?oauth_success=true', appUrl)
    );
  } catch (err) {
    console.error('Erro no processamento do callback Mercado Pago:', err);
    return NextResponse.redirect(
      new URL('/painel/configuracoes?error=server_oauth', appUrl)
    );
  }
}
