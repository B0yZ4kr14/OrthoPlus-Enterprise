// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface WizardNavigationProps {
  step: number;
  totalSteps: number;
  loading: boolean;
  canSubmit: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function WizardNavigation({
  step,
  totalSteps,
  loading,
  canSubmit,
  onPrev,
  onNext,
  onSubmit,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={onPrev} disabled={step === 1}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>

      {step < totalSteps ? (
        <Button onClick={onNext}>
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={loading || !canSubmit}>
          {loading ? "Configurando..." : "Confirmar e Ativar"}
        </Button>
      )}
    </div>
  );
}
