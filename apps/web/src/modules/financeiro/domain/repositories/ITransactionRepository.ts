import { Transaction } from "../entities/Transaction";
import { Period } from "../valueObjects/Period";

export interface TransactionFilters {
  type?: "RECEITA" | "DESPESA";
  status?: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
  categoryId?: string;
  period?: Period;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByClinic(
    clinicId: string,
    filters?: TransactionFilters,
  ): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;

  // Analytics queries
  getTotalByPeriod(
    clinicId: string,
    period: Period,
    type: "RECEITA" | "DESPESA",
  ): Promise<number>;
  getOverdueTransactions(clinicId: string): Promise<Transaction[]>;
  getPendingTransactions(clinicId: string): Promise<Transaction[]>;
}
