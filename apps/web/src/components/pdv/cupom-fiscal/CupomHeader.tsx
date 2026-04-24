// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import type { CupomFiscalProps } from "./types";

interface CupomHeaderProps {
  venda: CupomFiscalProps["venda"];
}

export function CupomHeader({ venda }: CupomHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Cupom Fiscal
      </h3>
      <Badge variant="success">
        <CheckCircle className="h-3 w-3 mr-1" />
        Venda #{venda.numero_venda}
      </Badge>
    </div>
  );
}
