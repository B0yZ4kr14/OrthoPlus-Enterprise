import type { UseFormReturn } from "react-hook-form";
import type { ExchangeFormValues } from "../types";

export type { ExchangeFormValues };

export interface AdvancedSettingsProps {
  form: UseFormReturn<ExchangeFormValues>;
}

export interface FormSwitchProps {
  name: "auto_convert_to_brl" | "is_active";
  label: string;
  description: string;
  form: UseFormReturn<ExchangeFormValues>;
}

export interface FormNumberInputProps {
  name: "conversion_threshold" | "processing_fee_percentage";
  label: string;
  description: string;
  form: UseFormReturn<ExchangeFormValues>;
  step?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}
