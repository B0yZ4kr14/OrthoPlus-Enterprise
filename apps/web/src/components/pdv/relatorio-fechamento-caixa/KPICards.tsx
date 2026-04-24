// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { DollarSign, FileText, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import type { FechamentoData } from "./types";

interface KPICardsProps {
  fechamento: FechamentoData | undefined;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

export function KPICards({ fechamento }: KPICardsProps) {
  const hasDivergencia = Math.abs(fechamento?.divergencia || 0) > 0.01;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total PDV</p>
            <p className="text-xl font-bold">{formatCurrency(fechamento?.totalVendasPDV || 0)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <FileText className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total NFCe</p>
            <p className="text-xl font-bold">{formatCurrency(fechamento?.totalNFCe || 0)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasDivergencia ? "bg-destructive/10" : "bg-success/10"}`}>
            {hasDivergencia ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Divergência</p>
            <p className={`text-xl font-bold ${hasDivergencia ? "text-destructive" : "text-success"}`}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                signDisplay: "always",
              }).format(fechamento?.divergencia || 0)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <TrendingUp className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sem NFCe</p>
            <p className="text-xl font-bold">{fechamento?.vendasSemNFCe || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
