/**
 * Phone Value Object
 * Garante que telefones sejam sempre válidos no domínio
 */
export class Phone {
  private readonly value: string;

  private constructor(phone: string) {
    this.value = phone;
  }

  static create(phone: string): Phone {
    if (!phone || typeof phone !== "string") {
      throw new Error("Telefone é obrigatório");
    }

    // Remove formatação
    const cleaned = phone.replace(/\D/g, "");

    // Valida tamanho (10 ou 11 dígitos)
    if (cleaned.length < 10 || cleaned.length > 11) {
      throw new Error("Telefone deve ter 10 ou 11 dígitos");
    }

    // Valida DDD (11-99)
    const ddd = parseInt(cleaned.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      throw new Error("DDD inválido");
    }

    return new Phone(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    if (this.value.length === 11) {
      return this.value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return this.value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.getFormatted();
  }
}
