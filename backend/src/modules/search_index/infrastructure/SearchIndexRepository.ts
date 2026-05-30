import { prisma } from "@/infrastructure/database/prismaClient";
import {
  ISearchIndexRepository,
  SearchRow,
} from "../domain/repositories/ISearchIndexRepository";

export class SearchIndexRepository implements ISearchIndexRepository {
  async search(
    query: string,
    clinicId: string,
    moduleFilter: string | undefined,
    limit: number,
    offset: number,
  ): Promise<SearchRow[]> {
    if (moduleFilter) {
      return prisma.$queryRaw<SearchRow[]>`
        SELECT id, entity_type, entity_id, clinic_id, title, content, module, updated_at,
               ts_rank(content_tsv, websearch_to_tsquery('portuguese', ${query})) as score
        FROM core.search_index
        WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
          AND clinic_id = ${clinicId}
          AND module = ${moduleFilter}
        ORDER BY score DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return prisma.$queryRaw<SearchRow[]>`
      SELECT id, entity_type, entity_id, clinic_id, title, content, module, updated_at,
             ts_rank(content_tsv, websearch_to_tsquery('portuguese', ${query})) as score
      FROM core.search_index
      WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
        AND clinic_id = ${clinicId}
      ORDER BY score DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  async count(
    query: string,
    clinicId: string,
    moduleFilter: string | undefined,
  ): Promise<[{ count: bigint }]> {
    if (moduleFilter) {
      return prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM core.search_index
        WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
          AND clinic_id = ${clinicId}
          AND module = ${moduleFilter}
      `;
    }

    return prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM core.search_index
      WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
        AND clinic_id = ${clinicId}
    `;
  }

  async ping(): Promise<unknown> {
    return prisma.$queryRaw`SELECT 1 as ping`;
  }

  async countByClinic(clinicId: string): Promise<[{ count: bigint }]> {
    return prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM core.search_index WHERE clinic_id = ${clinicId}
    `;
  }

  async maxUpdatedByClinic(
    clinicId: string,
  ): Promise<[{ max_updated: Date | null }]> {
    return prisma.$queryRaw<[{ max_updated: Date | null }]>`
      SELECT MAX(updated_at) as max_updated FROM core.search_index WHERE clinic_id = ${clinicId}
    `;
  }
}
