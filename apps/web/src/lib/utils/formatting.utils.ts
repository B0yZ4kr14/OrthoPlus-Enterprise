/**
 * Utilitários de formatação profissional para campos brasileiros
 * @module Formatting Utils
 * @category Shared/Utils
 */

/**
 * Formata CPF com pontuação automática
 * @example formatCPF("12345678909") → "123.456.789-09"
 */
export function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 11);

  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  if (limited.length <= 9)
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
}

/**
 * Formata CNPJ com pontuação automática
 * @example formatCNPJ("12345678000190") → "12.345.678/0001-90"
 */
export function formatCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 14);

  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8)
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  if (limited.length <= 12)
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
}

/**
 * Formata CEP com pontuação automática
 * @example formatCEP("12345678") → "12345-678"
 */
export function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 8);

  if (limited.length <= 5) return limited;
  return `${limited.slice(0, 5)}-${limited.slice(5)}`;
}

/**
 * Formata telefone brasileiro (fixo ou celular)
 * @example formatPhone("11987654321") → "(11) 98765-4321"
 */
export function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 11);

  if (limited.length <= 2) return limited;
  if (limited.length <= 6)
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;

  // Celular (11 dígitos)
  if (limited.length === 11) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }

  // Fixo (10 dígitos)
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
}

/**
 * Formata RG com pontuação automática
 * @example formatRG("123456789") → "12.345.678-9"
 */
export function formatRG(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const limited = cleaned.slice(0, 9);

  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8)
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}-${limited.slice(8)}`;
}

/**
 * Formata CRO (Conselho Regional de Odontologia)
 * @example formatCRO("12345") → "CRO-SP 12345"
 */
export function formatCRO(value: string, estado?: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (!estado) return cleaned;
  return `CRO-${estado.toUpperCase()} ${cleaned}`;
}

/**
 * Formata moeda
 * @param value - Valor a formatar
 * @param currency - Código da moeda (padrão: "BRL")
 * @example formatCurrency(1234.56) → "R$ 1.234,56"
 * @example formatCurrency(1234.56, "USD") → "US$ 1.234,56"
 */
export function formatCurrency(
  value: number | string,
  currency: string = "BRL",
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  });
  if (isNaN(numValue)) return formatter.format(0);

  return formatter.format(numValue);
}

/**
 * Remove toda formatação, mantendo apenas dígitos
 * @example cleanFormat("123.456.789-09") → "12345678909"
 */
export function cleanFormat(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida e formata CPF/CNPJ automaticamente
 */
export function formatCPFOrCNPJ(value: string): string {
  const cleaned = cleanFormat(value);
  if (cleaned.length <= 11) return formatCPF(value);
  return formatCNPJ(value);
}
