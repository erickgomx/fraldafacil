import type { Locale } from '../types';

const pt = {
  nav: {
    ariaLabel: 'Navegação principal',
    fees: 'Taxas',
    viewDemo: 'Ver Demonstração',
    login: 'Entrar',
    createShower: 'Criar meu Chá',
  },
  hero: {
    titlePrefix: 'Ganhe fraldas dos convidados.',
    titleHighlight: 'Receba o valor no Pix.',
    subtitle:
      'Crie uma página linda em 2 minutos e compartilhe no WhatsApp. Seus convidados escolhem pacotes de fraldas na vitrine e você recebe o dinheiro para comprar o tamanho certo quando o bebê precisar.',
    primaryCta: 'Criar Página do meu Bebê',
    secondaryCta: 'Ver Página de Exemplo',
    pills: [
      'Sem estoque parado em casa',
      'Convidado não baixa app',
      'Saque direto para seu Pix',
    ],
  },
  heroPreview: {
    liveBadge: 'Ao vivo',
    eventTypeLabel: 'Chá de Bebê & Revelação',
    pollTitle: 'Bolão do Bebê (experimente votar)',
    votesCount: '{count} palpites',
    teamBoy: '💙 Team Menino',
    teamGirl: '🩷 Team Menina',
    giftTitle: 'Pacote Mega Fraldas Tam. M',
    giftSubtitle: 'Convidado presenteia via Pix',
    giftPrice: 'R$ 85,00',
    giftAction: 'Presentear →',
    toastSender: 'Tia Camila enviou 1 pacote + recado',
    toastMessage: 'Que venha com muita saúde!',
    toastAmount: '+ R$ 85 no Pix',
  },
  contrast: {
    eyebrow: 'Simples de entender',
    title: 'Por que trocar as pilhas de pacotes pelo Chá Online?',
    subtitle:
      'No chá tradicional, você ganha dezenas de pacotes do mesmo tamanho que o bebê perde em poucas semanas. Aqui, o carinho vira praticidade.',
    traditional: {
      badge: 'Chá de Fraldas Comum',
      title: 'O que costuma acontecer',
      bullets: [
        'Muitos pacotes tamanho P repetidos que o bebê perde rápido',
        'Marcas variadas que podem causar alergia na pele do bebê',
        'Parentes que moram longe não conseguem participar',
      ],
    },
    online: {
      badge: 'Com Fralda Online',
      title: 'Liberdade para os pais, carinho para o bebê',
      bullets: [
        'Você recebe o valor em dinheiro no Pix e compra quando precisar',
        'Vitrine pronta com valores reais para o convidado escolher com gosto',
        'Bolão interativo e mural de recados para unir toda a família',
      ],
    },
  },
  steps: {
    eyebrow: 'Passo a Passo',
    title: 'Pronto em 3 passos simples.',
    cards: [
      {
        step: 'PASSO 01',
        title: 'Crie sua página em 2 minutos',
        description:
          'Coloque o nome dos pais, a data prevista e escolha o link exclusivo do seu bebê. A lista de fraldas já vem pronta para usar.',
        footer: '10 itens essenciais já configurados',
      },
      {
        step: 'PASSO 02',
        title: 'Envie o link no WhatsApp',
        description:
          'Seus amigos e familiares abrem direto pelo celular, votam no bolão, escolhem um pacote de fraldas e deixam uma mensagem.',
        footer: 'Sem precisar baixar aplicativo',
      },
      {
        step: 'PASSO 03',
        title: 'Receba direto no seu Mercado Pago',
        description:
          'Por segurança jurídica e bancária, o valor dos presentes cai diretamente na sua conta do Mercado Pago. Caso não tenha, você cria a sua gratuitamente em 2 minutos.',
        footer: 'Intermediação Oficial',
      },
    ],
  },
  security: {
    badge: 'Segurança & Transparência',
    title: 'Intermediação oficial via Mercado Pago',
    processorLabel: 'Processador Oficial',
    leftTitle: 'Sem custódia da plataforma',
    leftBody:
      'O Fralda Online não retém o dinheiro do seu chá. Usamos a infraestrutura do Mercado Pago para que o valor de cada presente caia direto na sua conta, com total transparência e proteção antifraude.',
    rightTitle: 'Por que é necessário criar conta no Mercado Pago?',
    rightBody:
      'Por exigência de segurança bancária e regulamentação fiscal, os pais precisam vincular ou criar uma conta gratuita no Mercado Pago. O cadastro leva apenas 2 minutos e garante que o dinheiro fique sempre sob seu controle.',
    checks: [
      'Conexão simples em 1 clique no painel',
      'Convidado não precisa ter conta no Mercado Pago',
      'Saques e transferências imediatas via Pix',
    ],
  },
  pillars: {
    eyebrow: 'O que está incluído',
    title: 'Uma experiência encantadora para quem envia e prática para quem recebe.',
    card1: {
      tag: '01 · VITRINE DE PRESENTES',
      title: 'Catálogo de fraldas e mimos pronto para usar',
      description:
        'Sua página já nasce com pacotes de fraldas RN, P, M, G, lenços umedecidos e itens de cuidado com preços sugeridos. Você pode editar valores ou criar novos itens como preferir.',
      samples: [
        { title: 'Fralda Tam. P', price: 'R$ 55' },
        { title: 'Fralda Tam. M', price: 'R$ 85' },
        { title: 'Kit Banho', price: 'R$ 120' },
      ],
    },
    card2: {
      tag: '02 · INTERATIVIDADE',
      title: 'Bolão Menino ou Menina',
      description:
        'Perfeito para Chá Revelação. Os convidados dão seu palpite e acompanham o placar da família em tempo real.',
      boyLabel: 'Menino · 58%',
      girlLabel: '42% · Menina',
    },
    card3: {
      tag: '03 · RECORDAÇÃO PARA SEMPRE',
      title: 'Mural de mensagens carinhosas da família',
      description:
        'Cada presente confirmado publica automaticamente o recado do convidado no mural da página. Uma lembrança afetuosa de quem esteve presente desde o início.',
      author: 'Vovó Cida',
      badge: '+ Mimo enviado',
      quote:
        'O coração da vovó já transborda de alegria! Que venha com muita saúde para iluminar nossa família.',
    },
  },
  fees: {
    eyebrow: 'Taxas Transparentes',
    title: 'Grátis para criar. Você só paga quando recebe.',
    subtitle:
      'Sem mensalidade, sem fidelidade e sem surpresas. A taxa da plataforma é de 4,99% + tarifa do Mercado Pago (0,99% no Pix ou 3,99% no cartão) — e você escolhe quem assume.',
    freeCard: {
      badge: 'Criar e usar a página',
      price: 'R$ 0',
      priceTag: 'Criação gratuita',
      description:
        'Publique sua lista sem pagar nada e sem mensalidade. Todos os recursos já vêm liberados.',
      bullets: [
        'Lista pronta e personalizável',
        'Bolão Menino ou Menina + Sorteio',
        'Mural com exportação em PDF',
      ],
    },
    guestCard: {
      badge: 'Repassar ao convidado',
      recommended: 'Recomendado',
      title: 'Receba 100% do valor líquido',
      description:
        'As taxas são somadas no checkout com cálculo exato. Os pais recebem o valor integral do presente sem descontos.',
      pixLabel: 'Exemplo no Pix · Presente R$ 100,00',
      pixTextBefore: 'Convidado paga',
      pixPaid: 'R$ 106,04',
      pixTextMid: '→',
      pixReceived: 'você recebe R$ 100,00 cheios',
      cardLabel: 'Exemplo no Cartão · Presente R$ 100,00',
      cardTextBefore: 'Convidado paga',
      cardPaid: 'R$ 109,35',
      cardTextMid: '→',
      cardReceived: 'você recebe R$ 100,00 cheios',
    },
    parentsCard: {
      badge: 'Opcional · Pais assumem',
      title: 'Convidado paga o valor seco',
      description:
        'Prefere absorver as taxas? O convidado paga exatamente o valor anunciado (ex: R$ 100,00) e o desconto ocorre no repasse.',
      pixLabel: 'No Pix (4,99% + 0,99% MP)',
      pixPrefix: 'De R$ 100,00 →',
      pixNet: 'você recebe R$ 94,02 líquidos',
      cardLabel: 'No Cartão (4,99% + 3,99% MP)',
      cardPrefix: 'De R$ 100,00 →',
      cardNet: 'você recebe R$ 91,02 líquidos',
    },
    footnote:
      'Você pode alternar entre repassar ou assumir as taxas a qualquer momento nas Configurações do seu painel.',
  },
  faq: {
    eyebrow: 'Tire suas dúvidas',
    title: 'Perguntas frequentes',
    items: [
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
    ],
  },
  ctaFinal: {
    badge: 'Criação gratuita · Pronto em 2 minutos',
    title: 'Prepare a chegada do seu bebê com tranquilidade.',
    subtitle:
      'Crie agora a página do seu Chá de Bebê ou Revelação, personalize do seu jeito e compartilhe com quem você ama.',
    primary: 'Criar Página do meu Chá',
    secondary: 'Testar Demonstração',
  },
  footer: {
    tagline: 'A plataforma independente para Chás de Bebê & Revelação',
    paymentsVia: 'Pagamentos via',
    support: 'Suporte',
    terms: 'Termos de Uso',
    privacy: 'Privacidade (LGPD)',
  },
  demo: {
    topBanner: 'Modo Demonstração Interativo — Esta é a experiência exata que seus convidados terão',
    createShower: 'Criar meu Chá',
    simulatorLabel: 'Simulador do Chá:',
    revealBoy: 'Revelar: Menino',
    revealGirl: 'Revelar: Menina',
    reset: 'Resetar',
    resetTitle: 'Voltar ao início',
    storyMessage:
      'Estamos muito felizes e ansiosos pela chegada do nosso primeiro bebê. Criamos este espaço para compartilhar essa alegria com quem amamos.',
    initialMessages: [
      {
        id: 'msg-1',
        name: 'Tia Camila & Tio Bruno',
        message:
          'Estamos tão ansiosos para ver o rostinho desse anjinho! Que venha com muita saúde para encher a casa de risadas.',
      },
      {
        id: 'msg-2',
        name: 'Vovó Cida',
        message:
          'O coração da vovó já transborda de alegria! Meu palpite é que vai ser um menino com a calma da mãe.',
      },
      {
        id: 'msg-3',
        name: 'Dinda Carol',
        message:
          'Presentinho de coração para o amor da dinda! Mal posso esperar para segurar no colo.',
      },
      {
        id: 'msg-4',
        name: 'Lucas & Família',
        message:
          'Mari e Rafa, parabéns por esse momento abençoado! Toda a felicidade do mundo para vocês.',
      },
    ],
    guestYouName: 'Você (Convidado)',
    guestYouMessageGirl: 'Parabéns Mariana e Rafael! Muita saúde para a Helena!',
    guestYouMessageBoy: 'Parabéns Mariana e Rafael! Muita saúde para o Leonardo!',
    guestYouMessageNeutral: 'Parabéns Mariana e Rafael! Muita saúde para esse bebê tão esperado!',
    floatingTitle: 'Pronto para o seu próprio Chá?',
    floatingSubtitle: 'Crie sua página e receba via Pix em menos de 2 minutos.',
    floatingCta: 'Criar Página',
  },
};

