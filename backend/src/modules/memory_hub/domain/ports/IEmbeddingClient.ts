/**
 * Port (interface) for embedding client operations.
 */
export interface IEmbeddingClient {
  embed(texts: string[]): Promise<any[]>;
  embedSingle(text: string): Promise<any>;
}
