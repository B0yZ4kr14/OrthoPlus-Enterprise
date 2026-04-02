import { Transaction } from "../../domain/entities/Transaction";
import {
  ITransactionRepository,
  TransactionFilters,
} from "../../domain/repositories/ITransactionRepository";

export interface ListTransactionsDTO {
  clinicId: string;
  filters?: TransactionFilters;
}

export class ListTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(dto: ListTransactionsDTO): Promise<Transaction[]> {
    return await this.transactionRepository.findByClinic(
      dto.clinicId,
      dto.filters,
    );
  }
}
