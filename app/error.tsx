'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro inesperado na aplicação:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Link href="/" className="inline-flex justify-center group">
          <BrandLogo size="md" />
        </Link>

        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-warm-border shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-dusty-rose-light border border-dusty-rose/30 text-dusty-rose mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-charcoal-500 block mb-1">
              Ops, algo saiu do previsto
            </span>
            <h1 className="font-serif text-2xl font-normal text-charcoal-900">
              Não foi possível carregar esta página
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 font-sans mt-2 leading-relaxed">
              Ocorreu uma instabilidade temporária. Tente recarregar ou volte para a página inicial.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={reset}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tentar novamente</span>
            </button>

            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl text-xs font-medium bg-cream-50 text-charcoal-800 border border-warm-border hover:bg-cream-100 transition inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Voltar ao início</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
