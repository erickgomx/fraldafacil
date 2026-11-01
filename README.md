# 🍼 Fralda Fácil - SaaS de Chá Revelação & Chá de Fralda

Plataforma SaaS multi-tenant onde futuros pais criam páginas personalizadas para arrecadação de presentes em dinheiro via Pix e engajam convidados com o bolão interativo "Menino ou Menina?".

---

## 🚀 Tecnologias

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados & ORM:** [Prisma](https://www.prisma.io/) (SQLite local / PostgreSQL prod)
- **Pagamentos:** [Mercado Pago SDK](https://www.mercadopago.com.br/developers) (Pix transparente)
- **Animações & Efeitos:** [Framer Motion](https://www.framer.com/motion/) e [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🛠️ Começando

1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
Copie `.env.example` para `.env` e preencha as credenciais.

3. Sincronize o banco de dados:
```bash
npx prisma db push
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
