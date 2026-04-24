// cspell:disable
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import type { ExchangeComparisonProps } from "./types";
import { BadgeHeader } from "./components/BadgeHeader";
import { ExchangeRateRow } from "./components/ExchangeRateRow";

export * from "./types";
export { BadgeHeader } from "./components/BadgeHeader";
export { ExchangeRateRow } from "./components/ExchangeRateRow";
export { RateValue } from "./components/RateValue";

export function ExchangeComparison({ rates, amount }: ExchangeComparisonProps) {
  const amountNum = parseFloat(amount) || 1;
  const bestRate = rates[0];
  const worstRate = rates[rates.length - 1];
  const savings = bestRate && worstRate
    ? bestRate.netAmount - worstRate.netAmount
    : 0;

  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <BadgeHeader bestExchange={bestRate?.exchange} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rates.map((rate, index) => (
          <ExchangeRateRow
            key={rate.exchange}
            rate={rate}
            index={index}
            amountNum={amountNum}
            isBest={index === 0}
            savings={index === 0 ? savings : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
}
