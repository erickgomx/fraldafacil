/**
 * ⏳ Loading Geral da Aplicação (Root Suspense Boundary)
 *
 * Exibido automaticamente pelo Next.js App Router durante transições de rota de primeiro nível.
 * Utiliza o BrandLoader centralizado com a identidade visual da Fralda Online para garantir
 * consistência e elegância enquanto os dados do servidor são carregados.
 */
import BrandLoader from '@/components/BrandLoader';

export default function Loading() {
  return <BrandLoader fullScreen />;
}
