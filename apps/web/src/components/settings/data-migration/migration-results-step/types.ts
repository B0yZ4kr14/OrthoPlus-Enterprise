import type { ResultsStepProps } from "../types";

export type { ResultsStepProps };

export interface ImportResultsData {
  imported: {
    modules: number;
    patients: number;
    prontuarios: number;
    appointments: number;
  };
  skipped?: unknown[];
  errors?: unknown[];
}

export interface ExportSuccessProps {
  title?: string;
  message?: string;
}

export interface ImportSummaryProps {
  results: ImportResultsData;
}
