// cspell:disable
import type { Patient } from "@/types/patient";

export type TabValue =
  | "historico"
  | "tratamentos"
  | "odontograma"
  | "odontograma-3d"
  | "historico-odonto"
  | "comparacao-odonto"
  | "anexos";

export interface DialogState {
  historico: boolean;
  tratamento: boolean;
  prescricao: boolean;
  receita: boolean;
}

export interface PEPPageState {
  selectedPatient: Patient | null;
  activeTab: TabValue;
  dialogs: DialogState;
  selectedForComparison: [string | null, string | null];
}

export interface AISuggestion {
  procedure?: string;
  clinical_notes?: string;
  tooth_number?: number;
}
