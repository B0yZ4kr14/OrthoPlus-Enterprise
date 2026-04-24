import type { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

export interface DentalTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export interface HygieneOption {
  value: string;
  label: string;
}

export interface GumConditionOption {
  value: string;
  label: string;
}

export const HYGIENE_OPTIONS: HygieneOption[] = [
  { value: "excelente", label: "Excelente" },
  { value: "boa", label: "Boa" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
];

export const GUM_CONDITION_OPTIONS: GumConditionOption[] = [
  { value: "saudavel", label: "Saudável" },
  { value: "leve_inflamacao", label: "Leve Inflamação" },
  { value: "gengivite", label: "Gengivite" },
  { value: "periodontite", label: "Periodontite" },
];
