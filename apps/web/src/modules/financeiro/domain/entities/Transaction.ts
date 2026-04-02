import { Money } from "../valueObjects/Money";

export type TransactionType = "RECEITA" | "DESPESA";
export type TransactionStatus = "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";

export interface TransactionProps {
  id: string;
  clinicId: string;
  type: TransactionType;
  amount: Money;
  description: string;
  categoryId?: string;
  dueDate: Date;
  paidDate?: Date;
  status: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
  attachmentUrl?: string;
  relatedEntityType?: string; // 'TREATMENT', 'BUDGET', 'SUPPLIER', etc
  relatedEntityId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  constructor(private props: TransactionProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error("ID da clínica é obrigatório");
    }

    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error("Descrição é obrigatória");
    }

    if (this.props.amount.isZero()) {
      throw new Error("Valor não pode ser zero");
    }

    if (!this.props.dueDate) {
      throw new Error("Data de vencimento é obrigatória");
    }

    if (this.props.paidDate && this.props.paidDate > new Date()) {
      throw new Error("Data de pagamento não pode ser futura");
    }

    if (!this.props.createdBy) {
      throw new Error("Usuário criador é obrigatório");
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get clinicId(): string {
    return this.props.clinicId;
  }
  get type(): TransactionType {
    return this.props.type;
  }
  get amount(): Money {
    return this.props.amount;
  }
  get description(): string {
    return this.props.description;
  }
  get categoryId(): string | undefined {
    return this.props.categoryId;
  }
  get dueDate(): Date {
    return this.props.dueDate;
  }
  get paidDate(): Date | undefined {
    return this.props.paidDate;
  }
  get status(): TransactionStatus {
    return this.props.status;
  }
  get paymentMethod(): string | undefined {
    return this.props.paymentMethod;
  }
  get notes(): string | undefined {
    return this.props.notes;
  }
  get attachmentUrl(): string | undefined {
    return this.props.attachmentUrl;
  }
  get relatedEntityType(): string | undefined {
    return this.props.relatedEntityType;
  }
  get relatedEntityId(): string | undefined {
    return this.props.relatedEntityId;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain Methods
  isOverdue(): boolean {
    return (
      this.props.status === "PENDENTE" &&
      this.props.dueDate < new Date() &&
      !this.props.paidDate
    );
  }

  canBePaid(): boolean {
    return this.props.status === "PENDENTE" || this.props.status === "ATRASADO";
  }

  canBeCancelled(): boolean {
    return this.props.status !== "PAGO" && this.props.status !== "CANCELADO";
  }

  markAsPaid(paidDate: Date, paymentMethod?: string): void {
    if (!this.canBePaid()) {
      throw new Error("Esta transação não pode ser marcada como paga");
    }

    if (paidDate > new Date()) {
      throw new Error("Data de pagamento não pode ser futura");
    }

    this.props.status = "PAGO";
    this.props.paidDate = paidDate;
    if (paymentMethod) {
      this.props.paymentMethod = paymentMethod;
    }
    this.props.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error("Esta transação não pode ser cancelada");
    }

    this.props.status = "CANCELADO";
    if (reason) {
      this.props.notes = this.props.notes
        ? `${this.props.notes}\n\nCancelada: ${reason}`
        : `Cancelada: ${reason}`;
    }
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error("Descrição não pode ser vazia");
    }
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updateDueDate(dueDate: Date): void {
    if (this.props.status === "PAGO") {
      throw new Error(
        "Não é possível alterar a data de vencimento de uma transação paga",
      );
    }
    this.props.dueDate = dueDate;
    this.props.updatedAt = new Date();
  }

  updateAmount(amount: Money): void {
    if (this.props.status === "PAGO") {
      throw new Error("Não é possível alterar o valor de uma transação paga");
    }
    if (amount.isZero()) {
      throw new Error("Valor não pode ser zero");
    }
    this.props.amount = amount;
    this.props.updatedAt = new Date();
  }

  updateCategory(categoryId: string): void {
    this.props.categoryId = categoryId;
    this.props.updatedAt = new Date();
  }

  addAttachment(url: string): void {
    this.props.attachmentUrl = url;
    this.props.updatedAt = new Date();
  }

  addNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  toJSON(): TransactionProps {
    return {
      ...this.props,
      amount: this.props.amount,
    };
  }
}
