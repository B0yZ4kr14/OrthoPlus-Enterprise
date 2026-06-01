import { DriftIssue } from "../types"

export interface IDriftRepository {
  findUnresolved(options: {
    severity?: string
    limit: number
    offset: number
  }): Array<Record<string, unknown>>
  countUnresolved(severity?: string): number
  insertMany(issues: DriftIssue[]): void
}
