export interface ScheduledBackupConfig {
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  backupType: "full" | "incremental" | "differential";
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
  cloudStorageProvider:
    | "s3"
    | "google_drive"
    | "dropbox"
    | "ftp"
    | "storj"
    | "local"
    | "none";
  ftpConfig?: {
    host: string;
    port: number;
    username: string;
    password: string;
    remotePath: string;
  };
  storjConfig?: {
    accessGrant: string;
    bucket: string;
    prefix: string;
  };
  localPath?: string;
  notificationEmails: string[];
  isActive: boolean;
}

export interface WizardStepProps {
  config: ScheduledBackupConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScheduledBackupConfig>>;
}
