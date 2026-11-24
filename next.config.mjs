/**
 * ⚙️ Configuração Principal do Next.js (next.config.mjs)
 *
 * Define políticas de segurança HTTP avançadas para o Fralda Online:
 * - Content-Security-Policy (CSP) com permissões restritas e compatíveis com o SDK do Mercado Pago
 * - Anti-Clickjacking (X-Frame-Options: DENY, frame-ancestors 'none')
 * - Anti-MIME-sniffing (X-Content-Type-Options: nosniff)
 * - HSTS com max-age estrito de 2 anos (somente em produção HTTPS)
 * - Headers de cache estático e otimização de imagens externas (Unsplash / Mercado Pago CDN)
 */
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Em desenvolvimento (localhost), não forçamos HTTPS (upgrade-insecure-requests)
// e liberamos conexões WebSocket (ws: wss:) para o Hot Reload do Next.js funcionar suavemente.
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://http2.mlstatic.com https://secure.mlstatic.com https://*.mercadopago.com https://*.mercadolibre.com ${isProd ? '' : "'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://http2.mlstatic.com https://secure.mlstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://http2.mlstatic.com https://*.mlstatic.com https://*.mercadopago.com",
  "font-src 'self' data: https://fonts.gstatic.com https://http2.mlstatic.com",
  `connect-src 'self' https://api.mercadopago.com https://events.mercadopago.com https://api.mercadolibre.com https://*.mercadopago.com https://*.mercadopago.com.br https://*.mlstatic.com ${isProd ? '' : 'ws: wss: http: http://localhost:* ws://localhost:*'}`,
  "frame-src 'self' https://sdk.mercadopago.com https://*.mercadopago.com https://*.mercadopago.com.br https://*.mlstatic.com",
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
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
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
