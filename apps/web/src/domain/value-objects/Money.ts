/**
 * Money Value Object
 * Garante precisão em operações monetárias
 */
export class Money {
  private readonly cents: number;

  private constructor(cents: number) {
    this.cents = cents;
  }

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents)) {
      throw new Error("Centavos devem ser um número inteiro");
    }

    if (cents < 0) {
      throw new Error("Valor monetário não pode ser negativo");
    }

    return new Money(cents);
  }

  static fromReais(reais: number): Money {
    if (typeof reais !== "number" || isNaN(reais)) {
      throw new Error("Valor inválido");
    }

    if (reais < 0) {
      throw new Error("Valor monetário não pode ser negativo");
    }

    // Converte para centavos com precisão
    const cents = Math.round(reais * 100);
    return new Money(cents);
  }

  getCents(): number {
    return this.cents;
  }

  getReais(): number {
    return this.cents / 100;
  }

  getFormatted(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.getReais());
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    const result = this.cents - other.cents;
    if (result < 0) {
      throw new Error("Resultado negativo não permitido");
    }
    return new Money(result);
  }

  multiply(factor: number): Money {
    if (typeof factor !== "number" || isNaN(factor)) {
      throw new Error("Fator inválido");
    }
    return new Money(Math.round(this.cents * factor));
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  isLessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  toString(): string {
    return this.getFormatted();
  }
}
