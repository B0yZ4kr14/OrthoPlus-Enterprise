import {
  Transaction,
  TransactionProps,
} from "../../domain/entities/Transaction";
import { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { Money } from "../../domain/valueObjects/Money";

export interface CreateTransactionDTO {
  clinicId: string;
  type: "RECEITA" | "DESPESA";
  amount: number;
  description: string;
  categoryId?: string;
  dueDate: Date;
  paymentMethod?: string;
  notes?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdBy: string;
}

export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(dto: CreateTransactionDTO): Promise<Transaction> {
    const transactionProps: TransactionProps = {
      id: crypto.randomUUID(),
      clinicId: dto.clinicId,
      type: dto.type,
      amount: Money.fromNumber(dto.amount),
      description: dto.description,
      categoryId: dto.categoryId,
      dueDate: dto.dueDate,
      status: "PENDENTE",
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
      relatedEntityType: dto.relatedEntityType,
      relatedEntityId: dto.relatedEntityId,
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transaction = new Transaction(transactionProps);
    await this.transactionRepository.save(transaction);

    return transaction;
  }
}
