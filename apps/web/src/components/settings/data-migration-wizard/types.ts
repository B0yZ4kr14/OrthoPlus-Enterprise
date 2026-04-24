// cspell:disable
export interface ExportOptions {
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  format: string;
  enableCompression: boolean;
  enableEncryption: boolean;
  isIncremental: boolean;
}

export interface ImportOptions {
  overwriteExisting: boolean;
  skipConflicts: boolean;
  mergeData: boolean;
}

export interface DataMigrationWizardProps {
  open: boolean;
  onClose: () => void;
  mode: "export" | "import";
}