export type LandingDict = typeof pt;

const en: LandingDict = {
  nav: {
    ariaLabel: 'Main navigation',
    fees: 'Pricing',
    viewDemo: 'View Demo',
    login: 'Sign in',
    createShower: 'Create my Shower',
  },
  hero: {
    titlePrefix: 'Receive diapers from guests.',
    titleHighlight: 'Get the money straight via Pix.',
    subtitle:
      'Create a beautiful page in 2 minutes and share it on WhatsApp. Your guests pick diaper packs from your registry and you receive the funds to buy the exact size when your baby needs it.',
    primaryCta: 'Create My Baby’s Page',
    secondaryCta: 'See Example Page',
    pills: [
      'No boxes piling up at home',
      'No app download for guests',
      'Instant transfer to your account',
    ],
  },
  heroPreview: {
    liveBadge: 'Live',
    eventTypeLabel: 'Baby Shower & Gender Reveal',
    pollTitle: 'Baby Poll (try voting)',
    votesCount: '{count} guesses',
    teamBoy: '💙 Team Boy',
    teamGirl: '🩷 Team Girl',
    giftTitle: 'Mega Diaper Pack Size M',
    giftSubtitle: 'Guest sends gift via Pix',
    giftPrice: 'R$ 85.00',
    giftAction: 'Gift now →',
    toastSender: 'Aunt Camila sent 1 pack + note',
    toastMessage: 'Wishing your baby endless health!',
    toastAmount: '+ R$ 85 via Pix',
  },
  contrast: {
    eyebrow: 'Easy to understand',
    title: 'Why swap stacks of physical packs for an Online Shower?',
    subtitle:
      'In a traditional shower, you get dozens of packs in the same size that your baby outgrows in weeks. Here, love turns into flexibility.',
    traditional: {
      badge: 'Traditional Baby Shower',
      title: 'What usually happens',
      bullets: [
        'Too many repeated Size 1 packs your baby outgrows fast',
        'Mixed brands that may irritate your newborn’s skin',
        'Relatives who live far away miss out on joining in',
      ],
    },
    online: {
      badge: 'With Fralda Online',
      title: 'Freedom for parents, love for baby',
      bullets: [
        'You receive the cash value via Pix and buy whenever needed',
        'Ready-made showcase with realistic items guests love picking',
        'Interactive guessing poll and guestbook bringing everyone together',
      ],
    },
  },
  steps: {
    eyebrow: 'Step by Step',
    title: 'Ready in 3 simple steps.',
    cards: [
      {
        step: 'STEP 01',
        title: 'Create your page in 2 minutes',
        description:
          'Enter the parents’ names, due date, and pick your baby’s unique link. Your diaper registry comes pre-built and ready to go.',
        footer: '10 essential items pre-configured',
      },
      {
        step: 'STEP 02',
        title: 'Share the link on WhatsApp',
        description:
          'Friends and family open it right on their phone, vote in the guessing poll, pick a diaper pack, and write a loving note.',
        footer: 'No app installation required',
      },
      {
        step: 'STEP 03',
        title: 'Receive directly in Mercado Pago',
        description:
          'For banking compliance and security, gift funds go directly to your Mercado Pago account. If you don’t have one yet, you can create it for free in 2 minutes.',
        footer: 'Official Processing',
      },
    ],
  },
  security: {
    badge: 'Security & Transparency',
    title: 'Official processing via Mercado Pago',
    processorLabel: 'Official Processor',
    leftTitle: 'Zero platform custody',
    leftBody:
      'Fralda Online never holds your baby shower funds. We use Mercado Pago’s infrastructure so every gift goes straight into your own account with full transparency and fraud protection.',
    rightTitle: 'Why do parents need a Mercado Pago account?',
    rightBody:
      'Due to banking regulations and tax compliance, parents link or open a free Mercado Pago account. Setup takes 2 minutes and keeps 100% of your funds under your control.',
    checks: [
      'One-click connection from your dashboard',
      'Guests do not need a Mercado Pago account',
      'Instant withdrawals and Pix transfers',
    ],
  },
  pillars: {
    eyebrow: 'What is included',
    title: 'A delightful experience for guests and effortless for parents.',
    card1: {
      tag: '01 · GIFT SHOWCASE',
      title: 'Ready-to-use diaper & baby care catalog',
      description:
        'Your page launches with Newborn, P, M, G diaper packs, wipes, and care kits with suggested amounts. Edit prices or add custom gifts anytime.',
      samples: [
        { title: 'Diaper Size P', price: 'R$ 55' },
        { title: 'Diaper Size M', price: 'R$ 85' },
        { title: 'Bath Kit', price: 'R$ 120' },
      ],
    },
    card2: {
      tag: '02 · INTERACTIVITY',
      title: 'Boy or Girl Guessing Poll',
      description:
        'Ideal for Gender Reveals. Guests cast their votes and watch the live family scoreboard update in real time.',
      boyLabel: 'Boy · 58%',
      girlLabel: '42% · Girl',
    },
    card3: {
      tag: '03 · KEEPSAKE MEMORIES',
      title: 'Warm family guestbook wall',
      description:
        'Every confirmed gift automatically posts the guest’s note onto your event wall—a heartwarming keepsake from everyone who celebrated with you.',
      author: 'Grandma Cida',
      badge: '+ Gift sent',
      quote:
        'Grandma’s heart is already overflowing with joy! Wishing endless health to brighten our family.',
    },
  },
  fees: {
    eyebrow: 'Transparent Pricing',
    title: 'Free to create. Only pay when you receive.',
    subtitle:
      'No monthly fees, no lock-in, and no surprises. Our platform fee is 4.99% + Mercado Pago processing (0.99% on Pix or 3.99% on Card) — and you choose who covers it.',
    freeCard: {
      badge: 'Create and run your page',
      price: 'R$ 0',
      priceTag: 'Free to create',
      description:
        'Publish your registry for free with no recurring subscription. Every feature is unlocked from day one.',
      bullets: [
        'Ready & customizable gift list',
        'Gender Poll + Lucky Raffle',
        'Guestbook with PDF export',
      ],
    },
    guestCard: {
      badge: 'Pass fees to guest',
      recommended: 'Recommended',
      title: 'Receive 100% net amount',
      description:
        'Fees are added transparently at checkout using exact gross-up math. Parents receive the full gift price with zero deductions.',
      pixLabel: 'Pix Example · R$ 100.00 Gift',
      pixTextBefore: 'Guest pays',
      pixPaid: 'R$ 106.04',
      pixTextMid: '→',
      pixReceived: 'you receive full R$ 100.00',
      cardLabel: 'Card Example · R$ 100.00 Gift',
      cardTextBefore: 'Guest pays',
      cardPaid: 'R$ 109.35',
      cardTextMid: '→',
      cardReceived: 'you receive full R$ 100.00',
    },
    parentsCard: {
      badge: 'Optional · Parents cover fees',
      title: 'Guest pays listed gift price',
      description:
        'Prefer covering fees yourself? Guests pay the exact listed amount (e.g., R$ 100.00) and fees are deducted from payout.',
      pixLabel: 'On Pix (4.99% + 0.99% MP)',
      pixPrefix: 'Out of R$ 100.00 →',
      pixNet: 'you receive R$ 94.02 net',
      cardLabel: 'On Card (4.99% + 3.99% MP)',
      cardPrefix: 'Out of R$ 100.00 →',
      cardNet: 'you receive R$ 91.02 net',
    },
    footnote:
      'You can switch between passing fees to guests or covering them anytime in your Dashboard Settings.',
  },
  faq: {
    eyebrow: 'Questions answered',
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Do guests buy physical diapers or send cash?',
        a: 'They pick diaper packs and gifts from your virtual storefront, and you receive the cash equivalent via Pix. That way you buy the exact brand and size as your baby grows.',
      },
      {
        q: 'Do guests need to download an app or create an account?',
        a: 'No. Guests do not need to download anything or sign up. They open your WhatsApp link, pick a gift, and pay via any banking app with Pix or credit card.',
      },
      {
        q: 'How do I receive gift money? Do I need a Mercado Pago account?',
        a: 'Yes. For maximum banking security and tax compliance, payments are officially processed by Mercado Pago straight into your account without our platform holding your funds. Creating a free account takes only 2 minutes during setup.',
      },
      {
        q: 'Does it work for both Gender Reveals and Diaper Showers?',
        a: 'Yes! You can enable the Boy vs. Girl Poll for a Gender Reveal, or use just the diaper showcase and guestbook if the baby’s gender is already known.',
      },
      {
        q: 'How much does it cost? Are there monthly subscriptions or hidden fees?',
        a: 'Creating and hosting your page is 100% free with no monthly fees or gift limits. When a gift is confirmed, there is a 4.99% platform fee plus Mercado Pago processing (0.99% Pix or 3.99% Card). You choose whether guests cover it (so you receive 100% net) or you absorb it.',
      },
      {
        q: 'Can I run a lucky raffle and export guestbook wishes?',
        a: 'Yes! Enable the optional Lucky Raffle in settings so every confirmed gift generates 1 Lucky Number automatically. All guest wishes are saved in your dashboard with one-tap WhatsApp thank-yous and full PDF export.',
      },
    ],
  },
  ctaFinal: {
    badge: 'Free to create · Ready in 2 minutes',
    title: 'Prepare for your baby’s arrival with peace of mind.',
    subtitle:
      'Create your Baby Shower or Gender Reveal page now, customize it your way, and share it with everyone you love.',
    primary: 'Create My Shower Page',
    secondary: 'Try Live Demo',
  },
  footer: {
    tagline: 'The independent platform for Baby Showers & Gender Reveals',
    paymentsVia: 'Payments powered by',
    support: 'Support',
    terms: 'Terms of Use',
    privacy: 'Privacy (LGPD)',
  },
  demo: {
    topBanner: 'Interactive Demo Mode — This is the exact experience your guests will see',
    createShower: 'Create my Shower',
    simulatorLabel: 'Shower Simulator:',
    revealBoy: 'Reveal: Boy',
    revealGirl: 'Reveal: Girl',
    reset: 'Reset',
    resetTitle: 'Back to start',
    storyMessage:
      'We are overjoyed and counting the days to meet our first baby. We created this space to share this happiness with the people we love.',
    initialMessages: [
      {
        id: 'msg-1',
        name: 'Aunt Camila & Uncle Bruno',
        message:
          'We are so excited to meet this little angel! Wishing loads of health and laughter to fill your home.',
      },
      {
        id: 'msg-2',
        name: 'Grandma Cida',
        message:
          'Grandma’s heart is bursting with joy! My guess is a sweet baby boy with Mom’s calm personality.',
      },
      {
        id: 'msg-3',
        name: 'Godmother Carol',
        message:
          'A heartfelt little gift for Godmom’s sweetheart! Cannot wait to hold this baby.',
      },
      {
        id: 'msg-4',
        name: 'Lucas & Family',
        message:
          'Mari and Rafa, congratulations on this blessed chapter! Wishing your family all the happiness in the world.',
      },
    ],
    guestYouName: 'You (Guest)',
    guestYouMessageGirl: 'Congratulations Mariana & Rafael! Wishing baby Helena so much health!',
    guestYouMessageBoy: 'Congratulations Mariana & Rafael! Wishing baby Leonardo so much health!',
    guestYouMessageNeutral:
      'Congratulations Mariana & Rafael! Wishing this eagerly awaited baby endless health!',
    floatingTitle: 'Ready for your own Baby Shower?',
    floatingSubtitle: 'Create your page and receive via Pix in under 2 minutes.',
    floatingCta: 'Create Page',
  },
};

