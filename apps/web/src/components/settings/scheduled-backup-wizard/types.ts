// cspell:disable
export interface ScheduledBackupConfig {
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  backupType: "full" | "partial";
  isIncremental: boolean;
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  includePostgresDB: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  cloudStorageProvider: string;
  notificationEmails: string[];
  isActive: boolean;
}

export interface ScheduledBackupWizardProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ScheduledBackupConfig> & { id?: string };
}
