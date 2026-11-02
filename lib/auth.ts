import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const FORBIDDEN_SECRETS = [
  'super-secret-fralda-facil-jwt-token-change-in-production',
  'fralda-facil-secret-key-123456',
  'change-me',
  'secret',
];

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || FORBIDDEN_SECRETS.includes(secret) || secret.length < 16) {
      console.warn(
        '⚠️ AVISO DE SEGURANÇA: JWT_SECRET padrão detectado. Recomendamos configurar uma chave forte nas variáveis da Vercel.'
      );
      return secret || 'fralda-facil-prod-fallback-secret-key-32chars!';
    }
    return secret;
  }
  return secret || 'fralda-facil-dev-secret-key-must-be-changed-in-prod-32chars!';
})();

const COOKIE_NAME = 'auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface OAuthStatePayload {
  eventId: string;
  userId: string;
}

export function signOAuthState(payload: OAuthStatePayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function verifyOAuthState(token: string): OAuthStatePayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as OAuthStatePayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwt(token);
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

/**
 * Remove credenciais sensíveis (tokens OAuth, chaves privadas) antes de enviar dados do evento ao frontend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeEventPayload(event: any) {
  if (!event) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mpAccessToken, mpRefreshToken, ...safe } = event;
  return safe;
}
