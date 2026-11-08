/**
 * ============================================================================
 * ESTADO DE CARREGAMENTO DA PÁGINA PÚBLICA (/[slug]/loading)
 * ============================================================================
 * Exibe o BrandLoader com logotipo pulsante em tela cheia enquanto os dados
 * do chá são recuperados do banco de dados.
 */

import BrandLoader from '@/components/BrandLoader';

export default function EventPageLoading() {
  return <BrandLoader fullScreen />;
}
