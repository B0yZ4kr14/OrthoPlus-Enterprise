export interface ExportOptions {
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  format: "json" | "csv" | "excel";
  enableCompression: boolean;
  enableEncryption: boolean;
  encryptionPassword?: string;
  isIncremental: boolean;
  lastBackupDate?: string;
}

export interface ImportOptions {
  overwriteExisting: boolean;
  skipConflicts: boolean;
  mergeData: boolean;
}

export interface ExportStepProps {
  exportOptions: ExportOptions;
  setExportOptions: React.Dispatch<React.SetStateAction<ExportOptions>>;
  loading?: boolean;
  progress?: number;
}

export interface ImportStepProps {
  importOptions: ImportOptions;
  setImportOptions: React.Dispatch<React.SetStateAction<ImportOptions>>;
  importFile: File | null;
  importData: unknown;
  loading?: boolean;
  progress?: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ResultsStepProps {
  mode: "export" | "import";
  importResults: unknown;
}
