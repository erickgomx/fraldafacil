import { ImageResponse } from 'next/og';

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
            'radial-gradient(circle at 50% 20%, rgba(197, 160, 89, 0.12), transparent 70%)',
          fontFamily: 'sans-serif',
          padding: '60px 40px',
        }}
      >
        {/* Emblema Ouro Nobre */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '32px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #E6DDCF',
            boxShadow: '0 8px 30px rgba(28, 25, 23, 0.08)',
            marginBottom: '32px',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            width="80"
            height="80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 50, 31 C 43, 21, 29, 23, 24, 34 C 18, 47, 28, 62, 50, 75 C 72, 62, 82, 47, 76, 34 C 71, 23, 57, 21, 50, 31 Z"
              stroke="#C5A059"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 42, 25 C 42, 21, 58, 21, 58, 25 L 57, 34 C 57, 36, 43, 36, 43, 34 Z"
              fill="#1C1917"
              stroke="#1C1917"
              strokeWidth="1.5"
            />
            <circle cx="50" cy="28.5" r="2.2" fill="#FAF7F2" />
            <path d="M 50, 36 L 50, 60" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Nome da Marca */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: '600',
            color: '#1C1917',
            letterSpacing: '-0.03em',
            marginBottom: '12px',
          }}
        >
          Fralda Online
        </div>

        {/* Subtítulo Tagline */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#C5A059',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            marginBottom: '24px',
          }}
        >
          Chá de Bebê, Fralda &amp; Revelação
        </div>

        {/* Descrição de Valor */}
        <div
          style={{
            fontSize: '24px',
            color: '#57534E',
            maxWidth: '800px',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          A plataforma elegante para receber fraldas em dinheiro via Pix e engajar amigos e familiares com o bolão.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
