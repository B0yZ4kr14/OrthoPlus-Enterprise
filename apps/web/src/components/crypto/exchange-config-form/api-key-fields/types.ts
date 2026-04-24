import type { UseFormReturn } from "react-hook-form";
import type { ExchangeFormValues } from "../types";

export type { ExchangeFormValues };

export interface ApiKeyFieldsProps {
  form: UseFormReturn<ExchangeFormValues>;
}

export interface ApiKeyFieldProps {
  form: UseFormReturn<ExchangeFormValues>;
  name: "api_key" | "api_secret";
  label: string;
  placeholder: string;
  description: string;
  tooltipContent: string;
}
