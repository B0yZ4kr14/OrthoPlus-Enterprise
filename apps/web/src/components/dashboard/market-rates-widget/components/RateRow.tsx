import { Badge } from "@orthoplus/core-ui/badge";
import { Bitcoin, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import type { MarketRate } from "../types";

interface RateRowProps {
  rate: MarketRate;
}

export function RateRow({ rate }: RateRowProps) {
  const isCrypto = rate.symbol === "BTC";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isCrypto ? (
          <Bitcoin className="h-5 w-5 text-warning" />
        ) : (
          <DollarSign className="h-5 w-5 text-success" />
        )}
        <div>
          <div className="font-semibold text-sm">{rate.name}</div>
          <div className="text-xs text-muted-foreground">{rate.symbol}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-sm">
          R${" "}
          {rate.price.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        {rate.change24h !== 0 && (
          <Badge
            variant={rate.change24h >= 0 ? "success" : "destructive"}
            className="text-xs flex items-center gap-1 mt-1"
          >
            {rate.change24h >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(rate.change24h).toFixed(2)}%
          </Badge>
        )}
      </div>
    </div>
  );
}
