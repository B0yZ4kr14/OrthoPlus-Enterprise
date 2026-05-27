import { Progress } from "@orthoplus/core-ui/progress";
import { Check, Loader2 } from "lucide-react";
import type { RestoreResults } from "./types";

interface RestoreProgressProps {
  progress: number;
  results: RestoreResults | null;
}

export function RestoreProgress({ progress, results }: RestoreProgressProps) {
  if (results) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Restauração Concluída!</h3>
          <p className="text-sm text-muted-foreground">
            Os dados foram restaurados com sucesso.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted p-2 rounded">
            <span className="font-medium">{results.modules}</span> módulos
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="font-medium">{results.patients}</span> pacientes
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="font-medium">{results.historico}</span> históricos
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="font-medium">{results.prontuarios}</span> prontuários
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="font-medium">{results.appointments}</span> agendamentos
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="font-medium">{results.financeiro}</span> registros financeiros
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center py-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      <div>
        <h3 className="font-medium">Restaurando dados...</h3>
        <p className="text-sm text-muted-foreground">
          Não feche esta janela
        </p>
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-muted-foreground">{progress}%</p>
    </div>
  );
}
