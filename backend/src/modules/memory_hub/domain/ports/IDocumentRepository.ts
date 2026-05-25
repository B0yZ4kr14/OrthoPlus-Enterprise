/**
 * Port (interface) for document repository operations.
 * Domain layer depends on this abstraction, not on infrastructure.
 */
export interface IDocumentRepository {
  count(clinicId?: string): number
  listAll(clinicId?: string): any[]
  findByPath(path: string, clinicId?: string): any | null
  isConfidential(doc: any): boolean
  archive(id: string): void
  upsert(doc: any): any
}
