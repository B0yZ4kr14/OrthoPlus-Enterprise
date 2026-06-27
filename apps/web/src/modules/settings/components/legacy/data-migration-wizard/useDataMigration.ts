// cspell:disable
import { useState } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type { ExportOptions, ImportOptions } from "./types";

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeModules: true,
  includePatients: true,
  includeHistory: true,
  includeProntuarios: true,
  includeAppointments: true,
  includeFinanceiro: false,
  format: "json",
  enableCompression: true,
  enableEncryption: false,
  isIncremental: false,
};

const DEFAULT_IMPORT_OPTIONS: ImportOptions = {
  overwriteExisting: false,
  skipConflicts: true,
  mergeData: false,
};

export function useDataMigration(
  mode: "export" | "import",
  onClose: () => void,
) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(
    DEFAULT_EXPORT_OPTIONS,
  );
  const [importOptions, setImportOptions] = useState<ImportOptions>(
    DEFAULT_IMPORT_OPTIONS,
  );
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<unknown>(null);
  const [importResults, setImportResults] = useState<unknown>(null);

  const totalSteps = mode === "export" ? 3 : 4;

  const handleExport = async () => {
    setLoading(true);
    setProgress(0);

    try {
      setProgress(20);
      const data = await apiClient.post<unknown>(
        "/backups/manager",
        exportOptions,
      );
      setProgress(60);
      setProgress(80);

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orthoplus-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setProgress(100);
      toast.success("Exportação concluída com sucesso!", {
        description: "O arquivo foi baixado para seu computador.",
      });
      setStep(3);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Export error:", error);
      toast.error("Erro ao exportar dados", { description: _e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setLoading(true);
    setProgress(0);

    try {
      setProgress(20);
      const data = await apiClient.post<unknown>("/modules/import-data", {
        data: importData,
        options: importOptions,
      });
      setProgress(80);
      setProgress(100);
      setImportResults(data);

      const imported = (
        data as Record<
          string,
          {
            modules: number;
            patients: number;
            prontuarios: number;
            appointments: number;
          }
        >
      ).imported;
      toast.success("Importação concluída!", {
        description: `${imported.modules + imported.patients + imported.prontuarios + imported.appointments} registros importados.`,
      });
      setStep(4);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Import error:", error);
      toast.error("Erro ao importar dados", { description: _e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setImportData(json);
        toast.success("Arquivo carregado com sucesso!");
        setStep(2);
      } catch (_err) {
        toast.error("Erro ao ler arquivo", {
          description: "Arquivo JSON inválido",
        });
      }
    };

    reader.readAsText(file);
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  return {
    step,
    totalSteps,
    loading,
    progress,
    exportOptions,
    importOptions,
    importFile,
    importData,
    importResults,
    setExportOptions,
    setImportOptions,
    handleExport,
    handleImport,
    handleFileUpload,
    nextStep,
    prevStep,
    setStep,
  };
}
