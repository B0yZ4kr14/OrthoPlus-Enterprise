// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { FileText, Download } from "lucide-react";

interface ReportHeaderProps {
  gerandoSped: boolean;
  onGerarSped: () => void;
}

export function ReportHeader({ gerandoSped, onGerarSped }: ReportHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Relatório de Fechamento</h3>
          <p className="text-sm text-muted-foreground">
            Comparação PDV vs NFCe Emitidas
          </p>
        </div>
      </div>
      <Button onClick={onGerarSped} disabled={gerandoSped} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        {gerandoSped ? "Gerando..." : "Gerar SPED Fiscal"}
      </Button>
    </div>
  );
}
