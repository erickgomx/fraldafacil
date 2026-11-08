/**
 * ============================================================================
 * MÓDULO DE CRIPTOGRAFIA SIMÉTRICA AUTENTICADA (AES-256-GCM)
 * ============================================================================
 * Este módulo protege dados altamente sensíveis em repouso no banco de dados,
 * especificamente os tokens de acesso e de atualização (access/refresh tokens)
 * obtidos via OAuth do Mercado Pago.
 *
 * Por que AES-256-GCM?
 * - O modo GCM (Galois/Counter Mode) oferece confidencialidade e integridade simultâneas.
 * - Utiliza uma authentication tag (authTag) de 128 bits que garante que o texto cifrado
 *   não foi adulterado ou corrompido no banco.
 * - Cada operação de cifra utiliza um vetor de inicialização (IV) aleatório de 96 bits.
 */

import crypto from 'crypto';

/**
 * Obtém ou deriva a chave mestra de criptografia com tamanho exato de 256 bits (32 bytes).
 * Em ambiente de produção, valida o princípio de segregação criptográfica (NIST SP 800-57),
 * garantindo que a chave de dados não seja a mesma do segredo JWT.
 */
function getEncryptionKey(): Buffer {
  const encKey = process.env.DATA_ENCRYPTION_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    if (!encKey || encKey.trim() === '' || encKey.length < 32) {
      throw new Error(
        'FATAL SECURITY: A variável DATA_ENCRYPTION_KEY dedicada (mínimo 32 caracteres) é estritamente obrigatória em produção.'
      );
    }
    if (jwtSecret && encKey === jwtSecret) {
      throw new Error(
        'FATAL SECURITY: DATA_ENCRYPTION_KEY não pode ser idêntica a JWT_SECRET (violação do princípio de isolamento criptográfico NIST SP 800-57).'
      );
    }
  }

  // Fonte da chave com fallback seguro apenas para desenvolvimento local
  const keySource = encKey || jwtSecret || 'fralda-facil-fallback-encryption-key-dev-only';
  // Deriva exatamente 32 bytes para AES-256 usando SHA-256
  return crypto.createHash('sha256').update(keySource).digest();
}

// Tamanho recomendado para o vetor de inicialização (IV) no algoritmo GCM: 12 bytes (96 bits)
const IV_LENGTH = 12;

/**
 * Criptografa uma string em texto claro usando AES-256-GCM.
 * Retorna uma string compacta contendo: "ivHex:authTagHex:encryptedHex".
 * Se o valor for vazio ou nulo, retorna null com segurança.
 */
export function encryptSecret(plainText: string | null | undefined): string | null {
  if (!plainText || plainText.trim() === '') return null;

  try {
    const key = getEncryptionKey();
    // Gera 12 bytes aleatórios e imprevisíveis para o IV
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Formato de armazenamento seguro: iv:authTag:cipherHex
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar segredo:', error);
    throw new Error('Falha na proteção criptográfica de credenciais.');
  }
}

/**
 * Decifra uma string protegida no formato "ivHex:authTagHex:encryptedHex".
 * Se o dado for texto simples legado (sem separadores ':'), retorna o dado como está,
 * facilitando compatibilidade e migrações transparentes sem quebrar o sistema.
 */
export function decryptSecret(cipherText: string | null | undefined): string | null {
  if (!cipherText || cipherText.trim() === '') return null;

  // Se o dado não estiver no formato criptografado (ex: legado em texto claro), retorna com segurança
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    return cipherText;
  }

  try {
    const [ivHex, authTagHex, encrypted] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // Se a decifragem falhar (ex: string contendo dois pontos que não é cifra), retorna null com log amigável
    console.error('Falha ao decifrar token:', error);
    return null;
  }
}
