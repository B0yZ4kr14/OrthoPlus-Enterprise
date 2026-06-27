export interface BackupData {
  version: string;
  exportedAt: string;
  clinicId: string;
  backupId: string;
  isIncremental: boolean;
  requiresDecryption?: boolean;
  data: {
    modules?: string[];
    patients?: string[];
    historicoClinico?: string[];
    prontuarios?: string[];
    odontogramas?: string[];
    appointments?: string[];
    financeiro?: {
      contasReceber: string[];
      contasPagar: string[];
    };
  };
}

export interface RestoreResults {
  modules: number;
  patients: number;
  historico: number;
  prontuarios: number;
  appointments: number;
  financeiro: number;
}

export interface BackupRestoreDialogProps {
  open: boolean;
  onClose: () => void;
  backupFile?: File;
}

export interface SelectedItems {
  modules: boolean;
  patients: boolean;
  historicoClinico: boolean;
  prontuarios: boolean;
  odontogramas: boolean;
  appointments: boolean;
  financeiro: boolean;
}

export const DEFAULT_SELECTED_ITEMS: SelectedItems = {
  modules: true,
  patients: false,
  historicoClinico: false,
  prontuarios: false,
  odontogramas: false,
  appointments: false,
  financeiro: false,
};

export const RESTORE_STEPS = [
  { id: 1, label: "Validação" },
  { id: 2, label: "Seleção" },
  { id: 3, label: "Confirmação" },
  { id: 4, label: "Restauração" },
] as const;
