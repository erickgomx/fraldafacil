import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900">
      {/* Topo / Navegação */}
      <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-warm-border/70">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="group">
            <BrandLogo size="md" />
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/demo"
              className="text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900 px-3 py-2 transition"
            >
              Ver Exemplo Real
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900 px-3 py-2 transition"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle"
            >
              Criar meu Chá
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Editorial */}
      <section className="pt-16 pb-20 px-6 border-b border-warm-border/60">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-warm-border text-xs font-sans text-charcoal-600 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
            <span>Arrecadação de presentes via Pix e bolão interativo</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl text-charcoal-900 font-normal tracking-tight leading-[1.12] mb-6">
            O chá de bebê pensado para a{' '}
            <span className="italic font-normal">vida real dos pais</span>.
          </h1>

          <p className="text-base sm:text-lg text-charcoal-600 font-sans max-w-xl mx-auto leading-relaxed mb-10">
            Crie em minutos uma página elegante. Receba o valor das fraldas direto no Pix para comprar os tamanhos certos conforme o bebê cresce — sem estoque acumulado na sala.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-sm font-medium bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle flex items-center justify-center gap-2 group"
            >
              <span>Começar meu Chá</span>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-sm font-medium bg-white text-charcoal-800 border border-warm-border hover:bg-stone-50 transition shadow-subtle flex items-center justify-center"
            >
              Ver Demonstração Interativa
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-warm-border/50 flex flex-wrap items-center justify-center gap-8 text-xs text-charcoal-500 font-sans">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-stone-700" />
              Sem marcas ou tamanhos repetidos
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-stone-700" />
              Chave Pix direta para saque
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-stone-700" />
              Bolão & mural em tempo real
            </span>
          </div>
        </div>
      </section>

      {/* Grid de Pilares do Produto (Sóbrio & Direto) */}
      <section className="py-20 px-6 bg-[#FCFAF6] border-b border-warm-border/60">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-charcoal-500 block mb-2">
              Funcionalidades
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
              Tudo o que os convidados precisam para participar com carinho.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pilar 1 */}
            <div className="bg-white p-8 rounded-xl border border-warm-border shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-charcoal-400 block mb-4">01</span>
                <h3 className="font-serif text-xl text-charcoal-900 font-normal mb-2.5">
                  Bolão do Sexo do Bebê
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed font-sans">
                  Uma votação interativa e discreta. Os convidados deixam o palpite sobre Menino ou Menina e podem acompanhar as porcentagens atualizadas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-border/50 text-[11px] font-mono text-dusty-blue font-medium">
                Votação gratuita ou com presente
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white p-8 rounded-xl border border-warm-border shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-charcoal-400 block mb-4">02</span>
                <h3 className="font-serif text-xl text-charcoal-900 font-normal mb-2.5">
                  Vitrine com Valores Reais
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed font-sans">
                  Pacotes de fraldas nos tamanhos RN a G, lenços umedecidos e cuidados essenciais pré-cadastrados, com fotos e descrições claras.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-border/50 text-[11px] font-mono text-charcoal-500 font-medium">
                10 itens prontos de início
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white p-8 rounded-xl border border-warm-border shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-charcoal-400 block mb-4">03</span>
                <h3 className="font-serif text-xl text-charcoal-900 font-normal mb-2.5">
                  Mural de Mensagens
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed font-sans">
                  As palavras de afeto deixadas pela família e amigos aparecem organizadas em um mural limpo, que os pais guardam de recordação.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-border/50 text-[11px] font-mono text-terracotta font-medium">
                Atualização imediata via Pix
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona em 3 Passos */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-charcoal-500 block mb-2">
              Fluxo
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
              Simples de configurar, fácil de compartilhar.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-l-2 border-warm-border pl-6">
              <span className="text-xs font-mono text-charcoal-400 block mb-2">Etapa 1</span>
              <h4 className="font-serif text-lg text-charcoal-900 font-medium mb-1.5">
                Crie seu evento
              </h4>
              <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                Informe o nome dos pais, data prevista e escolha o endereço único da página do seu bebê.
              </p>
            </div>

            <div className="border-l-2 border-warm-border pl-6">
              <span className="text-xs font-mono text-charcoal-400 block mb-2">Etapa 2</span>
              <h4 className="font-serif text-lg text-charcoal-900 font-medium mb-1.5">
                Compartilhe o link
              </h4>
              <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                Envie no WhatsApp da família. Os convidados acessam sem precisar baixar nenhum aplicativo.
              </p>
            </div>

            <div className="border-l-2 border-warm-border pl-6">
              <span className="text-xs font-mono text-charcoal-400 block mb-2">Etapa 3</span>
              <h4 className="font-serif text-lg text-charcoal-900 font-medium mb-1.5">
                Receba o saldo via Pix
              </h4>
              <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                Acompanhe os recados no painel e solicite a transferência do valor direto para sua chave Pix.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-medium bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle"
            >
              <span>Criar Página do meu Chá</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Rodapé Editorial */}
      <footer className="py-12 px-6 border-t border-warm-border bg-[#F7F3EC] text-charcoal-600 text-xs font-sans">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-sm text-charcoal-900">Fralda Online</span>
            <span className="text-charcoal-400">·</span>
            <span>A plataforma independente para Chás de Bebê & Revelação</span>
          </div>

          <div className="text-charcoal-500">
            © {new Date().getFullYear()} — Feito para famílias brasileiras.
          </div>
        </div>
      </footer>
    </div>
  );
}
