import { PrismaClient, Prisma } from "@prisma/client";
import { BaseIndexer, SearchIndexEntry } from "./BaseIndexer";

interface AppointmentRow {
  id: string;
  clinic_id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  start_time: Date | null;
  end_time: Date | null;
  dentist_id: string | null;
  patient_full_name: string | null;
}

/**
 * AgendaIndexer - Servico batch de indexacao full-text para agendamentos.
 *
 * Responsabilidade: sincronizar registros da tabela `appointments` com a tabela
 * `search_index` para busca full-text via PostgreSQL tsvector.
 *
 * NOTA: Usa $queryRaw com JOIN manual para evitar drift de schema (campos
 * como patients.photo_url podem nao existir em producao).
 */
export class AgendaIndexer extends BaseIndexer<AppointmentRow> {
  protected entityType = "agendamento";
  protected module = "agenda";

  private dentistNameCache = new Map<string, string | undefined>();

  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected async queryBatch(
    cursor?: string,
    since?: Date,
  ): Promise<AppointmentRow[]> {
    const conditions: Prisma.Sql[] = [];
    if (since) {
      conditions.push(Prisma.sql`a.updated_at > ${since.toISOString()}`);
    }
    if (cursor) {
      conditions.push(Prisma.sql`a.id > ${cursor}`);
    }

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
        : Prisma.sql``;

    return this.prisma.$queryRaw<AppointmentRow[]>`
      SELECT a.id, a.clinic_id, a.title, a.description, a.status,
             a.start_time, a.end_time, a.dentist_id,
             p.full_name as patient_full_name
      FROM pacientes.appointments a
      LEFT JOIN pacientes.patients p ON a.patient_id = p.id
      ${whereClause}
      ORDER BY a.id ASC
      LIMIT ${this.batchSize}
    `;
  }

  protected extractData(entity: AppointmentRow): Promise<AppointmentRow> {
    return Promise.resolve(entity);
  }

  protected async buildIndexEntry(
    entity: AppointmentRow,
  ): Promise<SearchIndexEntry> {
    const dentistName = await this.resolveDentistName(entity.dentist_id);
    const patientName = entity.patient_full_name ?? "";

    const title = entity.title || patientName || "Agendamento";

    const contentParts = [
      entity.title,
      entity.description,
      patientName,
      dentistName,
      entity.status,
      entity.start_time,
      entity.end_time,
    ].filter(Boolean);

    return {
      entity_type: this.entityType,
      entity_id: entity.id,
      clinic_id: entity.clinic_id,
      title,
      content: contentParts.join(" "),
      module: this.module,
    };
  }

  protected getEntityId(entity: AppointmentRow): string {
    return entity.id;
  }



  /**
   * Reindexa um unico agendamento por ID.
   * Remove a entrada anterior e reinsere com dados atualizados.
   */
  async reindexById(appointmentId: string): Promise<void> {
    const rows = await this.prisma.$queryRaw<AppointmentRow[]>`
      SELECT a.id, a.clinic_id, a.title, a.description, a.status,
             a.start_time, a.end_time, a.dentist_id,
             p.full_name as patient_full_name
      FROM pacientes.appointments a
      LEFT JOIN pacientes.patients p ON a.patient_id = p.id
      WHERE a.id = ${appointmentId}
    `;

    const entity = rows[0];
    if (!entity) return;

    await this.prisma.search_index.deleteMany({
      where: {
        entity_type: this.entityType,
        entity_id: entity.id,
      },
    });

    const entry = await this.buildIndexEntry(entity);
    await this.prisma.search_index.create({ data: entry });
  }

  private async resolveDentistName(
    dentistId: string | null,
  ): Promise<string | undefined> {
    if (!dentistId) return undefined;
    if (this.dentistNameCache.has(dentistId)) {
      return this.dentistNameCache.get(dentistId);
    }

    const profile = await this.prisma.profiles.findFirst({
      where: { id: dentistId },
      select: { full_name: true },
    });

    const name = profile?.full_name ?? undefined;
    this.dentistNameCache.set(dentistId, name);
    return name;
  }
}
