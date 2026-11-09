/**
 * ============================================================================
 * GERADOR DINÂMICO DE CARD OPEN GRAPH (app/opengraph-image.tsx)
 * ============================================================================
 * Gera a imagem oficial de 1200x630 pixels com a nova logo do Fralda Online,
 * exibida nos compartilhamentos em redes sociais e mensageiros como WhatsApp,
 * Telegram, Facebook e Twitter.
 */

import { ImageResponse } from 'next/og';
import { LOGO_DATA_URI } from '@/lib/logo-data';

export const runtime = 'edge';
export const alt = 'Fralda Online - Chá de Bebê, Fralda & Revelação com Pix';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F2',
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(197, 160, 89, 0.16), transparent 70%)',
          fontFamily: 'sans-serif',
          padding: '60px 40px',
          position: 'relative',
        }}
      >
        {/* Moldura sutil decorativa */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            bottom: '24px',
            left: '24px',
            right: '24px',
            border: '1px solid rgba(197, 160, 89, 0.28)',
            borderRadius: '24px',
          }}
        />

        {/* Emblema Oficial com a Nova Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '150px',
            height: '150px',
            borderRadius: '38px',
            backgroundColor: '#FFFFFF',
            border: '2px solid rgba(229, 231, 235, 0.9)',
            boxShadow: '0 16px 45px rgba(28, 25, 23, 0.08)',
            marginBottom: '24px',
            overflow: 'hidden',
            padding: '12px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_DATA_URI}
            width="126"
            height="126"
            style={{ objectFit: 'contain' }}
            alt="Fralda Online"
          />
        </div>

        {/* Nome da Marca */}
        <div
          style={{
            fontSize: '66px',
            fontWeight: '700',
            color: '#1C1917',
            letterSpacing: '-0.03em',
            marginBottom: '10px',
            lineHeight: 1,
          }}
        >
          Fralda Online
        </div>

        {/* Subtítulo Tagline em Pill Dourada */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            fontWeight: '700',
            color: '#9A7328',
            backgroundColor: 'rgba(197, 160, 89, 0.14)',
            border: '1px solid rgba(197, 160, 89, 0.3)',
            borderRadius: '9999px',
            padding: '6px 22px',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            marginBottom: '22px',
          }}
        >
          Chá de Bebê • Fralda • Revelação
        </div>

        {/* Descrição de Valor Afetuosa */}
        <div
          style={{
            fontSize: '23px',
            color: '#57534E',
            maxWidth: '820px',
            textAlign: 'center',
            lineHeight: 1.45,
            marginBottom: '32px',
          }}
        >
          A plataforma elegante para receber presentes em dinheiro via Pix e engajar amigos e familiares com o bolão do bebê.
        </div>

        {/* Badges de Destaque */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E5E4',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#292524',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span>⚡</span>
            <span>Pix Direto na Conta</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E5E4',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#292524',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span>🎉</span>
            <span>Bolão Menino ou Menina</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E5E4',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#292524',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span>💌</span>
            <span>Mural de Recados</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
