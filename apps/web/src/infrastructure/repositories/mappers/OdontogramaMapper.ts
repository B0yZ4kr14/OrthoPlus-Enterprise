import { Odontograma, OdontogramaProps } from "@/domain/entities/Odontograma";
import { Database } from "@/types/database";

type OdontogramaRow = Database["public"]["Tables"]["odontogramas"]["Row"];
type OdontogramaInsert = Database["public"]["Tables"]["odontogramas"]["Insert"];

/**
 * Mapper: Odontograma Entity <-> PostgreSQL odontogramas table
 */
export class OdontogramaMapper {
  /**
   * Converte row do banco para Entidade de Domínio
   */
  static toDomain(row: OdontogramaRow): Odontograma {
    const props: OdontogramaProps = {
      id: row.id,
      prontuarioId: row.prontuario_id,
      // @ts-expect-error — TS2322
      teeth: row.teeth as unknown, // JSONB será parseado automaticamente
      lastUpdated: new Date(row.last_updated),
      // @ts-expect-error — TS2740
      history: (row.history as unknown) || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return Odontograma.restore(props);
  }

  /**
   * Converte Entidade de Domínio para Insert do banco
   */
  static toDbInsert(entity: Odontograma, clinicId: string): OdontogramaInsert {
    return {
      id: entity.id,
      prontuario_id: entity.prontuarioId,
      clinic_id: clinicId,
      // @ts-expect-error — TS2322
      teeth: entity.teeth as unknown,
      last_updated: entity.lastUpdated.toISOString(),
      // @ts-expect-error — TS2322
      history: entity.history as unknown,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }
}
