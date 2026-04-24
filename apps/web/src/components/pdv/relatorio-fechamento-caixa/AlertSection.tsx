// cspell:disable
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { FechamentoData } from "./types";

interface AlertSectionProps {
  fechamento: FechamentoData | undefined;
}

export function AlertSection({ fechamento }: AlertSectionProps) {
  const hasDivergencia = Math.abs(fechamento?.divergencia || 0) > 0.01;

  if (hasDivergencia) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium text-destructive">
              Divergência Detectada: {fechamento?.percentualDivergencia.toFixed(2)}%
            </p>
            <p className="text-sm text-destructive-foreground mt-1">
              {fechamento?.vendasSemNFCe} vendas sem NFCe emitida. Verifique se todas as vendas geraram cupom fiscal
              corretamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
        <div>
          <p className="font-medium text-success">Fechamento Conferido</p>
          <p className="text-sm text-success-foreground mt-1">
            Todos os valores estão corretos. Sistema fiscal em conformidade.
          </p>
        </div>
      </div>
    </div>
  );
}
