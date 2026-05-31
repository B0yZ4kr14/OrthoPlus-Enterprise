/**
 * Port (interface) for embedding repository operations.
 */
export interface IEmbeddingRepository {
  getCompressionStats(): {
    compressionRatio: number;
    compressedEmbeddings: number;
    spaceSavedBytes: number;
  };
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bulkInsert(data: any[], useCompression?: boolean): void;
  deleteByDocument(documentId: string): void;
}
