/**
 * ============================================================================
 * LAYOUT RAIZ DA APLICAÇÃO (RootLayout)
 * ============================================================================
 * Estrutura base de todas as páginas da plataforma Fralda Online:
 * - Carregamento otimizado de tipografia do Google Fonts:
 *   - Lora (`--font-serif`): Títulos com elegância editorial, calor e afeto.
 *   - Plus Jakarta Sans (`--font-sans`): Interface limpa, legível e moderna.
 * - Metadados de SEO padrão, OpenGraph para cards no WhatsApp e Twitter, favicons.
 * - Script inline anti-flicker de tema (garante que o Dark Mode ou Light Mode seja
 *   aplicado antes da primeira renderização da página, evitando tela piscando).
 */

import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Fonte Serifada Editorial para títulos acolhedores
const serif = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

// Fonte Sans-Serif moderna e geométrica para textos de interface e botões
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fralda Online — Chá de Bebê, Fralda & Revelação com Pix',
    description:
      'A plataforma elegante para futuros pais receberem fraldas em dinheiro via Pix e engajarem a família com o bolão do bebê.',
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
