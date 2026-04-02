import { Money } from "../valueObjects/Money";

export type CashRegisterStatus = "ABERTO" | "FECHADO";

export interface CashRegisterProps {
  id: string;
  clinicId: string;
  openedBy: string;
  openedAt: Date;
  closedBy?: string;
  closedAt?: Date;
  initialAmount: Money;
  finalAmount?: Money;
  expectedAmount?: Money;
  difference?: Money;
  status: CashRegisterStatus;
  notes?: string;
}

export class CashRegister {
  constructor(private props: CashRegisterProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error("ID da clínica é obrigatório");
    }

    if (!this.props.openedBy) {
      throw new Error("Usuário que abriu o caixa é obrigatório");
    }

    if (!this.props.openedAt) {
      throw new Error("Data de abertura é obrigatória");
    }

    if (this.props.status === "FECHADO") {
      if (!this.props.closedBy) {
        throw new Error("Usuário que fechou o caixa é obrigatório");
      }
      if (!this.props.closedAt) {
        throw new Error("Data de fechamento é obrigatória");
      }
      if (!this.props.finalAmount) {
        throw new Error("Valor final é obrigatório para caixa fechado");
      }
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get clinicId(): string {
    return this.props.clinicId;
  }
  get openedBy(): string {
    return this.props.openedBy;
  }
  get openedAt(): Date {
    return this.props.openedAt;
  }
  get closedBy(): string | undefined {
    return this.props.closedBy;
  }
  get closedAt(): Date | undefined {
    return this.props.closedAt;
  }
  get initialAmount(): Money {
    return this.props.initialAmount;
  }
  get finalAmount(): Money | undefined {
    return this.props.finalAmount;
  }
  get expectedAmount(): Money | undefined {
    return this.props.expectedAmount;
  }
  get difference(): Money | undefined {
    return this.props.difference;
  }
  get status(): CashRegisterStatus {
    return this.props.status;
  }
  get notes(): string | undefined {
    return this.props.notes;
  }

  // Domain Methods
  isOpen(): boolean {
    return this.props.status === "ABERTO";
  }

  isClosed(): boolean {
    return this.props.status === "FECHADO";
  }

  canBeClosed(): boolean {
    return this.props.status === "ABERTO";
  }

  getDurationInHours(): number {
    const endTime = this.props.closedAt || new Date();
    const duration = endTime.getTime() - this.props.openedAt.getTime();
    return duration / (1000 * 60 * 60);
  }

  close(
    closedBy: string,
    finalAmount: Money,
    expectedAmount: Money,
    notes?: string,
  ): void {
    if (!this.canBeClosed()) {
      throw new Error("Este caixa já foi fechado");
    }

    this.props.status = "FECHADO";
    this.props.closedBy = closedBy;
    this.props.closedAt = new Date();
    this.props.finalAmount = finalAmount;
    this.props.expectedAmount = expectedAmount;

    // Calcular diferença
    try {
      this.props.difference = finalAmount.subtract(expectedAmount);
    } catch {
      // Se subtração resultar em negativo, invertemos
      this.props.difference = Money.fromNumber(
        expectedAmount.toNumber() - finalAmount.toNumber(),
      );
    }

    if (notes) {
      this.props.notes = notes;
    }
  }

  hasDifference(): boolean {
    return (
      this.props.difference !== undefined && !this.props.difference.isZero()
    );
  }

  getDifferencePercentage(): number {
    if (!this.props.expectedAmount || !this.props.difference) {
      return 0;
    }

    const expected = this.props.expectedAmount.toNumber();
    if (expected === 0) return 0;

    return (this.props.difference.toNumber() / expected) * 100;
  }

  addNotes(notes: string): void {
    this.props.notes = this.props.notes
      ? `${this.props.notes}\n${notes}`
      : notes;
  }

  toJSON(): CashRegisterProps {
    return {
      ...this.props,
    };
  }
}
