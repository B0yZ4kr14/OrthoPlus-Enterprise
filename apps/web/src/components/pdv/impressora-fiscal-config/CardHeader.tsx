// cspell:disable
import { CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Printer, CheckCircle2, XCircle } from "lucide-react";
import type { ImpressoraConfig } from "./types";

interface CardHeaderProps {
  config: ImpressoraConfig | null;
}

export function ImpressoraCardHeader({ config }: CardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          <CardTitle>Configuração de Impressora Fiscal SAT/MFe</CardTitle>
        </div>
        {config && (
          <Badge variant={config.ativo ? "success" : "secondary"}>
            {config.ativo ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ativa
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inativa
              </>
            )}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
}
