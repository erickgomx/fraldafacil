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
        {/* Emblema Oficial Fralda Online */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '128px',
            height: '128px',
            borderRadius: '32px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #E5E7EB',
            boxShadow: '0 8px 30px rgba(28, 25, 23, 0.08)',
            marginBottom: '32px',
            overflow: 'hidden',
            padding: '10px',
          }}
        >
          <svg
            viewBox="0 0 500 500"
            width="108"
            height="108"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="og-globe-clip">
                <circle cx="0" cy="95" r="75" />
              </clipPath>
            </defs>

            <g transform="translate(250, 250) rotate(45)">
              <path
                d="M -30,-45 C -45,-80 -55,-130 0,-155 C 55,-130 45,-80 30,-45 Z"
                fill="#FFFFFF"
                stroke="#111111"
                strokeWidth="16"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M -12,-140 C -26,-125 -28,-105 -24,-90"
                fill="none"
                stroke="#111111"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <rect
                x="-95"
                y="-45"
                width="190"
                height="46"
                rx="23"
                fill="#D1D5DB"
                stroke="#111111"
                strokeWidth="16"
                strokeLinejoin="round"
              />
              <rect
                x="-24"
                y="0"
                width="48"
                height="28"
                rx="6"
                fill="#6B7280"
                stroke="#111111"
                strokeWidth="14"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="95" r="85" fill="none" stroke="#111111" strokeWidth="14" />
              <circle cx="0" cy="95" r="75" fill="#FFFFFF" stroke="#111111" strokeWidth="14" />
              <g clipPath="url(#og-globe-clip)" stroke="#111111" strokeWidth="10" fill="none">
                <line x1="0" y1="20" x2="0" y2="170" />
                <line x1="-75" y1="95" x2="75" y2="95" />
                <line x1="-65" y1="65" x2="65" y2="65" />
                <line x1="-65" y1="125" x2="65" y2="125" />
                <ellipse cx="0" cy="95" rx="42" ry="75" />
              </g>
              <path
                d="M -68,148 A 86 86 0 0 0 25,180"
                fill="none"
                stroke="#111111"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </g>
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
