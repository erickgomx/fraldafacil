# 🍼 Blueprint & Guia de Execução: Plataforma de Chá Revelação & Chá de Fralda (SaaS Multi-Tenant)

Este guia consolida toda a arquitetura, regras de negócio, modelagem de banco e o passo a passo de desenvolvimento para criar uma plataforma onde pais criam páginas personalizadas de Chá Revelação ou Chá de Fralda com arrecadação Pix e bolão interativo.

---

## 1. Visão Geral do Produto

* **Proposta de Valor:** Permitir que futuros pais criem em menos de 3 minutos uma página moderna para receber fraldas em dinheiro via Pix e engajar os convidados com o bolão "Menino ou Menina?".
* **Público-Alvo:** Grávidas, casais "pais de primeira viagem", organizadores de chá de bebê.
* **Modelo de Monetização (Receita Recorrente & Transacional):**
  * **Taxa sobre o Pix arrecadado:** Retenção automática de 5,9% sobre o valor dos presentes e votos.
  * **Opcional Upgrade VIP:** R$ 29,90 para liberar domínio próprio, fotos ilimitadas ou download do livro de recados em PDF.

---

## 2. Diferenciais & Mecânicas Interativas

1. **O Bolão do Sexo do Bebê (Engajamento Máximo):**
   * Gráfico em tempo real de votos: *Ex: 62% Apostam em Menino / 38% em Menina*.
   * Cada voto pode ser gratuito ou acompanhado de um Pix (ex: "Vote e dê R$ 20 de presente").
2. **Vitrine de Fraldas & Cuidados:**
   * Itens pré-cadastrados com valores simbólicos:
     * *Pacote Fralda RN (R$ 35)*
     * *Pacote Fralda M (R$ 55)*
     * *Estoque de Lenço Umedecido (R$ 40)*
     * *Kit Pomadas e Cuidados (R$ 75)*
     * *Noite de Sono dos Pais (R$ 100)*
3. **Mural de Recados com Ultrassom:**
   * Mensagens deixadas pelos convidados aparecem no feed com efeito visual carinhoso.

---

## 3. Schema do Banco de Dados (`prisma/schema.prisma`)

Adaptado diretamente da sua base atual do `fotografiasemdr`:

```prisma
datasource db {
  provider = "sqlite" // ou "postgresql" em produção (Supabase/Neon)
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // Hash bcrypt
  events    Event[]
  createdAt DateTime @default(now())
}

model Event {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id])
  slug            String         @unique // Ex: "cha-do-leo", "revelacao-maya-ou-noah"
  eventType       String         @default("REVELACAO") // "REVELACAO" | "FRALDA" | "AMBOS"
  babyName        String?        // Nome do bebê ou nomes prováveis
  parentsNames    String         // Ex: "Mariana e Rafael"
  eventDate       DateTime
  coverImageUrl   String?
  storyMessage    String?
  themeColor      String         @default("#38BDF8") // Azul, Rosa, Neutro
  revealedGender  String?        // "BOY" | "GIRL" | null (liberado após a revelação)
  pixKey          String?        // Chave Pix dos pais para saque
  
  items           GiftItem[]
  orders          Order[]
  guestMessages   GuestMessage[]
  pollVotes       PollVote[]
  createdAt       DateTime       @default(now())
}

model GiftItem {
  id          String   @id @default(uuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id])
  title       String   // "Pacote Fralda G"
  description String?
  price       Float
  imageUrl    String
  category    String   // "fraldas", "higiene", "brincadeiras"
  active      Boolean  @default(true)
  orders      Order[]
  createdAt   DateTime @default(now())
}

model PollVote {
  id        String   @id @default(uuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  voterName String
  guess     String   // "BOY" | "GIRL"
  createdAt DateTime @default(now())
}

model Order {
  id             String        @id @default(uuid())
  eventId        String
  event          Event         @relation(fields: [eventId], references: [id])
  giftItemId     String?
  giftItem       GiftItem?     @relation(fields: [giftItemId], references: [id])
  amount         Float
  payerName      String
  payerEmail     String
  payerPhone     String?
  payerMessage   String?
  pollGuess      String?       // Se o presente veio com palpite no bolão
  paymentMethod  String        @default("PIX")
  mpPaymentId    String?       @unique
  status         String        @default("PENDING") // "PENDING", "APPROVED", "REJECTED"
  guestMessage   GuestMessage?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model GuestMessage {
  id        String   @id @default(uuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  orderId   String   @unique
  order     Order    @relation(fields: [orderId], references: [id])
  name      String
  message   String
  createdAt DateTime @default(now())
}
```

