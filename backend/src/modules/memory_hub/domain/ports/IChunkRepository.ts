/**
 * Port (interface) for chunk repository operations.
 */
export interface IChunkRepository {
  bulkInsert(documentId: string, chunks: any[]): any[]
  deleteByDocument(documentId: string): void
}
