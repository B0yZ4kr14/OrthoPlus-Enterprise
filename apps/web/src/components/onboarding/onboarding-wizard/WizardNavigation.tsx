// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between pt-2">
      <Button type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Anterior
      </Button>

      <Button type="button" onClick={onNext} className="gap-2">
        {currentStep === totalSteps - 1 ? "Concluir" : "Próximo"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
