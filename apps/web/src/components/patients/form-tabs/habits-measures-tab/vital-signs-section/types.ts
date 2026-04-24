import type { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

export interface VitalSignsSectionProps {
  form: UseFormReturn<PatientFormValues>;
}

export interface VitalField {
  name: keyof PatientFormValues;
  label: string;
  placeholder: string;
  step?: string;
  disabled?: boolean;
}

export interface BloodTypeOption {
  value: string;
  label: string;
}

export const BLOOD_TYPES: BloodTypeOption[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const VITAL_FIELDS: VitalField[] = [
  { name: "blood_pressure_systolic", label: "Pressão Sistólica (mmHg)", placeholder: "120" },
  { name: "blood_pressure_diastolic", label: "Pressão Diastólica (mmHg)", placeholder: "80" },
  { name: "heart_rate", label: "Freq. Cardíaca (bpm)", placeholder: "70" },
  { name: "weight_kg", label: "Peso (kg)", placeholder: "70.5", step: "0.1" },
  { name: "height_cm", label: "Altura (cm)", placeholder: "170", step: "0.1" },
  { name: "bmi", label: "IMC", placeholder: "Calculado automaticamente", step: "0.1", disabled: true },
];
