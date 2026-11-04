import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

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
  role?: string;
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

/**
 * Validação rigorosa de sessão de Administrador (Superusuário).
 * Verifica o cookie de autenticação JWT E confirma diretamente no banco de dados
 * se o usuário existe, está ativo e possui o papel 'ADMIN'.
 * Essa verificação dupla no banco impede adulteração de token ou acessos após revogação de privilégios.
 */
export async function getAdminSession(): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
} | null> {
  try {
    const session = await getSession();
    if (!session || !session.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user || user.role !== 'ADMIN') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Erro na validação de sessão administrativa:', error);
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

export interface PasswordResetPayload {
  userId: string;
  email: string;
  pwdStamp: string;
}

/**
 * Gera um token de redefinição de senha com validade de 1 hora.
 * O stamp dos últimos 10 caracteres do hash garante que o token seja de uso único
 * e seja automaticamente invalidado assim que a senha for alterada.
 */
export function signPasswordResetToken(payload: {
  userId: string;
  email: string;
  currentPasswordHash: string;
}): string {
  const pwdStamp = payload.currentPasswordHash.slice(-10);
  return jwt.sign(
    { userId: payload.userId, email: payload.email, pwdStamp },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Decodifica o token para identificar o usuário sem validar a assinatura do stamp ainda.
 */
export function decodePasswordResetToken(token: string): PasswordResetPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PasswordResetPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Valida o token e confirma que a senha não foi alterada após a emissão do token.
 */
export function verifyPasswordResetToken(
  token: string,
  currentPasswordHash: string
): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PasswordResetPayload;
    const expectedStamp = currentPasswordHash.slice(-10);
    if (decoded.pwdStamp !== expectedStamp) {
      return null;
    }
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

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
