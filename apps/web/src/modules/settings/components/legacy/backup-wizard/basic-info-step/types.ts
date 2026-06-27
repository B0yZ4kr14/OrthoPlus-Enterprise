import type { WizardStepProps } from "../types";

export type { WizardStepProps };

export type Frequency = "daily" | "weekly" | "monthly";

export interface FrequencyOption {
  value: Frequency;
  label: string;
}

export interface DayOfWeekOption {
  value: string;
  label: string;
}
