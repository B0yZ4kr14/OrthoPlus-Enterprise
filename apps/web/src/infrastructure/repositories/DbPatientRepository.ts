import { Patient } from "@/domain/entities/Patient";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { PatientMapper } from "../mappers/PatientMapper";
import type { Tables } from "@/types/database";

export class DbPatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`/pacientes/${id}`);
      if (!data) return null;
      return PatientMapper.toDomain(
        data as Parameters<typeof PatientMapper.toDomain>[0],
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar paciente",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<Patient[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>(`/pacientes`, {
        params: { clinic_id: clinicId },
      });
      return (data || []).map((d) =>
        PatientMapper.toDomain(
          d as Parameters<typeof PatientMapper.toDomain>[0],
        ),
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar pacientes",
        error instanceof Error ? error : new Error(String(error)),
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
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    try {
      const data = await apiClient.get<Record<string, any>[]>(`/pacientes`, {
        params: { clinic_id: clinicId, cpf },
      });
      if (!data || data.length === 0) return null;
      return PatientMapper.toDomain(
        data[0] as Parameters<typeof PatientMapper.toDomain>[0],
      );
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
        error instanceof Error ? error : new Error(String(error)),
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
        error instanceof Error ? error : new Error(String(error)),
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
        error instanceof Error ? error : new Error(String(error)),
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
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
