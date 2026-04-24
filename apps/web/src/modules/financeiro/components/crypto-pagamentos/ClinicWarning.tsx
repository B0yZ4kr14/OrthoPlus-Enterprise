// cspell:disable
import { Info } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";

export function ClinicWarning() {
  return (
    <Card variant="default" className="border-amber-500/50 bg-amber-500/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Nenhuma clínica selecionada
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
              Selecione uma clínica no menu superior para gerenciar
              pagamentos em criptomoedas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
