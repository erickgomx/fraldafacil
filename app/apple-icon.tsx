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
          backgroundColor: '#FFFFFF',
          borderRadius: '40px',
          border: '4px solid #E5E7EB',
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        <svg
          viewBox="0 0 500 500"
          width="148"
          height="148"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="apple-globe-clip">
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
            <g clipPath="url(#apple-globe-clip)" stroke="#111111" strokeWidth="10" fill="none">
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
    ),
    {
      ...size,
    }
  );
}
