import type { PatientStatus } from "@/types/patient-status";

export type { PatientStatus };

export interface StatusSelectProps {
  currentStatus: PatientStatus;
  selectedStatus: PatientStatus;
  disabled?: boolean;
  onSelect: (status: PatientStatus) => void;
}

export interface StatusOptionProps {
  status: PatientStatus;
  selectedStatus: PatientStatus;
  currentStatus: PatientStatus;
  onSelect: (status: PatientStatus) => void;
}
