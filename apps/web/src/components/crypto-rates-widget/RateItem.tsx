import { Badge } from "@orthoplus/core-ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice, formatChange } from "./formatters";
import type { CryptoRate } from "./types";

interface RateItemProps {
  rate: CryptoRate;
}

export function RateItem({ rate }: RateItemProps) {
  const change = formatChange(rate.change_24h);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="font-bold text-sm">{rate.symbol}</span>
        </div>
        <div>
          <p className="font-medium">{rate.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(rate.price_brl)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`flex items-center gap-1 ${change.isPositive ? "text-success" : "text-destructive"}`}
        >
          {change.isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span className="text-sm font-medium">{change.text}</span>
        </div>
        <Badge variant="outline" className="mt-1">
          24h
        </Badge>
      </div>
    </div>
  );
}
