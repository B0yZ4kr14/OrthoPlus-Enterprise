import { apiClient } from "@/lib/api/apiClient";
import { PatientAdapter } from "@/lib/adapters/patientAdapter";
import type { IPatientRepository } from "../../domain/repositories/IPatientRepository";
import type { Patient } from "@/types/patient";

export class PatientRepositoryApi implements IPatientRepository {
  async findAll(): Promise<Patient[]> {
    const response = await apiClient.get<{ patients: unknown[] }>("/pacientes");
    return PatientAdapter.toFrontendList(response.patients as Parameters<typeof PatientAdapter.toFrontendList>[0]);
  }

  async findById(id: string): Promise<Patient | null> {
    const response = await apiClient.get<import("@/lib/adapters/patientAdapter").PatientAPI>(`/pacientes/${id}`);
    return PatientAdapter.toFrontend(response);
  }

  async save(patient: Partial<Patient>): Promise<Patient> {
    const apiData = PatientAdapter.toAPI(patient as Patient);
    const response = await apiClient.post<import("@/lib/adapters/patientAdapter").PatientAPI>("/pacientes", apiData);
    return PatientAdapter.toFrontend(response);
  }

  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    const apiData = PatientAdapter.toAPI(patient as Patient);
    await apiClient.put(`/pacientes/${id}`, apiData);
    return this.findById(id).then((p) => p!);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pacientes/${id}`);
  }
}
