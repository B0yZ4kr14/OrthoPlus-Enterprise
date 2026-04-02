import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';

export class TransactionRepositoryPostgres implements ITransactionRepository {
  constructor(private db: IDatabaseConnection) {}

  async findById(id: string): Promise<Transaction | null> {
    const result = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM financeiro.transactions WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByClinic(clinicId: string): Promise<Transaction[]> {
    const result = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM financeiro.transactions WHERE clinic_id = $1 ORDER BY created_at DESC LIMIT 1000',
      [clinicId]
    );
    return result.rows.map((row) => this.mapToDomain(row));
  }

  async save(transaction: Transaction): Promise<void> {
    await this.db.query(
      `INSERT INTO financeiro.transactions
        (id, clinic_id, type, category, amount, description, due_date, status,
         patient_id, appointment_id, payment_method, paid_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        transaction.id,
        transaction.clinicId,
        transaction.type,
        transaction.category,
        transaction.amount,
        transaction.description,
        transaction.dueDate,
        transaction.status,
        transaction.patientId,
        transaction.appointmentId,
        transaction.paymentMethod,
        transaction.paidAt,
        transaction.createdAt,
        transaction.updatedAt,
      ]
    );
  }

  async update(transaction: Transaction): Promise<void> {
    await this.db.query(
      `UPDATE financeiro.transactions SET
        type = $2, category = $3, amount = $4, description = $5, due_date = $6,
        status = $7, patient_id = $8, appointment_id = $9, payment_method = $10,
        paid_at = $11, updated_at = $12
       WHERE id = $1`,
      [
        transaction.id,
        transaction.type,
        transaction.category,
        transaction.amount,
        transaction.description,
        transaction.dueDate,
        transaction.status,
        transaction.patientId,
        transaction.appointmentId,
        transaction.paymentMethod,
        transaction.paidAt,
        transaction.updatedAt,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.query(
      'DELETE FROM financeiro.transactions WHERE id = $1',
      [id]
    );
  }

  private mapToDomain(row: Record<string, unknown>): Transaction {
    return Transaction.create({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      type: row.type as 'RECEITA' | 'DESPESA',
      category: row.category as string,
      amount: Number(row.amount),
      description: row.description as string,
      dueDate: new Date(row.due_date as string),
      status: row.status as 'PENDENTE' | 'PAGO' | 'CANCELADO',
      patientId: (row.patient_id as string | null) ?? null,
      appointmentId: (row.appointment_id as string | null) ?? null,
      paymentMethod: (row.payment_method as string | null) ?? null,
      paidAt: row.paid_at ? new Date(row.paid_at as string) : null,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
