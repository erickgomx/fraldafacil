import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade e Proteção de Dados (LGPD) — Fralda Online',
  description: 'Conheça nosso compromisso com a privacidade, transparência e segurança de dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018).',
};

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal tracking-tight mb-4">
            Política de Privacidade &amp; Proteção de Dados
          </h1>

          <p className="text-sm text-charcoal-500 font-sans leading-relaxed max-w-2xl">
            No Fralda Online, a privacidade da sua família e dos seus convidados é tratada com o mais alto rigor técnico e respeito. Esta política descreve de forma clara e transparente como tratamos, armazenamos e protegemos seus dados pessoais.
          </p>

          <p className="text-xs text-charcoal-400 font-mono mt-3">
            Última atualização: {lastUpdated}
          </p>
        </div>

        {/* Artigos da Política */}
        <div className="space-y-10 bg-white rounded-2xl p-8 sm:p-12 border border-warm-border shadow-subtle text-charcoal-700 text-xs sm:text-sm leading-relaxed">
          
          {/* Seção 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">01.</span>
              <span>Identificação do Controlador e Escopo</span>
            </h2>
            <p>
              A plataforma <strong>Fralda Online</strong> (disponível em <a href="https://fralda.online" className="text-charcoal-900 underline font-medium">fralda.online</a>) atua como <strong>Controladora</strong> dos dados pessoais tratados no contexto do cadastro e gestão dos Chás de Bebê e Revelação, bem como do processamento de presentes e recados.
            </p>
            <p>
              Para qualquer dúvida sobre privacidade ou para exercer seus direitos como titular, nosso canal oficial de contato com o Encarregado de Proteção de Dados (DPO) é: <strong className="text-charcoal-900 font-mono text-xs">suporte@fralda.online</strong>.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">02.</span>
              <span>Dados Pessoais Coletados e Finalidades</span>
            </h2>
            <p>Coletamos estritamente os dados necessários para o funcionamento e a segurança do serviço:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl bg-cream-50 border border-warm-border/80">
                <h3 className="font-medium text-charcoal-900 text-xs font-mono uppercase mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-charcoal-600" />
                  <span>Organizadores (Pais)</span>
                </h3>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 text-xs">
                  <li><strong>Nome Completo e E-mail:</strong> Criação de conta, login e comunicações essenciais.</li>
                  <li><strong>Senha Criptografada:</strong> Protegida via hash irreversible bcrypt (10 rounds).</li>
                  <li><strong>Chave Pix e Integração MP:</strong> Liquidação e split das cotas de presentes (cifradas via AES-256-GCM).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-warm-border/80">
                <h3 className="font-medium text-charcoal-900 text-xs font-mono uppercase mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-charcoal-600" />
                  <span>Convidados e Pagadores</span>
                </h3>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600 text-xs">
                  <li><strong>Nome do Convidado:</strong> Exibição no mural de recados e no painel dos pais.</li>
                  <li><strong>E-mail e WhatsApp (opcional):</strong> Envio de comprovante de confirmação do presente.</li>
                  <li><strong>CPF:</strong> Coletado estritamente por exigência regulatória do BACEN para emissão do Pix e antifraude.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seção 3 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">03.</span>
              <span>Proteção Especial a Dados de Crianças (Artigo 14 da LGPD)</span>
            </h2>
            <p>
              O Fralda Online reconhece a sensibilidade dos dados relativos a crianças e nascituros. Nomes prováveis ou revelados do bebê e datas previstas são inseridos **exclusivamente pelos genitores ou responsáveis legais**, os quais detêm a legitimidade e o consentimento explícito para compartilhar essas informações festivas com seu círculo de convidados.
            </p>
            <p>
              Em nenhuma circunstância utilizamos dados de crianças para fins de marketing direcionado, criação de perfis comerciais ou cessão a terceiros.
            </p>
          </section>

          {/* Seção 4 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">04.</span>
              <span>Bases Legais de Tratamento</span>
            </h2>
            <p>Todo tratamento de dados no Fralda Online está fundamentado em uma das hipóteses do Artigo 7º da LGPD:</p>
            <ul className="list-disc list-inside space-y-1 text-charcoal-600">
              <li><strong>Execução de Contrato (Art. 7º, V):</strong> Para criar sua página de Chá, disponibilizar os presentes e registrar os palpites no bolão.</li>
              <li><strong>Cumprimento de Obrigação Legal/Regulatória (Art. 7º, II):</strong> Para a coleta e validação do CPF nas operações de pagamento via Pix, conforme normas vigentes do Banco Central do Brasil.</li>
              <li><strong>Legítimo Interesse e Segurança (Art. 7º, IX):</strong> Para auditoria de logs, prevenção a fraudes de cartão (*anti-carding*), ataques de negação de serviço e controle de acessos abusivos.</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">05.</span>
              <span>Compartilhamento com Operadores Confiáveis</span>
            </h2>
            <p>
              O Fralda Online <strong>nunca comercializa, aluga ou compartilha seus dados pessoais para fins publicitários de terceiros</strong>. Os dados são compartilhados apenas com os parceiros de infraestrutura necessários para a prestação do serviço:
            </p>
            <div className="space-y-2 mt-2">
              <div className="p-3 bg-cream-50/60 rounded-lg border border-warm-border/60 text-xs">
                <strong>Mercado Pago (Gateway &amp; Split Financeiro):</strong> Processamento do pagamento via Pix ou Cartão de Crédito em conformidade com as normas PCI-DSS.
              </div>
              <div className="p-3 bg-cream-50/60 rounded-lg border border-warm-border/60 text-xs">
                <strong>Resend (Infraestrutura de E-mails):</strong> Despacho de mensagens transacionais essenciais (ex: link de recuperação de senha).
              </div>
              <div className="p-3 bg-cream-50/60 rounded-lg border border-warm-border/60 text-xs">
                <strong>Supabase &amp; Vercel (Hospedagem e Banco de Dados):</strong> Armazenamento seguro sob criptografia em repouso e isolamento de banco com Row Level Security (RLS).
              </div>
            </div>
          </section>

          {/* Seção 6 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">06.</span>
              <span>Seus Direitos como Titular de Dados (Artigo 18 da LGPD)</span>
            </h2>
            <p>Você possui o direito garantido por lei de, a qualquer momento e gratuitamente:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {[
                'Confirmar a existência de tratamento dos seus dados.',
                'Acessar e consultar os dados cadastrados em sua conta.',
                'Corrigir dados incompletos, inexatos ou desatualizados.',
                'Solicitar a exclusão definitiva da sua conta e do evento.',
                'Revogar o consentimento previamente fornecido.',
                'Obter informações sobre as entidades com as quais seus dados foram compartilhados.',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-cream-50/40 border border-warm-border/40 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">
              Para exercer qualquer um desses direitos, basta enviar uma mensagem para <strong className="text-charcoal-900 font-mono text-xs">suporte@fralda.online</strong> informando o e-mail cadastrado.
            </p>
          </section>

          {/* Seção 7 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">07.</span>
              <span>Segurança da Informação e Cookies</span>
            </h2>
            <p>
              Adotamos medidas técnicas de segurança contínuas, incluindo comunicação via TLS 1.3 / HTTPS forçado, criptografia AES-256 de chaves de integração, assinaturas criptográficas de integridade e controle de taxa de requisições (*Rate Limiting*).
            </p>
            <p>
              Utilizamos apenas cookies estritamente necessários para manter sua sessão autenticada de forma segura (<code className="bg-cream-100 px-1.5 py-0.5 rounded text-xs font-mono">auth_token</code> com flags <code className="bg-cream-100 px-1.5 py-0.5 rounded text-xs font-mono">HttpOnly</code> e <code className="bg-cream-100 px-1.5 py-0.5 rounded text-xs font-mono">Secure</code>). Não utilizamos cookies de rastreamento publicitário de terceiros.
            </p>
          </section>

          {/* Seção 8 */}
          <section className="space-y-3 pt-6 border-t border-warm-border/60">
            <h2 className="font-serif text-lg sm:text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <span className="text-charcoal-400 font-mono text-sm">08.</span>
              <span>Alterações nesta Política</span>
            </h2>
            <p>
              Esta política pode ser atualizada periodicamente para refletir aprimoramentos técnicos ou regulatórios. Quaisquer alterações substanciais serão comunicadas diretamente na plataforma ou no e-mail dos usuários cadastrados.
            </p>
          </section>
        </div>

        {/* Rodapé Interno */}
        <div className="mt-12 text-center text-xs text-charcoal-500 font-sans">
          <p>Dúvidas sobre o tratamento de dados pessoais?</p>
          <p className="mt-1">
            Fale diretamente com nosso canal de privacidade:{' '}
            <a href="mailto:suporte@fralda.online" className="text-charcoal-900 font-medium underline">
              suporte@fralda.online
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
