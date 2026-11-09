/**
 * ============================================================================
 * GERADOR DINÂMICO DE FAVICON (app/icon.tsx)
 * ============================================================================
 * Gera o ícone da marca (32x32) dinamicamente via ImageResponse na Edge Runtime.
 */

import { ImageResponse } from 'next/og';
import { LOGO_DATA_URI } from '@/lib/logo-data';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '7px',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_DATA_URI}
          width="32"
          height="32"
          style={{ objectFit: 'contain' }}
          alt="Fralda Online"
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
