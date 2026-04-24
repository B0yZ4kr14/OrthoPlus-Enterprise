// cspell:disable
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import type { CryptoStats } from "./types";

interface KPICardsProps {
  cryptoStats: CryptoStats;
  cryptoFeePercentage: number;
  totalSavings: number;
  avgSavingsPercentage: number;
}

export function KPICards({
  cryptoStats,
  cryptoFeePercentage,
  totalSavings,
  avgSavingsPercentage,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="metric" depth="normal" className="p-6 border-l-orange-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Taxa Crypto Média
            </p>
            <p className="text-2xl font-bold text-orange-500">
              {cryptoFeePercentage.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              R${" "}
              {cryptoStats.totalFees.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <Percent className="h-10 w-10 text-orange-500 opacity-20 shrink-0" />
        </div>
      </Card>

      <Card variant="metric" depth="normal" className="p-6 border-l-green-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Economia Total
            </p>
            <p className="text-2xl font-bold text-green-500">
              R${" "}
              {totalSavings.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              vs métodos tradicionais
            </p>
          </div>
          <TrendingUp className="h-10 w-10 text-green-500 opacity-20 shrink-0" />
        </div>
      </Card>

      <Card variant="metric" depth="normal" className="p-6 border-l-blue-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Economia Média
            </p>
            <p className="text-2xl font-bold text-blue-500">
              {avgSavingsPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">menos taxas</p>
          </div>
          <TrendingDown className="h-10 w-10 text-blue-500 opacity-20 shrink-0" />
        </div>
      </Card>

      <Card variant="metric" depth="normal" className="p-6 border-l-purple-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Valor Líquido
            </p>
            <p className="text-2xl font-bold text-purple-500">
              R${" "}
              {cryptoStats.netAmount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              recebido após taxas
            </p>
          </div>
          <DollarSign className="h-10 w-10 text-purple-500 opacity-20 shrink-0" />
        </div>
      </Card>
    </div>
  );
}
