import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso e Condições Gerais — Fralda Online',
  description: 'Conheça os Termos de Uso e Condições Gerais da plataforma Fralda Online para organizadores e convidados.',
};

export default function TermsPage() {
  const lastUpdated = 'Novembro de 2026';

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 font-sans">
      {/* Topo / Barra de Navegação Superior */}
      <header className="border-b border-warm-border bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <BrandLogo size="sm" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao início</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Título & Emblema */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 border border-warm-border text-charcoal-600 text-xs mb-4">
            <FileText className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Condições Gerais de Uso da Plataforma</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight mb-4">
            Termos de Uso do Fralda Online
          </h1>

          <p className="text-sm text-charcoal-500 font-sans leading-relaxed max-w-2xl">
            Bem-vindo ao Fralda Online. Ao criar uma página de Chá de Bebê ou presentear uma família através da nossa plataforma, você concorda expressamente com os presentes Termos e Condições.
          </p>

          <p className="text-xs text-charcoal-400 font-mono mt-3">
            Última atualização: {lastUpdated}
          </p>
        </div>

        {/* Artigos dos Termos */}
        <div className="space-y-10 bg-white rounded-2xl p-8 sm:p-12 border border-warm-border shadow-subtle text-charcoal-700 text-xs sm:text-sm leading-relaxed">
          
          {/* Seção 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">01.</span>
              <span>Objeto e Natureza do Serviço</span>
            </h2>
            <p>
              O <strong>Fralda Online</strong> (acessível em <a href="https://fralda.online" className="text-charcoal-900 underline font-medium">fralda.online</a>) é uma solução tecnológica que disponibiliza infraestrutura digital para criação de páginas comemorativas de Chás de Bebê e Chás Revelação.
            </p>
            <p>
              A plataforma permite a criação de listas virtuais onde os presentes em fraldas e artigos infantis são representados simbolicamente em cotas financeiras, viabilizando o recebimento do saldo diretamente na conta do organizador através de arranjos de pagamento seguros.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">02.</span>
              <span>Responsabilidade sobre Menores (Conformidade com a LGPD)</span>
            </h2>
            <p>
              Ao cadastrar uma página de Chá, o organizador <strong>declara e garante expressamente</strong> que é o pai, mãe ou responsável legal do bebê/nascituro, possuindo plena capacidade jurídica e legitimidade para:
            </p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-600">
              <li>Cadastrar o nome do bebê ou opções de nomes prováveis;</li>
              <li>Inserir fotos de ultrassonografia ou registros fotográficos familiares na página do evento;</li>
              <li>Compartilhar o link do evento com seus convidados e rede familiar.</li>
            </ul>
            <p>
              É estritamente vedada a criação de páginas comemorativas em nome de terceiros sem a respectiva autorização formal dos responsáveis legais.
            </p>
          </section>

          {/* Seção 3 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">03.</span>
              <span>Regras Financeiras, Taxas e Split de Pagamentos</span>
            </h2>
            <p>
              O Fralda Online opera com total transparência quanto aos custos de intermediação e tecnologia:
            </p>
            
            <div className="p-4 rounded-xl bg-cream-50 border border-warm-border/80 space-y-2 mt-2">
              <p className="font-medium text-charcoal-900 text-xs font-mono uppercase">
                Composição das Taxas por Transação:
              </p>
              <ul className="list-disc list-inside space-y-1 text-charcoal-600 text-xs">
                <li><strong>Comissão da Plataforma Fralda Online:</strong> 4,99% sobre o valor base do presente.</li>
                <li><strong>Taxa do Gateway de Pagamento (Mercado Pago):</strong> 0,99% para liquidações via Pix ou 3,99% para pagamentos no Cartão de Crédito.</li>
              </ul>
            </div>

            <p className="mt-3">
              O organizador pode optar livremente nas configurações do painel por:
            </p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-600">
              <li><strong>Convidado assume (padrão):</strong> As taxas são somadas ao valor do presente no momento do checkout, e os pais recebem 100% do valor líquido do item.</li>
              <li><strong>Pais assumem:</strong> O convidado paga o valor exato do presente e as taxas são deduzidas diretamente do montante repassado aos pais.</li>
            </ul>
            <p>
              Os valores são transacionados diretamente por meio da conta oficial do <strong>Mercado Pago</strong> conectada pelos pais via OAuth. O Fralda Online retém apenas a taxa de intermediação estipulada e não realiza custódia prolongada de saldos bancários dos usuários.
            </p>
          </section>

          {/* Seção 4 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">04.</span>
              <span>Uso Permitido e Condutas Proibidas</span>
            </h2>
            <p>O usuário se compromete a utilizar a plataforma para propósitos lícitos e festivos. É expressamente proibido:</p>
            <div className="space-y-2 mt-2">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-dusty-rose-light border border-dusty-rose/20 text-xs text-dusty-rose">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Criar eventos fictícios ou fraudulentos visando obter vantagens financeiras indevidas.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-dusty-rose-light border border-dusty-rose/20 text-xs text-dusty-rose">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Utilizar cartões de crédito clonados ou dados bancários de terceiros sem consentimento (*carding*).</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-dusty-rose-light border border-dusty-rose/20 text-xs text-dusty-rose">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Publicar mensagens ofensivas, difamatórias ou ilegais no mural de recados.</span>
              </div>
            </div>
            <p className="mt-2">
              A identificação de fraudes implicará o cancelamento imediato da página e comunicação às autoridades competentes.
            </p>
          </section>

          {/* Seção 5 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">05.</span>
              <span>Encerramento e Exclusão da Conta</span>
            </h2>
            <p>
              O organizador possui o direito de solicitar o encerramento do seu evento e a exclusão da sua conta a qualquer momento. Para solicitar a exclusão de dados nos moldes da LGPD, basta entrar em contato com nossa equipe em <strong className="text-charcoal-900 font-mono text-xs">suporte@fralda.online</strong>.
            </p>
          </section>

          {/* Seção 6 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">06.</span>
              <span>Legislação Aplicável e Foro</span>
            </h2>
            <p>
              Estes Termos são regidos e interpretados de acordo com a legislação da República Federativa do Brasil, em especial o Código Civil, o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados (LGPD). Fica eleito o foro da Comarca do domicílio do consumidor para dirimir quaisquer controvérsias decorrentes destes Termos.
            </p>
          </section>
        </div>

        {/* Rodapé Interno */}
        <div className="mt-12 text-center text-xs text-charcoal-500 font-sans">
          <p>
            Ficou com alguma dúvida sobre nossos termos? Fale com nosso suporte em{' '}
            <a href="mailto:suporte@fralda.online" className="text-charcoal-900 font-medium underline">
              suporte@fralda.online
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
