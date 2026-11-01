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
