// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import { FileText, Check, AlertTriangle } from "lucide-react";
import type { FiscalConfig } from "./types";

interface ConfigHeaderProps {
  config: FiscalConfig | null;
}

export function ConfigHeader({ config }: ConfigHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Configuração Fiscal</h3>
          <p className="text-sm text-muted-foreground">
            Configure emissão de NFCe/SAT/MFe conforme legislação
          </p>
        </div>
      </div>
      {config?.is_active ? (
        <Badge variant="success" className="flex items-center gap-1">
          <Check className="h-3 w-3" />
          Ativo
        </Badge>
      ) : (
        <Badge variant="warning" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Inativo
        </Badge>
      )}
    </div>
  );
}
