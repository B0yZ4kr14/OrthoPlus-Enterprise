import type { ResultsStepProps } from "./types";
import { ExportSuccess } from "./components/ExportSuccess";
import { ImportSummary } from "./components/ImportSummary";

export * from "./types";
export { ExportSuccess, ImportSummary };

interface ImportResultsData {
  imported: {
    modules: number;
    patients: number;
    prontuarios: number;
    appointments: number;
  };
  skipped?: unknown[];
  errors?: unknown[];
}

export function MigrationResultsStep({
  mode,
  importResults,
}: ResultsStepProps) {
  if (mode === "export") {
    return <ExportSuccess />;
  }

  const results = importResults as ImportResultsData | null;

  if (results) {
    return <ImportSummary results={results} />;
  }

  return null;
}
