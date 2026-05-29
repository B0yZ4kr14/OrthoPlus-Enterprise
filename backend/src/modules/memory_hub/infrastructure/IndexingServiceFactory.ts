import Database from "better-sqlite3";
import { IndexingService } from "../domain/services/IndexingService";
import { MarkdownParser } from "./MarkdownParser";
import { DocumentChunker } from "./DocumentChunker";
import { EmbeddingClientFactory } from "./EmbeddingClientFactory";
import { DocumentRepository } from "./DocumentRepository";
import { ChunkRepository } from "./ChunkRepository";
import { EmbeddingRepository } from "./EmbeddingRepository";
import { IDocumentRepository } from "../domain/ports/IDocumentRepository";
import { IChunkRepository } from "../domain/ports/IChunkRepository";
import { IEmbeddingRepository } from "../domain/ports/IEmbeddingRepository";
import { IEmbeddingClient } from "../domain/ports/IEmbeddingClient";

export interface IndexingServiceDeps {
  parser?: MarkdownParser;
  chunker?: DocumentChunker;
  embedder?: IEmbeddingClient;
  documents?: IDocumentRepository;
  chunks?: IChunkRepository;
  embeddings?: IEmbeddingRepository;
}

/**
 * Factory for creating IndexingService instances with full DI.
 * All infrastructure dependencies are created here; domain services receive abstractions.
 */
export class IndexingServiceFactory {
  static create(
    db: Database.Database,
    deps?: IndexingServiceDeps,
  ): IndexingService {
    const parser = deps?.parser ?? new MarkdownParser();
    const chunker = deps?.chunker ?? new DocumentChunker();
    const embedder = deps?.embedder ?? EmbeddingClientFactory.create();
    const documents = deps?.documents ?? new DocumentRepository(db);
    const chunks = deps?.chunks ?? new ChunkRepository(db);
    const embeddings = deps?.embeddings ?? new EmbeddingRepository(db);

    return new IndexingService(db, {
      parser,
      chunker,
      embedder,
      documents,
      chunks,
      embeddings,
    });
  }
}
