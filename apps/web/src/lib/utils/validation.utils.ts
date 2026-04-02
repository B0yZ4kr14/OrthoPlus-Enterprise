/**
 * Validações profissionais para documentos e campos brasileiros
 * @module Validation Utils
 * @category Shared/Utils
 */

/**
 * Valida CPF brasileiro com verificação de dígitos
 * @param cpf - CPF com ou sem formatação
 * @returns true se válido, false caso contrário
 */
export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}

/**
 * Valida CNPJ brasileiro com verificação de dígitos
 * @param cnpj - CNPJ com ou sem formatação
 */
export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * Valida RG brasileiro (formato básico)
 */
export function validarRG(rg: string): boolean {
  const rgLimpo = rg.replace(/\D/g, "");
  return rgLimpo.length >= 7 && rgLimpo.length <= 9;
}

/**
 * Valida CRO (Conselho Regional de Odontologia)
 */
export function validarCRO(cro: string): boolean {
  const croLimpo = cro.replace(/\D/g, "");
  return croLimpo.length >= 4 && croLimpo.length <= 6;
}

/**
 * @deprecated Use formatCPF from formatting.utils.ts
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, "");
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * @deprecated Use formatCEP from formatting.utils.ts
 */
export function formatarCEP(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * @deprecated Use formatPhone from formatting.utils.ts
 */
export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/\D/g, "");

  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.length === 8;
}

export { formatCurrency } from "@/lib/utils/formatting.utils";
