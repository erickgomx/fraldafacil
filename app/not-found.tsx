import Link from 'next/link';
import { ArrowRight, Home, Search } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Link href="/" className="inline-flex justify-center group">
          <BrandLogo size="md" />
        </Link>

        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-warm-border shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cream-100 border border-warm-border text-charcoal-700 mx-auto flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta block mb-1">
              Erro 404
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
              Não encontramos esta página de chá
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 font-sans mt-2 leading-relaxed">
              Confira se o endereço recebido no WhatsApp foi digitado corretamente ou peça o link atualizado aos pais.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Ir para a página inicial</span>
            </Link>

            <Link
              href="/demo"
              className="py-2.5 px-4 rounded-xl text-xs font-medium bg-cream-50 text-charcoal-800 border border-warm-border hover:bg-cream-100 transition inline-flex items-center justify-center gap-1.5"
            >
              <span>Ver demonstração</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
