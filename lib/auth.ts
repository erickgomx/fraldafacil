/**
 * ============================================================================
 * MÓDULO DE AUTENTICAÇÃO E SESSÕES (Fralda Online)
 * ============================================================================
 * Centraliza o controle de segurança, emissão/validação de tokens JWT,
 * verificação de senhas com bcrypt e revogação de acessos via tokenVersion.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Lista de senhas/chaves fracas conhecidas que são bloqueadas em produção para garantir a segurança dos usuários
const FORBIDDEN_SECRETS = [
  'super-secret-fralda-facil-jwt-token-change-in-production',
  'fralda-facil-secret-key-123456',
  'change-me',
  'secret',
  'fralda-facil-prod-fallback-secret-key-32chars!',
  'fralda-facil-dev-secret-key-must-be-changed-in-prod-32chars!',
  'gere_um_segredo_criptografico_forte_com_openssl_rand_hex_32',
];

// Carrega e valida o segredo do JWT. Em ambiente de produção, exige um segredo forte com no mínimo 32 caracteres
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || FORBIDDEN_SECRETS.includes(secret) || secret.length < 32) {
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        return 'temp-build-only-secret-key-must-be-provided-at-runtime-32chars!';
      }
      throw new Error(
        'FATAL: A variável JWT_SECRET deve estar configurada nas variáveis de ambiente com no mínimo 32 caracteres seguros.'
      );
    }
    return secret;
  }
  return secret || 'fralda-facil-dev-secret-key-must-be-changed-in-prod-32chars!';
})();

// Nome padrão do cookie seguro de autenticação HTTP-Only
const COOKIE_NAME = 'auth_token';

// Estrutura do payload gravado dentro do token JWT do usuário autenticado
export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  tokenVersion?: number;
}

// Estrutura do estado temporário usado na autorização OAuth do Mercado Pago
export interface OAuthStatePayload {
  eventId: string;
  userId: string;
}

/**
 * Assina o token de estado temporário para o fluxo de autorização OAuth do Mercado Pago.
 * Tem validade de 15 minutos para evitar ataques de repetição ou falsificação de requisição (CSRF).
 */
export function signOAuthState(payload: OAuthStatePayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Valida o estado OAuth retornado pelo Mercado Pago no callback.
 * Retorna os dados se a assinatura for válida ou null caso tenha expirado ou sido adulterada.
 */
export function verifyOAuthState(token: string): OAuthStatePayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as OAuthStatePayload;
  } catch {
    return null;
  }
}

/**
 * Gera o hash criptográfico unidirecional seguro da senha do usuário com 10 rounds de salt via bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compara uma senha digitada em texto puro com o hash criptografado armazenado no banco de dados.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Emite um token JWT de sessão autenticada com validade de 7 dias para o usuário logado.
 */
export function signJwt(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Valida a integridade e a assinatura de um JWT emitido pela plataforma.
 */
export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Recupera e valida a sessão do usuário atual a partir dos cookies HTTP da requisição.
 * Se o token possuir controle de versão (tokenVersion), checa no banco de dados se a sessão ainda é válida,
 * permitindo revogação instantânea de sessões quando a senha é trocada.
 */
export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyJwt(token);
    if (!payload || !payload.userId) return null;

    // Se o token contém tokenVersion, valida contra o banco para garantir que a sessão não foi revogada
    if (typeof payload.tokenVersion === 'number') {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { tokenVersion: true },
      });
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        return null;
      }
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Incrementa o tokenVersion do usuário no banco de dados.
 * Invalida instantaneamente todos os JWTs ativos anteriormente em qualquer dispositivo/navegador.
 */
export async function revokeUserSessions(userId: string): Promise<number> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });
  return updated.tokenVersion;
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

// Exporta o nome padrão do cookie para uso compartilhado em rotas de login e logout
export const AUTH_COOKIE_NAME = COOKIE_NAME;

// Dados que compõem o payload do token de redefinição de senha
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
