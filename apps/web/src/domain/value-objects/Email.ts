/**
 * Email Value Object
 * Garante que emails sejam sempre válidos no domínio
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(email: string): Email {
    if (!email || typeof email !== "string") {
      throw new Error("Email é obrigatório");
    }

    const trimmed = email.trim().toLowerCase();

    // RFC 5322 simplified regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      throw new Error("Email inválido");
    }

    return new Email(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
