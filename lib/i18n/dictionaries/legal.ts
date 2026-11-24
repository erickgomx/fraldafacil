import type { Locale } from '../types';

const pt = {
  backHome: 'Voltar ao início',
  lastUpdatedLabel: 'Última atualização:',
  lastUpdatedValue: 'Novembro de 2026',
  terms: {
    badge: 'Condições Gerais de Uso da Plataforma',
    title: 'Termos de Uso do Fralda Online',
    intro:
      'Bem-vindo ao Fralda Online. Ao criar uma página de Chá de Bebê ou presentear uma família através da nossa plataforma, você concorda expressamente com os presentes Termos e Condições.',
    s1Title: 'Objeto e Natureza do Serviço',
    s1P1Before: 'O',
    s1P1Brand: 'Fralda Online',
    s1P1Mid: '(acessível em',
    s1P1After:
      ') é uma solução tecnológica que disponibiliza infraestrutura digital para criação de páginas comemorativas de Chás de Bebê e Chás Revelação.',
    s1P2: 'A plataforma permite a criação de listas virtuais onde os presentes em fraldas e artigos infantis são representados simbolicamente em cotas financeiras, viabilizando o recebimento do saldo diretamente na conta do organizador através de arranjos de pagamento seguros.',
    s2Title: 'Responsabilidade sobre Menores (Conformidade com a LGPD)',
    s2IntroBefore: 'Ao cadastrar uma página de Chá, o organizador',
    s2IntroBold: 'declara e garante expressamente',
    s2IntroAfter:
      'que é o pai, mãe ou responsável legal do bebê/nascituro, possuindo plena capacidade jurídica e legitimidade para:',
    s2List: [
      'Cadastrar o nome do bebê ou opções de nomes prováveis;',
      'Inserir fotos de ultrassonografia ou registros fotográficos familiares na página do evento;',
      'Compartilhar o link do evento com seus convidados e rede familiar.',
    ],
    s2Outro:
      'É estritamente vedada a criação de páginas comemorativas em nome de terceiros sem a respectiva autorização formal dos responsáveis legais.',
    s3Title: 'Regras Financeiras, Taxas e Split de Pagamentos',
    s3Intro:
      'O Fralda Online opera com total transparência quanto aos custos de intermediação e tecnologia:',
    s3BoxTitle: 'Composição das Taxas por Transação:',
    s3BoxItems: [
      {
        label: 'Comissão da Plataforma Fralda Online:',
        text: '4,99% sobre o valor base do presente.',
      },
      {
        label: 'Taxa do Gateway de Pagamento (Mercado Pago):',
        text: '0,99% para liquidações via Pix ou 3,99% para pagamentos no Cartão de Crédito.',
      },
    ],
    s3OptionsIntro: 'O organizador pode optar livremente nas configurações do painel por:',
    s3Options: [
      {
        label: 'Convidado assume (padrão):',
        text: 'As taxas são somadas ao valor do presente no momento do checkout, e os pais recebem 100% do valor líquido do item.',
      },
      {
        label: 'Pais assumem:',
        text: 'O convidado paga o valor exato do presente e as taxas são deduzidas diretamente do montante repassado aos pais.',
      },
    ],
    s3OutroBefore: 'Os valores são transacionados diretamente por meio da conta oficial do',
    s3OutroMp: 'Mercado Pago',
    s3OutroAfter:
      'conectada pelos pais via OAuth. O Fralda Online retém apenas a taxa de intermediação estipulada e não realiza custódia prolongada de saldos bancários dos usuários.',
    s4Title: 'Uso Permitido e Condutas Proibidas',
    s4Intro:
      'O usuário se compromete a utilizar a plataforma para propósitos lícitos e festivos. É expressamente proibido:',
    s4Forbidden: [
      'Criar eventos fictícios ou fraudulentos visando obter vantagens financeiras indevidas.',
      'Utilizar cartões de crédito clonados ou dados bancários de terceiros sem consentimento (carding).',
      'Publicar mensagens ofensivas, difamatórias ou ilegais no mural de recados.',
    ],
    s4Outro:
      'A identificação de fraudes implicará o cancelamento imediato da página e comunicação às autoridades competentes.',
    s5Title: 'Encerramento e Exclusão da Conta',
    s5Body:
      'O organizador possui o direito de solicitar o encerramento do seu evento e a exclusão da sua conta a qualquer momento (diretamente pelo painel ou via suporte). Para solicitar a exclusão de dados nos moldes da LGPD, basta entrar em contato com nossa equipe em',
    s6Title: 'Legislação Aplicável e Foro',
    s6Body:
      'Estes Termos são regidos e interpretados de acordo com a legislação da República Federativa do Brasil, em especial o Código Civil, o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados (LGPD). Fica eleito o foro da Comarca do domicílio do consumidor para dirimir quaisquer controvérsias decorrentes destes Termos.',
    footerPrompt: 'Ficou com alguma dúvida sobre nossos termos? Fale com nosso suporte em',
  },
  privacy: {
    badge: 'Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)',
    title: 'Política de Privacidade & Proteção de Dados',
    intro:
      'No Fralda Online, a privacidade da sua família e dos seus convidados é tratada com o mais alto rigor técnico e respeito. Esta política descreve de forma clara e transparente como tratamos, armazenamos e protegemos seus dados pessoais.',
    s1Title: 'Identificação do Controlador e Escopo',
    s1P1Before: 'A plataforma',
    s1P1Brand: 'Fralda Online',
    s1P1Mid: '(disponível em',
    s1P1Between: ') atua como',
    s1P1Bold: 'Controladora',
    s1P1After:
      'dos dados pessoais tratados no contexto do cadastro e gestão dos Chás de Bebê e Revelação, bem como do processamento de presentes e recados.',
    s1P2: 'Para qualquer dúvida sobre privacidade ou para exercer seus direitos como titular, nosso canal oficial de contato com o Encarregado de Proteção de Dados (DPO) é:',
    s2Title: 'Dados Pessoais Coletados e Finalidades',
    s2Intro: 'Coletamos estritamente os dados necessários para o funcionamento e a segurança do serviço:',
    s2ParentsTitle: 'Organizadores (Pais)',
    s2ParentsItems: [
      { label: 'Nome Completo e E-mail:', text: 'Criação de conta, login e comunicações essenciais.' },
      { label: 'Senha Criptografada:', text: 'Protegida via hash irreversível bcrypt (10 rounds).' },
      { label: 'Chave Pix e Integração MP:', text: 'Liquidação e split das cotas de presentes (cifradas via AES-256-GCM).' },
    ],
    s2GuestsTitle: 'Convidados e Pagadores',
    s2GuestsItems: [
      { label: 'Nome do Convidado:', text: 'Exibição no mural de recados e no painel dos pais.' },
      { label: 'E-mail e WhatsApp (opcional):', text: 'Envio de comprovante de confirmação do presente.' },
      { label: 'CPF:', text: 'Coletado estritamente por exigência regulatória do BACEN para emissão do Pix e antifraude.' },
    ],
    s3Title: 'Proteção Especial a Dados de Crianças (Artigo 14 da LGPD)',
    s3P1Before:
      'O Fralda Online reconhece a sensibilidade dos dados relativos a crianças e nascituros. Nomes prováveis ou revelados do bebê e datas previstas são inseridos',
    s3P1Bold: 'exclusivamente pelos genitores ou responsáveis legais',
    s3P1After:
      ', os quais detêm a legitimidade e o consentimento explícito para compartilhar essas informações festivas com seu círculo de convidados.',
    s3P2: 'Em nenhuma circunstância utilizamos dados de crianças para fins de marketing direcionado, criação de perfis comerciais ou cessão a terceiros.',
    s4Title: 'Bases Legais de Tratamento',
    s4Intro: 'Todo tratamento de dados no Fralda Online está fundamentado em uma das hipóteses do Artigo 7º da LGPD:',
    s4Items: [
      { label: 'Execução de Contrato (Art. 7º, V):', text: 'Para criar sua página de Chá, disponibilizar os presentes e registrar os palpites no bolão.' },
      { label: 'Cumprimento de Obrigação Legal/Regulatória (Art. 7º, II):', text: 'Para a coleta e validação do CPF nas operações de pagamento via Pix, conforme normas vigentes do Banco Central do Brasil.' },
      { label: 'Legítimo Interesse e Segurança (Art. 7º, IX):', text: 'Para auditoria de logs, prevenção a fraudes de cartão (anti-carding), ataques de negação de serviço e controle de acessos abusivos.' },
    ],
    s5Title: 'Compartilhamento com Operadores Confiáveis',
    s5Before: 'O Fralda Online',
    s5Bold: 'nunca comercializa, aluga ou compartilha seus dados pessoais para fins publicitários de terceiros',
    s5After: '. Os dados são compartilhados apenas com os parceiros de infraestrutura necessários para a prestação do serviço:',
    s5Operators: [
      { label: 'Mercado Pago (Gateway & Split Financeiro):', text: 'Processamento do pagamento via Pix ou Cartão de Crédito em conformidade com as normas PCI-DSS.' },
      { label: 'Resend (Infraestrutura de E-mails):', text: 'Despacho de mensagens transacionais essenciais (ex: link de recuperação de senha).' },
      { label: 'Supabase & Vercel (Hospedagem e Banco de Dados):', text: 'Armazenamento seguro sob criptografia em repouso e isolamento de banco com Row Level Security (RLS).' },
    ],
    s6Title: 'Seus Direitos como Titular de Dados (Artigo 18 da LGPD)',
    s6Intro: 'Você possui o direito garantido por lei de, a qualquer momento e gratuitamente:',
    s6Rights: [
      'Confirmar a existência de tratamento dos seus dados.',
      'Acessar e consultar os dados cadastrados em sua conta.',
      'Corrigir dados incompletos, inexatos ou desatualizados.',
      'Solicitar a exclusão definitiva da sua conta e do evento.',
      'Revogar o consentimento previamente fornecido.',
      'Obter informações sobre as entidades com as quais seus dados foram compartilhados.',
    ],
    s6OutroBefore: 'Para exercer qualquer um desses direitos, basta enviar uma mensagem para',
    s6OutroAfter: 'informando o e-mail cadastrado.',
    s7Title: 'Segurança da Informação e Cookies',
    s7P1: 'Adotamos medidas técnicas de segurança contínuas, incluindo comunicação via TLS 1.3 / HTTPS forçado, criptografia AES-256 de chaves de integração, assinaturas criptográficas de integridade e controle de taxa de requisições (Rate Limiting).',
    s7P2Before: 'Utilizamos apenas cookies estritamente necessários para manter sua sessão autenticada e sua preferência de idioma de forma segura (',
    s7P2Mid1: 'com flags',
    s7P2And: 'e',
    s7P2After: '). Não utilizamos cookies de rastreamento publicitário de terceiros.',
    s8Title: 'Alterações nesta Política',
    s8Body:
      'Esta política pode ser atualizada periodicamente para refletir aprimoramentos técnicos ou regulatórios. Quaisquer alterações substanciais serão comunicadas diretamente na plataforma ou no e-mail dos usuários cadastrados.',
    footerTitle: 'Dúvidas sobre o tratamento de dados pessoais?',
    footerContactPrefix: 'Fale diretamente com nosso canal de privacidade:',
  },
};

