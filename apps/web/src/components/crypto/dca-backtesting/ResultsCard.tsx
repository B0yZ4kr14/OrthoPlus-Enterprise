// cspell:disable
import { TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import type { BacktestSummary } from "./types";

interface ResultsCardProps {
  summary: BacktestSummary;
  coinType: string;
}

export function ResultsCard({ summary, coinType }: ResultsCardProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
      <Card depth="subtle" className="border-l-4 border-l-primary">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">DCA (Dollar-Cost Averaging)</h3>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Investido:</span>
              <span className="font-semibold">
                {formatCurrency(summary.dcaTotalInvested)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Final:</span>
              <span className="font-semibold text-primary">
                {formatCurrency(summary.dcaFinalValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno:</span>
              <span
                className={`font-semibold ${
                  summary.dcaReturn >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {summary.dcaReturn >= 0 ? "+" : ""}
                {summary.dcaReturn.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total {coinType}:</span>
              <span className="font-semibold">
                {summary.dcaTotalCoin.toFixed(8)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card depth="subtle" className="border-l-4 border-l-secondary">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Investimento Único (Lump Sum)</h3>
            <DollarSign className="h-5 w-5 text-secondary" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Investido:</span>
              <span className="font-semibold">
                {formatCurrency(summary.lumpSumTotalInvested)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Final:</span>
              <span className="font-semibold text-secondary">
                {formatCurrency(summary.lumpSumFinalValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno:</span>
              <span
                className={`font-semibold ${
                  summary.lumpSumReturn >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {summary.lumpSumReturn >= 0 ? "+" : ""}
                {summary.lumpSumReturn.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total {coinType}:</span>
              <span className="font-semibold">
                {summary.lumpSumTotalCoin.toFixed(8)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
