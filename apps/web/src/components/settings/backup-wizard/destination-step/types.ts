import type { ScheduledBackupConfig } from "../types";

export type CloudStorageProvider =
  ScheduledBackupConfig["cloudStorageProvider"];

export interface DestinationStepProps {
  config: ScheduledBackupConfig;
  setConfig: (config: ScheduledBackupConfig) => void;
}

export const STORAGE_OPTIONS = [
  { value: "local", label: "Armazenamento Local" },
  { value: "s3", label: "Amazon S3" },
  { value: "google_drive", label: "Google Drive" },
  { value: "dropbox", label: "Dropbox" },
  { value: "ftp", label: "FTP/SFTP" },
  { value: "storj", label: "Storj DCS (Descentralizado)" },
] as const;
