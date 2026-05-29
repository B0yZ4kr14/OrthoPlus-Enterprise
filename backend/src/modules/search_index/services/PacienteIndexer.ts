import { PrismaClient } from "@prisma/client";

export interface IndexerResult {
  indexed: number;
  durationMs: number;
}

export interface PatientSearchIndexEntry {
  entity_type: string;
  entity_id: string;
  clinic_id: string;
  title: string;
  content: string;
  module: string;
}

interface PatientRow {
  id: string;
  clinic_id: string;
  full_name: string;
  cpf: string | null;
  email: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  phone_emergency: string | null;
  clinical_observations: string | null;
}

/**
 * PacienteIndexer - Servico batch de indexacao full-text para pacientes.
 *
 * Responsabilidade: sincronizar registros da tabela `patients` com a tabela
 * `search_index` para busca full-text via PostgreSQL tsvector.
 *
 * NOTA: Usa $queryRaw em vez de findMany para evitar drift entre o schema
 * Prisma e o banco de producao (campos como photo_url podem nao existir).
 */
export class PacienteIndexer {
  private readonly batchSize = 500;
  private readonly entityType = "paciente";
  private readonly module = "pacientes";

  constructor(private prisma: PrismaClient) {}

  /**
   * Reindexacao completa: remove todas as entradas do tipo "paciente"
   * e reinsere todos os registros da tabela patients.
   */
  async fullReindex(force = true): Promise<IndexerResult> {
    const start = Date.now();

    if (force) {
      await this.clearPacienteEntries();
    }

    let indexed = 0;
    let cursor: string | undefined;

    for (;;) {
      const patientsBatch = await this.queryPatientBatch(cursor);

      if (patientsBatch.length === 0) break;

      const entries = patientsBatch.map((p) => this.toEntry(p));
      await this.prisma.search_index.createMany({ data: entries });

      indexed += patientsBatch.length;
      cursor = patientsBatch[patientsBatch.length - 1].id;
    }

    const durationMs = Date.now() - start;
    return { indexed, durationMs };
  }

  /**
   * Reindexacao incremental: processa apenas pacientes com updated_at
   * maior que o timestamp fornecido.
   */
  async incremental(since: Date): Promise<IndexerResult> {
    const start = Date.now();

    let indexed = 0;
    let cursor: string | undefined;

    for (;;) {
      const patientsBatch = await this.queryPatientBatch(cursor, since);

      if (patientsBatch.length === 0) break;

      const ids = patientsBatch.map((p) => p.id);

      // Remove entradas existentes para evitar duplicatas
      await this.prisma.search_index.deleteMany({
        where: {
          entity_type: this.entityType,
          entity_id: { in: ids },
        },
      });

      const entries = patientsBatch.map((p) => this.toEntry(p));
      await this.prisma.search_index.createMany({ data: entries });

      indexed += patientsBatch.length;
      cursor = patientsBatch[patientsBatch.length - 1].id;
    }

    const durationMs = Date.now() - start;
    return { indexed, durationMs };
  }

  private async queryPatientBatch(
    cursor?: string,
    since?: Date,
  ): Promise<PatientRow[]> {
    const sinceClause = since
      ? `AND updated_at > ${this.escapeLiteral(since.toISOString())}`
      : "";
    const cursorClause = cursor ? `AND id > ${this.escapeLiteral(cursor)}` : "";

    return this.prisma.$queryRawUnsafe<PatientRow[]>(`
      SELECT id, clinic_id, full_name, cpf, email,
             phone_primary, phone_secondary, phone_emergency,
             clinical_observations
      FROM pacientes.patients
      WHERE 1=1 ${sinceClause} ${cursorClause}
      ORDER BY id ASC
      LIMIT ${this.batchSize}
    `);
  }

  private escapeLiteral(value: string): string {
    // Simple escaping for string literals in raw SQL
    return "'" + value.replace(/'/g, "''") + "'";
  }

  private async clearPacienteEntries(): Promise<void> {
    await this.prisma.search_index.deleteMany({
      where: { entity_type: this.entityType },
    });
  }

  private toEntry(p: PatientRow): PatientSearchIndexEntry {
    const contentParts = [
      p.full_name,
      p.cpf,
      p.email,
      p.phone_primary,
      p.phone_secondary,
      p.phone_emergency,
      p.clinical_observations,
    ].filter(Boolean);

    return {
      entity_type: this.entityType,
      entity_id: p.id,
      clinic_id: p.clinic_id,
      title: p.full_name,
      content: contentParts.join(" "),
      module: this.module,
    };
  }
}
