import type { WizardStepProps } from "../types";

export type { WizardStepProps };

export type BackupType = "full" | "incremental" | "differential";

export interface BackupOption {
  value: BackupType;
  title: string;
  description: string;
  isIncremental?: boolean;
}
