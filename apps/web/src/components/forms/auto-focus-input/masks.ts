import type { MaskType } from "./types";

export function applyMask(rawValue: string, mask?: MaskType): string {
  const numbers = rawValue.replace(/\D/g, "");

  switch (mask) {
    case "cpf":
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    case "cnpj":
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");

    case "phone":
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
      }
      return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");

    case "cep":
      return numbers.replace(/(\d{5})(\d)/, "$1-$2");

    case "date":
      return numbers.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2");

    default:
      return rawValue;
  }
}

export function getMaxDigits(maskType?: MaskType, fallbackMaxLength = 0): number {
  const MAX_DIGITS: Record<string, number> = {
    cpf: 11,
    cnpj: 14,
    phone: 11,
    cep: 8,
    date: 8,
  };

  return maskType ? MAX_DIGITS[maskType] || fallbackMaxLength : fallbackMaxLength;
}
