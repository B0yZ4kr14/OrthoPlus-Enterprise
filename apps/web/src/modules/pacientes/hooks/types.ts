/**
 * Tipos compartilhados para hooks de pacientes
 *
 * Extraídos para quebrar dependência circular entre usePatientsAPI e usePatientsUnified.
 */

import type { Patient } from "@/types/patient";

export interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  addPatient: (patientData: Partial<Patient>) => Promise<void>;
  updatePatient: (
    patientId: string,
    patientData: Partial<Patient>,
  ) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  getPatient: (patientId: string) => Patient | undefined;
  reloadPatients: () => Promise<void>;
}
