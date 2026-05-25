/**
 * Port (interface) for embedding repository operations.
 */
export interface IEmbeddingRepository {
  getCompressionStats(): { compressionRatio: number; compressedEmbeddings: number; spaceSavedBytes: number }
  searchSimilar(
    embedding: number[],
    model: string,
    limit?: number,
    docTypes?: string[],
    clinicId?: string,
    author?: string,
    featureNumber?: string,
    dateFrom?: number,
    dateTo?: number,
  ): any[]
  bulkInsert(data: any[], useCompression?: boolean): void
  deleteByDocument(documentId: string): void
}