export type LegalDict = typeof pt;

const en: LegalDict = {
  backHome: 'Back to home',
  lastUpdatedLabel: 'Last updated:',
  lastUpdatedValue: 'November 2026',
  terms: {
    badge: 'General Platform Terms of Use',
    title: 'Fralda Online Terms of Use',
    intro:
      'Welcome to Fralda Online. By creating a Baby Shower page or sending a gift to a family through our platform, you expressly agree to these Terms and Conditions.',
    s1Title: 'Purpose and Nature of the Service',
    s1P1Before: '',
    s1P1Brand: 'Fralda Online',
    s1P1Mid: '(available at',
    s1P1After:
      ') is a technology platform providing digital infrastructure to create celebratory Baby Shower and Gender Reveal pages.',
    s1P2: 'The platform lets organizers build virtual gift registries where diapers and baby items are represented symbolically as monetary shares, enabling proceeds to go directly to the organizer’s account via secure payment rails.',
    s2Title: 'Responsibility Regarding Minors (LGPD Compliance)',
    s2IntroBefore: 'When registering a Baby Shower page, the organizer',
    s2IntroBold: 'expressly represents and warrants',
    s2IntroAfter:
      'that they are the parent or legal guardian of the baby/unborn child, having full legal capacity and authority to:',
    s2List: [
      'Register the baby’s name or potential name options;',
      'Upload ultrasound images or family photographs onto the event page;',
      'Share the event link with guests and family members.',
    ],
    s2Outro:
      'Creating celebratory pages on behalf of third parties without formal authorization from the legal guardians is strictly prohibited.',
    s3Title: 'Financial Rules, Fees & Payment Splitting',
    s3Intro:
      'Fralda Online operates with full transparency regarding processing and technology costs:',
    s3BoxTitle: 'Fee Breakdown per Transaction:',
    s3BoxItems: [
      {
        label: 'Fralda Online Platform Fee:',
        text: '4.99% of the base gift amount.',
      },
      {
        label: 'Payment Gateway Fee (Mercado Pago):',
        text: '0.99% for Pix settlements or 3.99% for Credit Card payments.',
      },
    ],
    s3OptionsIntro: 'In dashboard settings, the organizer may freely choose:',
    s3Options: [
      {
        label: 'Guest covers fees (default):',
        text: 'Fees are added at checkout so parents receive 100% of the listed gift amount net.',
      },
      {
        label: 'Parents cover fees:',
        text: 'The guest pays the exact gift value and fees are deducted directly from the parents’ payout.',
      },
    ],
    s3OutroBefore: 'Funds are processed directly through the official',
    s3OutroMp: 'Mercado Pago',
    s3OutroAfter:
      'account connected by parents via OAuth. Fralda Online only retains the stated platform fee and never holds prolonged custody of user funds.',
    s4Title: 'Permitted Use & Prohibited Conduct',
    s4Intro:
      'Users agree to use the platform strictly for lawful, celebratory purposes. It is strictly forbidden to:',
    s4Forbidden: [
      'Create fictitious or fraudulent events to obtain improper financial gain.',
      'Use stolen credit cards or third-party banking credentials without consent (carding).',
      'Post offensive, defamatory, or unlawful content on the guestbook wall.',
    ],
    s4Outro:
      'Detected fraud results in immediate page termination and reporting to the competent authorities.',
    s5Title: 'Account Termination & Deletion',
    s5Body:
      'The organizer may end their event and permanently delete their account at any time (directly from settings or via support). For LGPD data deletion requests, contact our team at',
    s6Title: 'Governing Law & Jurisdiction',
    s6Body:
      'These Terms are governed by the laws of the Federative Republic of Brazil, notably the Civil Code, Consumer Protection Code, and General Data Protection Law (LGPD). The court of the consumer’s domicile shall have jurisdiction over disputes arising from these Terms.',
    footerPrompt: 'Have questions about our terms? Contact our support team at',
  },
  privacy: {
    badge: 'Compliance with Brazil’s General Data Protection Law (Law No. 13.709/2018 - LGPD)',
    title: 'Privacy & Data Protection Policy',
    intro:
      'At Fralda Online, the privacy of your family and guests is handled with the highest technical care and respect. This policy clearly explains how we collect, store, and protect personal data.',
    s1Title: 'Data Controller Identification & Scope',
    s1P1Before: 'The platform',
    s1P1Brand: 'Fralda Online',
    s1P1Mid: '(available at',
    s1P1Between: ') acts as',
    s1P1Bold: 'Data Controller',
    s1P1After:
      'for personal data processed during account signup, Baby Shower / Gender Reveal management, gift processing, and guestbook notes.',
    s1P2: 'For privacy inquiries or to exercise your data subject rights, our Data Protection Officer (DPO) contact is:',
    s2Title: 'Personal Data Collected & Purposes',
    s2Intro: 'We collect strictly the data needed to operate and secure the service:',
    s2ParentsTitle: 'Organizers (Parents)',
    s2ParentsItems: [
      { label: 'Full Name & Email:', text: 'Account creation, authentication, and essential alerts.' },
      { label: 'Encrypted Password:', text: 'Protected via irreversible bcrypt hashing (10 rounds).' },
      { label: 'Pix Key & MP OAuth:', text: 'Payment settlement and split payouts (encrypted with AES-256-GCM).' },
    ],
    s2GuestsTitle: 'Guests & Payers',
    s2GuestsItems: [
      { label: 'Guest Name:', text: 'Displayed on the guestbook wall and parents’ dashboard.' },
      { label: 'Email & WhatsApp (optional):', text: 'Delivery of gift confirmation receipts and raffle numbers.' },
      { label: 'CPF (Brazilian Tax ID):', text: 'Collected strictly when needed for Central Bank Pix rules and anti-fraud.' },
    ],
    s3Title: 'Special Protection for Children’s Data (LGPD Art. 14)',
    s3P1Before:
      'Fralda Online recognizes the sensitivity of data relating to children and unborn babies. Baby names and expected dates are provided',
    s3P1Bold: 'exclusively by parents or legal guardians',
    s3P1After:
      ', who hold legal authority and explicit consent to share celebration details with invited guests.',
    s3P2: 'Under no circumstances do we use children’s data for targeted advertising, profiling, or sale to third parties.',
    s4Title: 'Legal Bases for Processing',
    s4Intro: 'All data processing at Fralda Online relies on legal bases under Article 7 of the LGPD:',
    s4Items: [
      { label: 'Contract Performance (Art. 7, V):', text: 'To host your event page, display gift items, and record poll guesses.' },
      { label: 'Legal/Regulatory Obligation (Art. 7, II):', text: 'For CPF validation in Pix transactions under Central Bank of Brazil regulations.' },
      { label: 'Legitimate Interest & Security (Art. 7, IX):', text: 'For audit logs, anti-carding fraud prevention, DDoS defense, and abuse rate limiting.' },
    ],
    s5Title: 'Sharing with Trusted Infrastructure Operators',
    s5Before: 'Fralda Online',
    s5Bold: 'never sells, rents, or shares your personal data for third-party advertising',
    s5After: '. Data is shared strictly with core infrastructure providers needed to run the service:',
    s5Operators: [
      { label: 'Mercado Pago (Gateway & Payment Split):', text: 'Processing Pix and Credit Card payments under PCI-DSS standards.' },
      { label: 'Resend (Email Infrastructure):', text: 'Sending essential transactional notifications and password reset emails.' },
      { label: 'Supabase & Vercel (Hosting & Database):', text: 'Encrypted-at-rest storage and database isolation with Row Level Security (RLS).' },
    ],
    s6Title: 'Your Data Subject Rights (LGPD Art. 18)',
    s6Intro: 'You have the legal right, free of charge and at any time, to:',
    s6Rights: [
      'Confirm the existence of processing of your personal data.',
      'Access and review the data stored in your account.',
      'Correct incomplete, inaccurate, or outdated information.',
      'Request permanent deletion of your account and event data.',
      'Revoke previously granted consent.',
      'Obtain information about entities with which your data has been shared.',
    ],
    s6OutroBefore: 'To exercise any of these rights, send an email to',
    s6OutroAfter: 'indicating your registered email address.',
    s7Title: 'Information Security & Cookies',
    s7P1: 'We maintain continuous security controls including TLS 1.3 / HTTPS enforcement, AES-256 credential encryption, cryptographic webhook signatures, and distributed Rate Limiting.',
    s7P2Before: 'We only use strictly necessary cookies to keep your session authenticated and save your language preference securely (',
    s7P2Mid1: 'with flags',
    s7P2And: 'and',
    s7P2After: '). We do not use third-party advertising or tracking cookies.',
    s8Title: 'Changes to This Policy',
    s8Body:
      'This policy may be updated periodically to reflect technical or regulatory updates. Material changes will be communicated directly on the platform or via registered user email.',
    footerTitle: 'Questions about personal data processing?',
    footerContactPrefix: 'Reach out directly to our privacy channel:',
  },
};

