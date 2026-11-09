/**
 * ============================================================================
 * GERADOR DINÂMICO DE ÍCONE APPLE TOUCH (app/apple-icon.tsx)
 * ============================================================================
 * Gera a imagem oficial de 180x180 para dispositivos Apple (iOS / Safari)
 * via ImageResponse na Edge Runtime.
 */

import { ImageResponse } from 'next/og';
import { LOGO_DATA_URI } from '@/lib/logo-data';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '40px',
          overflow: 'hidden',
          padding: '12px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_DATA_URI}
          width="156"
          height="156"
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
