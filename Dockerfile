# ==============================================================================
# PRODUCTION DOCKERFILE - HARDENED MULTI-STAGE
# Standards: CIS Docker Benchmark v1.6.0, NIST SP 800-190, OWASP ASVS v4.0.3
# Base: Node 20 Alpine (Minimal Attack Surface)
# ==============================================================================

# Stage 1: Dependências de Build
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev --ignore-scripts && \
    npx prisma generate

# Stage 2: Compilação da Aplicação
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Runtime de Produção Não-Privilegiado (CIS Benchmark 4.1)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Criação de grupo e usuário de sistema dedicado não-root (UID 1001)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    apk add --no-cache openssl curl

# Copia artefatos mínimos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# Healthcheck de Integridade (CIS Benchmark 4.6)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
