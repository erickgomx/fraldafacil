import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: A variável de ambiente JWT_SECRET é obrigatória em produção.');
  }
  return 'fralda-facil-secret-key-123456';
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
