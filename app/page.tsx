/**
 * ============================================================================
 * PÁGINA INICIAL / LANDING PAGE OFICIAL (Fralda Online)
 * ============================================================================
 * Apresenta o produto Fralda Online para futuros pais e mães:
 * - Seção Hero: Proposta de valor clara ("Receba fraldas em dinheiro via Pix").
 * - Preview Interativo ao Vivo: Simulação realista da página do bebê no celular.
 * - Como Funciona (3 passos simples): Criação em 2 minutos, compartilhamento e Pix na conta.
 * - Tabela Comparativa: Fralda física tradicional vs Fralda Online (adeus trocas e perdas).
 * - Calculadora / Demonstração do Bolão do Chá Revelação.
 * - Perguntas Frequentes (FAQ) em formato sanfona (Accordion) interativo.
 * - Call to Action (CTA) Final de Conversão.
 */

import Link from 'next/link';
import {
  ArrowRight,
  Check,
  QrCode,
  Share2,
  ShieldCheck,
  Gift,
  MessageSquareHeart,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import MercadoPagoLogo from '@/components/MercadoPagoLogo';
import HeroPreviewCard from '@/components/HeroPreviewCard';
import FaqAccordion from '@/components/FaqAccordion';

const FAQS = [
  {
    q: 'Os convidados compram fraldas físicas ou enviam o valor?',
    a: 'Eles escolhem pacotes de fraldas e mimos na sua vitrine virtual, mas você recebe o valor em dinheiro via Pix. Assim, você compra a marca e o tamanho certos conforme o bebê cresce.',
  },
  {
    q: 'Meus convidados precisam baixar aplicativo ou criar conta?',
    a: 'Não. Seus convidados não precisam baixar nenhum app nem criar conta. Eles apenas abrem o link no WhatsApp, escolhem o presente e pagam por qualquer aplicativo de banco via Pix ou cartão.',
  },
  {
    q: 'Como recebo o dinheiro dos presentes? Preciso ter conta no Mercado Pago?',
    a: 'Sim. Por máxima segurança bancária e transparência fiscal, todos os pagamentos são intermediados oficialmente pelo Mercado Pago. O valor dos presentes é transferido diretamente para a sua conta do Mercado Pago, sem que a nossa plataforma retenha o seu dinheiro. Se você ainda não possui uma conta no Mercado Pago, basta criar gratuitamente em 2 minutos durante a configuração.',
  },
  {
    q: 'Serve tanto para Chá Revelação quanto para Chá de Fraldas?',
    a: 'Sim! Você pode ativar o Bolão Menino vs. Menina para Chá Revelação ou usar apenas a vitrine de presentes e mural de recados se o sexo do bebê já foi revelado.',
  },
  {
    q: 'Quanto custa criar o chá? Existem mensalidades ou taxas escondidas?',
    a: 'Criar e manter a página do seu chá é 100% gratuito, sem mensalidade e sem limite de presentes. Quando você recebe um presente confirmado, há a taxa da plataforma de 4,99% mais a tarifa do Mercado Pago (0,99% no Pix ou 3,99% no cartão). Você decide no painel se repassa essas taxas para o convidado — recebendo 100% do valor do presente líquido — ou se prefere absorvê-las.',
  },
  {
    q: 'Posso fazer sorteio (Chá Rifa) e guardar os recados de recordação?',
    a: 'Sim! Você pode ativar o sorteio opcional no painel para que cada presente confirmado gere automaticamente 1 Número da Sorte. Além disso, todos os recados ficam salvos no seu painel com botão de agradecimento rápido no WhatsApp e exportação completa em PDF.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 overflow-x-hidden">
      {/* Topo / Navegação */}
      <header className="sticky top-0 z-40 bg-cream-50/85 backdrop-blur-md border-b border-warm-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <Link href="/" className="group shrink-0">
            <BrandLogo size="sm" className="sm:hidden" />
            <BrandLogo size="md" className="hidden sm:inline-flex" />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 shrink-0" aria-label="Navegação principal">
            <Link
              href="#taxas"
              className="hidden lg:inline-flex text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900 px-2.5 py-2 transition whitespace-nowrap"
            >
              Taxas
            </Link>
            <Link
              href="/demo"
              className="hidden md:inline-flex text-xs sm:text-sm font-medium text-charcoal-600 hover:text-charcoal-900 px-3 py-2 transition whitespace-nowrap"
            >
              Ver Demonstração
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-charcoal-700 hover:text-charcoal-900 px-2.5 sm:px-3 py-1.5 transition whitespace-nowrap"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-subtle whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Criar meu Chá</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 hidden sm:inline" aria-hidden="true" />
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION — Alto Impacto Visual + Minimalismo Editorial */}
        <section className="relative pt-10 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-6 border-b border-warm-border/60 overflow-hidden">
          {/* Luzes de fundo sutis e orgânicas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[360px] rounded-full bg-gradient-to-tr from-dusty-rose-light/70 via-cream-200/50 to-dusty-blue-light/70 dark:from-dusty-rose/10 dark:via-transparent dark:to-dusty-blue/10 blur-3xl opacity-80 dark:opacity-30"
          />

          <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Coluna Esquerda: Mensagem Direta e Clara */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.35rem] text-charcoal-900 font-medium tracking-[-0.025em] leading-[1.12] mb-6">
                Ganhe fraldas dos convidados.{' '}
                <span className="italic text-terracotta">Receba o valor no Pix.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Crie uma página linda em 2 minutos e compartilhe no WhatsApp. Seus convidados escolhem pacotes de fraldas na vitrine e você recebe o dinheiro para comprar o tamanho certo quando o bebê precisar.
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/cadastro"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-elevated flex items-center justify-center gap-2.5 group"
                >
                  <span>Criar Página do meu Bebê</span>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>

                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-medium bg-white text-charcoal-800 border border-warm-border hover:bg-cream-100 transition shadow-subtle flex items-center justify-center gap-2"
                >
                  <span>Ver Página de Exemplo</span>
                </Link>
              </div>

              {/* Pílulas de compreensão rápida */}
              <div className="mt-10 pt-7 border-t border-warm-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2.5 text-xs text-charcoal-600">
                  <span className="w-5 h-5 rounded-full bg-cream-200/80 text-charcoal-800 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" aria-hidden="true" />
                  </span>
                  <span>Sem estoque parado em casa</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-charcoal-600">
                  <span className="w-5 h-5 rounded-full bg-cream-200/80 text-charcoal-800 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" aria-hidden="true" />
                  </span>
                  <span>Convidado não baixa app</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-charcoal-600">
                  <span className="w-5 h-5 rounded-full bg-cream-200/80 text-charcoal-800 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" aria-hidden="true" />
                  </span>
                  <span>Saque direto para seu Pix</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Prévia Visual Interativa */}
            <HeroPreviewCard />
          </div>
        </section>

        {/* SEÇÃO DE CONTRASTE VISUAL — Por que fazer online? (Fácil compreensão) */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white border-b border-warm-border/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-terracotta font-semibold block mb-2.5">
                Simples de entender
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight mb-4">
                Por que trocar as pilhas de pacotes pelo Chá Online?
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 font-sans">
                No chá tradicional, você ganha dezenas de pacotes do mesmo tamanho que o bebê perde em poucas semanas. Aqui, o carinho vira praticidade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card: Chá Tradicional */}
              <div className="rounded-2xl bg-cream-50/70 dark:bg-[#161412] border border-warm-border dark:border-[#2A2521] p-7 sm:p-8">
                <span className="inline-block text-xs font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400 mb-4">
                  Chá de Fraldas Comum
                </span>
                <h3 className="font-serif text-xl text-charcoal-800 dark:text-stone-200 mb-5">
                  O que costuma acontecer
                </h3>
                <ul className="space-y-3.5 text-sm text-charcoal-600 dark:text-stone-400">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-charcoal-600 dark:text-stone-400 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3" aria-hidden="true" />
                    </span>
                    <span>Muitos pacotes tamanho P repetidos que o bebê perde rápido</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-charcoal-600 dark:text-stone-400 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3" aria-hidden="true" />
                    </span>
                    <span>Marcas variadas que podem causar alergia na pele do bebê</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-charcoal-600 dark:text-stone-400 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3" aria-hidden="true" />
                    </span>
                    <span>Parentes que moram longe não conseguem participar</span>
                  </li>
                </ul>
              </div>

              {/* Card: Com Fralda Online */}
              <div className="rounded-2xl bg-cream-100/70 dark:bg-[#201C19] border-2 border-charcoal-900 dark:border-stone-400/80 p-7 sm:p-8 shadow-card relative">
                <span className="inline-block text-xs font-mono uppercase tracking-wider text-terracotta dark:text-[#E8957D] font-semibold mb-4">
                  Com Fralda Online
                </span>
                <h3 className="font-serif text-xl text-charcoal-900 dark:text-[#FAF8F5] mb-5">
                  Liberdade para os pais, carinho para o bebê
                </h3>
                <ul className="space-y-3.5 text-sm text-charcoal-800 dark:text-[#F0ECE4]">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-charcoal-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-400/40 text-white dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" aria-hidden="true" />
                    </span>
                    <span>Você recebe o valor em dinheiro no Pix e compra quando precisar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-charcoal-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-400/40 text-white dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" aria-hidden="true" />
                    </span>
                    <span>Vitrine pronta com valores reais para o convidado escolher com gosto</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-charcoal-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-400/40 text-white dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" aria-hidden="true" />
                    </span>
                    <span>Bolão interativo e mural de recados para unir toda a família</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA EM 3 PASSOS */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-cream-50 border-b border-warm-border/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-600 block mb-2">
                Passo a Passo
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
                Pronto em 3 passos simples.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Passo 1 */}
              <div className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                      <Gift className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-charcoal-600">PASSO 01</span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                    Crie sua página em 2 minutos
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Coloque o nome dos pais, a data prevista e escolha o link exclusivo do seu bebê. A lista de fraldas já vem pronta para usar.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-warm-border/60 text-xs font-mono text-charcoal-600">
                  10 itens essenciais já configurados
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                      <Share2 className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-charcoal-600">PASSO 02</span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                    Envie o link no WhatsApp
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Seus amigos e familiares abrem direto pelo celular, votam no bolão, escolhem um pacote de fraldas e deixam uma mensagem.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-warm-border/60 text-xs font-mono text-dusty-blue font-medium">
                  Sem precisar baixar aplicativo
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                      <QrCode className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-charcoal-600">PASSO 03</span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                    Receba direto no seu Mercado Pago
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Por segurança jurídica e bancária, o valor dos presentes cai diretamente na sua conta do Mercado Pago. Caso não tenha, você cria a sua gratuitamente em 2 minutos.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-warm-border/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-terracotta font-medium">Intermediação Oficial</span>
                  <MercadoPagoLogo size="xs" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERMEDIAÇÃO FINANCEIRA & SEGURANÇA BANCÁRIA — Minimalista & Confiável */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FAF7F2] dark:bg-[#151311] border-b border-warm-border/60">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-white dark:bg-[#1C1917] border border-warm-border dark:border-[#2D2824] p-7 sm:p-10 shadow-subtle relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-warm-border/60">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 dark:bg-stone-800/80 border border-warm-border dark:border-stone-700 text-xs text-charcoal-700 dark:text-stone-300 mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-wider text-[11px]">Segurança &amp; Transparência</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-900 dark:text-stone-100 font-normal">
                    Intermediação oficial via Mercado Pago
                  </h2>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400">
                    Processador Oficial
                  </span>
                  <MercadoPagoLogo size="md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg text-charcoal-900 dark:text-stone-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" aria-hidden="true" />
                    Sem custódia da plataforma
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-stone-400 leading-relaxed font-sans">
                    O Fralda Online não retém o dinheiro do seu chá. Usamos a infraestrutura do Mercado Pago para que o valor de cada presente caia direto na sua conta, com total transparência e proteção antifraude.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg text-charcoal-900 dark:text-stone-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" aria-hidden="true" />
                    Por que é necessário criar conta no Mercado Pago?
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-stone-400 leading-relaxed font-sans">
                    Por exigência de segurança bancária e regulamentação fiscal, os pais precisam vincular ou criar uma conta gratuita no Mercado Pago. O cadastro leva apenas 2 minutos e garante que o dinheiro fique sempre sob seu controle.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-warm-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal-600 dark:text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Conexão simples em 1 clique no painel
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Convidado não precisa ter conta no Mercado Pago
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Saques e transferências imediatas via Pix
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PILARES VISUAIS DO PRODUTO — Bento Grid Minimalista */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white border-b border-warm-border/60">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-600 block mb-2">
                O que está incluído
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
                Uma experiência encantadora para quem envia e prática para quem recebe.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1: Vitrine (7 colunas) */}
              <div className="md:col-span-7 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-charcoal-600 block mb-3">01 · VITRINE DE PRESENTES</span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                    Catálogo de fraldas e mimos pronto para usar
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                    Sua página já nasce com pacotes de fraldas RN, P, M, G, lenços umedecidos e itens de cuidado com preços sugeridos. Você pode editar valores ou criar novos itens como preferir.
                  </p>
                </div>

                {/* Mini demonstração visual dos itens */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-white rounded-xl p-3 border border-warm-border text-center">
                    <span className="block text-xs font-medium text-charcoal-800">Fralda Tam. P</span>
                    <span className="block text-xs font-mono text-terracotta font-semibold mt-0.5">R$ 55</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-warm-border text-center">
                    <span className="block text-xs font-medium text-charcoal-800">Fralda Tam. M</span>
                    <span className="block text-xs font-mono text-terracotta font-semibold mt-0.5">R$ 85</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-warm-border text-center">
                    <span className="block text-xs font-medium text-charcoal-800">Kit Banho</span>
                    <span className="block text-xs font-mono text-terracotta font-semibold mt-0.5">R$ 120</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Bolão do Sexo (5 colunas) */}
              <div className="md:col-span-5 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-charcoal-600 block mb-3">02 · INTERATIVIDADE</span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                    Bolão Menino ou Menina
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                    Perfeito para Chá Revelação. Os convidados dão seu palpite e acompanham o placar da família em tempo real.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-warm-border">
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-dusty-blue">Menino · 58%</span>
                    <span className="text-dusty-rose">42% · Menina</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex bg-cream-100">
                    <div className="w-[58%] bg-dusty-blue" />
                    <div className="w-[42%] bg-dusty-rose" />
                  </div>
                </div>
              </div>

              {/* Card 3: Mural de Recados + Segurança (12 colunas) */}
              <div className="md:col-span-12 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <span className="text-xs font-mono text-charcoal-600 block mb-3">03 · RECORDAÇÃO PARA SEMPRE</span>
                  <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                    Mural de mensagens carinhosas da família
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Cada presente confirmado publica automaticamente o recado do convidado no mural da página. Uma lembrança afetuosa de quem esteve presente desde o início.
                  </p>
                </div>

                <div className="md:col-span-5 bg-white rounded-xl p-5 border border-warm-border shadow-subtle">
                  <div className="flex items-center gap-2 text-xs font-medium text-charcoal-900 mb-2">
                    <MessageSquareHeart className="w-4 h-4 text-terracotta" aria-hidden="true" />
                    <span>Vovó Cida</span>
                    <span className="ml-auto text-[11px] font-mono text-charcoal-600">+ Mimo enviado</span>
                  </div>
                  <p className="text-xs text-charcoal-600 italic leading-relaxed">
                    &ldquo;O coração da vovó já transborda de alegria! Que venha com muita saúde para iluminar nossa família.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TAXAS TRANSPARENTES — Sem mensalidade, você escolhe quem assume */}
        <section id="taxas" className="py-20 sm:py-24 px-4 sm:px-6 bg-[#FAF7F2] dark:bg-[#151311] border-b border-warm-border/60 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-terracotta dark:text-[#E8957D] font-semibold block mb-2.5">
                Taxas Transparentes
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 dark:text-[#FAF8F5] font-normal tracking-tight mb-4">
                Grátis para criar. Você só paga quando recebe.
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 dark:text-stone-300 font-sans leading-relaxed">
                Sem mensalidade, sem fidelidade e sem surpresas. A taxa da plataforma é de 4,99% + tarifa do Mercado Pago (0,99% no Pix ou 3,99% no cartão) — e você escolhe quem assume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Criação gratuita */}
              <div className="rounded-2xl bg-white dark:bg-[#1C1917] border border-warm-border dark:border-[#2D2824] p-7 shadow-subtle flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[11px] font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400 mb-3">
                    Criar e usar a página
                  </span>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-serif text-3xl text-charcoal-900 dark:text-[#FAF8F5] font-medium">
                      R$ 0
                    </span>
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                      Criação gratuita
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-600 dark:text-stone-300 leading-relaxed font-sans mb-5">
                    Publique sua lista sem pagar nada e sem mensalidade. Todos os recursos já vêm liberados.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-charcoal-700 dark:text-stone-300 pt-4 border-t border-warm-border/60 dark:border-[#2D2824]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Lista pronta e personalizável</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Bolão Menino ou Menina + Sorteio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Mural com exportação em PDF</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Repassar ao convidado (Recomendado) */}
              <div className="rounded-2xl bg-cream-100/70 dark:bg-[#201C19] border-2 border-charcoal-900 dark:border-stone-400/80 p-7 shadow-card flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-terracotta dark:text-[#E8957D] font-semibold">
                      Repassar ao convidado
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">
                      Recomendado
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-900 dark:text-[#FAF8F5] mb-2.5">
                    Receba 100% do valor líquido
                  </h3>
                  <p className="text-sm text-charcoal-700 dark:text-stone-300 leading-relaxed font-sans mb-5">
                    As taxas são somadas no checkout com cálculo exato. Os pais recebem o valor integral do presente sem descontos.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-warm-border/70 dark:border-[#332D28] text-xs font-sans">
                  <div className="rounded-xl bg-white dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      Exemplo no Pix · Presente R$ 100,00
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      Convidado paga <strong>R$ 106,04</strong> → <strong>você recebe R$ 100,00 cheios</strong>
                    </span>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      Exemplo no Cartão · Presente R$ 100,00
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      Convidado paga <strong>R$ 109,35</strong> → <strong>você recebe R$ 100,00 cheios</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Pais assumem as taxas */}
              <div className="rounded-2xl bg-white dark:bg-[#1C1917] border border-warm-border dark:border-[#2D2824] p-7 shadow-subtle flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[11px] font-mono uppercase tracking-wider text-charcoal-600 dark:text-stone-400 mb-3">
                    Opcional · Pais assumem
                  </span>
                  <h3 className="font-serif text-xl text-charcoal-900 dark:text-[#FAF8F5] mb-2.5">
                    Convidado paga o valor seco
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-stone-300 leading-relaxed font-sans mb-5">
                    Prefere absorver as taxas? O convidado paga exatamente o valor anunciado (ex: R$ 100,00) e o desconto ocorre no repasse.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-warm-border/60 dark:border-[#2D2824] text-xs font-sans">
                  <div className="rounded-xl bg-cream-50 dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      No Pix (4,99% + 0,99% MP)
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      De R$ 100,00 → <strong>você recebe R$ 94,02 líquidos</strong>
                    </span>
                  </div>
                  <div className="rounded-xl bg-cream-50 dark:bg-[#171412] border border-warm-border dark:border-[#2D2824] p-3">
                    <span className="font-mono text-[10px] uppercase text-charcoal-500 dark:text-stone-400 block mb-0.5">
                      No Cartão (4,99% + 3,99% MP)
                    </span>
                    <span className="text-charcoal-800 dark:text-stone-200 block">
                      De R$ 100,00 → <strong>você recebe R$ 91,02 líquidos</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-charcoal-600 dark:text-stone-400 font-sans">
              Você pode alternar entre repassar ou assumir as taxas a qualquer momento nas Configurações do seu painel.
            </p>
          </div>
        </section>

        {/* DÚVIDAS FREQUENTES — Rápido e Esclarecedor */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 bg-cream-50 border-b border-warm-border/60">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-600 block mb-2">
                Tire suas dúvidas
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
                Perguntas frequentes
              </h2>
            </div>

            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* CTA FINAL DE DESTAQUE */}
        <section className="py-20 px-4 sm:px-6 bg-white dark:bg-[#12100E]">
          <div className="max-w-4xl mx-auto rounded-3xl bg-charcoal-900 text-white p-8 sm:p-14 text-center shadow-lift relative overflow-hidden dark:!bg-[#1A1715] dark:border dark:border-[#332D28]">
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/15 text-stone-200 dark:!text-[#E8E2D8] text-xs font-mono mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E3A088]" aria-hidden="true" />
                Criação gratuita · Pronto em 2 minutos
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl text-white dark:!text-[#FAF8F5] font-normal tracking-tight mb-4">
                Prepare a chegada do seu bebê com tranquilidade.
              </h2>

              <p className="text-sm sm:text-base text-stone-300 dark:!text-[#D6CEC3] font-sans leading-relaxed mb-8">
                Crie agora a página do seu Chá de Bebê ou Revelação, personalize do seu jeito e compartilhe com quem você ama.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/cadastro"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-semibold bg-cream-50 text-charcoal-900 hover:bg-white transition flex items-center justify-center gap-2 dark:!bg-[#FAF8F5] dark:!text-[#1C1917]"
                >
                  <span className="dark:!text-[#1C1917]">Criar Página do meu Chá</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-900 dark:!text-[#1C1917]" aria-hidden="true" />
                </Link>
                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-medium bg-white/10 text-white hover:bg-white/15 border border-white/15 transition flex items-center justify-center dark:!text-[#FAF8F5] dark:border-white/20"
                >
                  Testar Demonstração
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé Editorial */}
      <footer className="py-12 px-6 border-t border-warm-border bg-[#F7F3EC] text-charcoal-600 text-xs font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-semibold text-sm tracking-[-0.02em] text-charcoal-900 dark:text-[#FAF8F5]">
              Fralda <span className="text-terracotta dark:text-[#E3A088]">Online</span>
            </span>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <span>A plataforma independente para Chás de Bebê &amp; Revelação</span>
            <span className="text-charcoal-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 text-charcoal-600">
              <span>Pagamentos via</span>
              <MercadoPagoLogo size="xs" />
            </span>
          </div>

          <div className="flex items-center gap-3 text-charcoal-600 text-xs">
            <a href="mailto:suporte@fralda.online" className="hover:text-charcoal-900 transition-colors">
              Suporte
            </a>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <Link href="/termos" className="hover:text-charcoal-900 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <Link href="/privacidade" className="hover:text-charcoal-900 transition-colors">
              Privacidade (LGPD)
            </Link>
            <span className="text-charcoal-600" aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
