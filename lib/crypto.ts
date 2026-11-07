import crypto from 'crypto';

/**
 * Módulo de Criptografia Simétrica Autenticada (AES-256-GCM)
 * Protege tokens OAuth de terceiros (Mercado Pago access/refresh tokens) em repouso no banco de dados.
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

  const keySource = encKey || jwtSecret || 'fralda-facil-fallback-encryption-key-dev-only';
  // Deriva exatamente 32 bytes para AES-256 usando SHA-256
  return crypto.createHash('sha256').update(keySource).digest();
}

const IV_LENGTH = 12; // 96 bits recomendado para GCM

export function encryptSecret(plainText: string | null | undefined): string | null {
  if (!plainText || plainText.trim() === '') return null;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Formato: iv:authTag:cipherHex
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar segredo:', error);
    throw new Error('Falha na proteção criptográfica de credenciais.');
  }
}

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
    // Se a decifragem falhar (ex: string contendo dois pontos que não é cifra), retorna null ou texto bruto
    console.error('Falha ao decifrar token:', error);
    return null;
  }
}
