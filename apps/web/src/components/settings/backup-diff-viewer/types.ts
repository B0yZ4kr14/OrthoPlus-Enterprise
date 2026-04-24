// cspell:disable
export interface BackupDiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface DiffResult {
  added: unknown[];
  modified: unknown[];
  removed: unknown[];
}

export interface DiffSummary {
  patients: DiffResult;
  appointments: DiffResult;
  clinical_history: DiffResult;
  financial: DiffResult;
}
