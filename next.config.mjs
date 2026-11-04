/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Em desenvolvimento (localhost), não forçamos HTTPS (upgrade-insecure-requests)
// e liberamos conexões WebSocket (ws: wss:) para o Hot Reload do Next.js funcionar suavemente.
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://http2.mlstatic.com ${isProd ? '' : "'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://http2.mlstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' https://api.mercadopago.com https://events.mercadopago.com ${isProd ? '' : 'ws: wss: http: http://localhost:* ws://localhost:*'}`,
  "frame-src 'self' https://sdk.mercadopago.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://auth.mercadopago.com.br",
  "frame-ancestors 'none'",
  ...(isProd ? ['block-all-mixed-content', 'upgrade-insecure-requests'] : []),
];

const cspHeader = cspDirectives.join('; ').replace(/\s{2,}/g, ' ').trim();

const baseHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

// HSTS (Strict-Transport-Security) só deve ser enviado em produção HTTPS, nunca em localhost HTTP
if (isProd) {
  baseHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: baseHeaders,
      },
    ];
  },
};

export default nextConfig;
