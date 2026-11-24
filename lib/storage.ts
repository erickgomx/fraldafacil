/**
 * ============================================================================
 * INTEGRAÇÃO COM SUPABASE STORAGE (Upload Seguro de Foto de Capa)
 * ============================================================================
 * Realiza upload, validação de cabeçalho binário (magic bytes) e remoção
 * de fotos de capa do evento diretamente no bucket público configurado (`capas`)
 * usando a chave administrativa do servidor (`SUPABASE_SERVICE_ROLE_KEY`).
 */

import { randomUUID } from 'crypto';

export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

export interface MagicBytesValidationResult {
  valid: boolean;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
  ext?: 'jpg' | 'png' | 'webp';
}

export function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .trim()
    .replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const bucket = (process.env.SUPABASE_COVERS_BUCKET || 'capas').trim() || 'capas';

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey, bucket };
}

/**
 * Valida a assinatura binária real do arquivo (magic bytes) para impedir
 * envio de HTML, SVG, scripts ou executáveis disfarçados de imagem.
 */
export function validateImageMagicBytes(buffer: Buffer): MagicBytesValidationResult {
  if (!buffer || buffer.length < 12) {
    return { valid: false };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg', ext: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png', ext: 'png' };
  }

  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, mimeType: 'image/webp', ext: 'webp' };
  }

  return { valid: false };
}

export async function uploadCoverToSupabase(params: {
  eventId: string;
  buffer: Buffer;
  contentType: string;
  ext: string;
}): Promise<{ publicUrl: string }> {
  const config = getSupabaseStorageConfig();
  if (!config) {
    throw new Error('Configuração do Supabase Storage ausente no servidor.');
  }

  const safeEventId = params.eventId.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeExt = params.ext.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const objectPath = `${safeEventId}/${Date.now()}-${randomUUID().slice(0, 8)}.${safeExt}`;

  const uploadUrl = `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${objectPath}`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      apikey: config.serviceRoleKey,
      'Content-Type': params.contentType,
      'x-upsert': 'true',
      'cache-control': '31536000',
    },
    body: new Uint8Array(params.buffer),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `Falha ao enviar imagem para o Supabase Storage (HTTP ${res.status}): ${errText.slice(0, 200)}`
    );
  }

  const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${objectPath}`;
  return { publicUrl };
}

export async function deleteCoverFromSupabaseByUrl(
  coverImageUrl: string | null | undefined
): Promise<void> {
  if (!coverImageUrl) return;

  const config = getSupabaseStorageConfig();
  if (!config) return;

  const publicPrefix = `${config.url}/storage/v1/object/public/${config.bucket}/`;
  if (!coverImageUrl.startsWith(publicPrefix)) {
    return;
  }

  const objectPath = coverImageUrl.slice(publicPrefix.length).split('?')[0];
  if (!objectPath) return;

  try {
    const encodedPath = objectPath
      .split('/')
      .filter(Boolean)
      .map((seg) => encodeURIComponent(seg))
      .join('/');

    await fetch(
      `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodedPath}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${config.serviceRoleKey}`,
          apikey: config.serviceRoleKey,
        },
        cache: 'no-store',
      }
    );
  } catch (err) {
    console.warn('[Supabase Storage] Falha não bloqueante ao remover capa antiga:', err);
  }
}
