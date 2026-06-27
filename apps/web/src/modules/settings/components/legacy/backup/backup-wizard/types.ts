export interface BackupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type BackupType = "full" | "incremental" | "differential";
export type DataCategory =
  | "patients"
  | "appointments"
  | "records"
  | "financial"
  | "inventory";

export interface DataOption {
  id: DataCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface BackupConfig {
  type: BackupType;
  selectedData: DataCategory[];
  compression: boolean;
  encryption: boolean;
}

export const BACKUP_TYPE_LABELS: Record<BackupType, string> = {
  full: "Completo",
  incremental: "Incremental",
  differential: "Diferencial",
};
