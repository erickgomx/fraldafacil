/**
 * ⏳ Loading do Painel dos Pais (/painel)
 *
 * Exibido durante a navegação entre as seções do painel administrativo dos pais
 * (Visão Geral, Presentes, Recados, Configurações), mantendo o feedback visual
 * imediato e fluido com a logo animada.
 */
import BrandLoader from '@/components/BrandLoader';

export default function PainelLoading() {
  return <BrandLoader fullScreen />;
}
