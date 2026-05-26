import { Prontuario } from "@/domain/entities/Prontuario";
import { IProntuarioRepository } from "@/domain/repositories/IProntuarioRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { ProntuarioMapper } from "../mappers/ProntuarioMapper";

export class DbProntuarioRepository implements IProntuarioRepository {
  async findById(id: string): Promise<Prontuario | null> {
    try {
      // @ts-expect-error — TS2304
      const data = await apiClient.get<Tables<"patient_records">>(
        `/pep/prontuarios/${id}`,
      );
      if (!data) return null;
      return ProntuarioMapper.toDomain(data);
    } catch (error) {
      // @ts-expect-error — TS2345
      throw new InfrastructureError("Erro ao buscar prontuário", error);
    }
  }

  async findByPatientId(
    patientId: string,
    clinicId: string,
  ): Promise<Prontuario | null> {
    try {
      // @ts-expect-error — TS2304
      const data = await apiClient.get<Tables<"patient_records">[]>(
        `/pep/prontuarios/patient/${patientId}`,
      );
      if (!data || data.length === 0) return null;
      return ProntuarioMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar prontuário do paciente",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<Prontuario[]> {
    try {
      const data =
        // @ts-expect-error — TS2304
        await apiClient.get<Tables<"patient_records">[]>("/pep/prontuarios");
      return (data || []).map(ProntuarioMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar prontuários da clínica",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Prontuario[]> {
    return this.findByClinicId(clinicId);
  }

  async findByNumero(
    numero: string,
    clinicId: string,
  ): Promise<Prontuario | null> {
    try {
      // @ts-expect-error — TS2304
      const data = await apiClient.get<Tables<"patient_records">[]>(
        "/pep/prontuarios",
        { params: { search: numero } },
      );
      if (!data || data.length === 0) return null;
      return ProntuarioMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar prontuário por número",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async save(prontuario: Prontuario): Promise<void> {
    try {
      const data = ProntuarioMapper.toInsert(prontuario);
      await apiClient.post("/pep/prontuarios", data);
    } catch (error) {
      // @ts-expect-error — TS2345
      throw new InfrastructureError("Erro ao salvar prontuário", error);
    }
  }

  async update(prontuario: Prontuario): Promise<void> {
    try {
      const data = ProntuarioMapper.toPersistence(prontuario);
      await apiClient.patch(`/pep/prontuarios/${prontuario.id}`, data);
    } catch (error) {
      // @ts-expect-error — TS2345
      throw new InfrastructureError("Erro ao atualizar prontuário", error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pep/prontuarios/${id}`);
    } catch (error) {
      // @ts-expect-error — TS2345
      throw new InfrastructureError("Erro ao deletar prontuário", error);
    }
  }
}
