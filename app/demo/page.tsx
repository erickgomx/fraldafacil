import DemoClient from './DemoClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demonstração Interativa - Chá de Bebê Fralda Online',
  description:
    'Veja como fica a página do seu Chá de Fralda e Revelação. Teste o bolão Menino ou Menina, a vitrine de presentes e o mural de recados.',
};

export default function DemoPage() {
  return <DemoClient />;
}
