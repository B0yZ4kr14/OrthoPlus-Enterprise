import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByClinic(clinicId: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
