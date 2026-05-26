import { IFinanceiroRepository } from "@/modules/financeiro/domain/repositories/IFinanceiroRepository"
import { AuditLogRepository } from "@/modules/database_admin/infrastructure/AuditLogRepository"
import { MetricsEmitter } from "@/infrastructure/metrics"
import { createTransactionSchema } from "@/modules/financeiro/api/schemas"

export class CreateTransactionUseCase {
  private repo: IFinanceiroRepository
  private audit = new AuditLogRepository()

  constructor(repo?: IFinanceiroRepository) {
    this.repo = repo ?? new (require("@/modules/financeiro/infrastructure/FinanceiroRepository").FinanceiroRepository)()
  }

  async execute(clinicId: string, userId: string, body: unknown) {
    const parsed = createTransactionSchema.safeParse(body)
    if (!parsed.success) {
      const err = new Error("Invalid input") as any
      err.statusCode = 400
      err.details = parsed.error.flatten()
      throw err
    }
    const data = parsed.data
    const tx = await this.repo.createTransaction({ ...data, clinic_id: clinicId, created_by: userId } as any)

    MetricsEmitter.incrementCounter(
      "financeiro_transaction_created",
      "Number of financial transactions created",
      { clinicId, paymentMethod: String((data as any).payment_method ?? "unknown") },
      1
    )

    try {
      await this.audit.createLog({
        table_name: "transactions",
        record_id: tx.id,
        action: "CREATE",
        clinic_id: clinicId,
        user_id: userId,
        old_data: null,
        new_data: tx,
        created_at: new Date(),
      })
    } catch { /* audit failure is non-blocking */ }

    return tx
  }
}
