// cspell:disable
import { Brain } from "lucide-react";
import { Badge } from "@orthoplus/core-ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@orthoplus/core-ui/alert";
import type { SugestaoIA } from "./types";

interface AlertaIAProps {
  sugestao: SugestaoIA | null;
}

export function AlertaIA({ sugestao }: AlertaIAProps) {
  if (!sugestao?.deveSugerirSangria) return null;

  return (
    <Alert variant="destructive">
      <Brain className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Badge variant="destructive">ALERTA IA</Badge>
        Sangria Recomendada
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-2 mt-2">
          <p className="font-medium">{sugestao.motivo}</p>
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <p className="text-muted-foreground">Valor Sugerido</p>
              <p className="font-bold text-lg">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(sugestao.valorSugerido)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Risco Calculado</p>
              <p className="font-bold text-lg">
                {sugestao.analise.riscoPercentual.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
