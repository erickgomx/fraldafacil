import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const serif = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Fralda Online — Chá de Bebê, Fralda & Revelação com Pix',
    template: '%s | Fralda Online',
  },
  description:
    'A plataforma elegante para futuros pais receberem fraldas em dinheiro via Pix e engajarem a família com o bolão do bebê.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
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
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans bg-cream-50 text-charcoal-900 antialiased selection:bg-stone-200">
        {children}
      </body>
    </html>
  );
}