const es: LandingDict = {
  nav: {
    ariaLabel: 'Navegación principal',
    fees: 'Tarifas',
    viewDemo: 'Ver Demostración',
    login: 'Iniciar sesión',
    createShower: 'Crear mi Shower',
  },
  hero: {
    titlePrefix: 'Recibe pañales de tus invitados.',
    titleHighlight: 'Cobra el valor directo por Pix.',
    subtitle:
      'Crea una hermosa página en 2 minutos y compártela por WhatsApp. Tus invitados eligen paquetes de pañales en la vitrina y tú recibes el dinero para comprar la talla exacta cuando el bebé lo necesite.',
    primaryCta: 'Crear Página de mi Bebé',
    secondaryCta: 'Ver Página de Ejemplo',
    pills: [
      'Sin cajas acumuladas en casa',
      'El invitado no descarga apps',
      'Retiro directo a tu cuenta',
    ],
  },
  heroPreview: {
    liveBadge: 'En vivo',
    eventTypeLabel: 'Baby Shower y Revelación',
    pollTitle: 'Porra del Bebé (prueba votar)',
    votesCount: '{count} votos',
    teamBoy: '💙 Team Niño',
    teamGirl: '🩷 Team Niña',
    giftTitle: 'Pack Mega Pañales Talla M',
    giftSubtitle: 'Invitado regala vía Pix',
    giftPrice: 'R$ 85,00',
    giftAction: 'Regalar →',
    toastSender: 'Tía Camila envió 1 paquete + nota',
    toastMessage: '¡Que venga con mucha salud!',
    toastAmount: '+ R$ 85 en Pix',
  },
  contrast: {
    eyebrow: 'Fácil de entender',
    title: '¿Por qué cambiar las pilas de paquetes por el Shower Online?',
    subtitle:
      'En el baby shower tradicional recibes decenas de paquetes de la misma talla que el bebé deja en pocas semanas. Aquí, el cariño se convierte en practicidad.',
    traditional: {
      badge: 'Baby Shower Común',
      title: 'Lo que suele pasar',
      bullets: [
        'Muchos paquetes talla P repetidos que el bebé deja rápido',
        'Marcas variadas que pueden irritar la piel del bebé',
        'Familiares que viven lejos no logran participar',
      ],
    },
    online: {
      badge: 'Con Fralda Online',
      title: 'Libertad para los padres, cariño para el bebé',
      bullets: [
        'Recibes el dinero vía Pix y compras cuando realmente lo necesites',
        'Vitrina lista con precios reales para que el invitado elija con gusto',
        'Porra interactiva y muro de mensajes para unir a toda la familia',
      ],
    },
  },
  steps: {
    eyebrow: 'Paso a Paso',
    title: 'Listo en 3 pasos simples.',
    cards: [
      {
        step: 'PASO 01',
        title: 'Crea tu página en 2 minutos',
        description:
          'Agrega el nombre de los padres, la fecha estimada y elige el enlace exclusivo de tu bebé. La lista de pañales ya viene lista para usar.',
        footer: '10 artículos esenciales listos',
      },
      {
        step: 'PASO 02',
        title: 'Envía el enlace por WhatsApp',
        description:
          'Tus amigos y familiares entran directo desde el celular, votan en la porra, eligen un paquete de pañales y dejan un mensaje.',
        footer: 'Sin descargar ninguna aplicación',
      },
      {
        step: 'PASO 03',
        title: 'Recibe directo en tu Mercado Pago',
        description:
          'Por seguridad bancaria y fiscal, el valor de los regalos cae directo en tu cuenta de Mercado Pago. Si aún no tienes una, la creas gratis en 2 minutos.',
        footer: 'Intermediación Oficial',
      },
    ],
  },
  security: {
    badge: 'Seguridad y Transparencia',
    title: 'Intermediación oficial vía Mercado Pago',
    processorLabel: 'Procesador Oficial',
    leftTitle: 'Sin custodia de la plataforma',
    leftBody:
      'Fralda Online no retiene el dinero de tu baby shower. Usamos la infraestructura de Mercado Pago para que cada regalo caiga directo a tu cuenta con total transparencia y protección antifraude.',
    rightTitle: '¿Por qué es necesario crear cuenta en Mercado Pago?',
    rightBody:
      'Por exigencia de seguridad bancaria y regulación fiscal, los padres vinculan o crean una cuenta gratuita en Mercado Pago. El registro toma 2 minutos y deja el dinero siempre bajo tu control.',
    checks: [
      'Conexión simple en 1 clic en el panel',
      'El invitado no necesita cuenta en Mercado Pago',
      'Retiros y transferencias inmediatas vía Pix',
    ],
  },
  pillars: {
    eyebrow: 'Qué está incluido',
    title: 'Una experiencia encantadora para quien regala y práctica para quien recibe.',
    card1: {
      tag: '01 · VITRINA DE REGALOS',
      title: 'Catálogo de pañales y detalles listo para usar',
      description:
        'Tu página nace con paquetes de pañales RN, P, M, G, toallitas húmedas y kits de cuidado con valores sugeridos. Puedes editar precios o crear nuevos artículos.',
      samples: [
        { title: 'Pañal Talla P', price: 'R$ 55' },
        { title: 'Pañal Talla M', price: 'R$ 85' },
        { title: 'Kit Baño', price: 'R$ 120' },
      ],
    },
    card2: {
      tag: '02 · INTERACTIVIDAD',
      title: 'Porra Niño o Niña',
      description:
        'Perfecto para Revelación de Género. Los invitados dan su voto y siguen el marcador de la familia en tiempo real.',
      boyLabel: 'Niño · 58%',
      girlLabel: '42% · Niña',
    },
    card3: {
      tag: '03 · RECUERDO PARA SIEMPRE',
      title: 'Muro de mensajes cariñosos de la familia',
      description:
        'Cada regalo confirmado publica automáticamente el mensaje del invitado en el muro de tu página. Un recuerdo inolvidable de quienes estuvieron desde el inicio.',
      author: 'Abuela Cida',
      badge: '+ Regalo enviado',
      quote:
        '¡El corazón de la abuela ya rebosa de alegría! Que venga con mucha salud para iluminar nuestra familia.',
    },
  },
  fees: {
    eyebrow: 'Tarifas Transparentes',
    title: 'Gratis para crear. Solo pagas cuando recibes.',
    subtitle:
      'Sin mensualidades, sin permanencia y sin sorpresas. La comisión de la plataforma es de 4,99% + tarifa de Mercado Pago (0,99% en Pix o 3,99% en tarjeta) — y tú decides quién la asume.',
    freeCard: {
      badge: 'Crear y usar la página',
      price: 'R$ 0',
      priceTag: 'Creación gratuita',
      description:
        'Publica tu lista sin pagar nada ni suscripciones. Todas las funciones ya vienen activadas.',
      bullets: [
        'Lista lista y personalizable',
        'Porra Niño o Niña + Sorteo',
        'Muro con exportación en PDF',
      ],
    },
    guestCard: {
      badge: 'Trasladar al invitado',
      recommended: 'Recomendado',
      title: 'Recibe el 100% del valor neto',
      description:
        'Las tarifas se suman en el checkout con cálculo exacto. Los padres reciben el valor íntegro del regalo sin descuentos.',
      pixLabel: 'Ejemplo en Pix · Regalo R$ 100,00',
      pixTextBefore: 'Invitado paga',
      pixPaid: 'R$ 106,04',
      pixTextMid: '→',
      pixReceived: 'tú recibes R$ 100,00 netos',
      cardLabel: 'Ejemplo en Tarjeta · Regalo R$ 100,00',
      cardTextBefore: 'Invitado paga',
      cardPaid: 'R$ 109,35',
      cardTextMid: '→',
      cardReceived: 'tú recibes R$ 100,00 netos',
    },
    parentsCard: {
      badge: 'Opcional · Padres asumen',
      title: 'Invitado paga el valor exacto',
      description:
        '¿Prefieres absorber las comisiones? El invitado paga exactamente el valor publicado (ej: R$ 100,00) y el descuento ocurre al liquidar.',
      pixLabel: 'En Pix (4,99% + 0,99% MP)',
      pixPrefix: 'De R$ 100,00 →',
      pixNet: 'recibes R$ 94,02 netos',
      cardLabel: 'En Tarjeta (4,99% + 3,99% MP)',
      cardPrefix: 'De R$ 100,00 →',
      cardNet: 'recibes R$ 91,02 netos',
    },
    footnote:
      'Puedes cambiar entre trasladar o asumir las comisiones en cualquier momento desde la Configuración de tu panel.',
  },
  faq: {
    eyebrow: 'Resuelve tus dudas',
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Los invitados compran pañales físicos o envían el dinero?',
        a: 'Eligen paquetes de pañales y regalos en tu vitrina virtual, pero tú recibes el monto en dinero vía Pix. Así compras la marca y talla exactas conforme crece el bebé.',
      },
      {
        q: '¿Mis invitados necesitan descargar una app o crear cuenta?',
        a: 'No. Tus invitados no necesitan descargar ninguna app ni registrarse. Solo abren el enlace en WhatsApp, eligen el regalo y pagan desde cualquier banco con Pix o tarjeta.',
      },
      {
        q: '¿Cómo recibo el dinero? ¿Debo tener cuenta en Mercado Pago?',
        a: 'Sí. Por máxima seguridad bancaria y transparencia fiscal, todos los pagos son procesados oficialmente por Mercado Pago directo a tu cuenta, sin que la plataforma retenga tu dinero. Crearla toma 2 minutos y es gratis.',
      },
      {
        q: '¿Sirve tanto para Revelación de Género como para Baby Shower?',
        a: '¡Sí! Puedes activar la Porra Niño vs. Niña para Revelación o usar solo la vitrina de regalos y el muro de mensajes si ya saben el sexo del bebé.',
      },
      {
        q: '¿Cuánto cuesta crear el evento? ¿Hay mensualidades o cargos ocultos?',
        a: 'Crear y mantener tu página es 100% gratis, sin mensualidades ni límite de regalos. Al recibir un regalo confirmado aplica la comisión de la plataforma de 4,99% más la tarifa de Mercado Pago (0,99% Pix o 3,99% tarjeta). Tú eliges si la paga el invitado o la asumes.',
      },
      {
        q: '¿Puedo hacer sorteo (Baby Rifa) y guardar los mensajes de recuerdo?',
        a: '¡Sí! Puedes activar el sorteo opcional en tu panel para que cada regalo confirmado genere automáticamente 1 Número de la Suerte. Además, todos los mensajes quedan guardados con botón de agradecimiento por WhatsApp y descarga completa en PDF.',
      },
    ],
  },
  ctaFinal: {
    badge: 'Creación gratuita · Listo en 2 minutos',
    title: 'Prepara la llegada de tu bebé con tranquilidad.',
    subtitle:
      'Crea ahora la página de tu Baby Shower o Revelación, personalízala a tu manera y compártela con quienes más amas.',
    primary: 'Crear Página de mi Shower',
    secondary: 'Probar Demostración',
  },
  footer: {
    tagline: 'La plataforma independiente para Baby Showers y Revelación',
    paymentsVia: 'Pagos vía',
    support: 'Soporte',
    terms: 'Términos de Uso',
    privacy: 'Privacidad (LGPD)',
  },
  demo: {
    topBanner: 'Modo Demostración Interactivo — Esta es la experiencia exacta que verán tus invitados',
    createShower: 'Crear mi Shower',
    simulatorLabel: 'Simulador del Evento:',
    revealBoy: 'Revelar: Niño',
    revealGirl: 'Revelar: Niña',
    reset: 'Reiniciar',
    resetTitle: 'Volver al inicio',
    storyMessage:
      'Estamos muy felices y ansiosos por la llegada de nuestro primer bebé. Creamos este espacio para compartir esta alegría con quienes amamos.',
    initialMessages: [
      {
        id: 'msg-1',
        name: 'Tía Camila & Tío Bruno',
        message:
          '¡Qué emoción esperar a este angelito! Que venga con mucha salud para llenar la casa de risas.',
      },
      {
        id: 'msg-2',
        name: 'Abuela Cida',
        message:
          '¡El corazón de la abuela ya rebosa de alegría! Mi voto es que será niño con la calma de mamá.',
      },
      {
        id: 'msg-3',
        name: 'Madrina Carol',
        message:
          '¡Un regalito de corazón para el amor de la madrina! Ya quiero tenerlo en mis brazos.',
      },
      {
        id: 'msg-4',
        name: 'Lucas & Familia',
        message:
          'Mari y Rafa, ¡felicidades por este momento bendecido! Toda la felicidad del mundo para ustedes.',
      },
    ],
    guestYouName: 'Tú (Invitado)',
    guestYouMessageGirl: '¡Felicidades Mariana y Rafael! ¡Mucha salud para Helena!',
    guestYouMessageBoy: '¡Felicidades Mariana y Rafael! ¡Mucha salud para Leonardo!',
    guestYouMessageNeutral:
      '¡Felicidades Mariana y Rafael! ¡Mucha salud para ese bebé tan esperado!',
    floatingTitle: '¿Listos para su propio Baby Shower?',
    floatingSubtitle: 'Crea tu página y cobra vía Pix en menos de 2 minutos.',
    floatingCta: 'Crear Página',
  },
};

export const landingDict: Record<Locale, LandingDict> = { pt, en, es };
