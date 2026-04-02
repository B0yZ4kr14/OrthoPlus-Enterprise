/**
 * Value Object: Money
 * Representa um valor monetário com validações
 */
export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = "BRL") {
    if (amount < 0) {
      throw new Error("Valor monetário não pode ser negativo");
    }

    if (isNaN(amount)) {
      throw new Error("Valor monetário inválido");
    }

    this._amount = Math.round(amount * 100) / 100; // 2 casas decimais
    this._currency = currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error("Resultado da subtração não pode ser negativo");
    }
    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error("Fator de multiplicação não pode ser negativo");
    }
    return new Money(this._amount * factor, this._currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error("Divisor deve ser maior que zero");
    }
    return new Money(this._amount / divisor, this._currency);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount > other._amount;
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount < other._amount;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  toNumber(): number {
    return this._amount;
  }

  toString(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this._amount,
      currency: this._currency,
    };
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Moedas incompatíveis: ${this._currency} e ${other._currency}`,
      );
    }
  }

  static zero(currency: string = "BRL"): Money {
    return new Money(0, currency);
  }

  static fromNumber(amount: number, currency: string = "BRL"): Money {
    return new Money(amount, currency);
  }
}
