import { NextRequest, NextResponse } from 'next/server';
import { getSession, signOAuthState } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Inicia o fluxo de autorização OAuth 2.0 do Mercado Pago.
 * Redireciona o vendedor (pais) para a página oficial de consentimento do MP.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    // Busca o evento do usuário autenticado
    const event = await prisma.event.findFirst({
      where: {
        userId: session.userId,
        ...(eventId ? { id: eventId } : {}),
      },
    });

    if (!event) {
      return NextResponse.redirect(new URL('/painel', req.url));
    }

    const clientId = process.env.MERCADO_PAGO_CLIENT_ID || process.env.NEXT_PUBLIC_MP_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/mercadopago/callback`;

    // Se as credenciais ainda não estiverem configuradas no ambiente, permite simulação assistida
    if (!clientId || clientId.trim() === '') {
      return NextResponse.redirect(
        new URL(`/painel/configuracoes?oauth_simulated=ready&eventId=${event.id}`, req.url)
      );
    }

    // O state é assinado criptograficamente com JWT (expira em 15m) contra ataques de CSRF
    const state = signOAuthState({
      eventId: event.id,
      userId: session.userId,
    });

    const authUrl = new URL('https://auth.mercadopago.com.br/authorization');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('platform_id', 'mp');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', redirectUri);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Erro ao iniciar OAuth Mercado Pago:', error);
    return NextResponse.redirect(new URL('/painel/configuracoes?error=oauth_init', req.url));
  }
}
