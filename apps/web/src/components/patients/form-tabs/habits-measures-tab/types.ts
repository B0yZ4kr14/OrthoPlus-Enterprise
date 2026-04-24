// cspell:disable
import { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

export interface HabitsMeasuresTabProps {
  form: UseFormReturn<PatientFormValues>;
}
