import Link from 'next/link';
import {
  Baby,
  Sparkles,
  Heart,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Gift,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-rose-50/30 to-amber-50/40 text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Baby className="w-6 h-6" />
            </span>
            <span className="font-black text-xl tracking-tight text-slate-800">
              Fralda<span className="text-rose-500">Fácil</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition"
            >
              Já tenho conta
            </Link>
            <Link
              href="/cadastro"
              className="py-2.5 px-4 md:px-5 rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-sky-500 to-rose-500 hover:opacity-95 shadow-md shadow-rose-500/20 active:scale-95 transition"
            >
              Criar meu Chá
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/90 border border-slate-200 shadow-sm text-slate-700 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>A melhor forma de receber fraldas e presentes dos amigos</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
            Seu Chá de Fralda & Revelação moderno,{' '}
            <span className="bg-gradient-to-r from-sky-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
              arrecadando no Pix
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Em menos de 2 minutos, crie uma página com bolão interativo &ldquo;Menino ou Menina?&rdquo;,
            lista de fraldas virtuais e receba o valor em dinheiro para comprar tudo no tamanho certo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto py-4 px-8 rounded-2xl font-black text-white bg-gradient-to-r from-sky-500 via-purple-500 to-rose-500 hover:opacity-95 shadow-xl shadow-rose-400/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>Criar Minha Página Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto py-4 px-6 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition flex items-center justify-center"
            >
              Ver Demonstração
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Sem marcas repetidas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Pix transparente
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Bolão em tempo real
            </span>
          </div>
        </div>
      </section>

      {/* Grid de Benefícios */}
      <section className="py-16 px-4 bg-white/70 border-y border-slate-200/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-slate-800">
              Por que os pais preferem o Fralda Fácil?
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Praticidade total para você e para os seus convidados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-md">
              <span className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Bolão Menino ou Menina</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seus convidados apostam no sexo do bebê em um gráfico animado. Cada voto pode vir acompanhado de uma doação no Pix!
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-md">
              <span className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Pix Direto e Rápido</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Integração com Mercado Pago para gerar QR Code e Copia e Cola instantâneo, com confirmação e mural em tempo real.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-md">
              <span className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Gift className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Vitrine Pronta de Fraldas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seu evento já nasce com 10 presentes pré-cadastrados (RN, P, M, G, lenços e pomadas). Não precisa cadastrar nada do zero!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-10">
            Tudo pronto em 3 passos simples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Cadastre seu Chá</h4>
              <p className="text-xs text-slate-500">
                Informe os nomes dos pais, do bebê e escolha seu link personalizado.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Compartilhe no WhatsApp</h4>
              <p className="text-xs text-slate-500">
                Envie o link para a família e amigos participarem do bolão e enviarem os presentes.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Receba no Pix</h4>
              <p className="text-xs text-slate-500">
                Acompanhe as mensagens no mural e receba o valor direto na sua conta bancária.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 py-4 px-8 rounded-2xl font-black text-white bg-gradient-to-r from-sky-500 to-rose-500 hover:opacity-95 shadow-xl shadow-sky-500/20 active:scale-95 transition"
            >
              <span>Começar Agora Gratuitamente</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center text-xs">
        <p className="flex items-center justify-center gap-1 mb-1">
          <span>Feito com</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>para tornar o nascimento do seu bebê inesquecível.</span>
        </p>
        <p>© {new Date().getFullYear()} Fralda Fácil — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
