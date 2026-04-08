import { Patient } from "@/domain/entities/Patient";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { PatientMapper } from "../mappers/PatientMapper";
import type { Tables } from "@/types/database";

export class DbPatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    try {
      const data = await apiClient.get<Tables<"patients">>(`/pacientes/${id}`);
      if (!data) return null;
      // @ts-expect-error — TS2345
      return PatientMapper.toDomain(data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar paciente",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<Patient[]> {
    try {
      const data = await apiClient.get<Tables<"patients">[]>(`/pacientes`, {
        params: { clinic_id: clinicId },
      });
      // @ts-expect-error — TS2345
      return (data || []).map(PatientMapper.toDomain);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar pacientes",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Patient[]> {
    try {
      return this.findByClinicId(clinicId);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar pacientes ativos",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    try {
      const data = await apiClient.get<Tables<"patients">[]>(`/pacientes`, {
        params: { clinic_id: clinicId, cpf },
      });
      if (!data || data.length === 0) return null;
      // @ts-expect-error — TS2345
      return PatientMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async save(patient: Patient): Promise<void> {
    try {
      const data = PatientMapper.toPersistence(patient);
      await apiClient.post("/pacientes", data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao salvar paciente",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async update(patient: Patient): Promise<void> {
    try {
      await apiClient.put(`/pacientes/${patient.id}`, {
        patient_name: patient.fullName,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao atualizar paciente",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.patch(`/pacientes/${id}/status`, { status: "inactive" });
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao deletar paciente",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async findByRiskLevel(
    clinicId: string,
    riskLevel: string,
  ): Promise<Patient[]> {
    try {
      return this.findByClinicId(clinicId);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar pacientes por risco",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }
}
