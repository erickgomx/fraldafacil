/**
 * Utilitários de validação e formatação para dados brasileiros (CPF, Telefone, E-mail).
 * Em conformidade com as regras do BACEN e APIs de pagamento do Mercado Pago.
 */

/** Remove todos os caracteres não numéricos. */
export function cleanDigits(val: string | null | undefined): string {
  if (!val) return '';
  return val.replace(/\D/g, '');
}

/** Formata CPF no padrão 000.000.000-00 enquanto o usuário digita. */
export function formatCpf(val: string): string {
  const digits = cleanDigits(val).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/** Formata telefone/WhatsApp no padrão (00) 00000-0000 ou (00) 0000-0000. */
export function formatPhone(val: string): string {
  const digits = cleanDigits(val).slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Valida se um CPF é matematicamente autêntico de acordo com os dígitos verificadores
 * oficiais da Receita Federal do Brasil.
 */
export function isValidCpf(cpf: string | null | undefined): boolean {
  if (!cpf) return false;
  const digits = cleanDigits(cpf);

  if (digits.length !== 11) return false;

  // Rejeita sequências de dígitos iguais conhecidas (ex: 00000000000, 11111111111)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let firstCheck = (sum * 10) % 11;
  if (firstCheck === 10 || firstCheck === 11) firstCheck = 0;
  if (firstCheck !== parseInt(digits.charAt(9), 10)) return false;

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  let secondCheck = (sum * 10) % 11;
  if (secondCheck === 10 || secondCheck === 11) secondCheck = 0;
  if (secondCheck !== parseInt(digits.charAt(10), 10)) return false;

  return true;
}

/** Validação de formato de e-mail */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export const ALLOWED_EVENT_TYPES = ['REVELACAO', 'FRALDA', 'AMBOS'] as const;
export type EventTypeValue = (typeof ALLOWED_EVENT_TYPES)[number];

export function isValidEventType(val: unknown): val is EventTypeValue {
  return typeof val === 'string' && (ALLOWED_EVENT_TYPES as readonly string[]).includes(val);
}

export const RESERVED_SLUGS = new Set<string>([
  'admin',
  'api',
  'login',
  'logout',
  'cadastro',
  'register',
  'painel',
  'dashboard',
  'demo',
  'privacidade',
  'termos',
  'recuperar-senha',
  'redefinir-senha',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'opengraph-image',
  'apple-icon',
  'icon',
  'icon.svg',
  '_next',
  'static',
  'public',
  'suporte',
  'ajuda',
  'sobre',
  'contato',
  'app',
  'www',
  'webhooks',
  'webhook',
  'checkout',
  'pagamento',
  'pagamentos',
  'sorteio',
  'health',
  'status',
]);

/** Normaliza texto em slug URL-friendly (minúsculas, sem acentos, apenas [a-z0-9-]). */
export function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Verifica se o slug colide com rotas reservadas do sistema. */
export function isReservedSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  return RESERVED_SLUGS.has(normalized) || normalized.startsWith('_');
}

/** Valida comprimento e disponibilidade institucional do slug. */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  const clean = slug.trim().toLowerCase();
  if (clean.length < 3) {
    return { valid: false, error: 'O link do evento deve ter pelo menos 3 caracteres.' };
  }
  if (clean.length > 80) {
    return { valid: false, error: 'O link do evento deve ter no máximo 80 caracteres.' };
  }
  if (isReservedSlug(clean)) {
    return {
      valid: false,
      error: 'Este endereço é reservado pela plataforma. Por favor, escolha outro link para o seu chá.',
    };
  }
  return { valid: true };
}

/**
 * Converte data vinda de input (`YYYY-MM-DD`) para meio-dia UTC (`12:00:00.000Z`),
 * evitando deslocamento de -1 dia em fusos horários brasileiros (UTC-3).
 */
export function parseEventDateInput(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const candidate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    if (
      isNaN(candidate.getTime()) ||
      candidate.getUTCFullYear() !== year ||
      candidate.getUTCMonth() !== month - 1 ||
      candidate.getUTCDate() !== day
    ) {
      return null;
    }
    return candidate;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/** Formata a data do evento em pt-BR preservando o dia calendário em UTC. */
export function formatEventDateBR(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}
