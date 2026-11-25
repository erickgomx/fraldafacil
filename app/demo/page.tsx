/**
 * ============================================================================
 * PÁGINA DE DEMONSTRAÇÃO PÚBLICA (/demo)
 * ============================================================================
 * Permite que visitantes e futuros pais experimentem todas as funcionalidades
 * interativas da página de evento sem precisar criar conta antes.
 */

import DemoClient from './DemoClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demonstração Interativa - Chá de Bebê Fralda Online',
  description:
    'Veja como fica a página do seu Chá de Fralda e Revelação. Teste o bolão Menino ou Menina, o sorteio com Número da Sorte, a vitrine de presentes e o mural de recados.',
};

export default function DemoPage() {
  return <DemoClient />;
}
