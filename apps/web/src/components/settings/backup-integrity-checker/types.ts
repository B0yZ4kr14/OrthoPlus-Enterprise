export interface BackupEntry {
  id: string;
  created_at: string;
  backup_type: string;
}

export interface IntegrityResult {
  backupId: string;
  isValid: boolean;
  originalMD5: string;
  currentMD5: string;
  originalSHA256: string;
  currentSHA256: string;
  createdAt: string;
  fileSize: number;
}

export interface BackupIntegrityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
}
