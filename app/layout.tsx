/**
 * ============================================================================
 * LAYOUT RAIZ DA APLICAÇÃO (RootLayout)
 * ============================================================================
 * Estrutura base de todas as páginas da plataforma Fralda Online:
 * - Carregamento otimizado de tipografia do Google Fonts:
 *   - Fraunces (`--font-serif`): Serifa moderna, arredondada, encorpada e acolhedora.
 *   - DM Sans (`--font-sans`): Interface minimalista, limpa, firme e altamente legível.
 * - Metadados de SEO padrão, OpenGraph para cards no WhatsApp e Twitter, favicons.
 * - Script inline anti-flicker de tema (garante que o Dark Mode ou Light Mode seja
 *   aplicado antes da primeira renderização da página, evitando tela piscando).
 */

import type { Metadata, Viewport } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';

// Configuração de Viewport acessível (permite zoom de pinça em dispositivos móveis)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Fonte Serifada Contemporânea, arredondada e encorpada (sem traços finos ou esticados)
const serif = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

// Fonte Sans-Serif moderna, limpa e equilibrada para textos de interface e botões
const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

// Metadados canônicos de SEO, OpenGraph e Favicon
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fralda.online'),
  title: {
    default: 'Fralda Online — Chá de Bebê, Fralda & Revelação com Pix',
    template: '%s | Fralda Online',
  },
  description:
    'A plataforma elegante para futuros pais receberem fraldas em dinheiro via Pix e engajarem a família com o bolão do bebê.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Fralda Online — Chá de Bebê, Fralda & Revelação com Pix',
    description:
      'A plataforma elegante para futuros pais receberem fraldas em dinheiro via Pix e engajarem a família com o bolão do bebê.',
    url: '/',
    siteName: 'Fralda Online',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Fralda Online — Chá de Bebê, Fralda & Revelação com Pix',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fralda Online — Chá de Bebê, Fralda & Revelação com Pix',
    description:
      'A plataforma elegante para futuros pais receberem fraldas em dinheiro via Pix e engajarem a família com o bolão do bebê.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Fralda Online — Chá de Bebê, Fralda & Revelação com Pix',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans bg-cream-50 text-charcoal-900 antialiased selection:bg-stone-200">
        {/* Script síncrono para prevenir Flash of Incorrect Theme (FOIT) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  // Inicia sempre no modo claro por padrão; ativa escuro apenas se o usuário tiver escolhido manualmente
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
