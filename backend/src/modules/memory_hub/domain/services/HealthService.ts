import Database from "better-sqlite3"
import { IDocumentRepository } from "../ports/IDocumentRepository"
import { IEmbeddingRepository } from "../ports/IEmbeddingRepository"

export interface HealthMetrics {
  indexStatus: "healthy" | "empty"
  totalDocuments: number
  compressionRatio: number
  compressedEmbeddings: number
  spaceSavedBytes: number
  lastScan: string | null
  driftCount: number
  coveragePercent: number
}

export class HealthService {
  private db: Database.Database
  private documents: IDocumentRepository
  private embeddings: IEmbeddingRepository

  constructor(
    db: Database.Database,
    documents: IDocumentRepository,
    embeddings: IEmbeddingRepository,
  ) {
    this.db = db
    this.documents = documents
    this.embeddings = embeddings
  }

  getMetrics(clinicId: string): HealthMetrics {
    const totalDocs = this.documents.count(clinicId)
    const allDocs = this.documents.listAll(clinicId)

    const driftRow = this.db
      .prepare("SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL")
      .get() as { c: number }

    // Coverage: docs indexed in last 7 days vs total markdown files
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentlyIndexed = allDocs.filter((d) => d.lastIndexed > oneWeekAgo).length
    const coveragePercent = totalDocs > 0 ? Math.round((recentlyIndexed / totalDocs) * 100) : 0

    const compressionStats = this.embeddings.getCompressionStats()

    return {
      indexStatus: totalDocs > 0 ? "healthy" : "empty",
      totalDocuments: totalDocs,
      compressionRatio: Math.round(compressionStats.compressionRatio * 100) / 100,
      compressedEmbeddings: compressionStats.compressedEmbeddings,
      spaceSavedBytes: compressionStats.spaceSavedBytes,
      lastScan: allDocs[0]?.lastIndexed
        ? new Date(allDocs[0].lastIndexed).toISOString()
        : null,
      driftCount: driftRow.c,
      coveragePercent: coveragePercent,
    }
  }
}
