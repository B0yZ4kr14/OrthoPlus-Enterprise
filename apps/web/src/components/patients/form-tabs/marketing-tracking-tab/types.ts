import type { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

export interface MarketingTrackingTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export interface MarketingField {
  name: keyof PatientFormValues;
  label: string;
  placeholder: string;
  description: string;
  icon: "target" | "megaphone" | "calendar" | "user" | "phone";
}
