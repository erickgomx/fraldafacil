import { ImageResponse } from 'next/og';

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
          backgroundColor: '#FAF7F2',
          borderRadius: '8px',
          border: '1.5px solid #E6DDCF',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="24"
          height="24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Arco do Coração Dourado */}
          <path
            d="M 50, 31 C 43, 21, 29, 23, 24, 34 C 18, 47, 28, 62, 50, 75 C 72, 62, 82, 47, 76, 34 C 71, 23, 57, 21, 50, 31 Z"
            stroke="#C5A059"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Fecho Superior do Alfinete */}
          <path
            d="M 40, 24 C 40, 19, 60, 19, 60, 24 L 59, 34 C 59, 36, 41, 36, 41, 34 Z"
            fill="#1C1917"
          />
          {/* Ponto de Luz / Pérola */}
          <circle cx="50" cy="27.5" r="2.5" fill="#FAF7F2" />
          {/* Haste do Alfinete */}
          <path d="M 50, 34 L 50, 60" stroke="#1C1917" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
