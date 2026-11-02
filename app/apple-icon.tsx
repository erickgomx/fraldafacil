import { ImageResponse } from 'next/og';

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
          backgroundColor: '#FAF7F2',
          borderRadius: '40px',
          border: '4px solid #E6DDCF',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="130"
          height="130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Arco do Coração Dourado */}
          <path
            d="M 50, 31 C 43, 21, 29, 23, 24, 34 C 18, 47, 28, 62, 50, 75 C 72, 62, 82, 47, 76, 34 C 71, 23, 57, 21, 50, 31 Z"
            stroke="#C5A059"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Fecho Superior do Alfinete */}
          <path
            d="M 41, 24 C 41, 19, 59, 19, 59, 24 L 58, 34 C 58, 36, 42, 36, 42, 34 Z"
            fill="#1C1917"
            stroke="#1C1917"
            strokeWidth="2"
          />
          {/* Pérola central */}
          <circle cx="50" cy="27.5" r="3" fill="#FAF7F2" />
          {/* Haste do Alfinete */}
          <path d="M 50, 35 L 50, 60" stroke="#1C1917" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