const es: LegalDict = {
  backHome: 'Volver al inicio',
  lastUpdatedLabel: 'Última actualización:',
  lastUpdatedValue: 'Noviembre de 2026',
  terms: {
    badge: 'Condiciones Generales de Uso de la Plataforma',
    title: 'Términos de Uso de Fralda Online',
    intro:
      'Bienvenido a Fralda Online. Al crear una página de Baby Shower o enviar un regalo a una familia mediante nuestra plataforma, aceptas expresamente estos Términos y Condiciones.',
    s1Title: 'Objeto y Naturaleza del Servicio',
    s1P1Before: '',
    s1P1Brand: 'Fralda Online',
    s1P1Mid: '(accesible en',
    s1P1After:
      ') es una solución tecnológica que brinda infraestructura digital para crear páginas conmemorativas de Baby Showers y Revelación de Género.',
    s1P2: 'La plataforma permite crear listas virtuales donde los pañales y artículos infantiles se representan simbólicamente en aportes económicos, permitiendo recibir el saldo directamente en la cuenta del organizador mediante pagos seguros.',
    s2Title: 'Responsabilidad sobre Menores (Cumplimiento LGPD)',
    s2IntroBefore: 'Al registrar una página de evento, el organizador',
    s2IntroBold: 'declara y garantiza expresamente',
    s2IntroAfter:
      'que es el padre, madre o tutor legal del bebé/por nacer, contando con plena capacidad jurídica para:',
    s2List: [
      'Registrar el nombre del bebé o posibles opciones de nombre;',
      'Subir fotos de ecografías o fotografías familiares a la página del evento;',
      'Compartir el enlace del evento con sus invitados y círculo familiar.',
    ],
    s2Outro:
      'Queda estrictamente prohibida la creación de páginas en nombre de terceros sin autorización formal de los responsables legales.',
    s3Title: 'Reglas Financieras, Tarifas y Split de Pagos',
    s3Intro:
      'Fralda Online opera con total transparencia respecto a los costos de intermediación y tecnología:',
    s3BoxTitle: 'Composición de Tarifas por Transacción:',
    s3BoxItems: [
      {
        label: 'Comisión de la Plataforma Fralda Online:',
        text: '4,99% sobre el valor base del regalo.',
      },
      {
        label: 'Tarifa de Pasarela de Pago (Mercado Pago):',
        text: '0,99% para pagos vía Pix o 3,99% para pagos con Tarjeta de Crédito.',
      },
    ],
    s3OptionsIntro: 'En la configuración del panel, el organizador puede elegir libremente:',
    s3Options: [
      {
        label: 'El invitado asume (predeterminado):',
        text: 'Las tarifas se suman en el checkout para que los padres reciban el 100% del monto neto.',
      },
      {
        label: 'Los padres asumen:',
        text: 'El invitado paga el monto exacto del regalo y las tarifas se descuentan directamente del saldo recibido.',
      },
    ],
    s3OutroBefore: 'Los fondos se procesan directamente a través de la cuenta oficial de',
    s3OutroMp: 'Mercado Pago',
    s3OutroAfter:
      'vinculada por los padres vía OAuth. Fralda Online retiene únicamente la comisión acordada y nunca ejerce custodia prolongada del dinero.',
    s4Title: 'Uso Permitido y Conductas Prohibidas',
    s4Intro:
      'El usuario se compromete a utilizar la plataforma únicamente con fines lícitos y festivos. Queda expresamente prohibido:',
    s4Forbidden: [
      'Crear eventos ficticios o fraudulentos para obtener beneficios económicos indebidos.',
      'Utilizar tarjetas clonadas o datos bancarios de terceros sin autorización (carding).',
      'Publicar mensajes ofensivos, difamatorios o ilegales en el muro de recuerdos.',
    ],
    s4Outro:
      'La detección de fraude implicará la cancelación inmediata de la página y notificación a las autoridades competentes.',
    s5Title: 'Cierre y Eliminación de Cuenta',
    s5Body:
      'El organizador tiene derecho a finalizar su evento y eliminar su cuenta definitivamente en cualquier momento (desde el panel o vía soporte). Para solicitudes LGPD, contáctanos en',
    s6Title: 'Legislación Aplicable y Jurisdicción',
    s6Body:
      'Estos Términos se rigen por las leyes de la República Federativa de Brasil, especialmente el Código Civil, el Código de Defensa del Consumidor y la Ley General de Protección de Datos (LGPD). Se elige el fuero del domicilio del consumidor para resolver controversias.',
    footerPrompt: '¿Tienes dudas sobre nuestros términos? Escribe a nuestro soporte en',
  },
  privacy: {
    badge: 'Cumplimiento con la Ley General de Protección de Datos de Brasil (Ley nº 13.709/2018 - LGPD)',
    title: 'Política de Privacidad y Protección de Datos',
    intro:
      'En Fralda Online tratamos la privacidad de tu familia y tus invitados con el máximo rigor técnico y respeto. Esta política explica claramente cómo recopilamos, almacenamos y protegemos tus datos personales.',
    s1Title: 'Identificación del Responsable y Alcance',
    s1P1Before: 'La plataforma',
    s1P1Brand: 'Fralda Online',
    s1P1Mid: '(disponible en',
    s1P1Between: ') actúa como',
    s1P1Bold: 'Responsable del Tratamiento',
    s1P1After:
      'de los datos personales tratados en el registro y gestión de Baby Showers, procesamiento de regalos y muro de mensajes.',
    s1P2: 'Para dudas sobre privacidad o ejercer tus derechos, el contacto oficial de nuestro Delegado de Protección de Datos (DPO) es:',
    s2Title: 'Datos Personales Recopilados y Finalidades',
    s2Intro: 'Recopilamos estrictamente los datos necesarios para el funcionamiento y seguridad del servicio:',
    s2ParentsTitle: 'Organizadores (Padres)',
    s2ParentsItems: [
      { label: 'Nombre Completo y Correo:', text: 'Creación de cuenta, acceso y notificaciones esenciales.' },
      { label: 'Contraseña Cifrada:', text: 'Protegida con hash irreversible bcrypt (10 rondas).' },
      { label: 'Clave Pix e Integración MP:', text: 'Liquidación y split de regalos (cifrados con AES-256-GCM).' },
    ],
    s2GuestsTitle: 'Invitados y Pagadores',
    s2GuestsItems: [
      { label: 'Nombre del Invitado:', text: 'Visible en el muro de mensajes y en el panel de los padres.' },
      { label: 'Correo y WhatsApp (opcional):', text: 'Envío del comprobante y Número de la Suerte.' },
      { label: 'CPF:', text: 'Recopilado estrictamente cuando es requerido por normas del Banco Central de Brasil para Pix y antifraude.' },
    ],
    s3Title: 'Protección Especial de Datos de Menores (Art. 14 LGPD)',
    s3P1Before:
      'Fralda Online reconoce la sensibilidad de los datos relativos a niños y bebés por nacer. Los nombres y fechas previstas son ingresados',
    s3P1Bold: 'exclusivamente por los padres o tutores legales',
    s3P1After:
      ', quienes poseen la legitimidad para compartir esta información festiva con sus invitados.',
    s3P2: 'Bajo ninguna circunstancia usamos datos de menores para publicidad dirigida, perfiles comerciales o cesión a terceros.',
    s4Title: 'Bases Legales del Tratamiento',
    s4Intro: 'Todo tratamiento de datos en Fralda Online se fundamenta en el Artículo 7 de la LGPD:',
    s4Items: [
      { label: 'Ejecución de Contrato (Art. 7, V):', text: 'Para crear tu página, mostrar regalos y registrar votos en la porra.' },
      { label: 'Obligación Legal/Regulatoria (Art. 7, II):', text: 'Para validación del CPF en pagos Pix conforme normas del Banco Central.' },
      { label: 'Interés Legítimo y Seguridad (Art. 7, IX):', text: 'Auditoría, prevención antifraude (anti-carding) y limitación de abuso.' },
    ],
    s5Title: 'Compartición con Operadores Confiables',
    s5Before: 'Fralda Online',
    s5Bold: 'nunca vende, alquila ni comparte tus datos personales con fines publicitarios',
    s5After: '. Solo se comparten con los proveedores de infraestructura necesarios:',
    s5Operators: [
      { label: 'Mercado Pago (Pasarela y Split):', text: 'Procesamiento de pagos vía Pix o Tarjeta bajo estándares PCI-DSS.' },
      { label: 'Resend (Correos Transaccionales):', text: 'Envío de correos esenciales de confirmación y recuperación de clave.' },
      { label: 'Supabase & Vercel (Alojamiento y Base de Datos):', text: 'Almacenamiento cifrado en reposo y aislamiento mediante Row Level Security (RLS).' },
    ],
    s6Title: 'Tus Derechos como Titular (Art. 18 LGPD)',
    s6Intro: 'Tienes el derecho legal, gratuito y en cualquier momento, de:',
    s6Rights: [
      'Confirmar la existencia del tratamiento de tus datos.',
      'Acceder y consultar los datos registrados en tu cuenta.',
      'Corregir datos incompletos, inexactos o desactualizados.',
      'Solicitar la eliminación definitiva de tu cuenta y evento.',
      'Revocar el consentimiento otorgado previamente.',
      'Obtener información sobre entidades con las que se compartieron datos.',
    ],
    s6OutroBefore: 'Para ejercer cualquiera de estos derechos, escribe a',
    s6OutroAfter: 'indicando el correo registrado.',
    s7Title: 'Seguridad de la Información y Cookies',
    s7P1: 'Aplicamos medidas continuas de seguridad: TLS 1.3 / HTTPS obligatorio, cifrado AES-256 de credenciales, firmas HMAC en webhooks y Rate Limiting distribuido.',
    s7P2Before: 'Solo usamos cookies estrictamente necesarias para mantener tu sesión y preferencia de idioma de forma segura (',
    s7P2Mid1: 'con flags',
    s7P2And: 'y',
    s7P2After: '). No usamos cookies de rastreo publicitario de terceros.',
    s8Title: 'Cambios en esta Política',
    s8Body:
      'Esta política puede actualizarse periódicamente para reflejar mejoras técnicas o regulatorias. Cualquier cambio relevante será comunicado en la plataforma o por correo.',
    footerTitle: '¿Dudas sobre el tratamiento de datos personales?',
    footerContactPrefix: 'Comunícate directamente con nuestro canal de privacidad:',
  },
};

export const legalDict: Record<Locale, LegalDict> = { pt, en, es };
