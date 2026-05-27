import { Odontograma } from "@/domain/entities/Odontograma";
import { IOdontogramaRepository } from "@/domain/repositories/IOdontogramaRepository";
import { apiClient } from "@/lib/api/apiClient";
import { OdontogramaMapper } from "./mappers/OdontogramaMapper";
import type { Tables } from "@/types/database";

/**
 * Implementação do repositório de Odontograma usando Express API
 */
export class DbOdontogramaRepository implements IOdontogramaRepository {
  async findById(id: string): Promise<Odontograma | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(
        `/pep/odontogramas/${id}`,
      );
      if (!data) return null;
      return OdontogramaMapper.toDomain(data as Parameters<typeof OdontogramaMapper.toDomain>[0]);
    } catch {
      return null;
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Odontograma | null> {
    try {
      const data = await apiClient.get<Record<string, any>[]>(
        "/pep/odontogramas",
        { params: { prontuario_id: prontuarioId } },
      );
      if (!data || data.length === 0) return null;
      return OdontogramaMapper.toDomain(data[0] as Parameters<typeof OdontogramaMapper.toDomain>[0]);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<Odontograma[]> {
    try {
      const data =
        await apiClient.get<Record<string, any>[]>(
          "/pep/odontogramas",
        );
      return (data || []).map((row) => OdontogramaMapper.toDomain(row as Parameters<typeof OdontogramaMapper.toDomain>[0]));
    } catch {
      return [];
    }
  }

  async save(odontograma: Odontograma): Promise<void> {
    const insert = OdontogramaMapper.toDbInsert(
      odontograma,
      "", // clinic_id will be resolved by the backend
    );

    try {
      await apiClient.post("/pep/odontogramas", {
        ...insert,
        prontuario_id: odontograma.prontuarioId,
      });
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao salvar odontograma: ${_e.message}`);
    }
  }

  async update(odontograma: Odontograma): Promise<void> {
    const insert = OdontogramaMapper.toDbInsert(
      odontograma,
      "", // clinic_id will be resolved by the backend
    );

    try {
      await apiClient.patch(`/pep/odontogramas/${odontograma.id}`, insert);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao atualizar odontograma: ${_e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pep/odontogramas/${id}`);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao deletar odontograma: ${_e.message}`);
    }
  }
}
