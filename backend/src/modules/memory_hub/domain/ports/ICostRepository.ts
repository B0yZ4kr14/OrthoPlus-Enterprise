import { CostRecord } from "../types"

export interface ICostRepository {
  ensureTable(): void
  insert(record: Omit<CostRecord, "id">): CostRecord
  getMonthlySummary(
    clinicId: string,
    startMs: number,
    endMs: number,
  ): {
    total_tokens: number
    total_cost: number
    query_count: number
  }
}
