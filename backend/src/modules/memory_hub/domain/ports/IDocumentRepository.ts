import { MemoryDocument } from "../types"

/**
 * Port (interface) for document repository operations.
 * Domain layer depends on this abstraction, not on infrastructure.
 */
export interface IDocumentRepository {
  count(clinicId?: string): number
  listAll(clinicId?: string): MemoryDocument[]
  findByPath(path: string, clinicId?: string): MemoryDocument | undefined
  isConfidential(doc: MemoryDocument): boolean
  archive(sourcePath: string): void
  upsert(
    doc: Omit<
      MemoryDocument,
      "id" | "version" | "lastIndexed" | "author" | "featureNumber"
    > & { author?: string | null; featureNumber?: string | null },
  ): MemoryDocument
  findVersions(
    sourcePath: string,
    clinicId?: string,
  ): Array<{
    version: number
    contentHash: string
    title: string
    wordCount: number
    createdAt: number
  }>
}
