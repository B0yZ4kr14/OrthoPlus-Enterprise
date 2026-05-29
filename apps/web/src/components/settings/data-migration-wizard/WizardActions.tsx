// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { ArrowLeft, ArrowRight, Download, Upload, Loader2 } from "lucide-react";

interface WizardActionsProps {
  step: number;
  totalSteps: number;
  mode: "export" | "import";
  loading: boolean;
  importData: unknown;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function WizardActions({
  step,
  totalSteps,
  mode,
  loading,
  importData,
  onClose,
  onPrev,
  onNext,
  onExport,
  onImport,
}: WizardActionsProps) {
  const isLastStepExport = mode === "export" && step === 3;
  const isLastStepImport = mode === "import" && step === 4;
  const isLastStep = isLastStepExport || isLastStepImport;

  return (
    <div className="flex justify-between pt-4">
      <Button
        variant="outline"
        onClick={() => (step === 1 ? onClose() : onPrev())}
        disabled={loading || isLastStep}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {step === 1 ? "Cancelar" : "Voltar"}
      </Button>

      {mode === "export" && step === 1 && (
        <Button onClick={onNext}>
          Avançar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {mode === "export" && step === 2 && (
        <Button onClick={onExport} disabled={loading}>
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
        <Button onClick={onNext} disabled={!importData}>
          Avançar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {mode === "import" && step === 3 && (
        <Button onClick={onImport} disabled={loading}>
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
  );
}
