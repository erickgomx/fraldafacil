'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Sparkles,
  Heart,
  QrCode,
  Share2,
  ShieldCheck,
  Gift,
  MessageSquareHeart,
  ChevronDown,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const FAQS = [
  {
    q: 'Os convidados compram fraldas físicas ou enviam o valor?',
    a: 'Eles escolhem pacotes de fraldas e mimos na sua vitrine virtual, mas você recebe o valor em dinheiro via Pix. Assim, você compra a marca e o tamanho certos conforme o bebê cresce.',
  },
  {
    q: 'Meus convidados precisam baixar aplicativo ou criar conta?',
    a: 'Não. Basta abrir o link que você enviar no WhatsApp, escolher o presente, deixar um recado carinhoso e pagar com qualquer banco via Pix Copia e Cola ou QR Code.',
  },
  {
    q: 'Serve tanto para Chá Revelação quanto para Chá de Fraldas?',
    a: 'Sim! Você pode ativar o Bolão Menino vs. Menina para Chá Revelação ou usar apenas a vitrine de presentes e mural de recados se o sexo do bebê já foi revelado.',
  },
];

export default function HomePage() {
  // Estado interativo da prévia no Hero para compreensão imediata
  const [previewVote, setPreviewVote] = useState<'BOY' | 'GIRL'>('BOY');
  const [boyCount, setBoyCount] = useState(38);
  const [girlCount, setGirlCount] = useState(26);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const totalVotes = boyCount + girlCount;
  const boyPercent = Math.round((boyCount / totalVotes) * 100);
  const girlPercent = 100 - boyPercent;

  const handleVotePreview = (choice: 'BOY' | 'GIRL') => {
    if (choice === previewVote) return;
    setPreviewVote(choice);
    if (choice === 'BOY') {
      setBoyCount((c) => c + 1);
    } else {
      setGirlCount((c) => c + 1);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 overflow-x-hidden">
      {/* Topo / Navegação */}
      <header className="sticky top-0 z-40 bg-cream-50/85 backdrop-blur-md border-b border-warm-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <Link href="/" className="group shrink-0">
            <BrandLogo size="sm" className="sm:hidden" />
            <BrandLogo size="md" className="hidden sm:inline-flex" />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
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
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 hidden sm:inline" />
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION — Alto Impacto Visual + Minimalismo Editorial */}
      <section className="relative pt-10 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-6 border-b border-warm-border/60 overflow-hidden">
        {/* Luzes de fundo sutis e orgânicas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[360px] rounded-full bg-gradient-to-tr from-dusty-rose-light/70 via-cream-200/50 to-dusty-blue-light/70 blur-3xl opacity-80"
        />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Coluna Esquerda: Mensagem Direta e Clara */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-warm-border shadow-subtle text-xs font-sans text-charcoal-700 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <span>Chá de Bebê &amp; Revelação Online · Receba tudo no Pix</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] text-charcoal-900 font-normal tracking-tight leading-[1.08] mb-6"
            >
              Ganhe fraldas dos convidados.{' '}
              <span className="italic text-terracotta">Receba o valor no Pix.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-charcoal-600 font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8"
            >
              Crie uma página linda em 2 minutos e compartilhe no WhatsApp. Seus convidados escolhem pacotes de fraldas na vitrine e você recebe o dinheiro para comprar o tamanho certo quando o bebê precisar.
            </motion.p>

            {/* Botões de Ação */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
            >
              <Link
                href="/cadastro"
                className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition shadow-elevated flex items-center justify-center gap-2.5 group"
              >
                <span>Criar Página do meu Bebê</span>
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/demo"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-medium bg-white text-charcoal-800 border border-warm-border hover:bg-cream-100 transition shadow-subtle flex items-center justify-center gap-2"
              >
                <span>Ver Página de Exemplo</span>
              </Link>
            </motion.div>

            {/* Pílulas de compreensão rápida */}
            <motion.div
              variants={fadeUp}
              className="mt-10 pt-7 border-t border-warm-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto lg:mx-0"
            >
              <div className="flex items-center gap-2.5 text-xs text-charcoal-600">
                <span className="w-5 h-5 rounded-full bg-cream-200/80 text-charcoal-800 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Sem estoque parado em casa</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-charcoal-600">
                <span className="w-5 h-5 rounded-full bg-cream-200/80 text-charcoal-800 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Convidado não baixa app</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-charcoal-600">
                <span className="w-5 h-5 rounded-full bg-cream-200/80 text-charcoal-800 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Saque direto para seu Pix</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Coluna Direita: Prévia Visual Interativa (Mostra o produto funcionando na hora) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className="lg:col-span-5 relative"
          >
            {/* Card Principal Simulando a Página do Bebê */}
            <div className="relative mx-auto max-w-md rounded-2xl bg-white border border-warm-border shadow-lift p-5 sm:p-6">
              {/* Barra superior de navegador minimalista */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-warm-border/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                </div>
                <div className="px-3 py-1 rounded-full bg-cream-100 border border-warm-border/70 text-[11px] font-mono text-charcoal-600">
                  fralda.online/mari-e-rafa
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-terracotta font-semibold">
                  Ao vivo
                </span>
              </div>

              {/* Cabeçalho do Chá na Prévia */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center shrink-0 font-serif text-lg text-charcoal-800">
                  M&amp;R
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-400 block">
                    Chá de Bebê &amp; Revelação
                  </span>
                  <h3 className="font-serif text-lg text-charcoal-900 leading-snug">
                    Mariana &amp; Rafael
                  </h3>
                </div>
              </div>

              {/* Mini Bolão Interativo (Experimente clicar) */}
              <div className="rounded-xl bg-cream-50 border border-warm-border/80 p-4 mb-4">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-medium text-charcoal-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                    Bolão do Bebê (experimente votar)
                  </span>
                  <span className="font-mono text-[11px] text-charcoal-500 tabular-nums">
                    {totalVotes} palpites
                  </span>
                </div>

                {/* Barra de Proporção */}
                <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-cream-200 mb-3">
                  <div
                    style={{ width: `${boyPercent}%` }}
                    className="bg-dusty-blue transition-all duration-500"
                  />
                  <div
                    style={{ width: `${girlPercent}%` }}
                    className="bg-dusty-rose transition-all duration-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleVotePreview('BOY')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-between ${
                      previewVote === 'BOY'
                        ? 'bg-dusty-blue text-white border-dusty-blue shadow-subtle'
                        : 'bg-white text-charcoal-700 border-warm-border hover:bg-dusty-blue-light/50'
                    }`}
                  >
                    <span>💙 Team Menino</span>
                    <span className="font-mono tabular-nums">{boyPercent}%</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVotePreview('GIRL')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-between ${
                      previewVote === 'GIRL'
                        ? 'bg-dusty-rose text-white border-dusty-rose shadow-subtle'
                        : 'bg-white text-charcoal-700 border-warm-border hover:bg-dusty-rose-light/50'
                    }`}
                  >
                    <span>🩷 Team Menina</span>
                    <span className="font-mono tabular-nums">{girlPercent}%</span>
                  </button>
                </div>
              </div>

              {/* Mini Vitrine de Presente → Vira Pix */}
              <div className="rounded-xl bg-white border border-warm-border p-3.5 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream-100 border border-warm-border flex items-center justify-center text-base shrink-0">
                    🧷
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-900">
                      Pacote Mega Fraldas Tam. M
                    </p>
                    <p className="text-[11px] text-charcoal-500">
                      Convidado presenteia via Pix
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-xs font-mono font-semibold text-charcoal-900 tabular-nums">
                    R$ 85,00
                  </span>
                  <span className="inline-block text-[10px] font-medium text-terracotta">
                    Presentear →
                  </span>
                </div>
              </div>

              {/* Notificação de Pix Recebido (compreensão instantânea do benefício) */}
              <div className="rounded-xl bg-charcoal-900 text-white p-3.5 flex items-center justify-between gap-3 shadow-card">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-[#E3A088]" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-white truncate">
                      Tia Camila enviou 1 pacote + recado
                    </p>
                    <p className="text-[11px] text-stone-300 truncate">
                      &ldquo;Que venha com muita saúde!&rdquo;
                    </p>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-mono text-xs font-semibold tabular-nums">
                  + R$ 85 no Pix
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO DE CONTRASTE VISUAL — Por que fazer online? (Fácil compreensão) */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white border-b border-warm-border/60">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-terracotta font-semibold block mb-2.5">
              Simples de entender
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight mb-4">
              Por que trocar as pilhas de pacotes pelo Chá Online?
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 font-sans">
              No chá tradicional, você ganha dezenas de pacotes do mesmo tamanho que o bebê perde em poucas semanas. Aqui, o carinho vira praticidade.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Card: Chá Tradicional */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl bg-cream-50/70 border border-warm-border p-7 sm:p-8"
            >
              <span className="inline-block text-xs font-mono uppercase tracking-wider text-charcoal-500 mb-4">
                Chá de Fraldas Comum
              </span>
              <h3 className="font-serif text-xl text-charcoal-800 mb-5">
                O que costuma acontecer
              </h3>
              <ul className="space-y-3.5 text-sm text-charcoal-600">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-charcoal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3" />
                  </span>
                  <span>Muitos pacotes tamanho P repetidos que o bebê perde rápido</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-charcoal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3" />
                  </span>
                  <span>Marcas variadas que podem causar alergia na pele do bebê</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-charcoal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3" />
                  </span>
                  <span>Parentes que moram longe não conseguem participar</span>
                </li>
              </ul>
            </motion.div>

            {/* Card: Com Fralda Online */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl bg-cream-100/70 border-2 border-charcoal-900 p-7 sm:p-8 shadow-card relative"
            >
              <span className="inline-block text-xs font-mono uppercase tracking-wider text-terracotta font-semibold mb-4">
                Com Fralda Online
              </span>
              <h3 className="font-serif text-xl text-charcoal-900 mb-5">
                Liberdade para os pais, carinho para o bebê
              </h3>
              <ul className="space-y-3.5 text-sm text-charcoal-800">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Você recebe o valor em dinheiro no Pix e compra quando precisar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Vitrine pronta com valores reais para o convidado escolher com gosto</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-charcoal-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Bolão interativo e mural de recados para unir toda a família</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA EM 3 PASSOS — Entrada Animada ao Rolar */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-cream-50 border-b border-warm-border/60">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center max-w-xl mx-auto mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-charcoal-500 block mb-2">
              Passo a Passo
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
              Pronto em 3 passos simples.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Passo 1 */}
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                    <Gift className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-xs text-charcoal-400">PASSO 01</span>
                </div>
                <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                  Crie sua página em 2 minutos
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Coloque o nome dos pais, a data prevista e escolha o link exclusivo do seu bebê. A lista de fraldas já vem pronta para usar.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-border/60 text-xs font-mono text-charcoal-500">
                10 itens essenciais já configurados
              </div>
            </motion.div>

            {/* Passo 2 */}
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                    <Share2 className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-xs text-charcoal-400">PASSO 02</span>
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
            </motion.div>

            {/* Passo 3 */}
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-2xl p-7 border border-warm-border shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-xl bg-cream-100 border border-warm-border flex items-center justify-center text-charcoal-900">
                    <QrCode className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-xs text-charcoal-400">PASSO 03</span>
                </div>
                <h3 className="font-serif text-xl text-charcoal-900 mb-2.5">
                  Receba os valores via Pix
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Acompanhe cada presente recebido em tempo real no seu painel e transfira o saldo acumulado direto para a sua chave Pix.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-warm-border/60 text-xs font-mono text-terracotta font-medium">
                Painel completo para os pais
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PILARES VISUAIS DO PRODUTO — Bento Grid Minimalista */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white border-b border-warm-border/60">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="max-w-2xl mb-14"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-charcoal-500 block mb-2">
              O que está incluído
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
              Uma experiência encantadora para quem envia e prática para quem recebe.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Card 1: Vitrine (7 colunas) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-7 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono text-charcoal-400 block mb-3">01 · VITRINE DE PRESENTES</span>
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
            </motion.div>

            {/* Card 2: Bolão do Sexo (5 colunas) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-5 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono text-charcoal-400 block mb-3">02 · INTERATIVIDADE</span>
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
            </motion.div>

            {/* Card 3: Mural de Recados + Segurança (12 colunas) */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-12 rounded-2xl bg-cream-50 border border-warm-border p-7 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7">
                <span className="text-xs font-mono text-charcoal-400 block mb-3">03 · RECORDAÇÃO PARA SEMPRE</span>
                <h3 className="font-serif text-2xl text-charcoal-900 mb-3">
                  Mural de mensagens carinhosas da família
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Cada presente confirmado publica automaticamente o recado do convidado no mural da página. Uma lembrança afetuosa de quem esteve presente desde o início.
                </p>
              </div>

              <div className="md:col-span-5 bg-white rounded-xl p-5 border border-warm-border shadow-subtle">
                <div className="flex items-center gap-2 text-xs font-medium text-charcoal-900 mb-2">
                  <MessageSquareHeart className="w-4 h-4 text-terracotta" />
                  <span>Vovó Cida</span>
                  <span className="ml-auto text-[11px] font-mono text-charcoal-400">+ Mimo enviado</span>
                </div>
                <p className="text-xs text-charcoal-600 italic leading-relaxed">
                  &ldquo;O coração da vovó já transborda de alegria! Que venha com muita saúde para iluminar nossa família.&rdquo;
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* DÚVIDAS FREQUENTES — Rápido e Esclarecedor */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-cream-50 border-b border-warm-border/60">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-charcoal-500 block mb-2">
              Tire suas dúvidas
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight">
              Perguntas frequentes
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="space-y-3"
          >
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="rounded-xl bg-white border border-warm-border overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-cream-50/60 transition"
                  >
                    <span className="font-serif text-base sm:text-lg text-charcoal-900">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-charcoal-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-charcoal-600 leading-relaxed border-t border-warm-border/40 pt-3">
                      {item.a}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL DE DESTAQUE */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={scaleIn}
          className="max-w-4xl mx-auto rounded-3xl bg-charcoal-900 text-white p-8 sm:p-14 text-center shadow-lift relative overflow-hidden"
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-stone-200 text-xs font-mono mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E3A088]" />
              Criação gratuita · Pronto em 2 minutos
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight mb-4">
              Prepare a chegada do seu bebê com tranquilidade.
            </h2>

            <p className="text-sm sm:text-base text-stone-300 font-sans leading-relaxed mb-8">
              Crie agora a página do seu Chá de Bebê ou Revelação, personalize do seu jeito e compartilhe com quem você ama.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-semibold bg-cream-50 text-charcoal-900 hover:bg-white transition flex items-center justify-center gap-2"
              >
                <span>Criar Página do meu Chá</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-medium bg-white/10 text-white hover:bg-white/15 border border-white/15 transition flex items-center justify-center"
              >
                Testar Demonstração
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Rodapé Editorial */}
      <footer className="py-12 px-6 border-t border-warm-border bg-[#F7F3EC] text-charcoal-600 text-xs font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-medium text-sm text-charcoal-900">Fralda Online</span>
            <span className="text-charcoal-400">·</span>
            <span>A plataforma independente para Chás de Bebê &amp; Revelação</span>
          </div>

          <div className="flex items-center gap-3 text-charcoal-500 text-xs">
            <Link href="/termos" className="hover:text-charcoal-900 transition-colors">
              Termos de Uso
            </Link>
            <span className="text-charcoal-300">·</span>
            <Link href="/privacidade" className="hover:text-charcoal-900 transition-colors">
              Privacidade (LGPD)
            </Link>
            <span className="text-charcoal-300">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
