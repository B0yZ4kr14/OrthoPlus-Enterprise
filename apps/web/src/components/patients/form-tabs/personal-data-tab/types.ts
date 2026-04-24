import type { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

export interface PersonalDataTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export interface FormFieldConfig {
  name: keyof PatientFormValues;
  label: string;
  required?: boolean;
  type?: "text" | "date" | "select";
  placeholder?: string;
  description?: string;
  mask?: "cpf" | "rg";
  options?: Array<{ value: string; label: string }>;
}
