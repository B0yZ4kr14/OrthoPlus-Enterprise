/**
 * Port (interface) for chunk repository operations.
 */
export interface IChunkRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bulkInsert(documentId: string, chunks: any[]): any[];
  deleteByDocument(documentId: string): void;
}
