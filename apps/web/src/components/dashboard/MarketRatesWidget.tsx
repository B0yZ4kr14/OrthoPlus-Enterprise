import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Bitcoin, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useMarketRates } from "./market-rates-widget/hooks/useMarketRates";

export function MarketRatesWidget() {
  const { rates, loading } = useMarketRates();

  if (loading) {
    return (
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Cotações do Mercado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Cotações Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rates.map((rate) => (
          <div key={rate.symbol} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {rate.symbol === "BTC" ? (
                <Bitcoin className="h-5 w-5 text-warning" />
              ) : (
                <DollarSign className="h-5 w-5 text-success" />
              )}
              <div>
                <div className="font-semibold text-sm">{rate.name}</div>
                <div className="text-xs text-muted-foreground">
                  {rate.symbol}
                </div>
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
        ))}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Atualizado em tempo real
        </div>
      </CardContent>
    </Card>
  );
}
