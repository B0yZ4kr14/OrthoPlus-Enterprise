import { PrismaClient } from "@prisma/client";

export interface SearchIndexEntry {
  entity_type: string;
  entity_id: string;
  clinic_id: string;
  title: string;
  content: string;
  module: string;
}

export interface IndexerResult {
  indexed: number;
  durationMs: number;
}

/**
 * BaseIndexer - Classe abstrata para indexadores batch de full-text.
 *
 * Encapsula a logica de paginacao por cursor, insercao em lote e
 * reindexacao incremental. Subclasses devem implementar:
 * - queryBatch(cursor?, since?): como buscar o lote de entidades
 * - extractData(entity): enriquecer/mapear a entidade bruta
 * - buildIndexEntry(entity): converter entidade em entrada search_index
 * - getEntityId(entity): extrair o ID da entidade para cursor
 */
export abstract class BaseIndexer<TEntity> {
  protected readonly batchSize = 500;
  protected abstract entityType: string;
  protected abstract module: string;

  constructor(protected prisma: PrismaClient) {}

  protected abstract queryBatch(
    cursor?: string,
    since?: Date,
  ): Promise<TEntity[]>;
  protected abstract extractData(entity: TEntity): Promise<TEntity> | TEntity;
  protected abstract buildIndexEntry(
    entity: TEntity,
  ): Promise<SearchIndexEntry> | SearchIndexEntry;
  protected abstract getEntityId(entity: TEntity): string;

  /**
   * Reindexacao completa: remove todas as entradas do entityType
   * e reinsere todos os registros.
   */
  async fullReindex(force = true): Promise<IndexerResult> {
    const start = Date.now();

    if (force) {
      await this.clearEntries();
    }

    let indexed = 0;
    let cursor: string | undefined;

    for (;;) {
      const batch = await this.queryBatch(cursor);
      if (batch.length === 0) break;

      await this.processBatch(batch);

      indexed += batch.length;
      cursor = this.getEntityId(batch[batch.length - 1]);
    }

    const durationMs = Date.now() - start;
    return { indexed, durationMs };
  }

  /**
   * Reindexacao incremental: processa apenas entidades com updated_at
   * maior que o timestamp fornecido.
   */
  async incremental(since: Date): Promise<IndexerResult> {
    const start = Date.now();

    let indexed = 0;
    let cursor: string | undefined;

    for (;;) {
      const batch = await this.queryBatch(cursor, since);
      if (batch.length === 0) break;

      const ids = batch.map((e) => this.getEntityId(e));
      await this.prisma.search_index.deleteMany({
        where: {
          entity_type: this.entityType,
          entity_id: { in: ids },
        },
      });

      await this.processBatch(batch);

      indexed += batch.length;
      cursor = this.getEntityId(batch[batch.length - 1]);
    }

    const durationMs = Date.now() - start;
    return { indexed, durationMs };
  }

  /**
   * Processa um lote de entidades: extrai dados, constroi entradas
   * e insere em batch no search_index.
   */
  protected async indexBatch(items: TEntity[]): Promise<void> {
    const enriched = await Promise.all(items.map((e) => this.extractData(e)));
    const entries = await Promise.all(
      enriched.map((e) => this.buildIndexEntry(e)),
    );
    await this.prisma.search_index.createMany({ data: entries });
  }

  private async processBatch(batch: TEntity[]): Promise<void> {
    await this.indexBatch(batch);
  }

  private async clearEntries(): Promise<void> {
    await this.prisma.search_index.deleteMany({
      where: { entity_type: this.entityType },
    });
  }

  /**
   * Remove a entrada de search_index para uma entidade especifica.
   */
  async deleteByEntityId(entityId: string): Promise<void> {
    await this.prisma.search_index.deleteMany({
      where: {
        entity_type: this.entityType,
        entity_id: entityId,
      },
    });
  }
}
