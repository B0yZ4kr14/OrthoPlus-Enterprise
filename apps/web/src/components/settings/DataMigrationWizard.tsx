import { useState } from "react";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import {
  Download,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { ExportOptions, ImportOptions } from "./data-migration/types";
import { ExportDataSelectionStep } from "./data-migration/ExportDataSelectionStep";
import { ExportConfirmStep } from "./data-migration/ExportConfirmStep";
import { ImportFileUploadStep } from "./data-migration/ImportFileUploadStep";
import { ImportPreviewStep } from "./data-migration/ImportPreviewStep";
import { ImportOptionsStep } from "./data-migration/ImportOptionsStep";
import { MigrationResultsStep } from "./data-migration/MigrationResultsStep";

interface DataMigrationWizardProps {
  open: boolean;
  onClose: () => void;
  mode: "export" | "import";
}

export function DataMigrationWizard({
  open,
  onClose,
  mode,
}: DataMigrationWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
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
  });

  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwriteExisting: false,
    skipConflicts: true,
    mergeData: false,
  });

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
      console.error("Export error:", error);
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

      const result = data as {
        imported: {
          modules: number;
          patients: number;
          prontuarios: number;
          appointments: number;
        };
      };
      toast.success("Importação concluída!", {
        description: `${result.imported.modules + result.imported.patients + result.imported.prontuarios + result.imported.appointments} registros importados.`,
      });
      setStep(4);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      console.error("Import error:", error);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "export" ? (
              <Download className="h-5 w-5" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {mode === "export" ? "Exportar Dados" : "Importar Dados"}
          </DialogTitle>
          <DialogDescription>
            {mode === "export"
              ? "Exporte dados da clínica para backup ou migração"
              : "Importe dados de outro sistema OrthoPlus Enterprise ou arquivo de backup"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    i + 1 === step
                      ? "bg-primary text-primary-foreground"
                      : i + 1 < step
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${i + 1 < step ? "bg-success" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {mode === "export" && step === 1 && (
            <ExportDataSelectionStep
              exportOptions={exportOptions}
              setExportOptions={setExportOptions}
            />
          )}
          {mode === "export" && step === 2 && (
            <ExportConfirmStep
              exportOptions={exportOptions}
              setExportOptions={setExportOptions}
              loading={loading}
              progress={progress}
            />
          )}
          {mode === "export" && step === 3 && (
            <MigrationResultsStep mode="export" importResults={null} />
          )}

          {mode === "import" && step === 1 && (
            <ImportFileUploadStep
              importFile={importFile}
              onFileUpload={handleFileUpload}
            />
          )}
          {mode === "import" && step === 2 && (
            <ImportPreviewStep importData={importData} />
          )}
          {mode === "import" && step === 3 && (
            <ImportOptionsStep
              importOptions={importOptions}
              setImportOptions={setImportOptions}
              loading={loading}
              progress={progress}
            />
          )}
          {mode === "import" && step === 4 && (
            <MigrationResultsStep mode="import" importResults={importResults} />
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
              disabled={
                loading ||
                (mode === "export" && step === 3) ||
                (mode === "import" && step === 4)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>

            {mode === "export" && step === 1 && (
              <Button onClick={() => setStep(2)}>
                Avançar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {mode === "export" && step === 2 && (
              <Button onClick={handleExport} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Agora
                  </>
                )}
              </Button>
            )}

            {mode === "export" && step === 3 && (
              <Button onClick={onClose}>Concluir</Button>
            )}

            {mode === "import" && step === 2 && (
              <Button onClick={() => setStep(3)} disabled={!importData}>
                Avançar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {mode === "import" && step === 3 && (
              <Button onClick={handleImport} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Agora
                  </>
                )}
              </Button>
            )}

            {mode === "import" && step === 4 && (
              <Button onClick={onClose}>Concluir</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
