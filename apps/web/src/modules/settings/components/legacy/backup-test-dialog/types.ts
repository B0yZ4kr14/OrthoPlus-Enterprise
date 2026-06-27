// cspell:disable
export interface BackupTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupId: string;
  backupName?: string;
}

export interface TestResult {
  success: boolean;
  backupId: string;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  errors: string[];
  duration: number;
  timestamp: string;
}
