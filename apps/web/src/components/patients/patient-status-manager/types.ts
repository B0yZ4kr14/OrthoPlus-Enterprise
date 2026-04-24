import type { PatientStatus } from "@/types/patient-status";

export interface PatientStatusManagerProps {
  currentStatus: PatientStatus;
  patientId: string;
  patientName: string;
  onStatusChange: (newStatus: PatientStatus, reason: string) => Promise<void>;
  disabled?: boolean;
}

export interface StatusValidationResult {
  isValid: boolean;
  error: string | null;
}
