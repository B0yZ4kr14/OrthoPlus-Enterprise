import { IDocumentRepository } from "../ports/IDocumentRepository";
import { IEmbeddingRepository } from "../ports/IEmbeddingRepository";
import { IDriftRepository } from "../ports/IDriftRepository";

export interface HealthMetrics {
  indexStatus: "healthy" | "empty";
  totalDocuments: number;
  compressionRatio: number;
  compressedEmbeddings: number;
  spaceSavedBytes: number;
  lastScan: string | null;
  driftCount: number;
  coveragePercent: number;
}

export class HealthService {
  private documents: IDocumentRepository;
  private embeddings: IEmbeddingRepository;
  private driftReports: IDriftRepository;

  constructor(
    documents: IDocumentRepository,
    embeddings: IEmbeddingRepository,
    driftReports: IDriftRepository,
  ) {
    this.documents = documents;
    this.embeddings = embeddings;
    this.driftReports = driftReports;
  }

  getMetrics(clinicId: string): HealthMetrics {
    const totalDocs = this.documents.count(clinicId);
    const allDocs = this.documents.listAll(clinicId);

    const driftCount = this.driftReports.countUnresolved();

    // Coverage: docs indexed in last 7 days vs total markdown files
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyIndexed = allDocs.filter(
      (d) => d.lastIndexed > oneWeekAgo,
    ).length;
    const coveragePercent =
      totalDocs > 0 ? Math.round((recentlyIndexed / totalDocs) * 100) : 0;

    const compressionStats = this.embeddings.getCompressionStats();

    return {
      indexStatus: totalDocs > 0 ? "healthy" : "empty",
      totalDocuments: totalDocs,
      compressionRatio:
        Math.round(compressionStats.compressionRatio * 100) / 100,
      compressedEmbeddings: compressionStats.compressedEmbeddings,
      spaceSavedBytes: compressionStats.spaceSavedBytes,
      lastScan: allDocs[0]?.lastIndexed
        ? new Date(allDocs[0].lastIndexed).toISOString()
        : null,
      driftCount: driftCount,
      coveragePercent: coveragePercent,
    };
  }
}
