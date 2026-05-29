import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { DollarSign } from "lucide-react";
import { useMarketRates } from "./hooks/useMarketRates";
import { RateRow } from "./components/RateRow";
import { LoadingState } from "./components/LoadingState";

export * from "./types";
export { useMarketRates, RateRow, LoadingState };

export function MarketRatesWidget() {
  const { rates, loading } = useMarketRates();

  if (loading) {
    return <LoadingState />;
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
          <RateRow key={rate.symbol} rate={rate} />
        ))}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Atualizado em tempo real
        </div>
      </CardContent>
    </Card>
  );
}
