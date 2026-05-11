import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Button } from "@orthoplus/core-ui/button";
import { Sparkles, Eye, Download } from "lucide-react";
import { useStepExport, NEXT_STEPS } from "./useStepExport";
import { CompletionCard } from "./CompletionCard";
import { NextStepCard } from "./NextStepCard";
import { ResourcesCard } from "./ResourcesCard";

export function StepExport() {
  const { handleExport, handleViewConfig } = useStepExport();

  return (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Parabéns! Você concluiu o tour de onboarding. Agora está pronto para começar a usar o
          OrthoPlus Enterprise com confiança.
        </AlertDescription>
      </Alert>

      <CompletionCard />

      <div className="space-y-4">
        <h3 className="font-semibold">Próximos Passos Recomendados</h3>
        {NEXT_STEPS.map((step) => (
          <NextStepCard key={step.title} step={step} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="gap-2" onClick={handleViewConfig}>
          <Eye className="h-4 w-4" />
          Ver Configurações
        </Button>
        <Button variant="default" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar Config
        </Button>
      </div>

      <ResourcesCard />
    </div>
  );
}