---

## 4. Estrutura de Pastas e Rotas (`Next.js 14`)

```text
meu-projeto/
├── app/
│   ├── page.tsx                    # Landing Page institucional ("Crie seu Chá em 2 minutos")
│   ├── login/page.tsx              # Login dos pais
│   ├── cadastro/page.tsx           # Cadastro inicial (Nome, E-mail, Senha e Slug)
│   │
│   ├── painel/                     # Painel Privado dos Pais
│   │   ├── layout.tsx              # Sidebar / Navegação interna autenticada
│   │   ├── page.tsx                # Visão Geral (Total arrecadado, Placar do Bolão)
│   │   ├── presentes/page.tsx      # Ligar/desligar itens de fraldas e editar preços
│   │   ├── recados/page.tsx        # Mural de mensagens recebidas
│   │   └── configuracoes/page.tsx  # Editar foto, data, chave Pix de saque
│   │
│   ├── [slug]/                     # PÁGINA PÚBLICA DO CHÁ (Mobile-First)
│   │   ├── page.tsx                # Carrega dados do evento pelo slug
│   │   └── layout.tsx
│   │
│   └── api/
│       ├── auth/                   # Rotas de Login/Registro/Logout com Cookie JWT
│       ├── events/                 # CRUD de eventos e configurações
│       ├── orders/                 # Criar pedido Pix (Mercado Pago SDK)
│       ├── poll/                   # Registrar voto no bolão
│       └── webhooks/mercadopago/   # Confirmação automática de Pix aprovado
│
├── components/
│   ├── BabyHero.tsx                # Contagem regressiva, fotos dos pais e tema
│   ├── GenderPoll.tsx              # Componente interativo do bolão Menino vs Menina
│   ├── DiaperCatalog.tsx           # Grade de itens de fraldas e presentes
│   ├── PixCheckoutModal.tsx        # Modal com QR Code e Copia e Cola Pix
│   └── GuestbookWall.tsx           # Feed de mensagens e recados comemorativos
```

---

## 5. Passo a Passo de Implementação (Fase a Fase)

### Fase 1: Setup & Fundação
1. Inicializar o projeto (`npx create-next-app@latest` com TypeScript, Tailwind e App Router).
2. Copiar as dependências testadas do `fotografiasemdr`:
   * `mercadopago`, `prisma`, `@prisma/client`, `framer-motion`, `lucide-react`, `canvas-confetti`, `qrcode`.
3. Configurar o `prisma/schema.prisma` e rodar `npx prisma db push`.

### Fase 2: Autenticação & Cadastro Rápido
1. Criar helper de JWT / Cookie (`lib/auth.ts`) e hash de senha com `bcryptjs`.
2. Criar a tela de cadastro `/cadastro`:
   * Formulário simples: Nome dos Pais, E-mail, Senha e o link desejado (ex: `cha-do-enzo`).
3. Ao cadastrar, o sistema já injeta automaticamente **10 presentes padrões de fraldas** na tabela `GiftItem` para o casal não precisar cadastrar nada do zero.

### Fase 3: A Rota Dinâmica Pública (`app/[slug]/page.tsx`)
1. Buscar os dados do evento pelo `params.slug`.
2. Adaptar os componentes do `fotografiasemdr`:
   * **Hero:** Adaptar com tema pastel (azul/rosa/dourado) e nomes dos pais.
   * **GenderPoll:** Barra de porcentagem interativa com botão de voto.
   * **DiaperCatalog:** Grade de fraldas e itens de higiene com botão "Presentear".

### Fase 4: Checkout Pix & Webhook Mercado Pago
1. Conectar a rota `api/orders` ao SDK do Mercado Pago.
2. Gerar Pix instantâneo com `point_of_interaction.transaction_data`.
3. Configurar o Webhook para alterar o status para `APPROVED` e liberar a mensagem no mural instantaneamente.

### Fase 5: Painel dos Pais (`/painel`)
1. Resumo financeiro: Total arrecadado, taxa retida e saldo líquido.
2. Botão de configurar chave Pix para solicitação de repasse.
3. Chave para "Revelar o Sexo": Um botão especial que, quando acionado pelos pais no dia do evento, dispara confetes virtuais na tela do site e anuncia o resultado oficial.
