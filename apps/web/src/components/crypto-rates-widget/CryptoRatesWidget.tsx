import { Card, CardContent } from "@orthoplus/core-ui/card";
import { useCryptoRates } from "./useCryptoRates";
import { WidgetHeader } from "./WidgetHeader";
import { RateItem } from "./RateItem";
import { EmptyState } from "./EmptyState";

export function CryptoRatesWidget() {
  const { rates, loading, lastUpdate, fetchRates } = useCryptoRates();

  return (
    <Card>
      <WidgetHeader
        lastUpdate={lastUpdate}
        loading={loading}
        onRefresh={fetchRates}
      />
      <CardContent>
        <div className="space-y-3">
          {rates.map((rate) => (
            <RateItem key={rate.symbol} rate={rate} />
          ))}
        </div>

        {rates.length === 0 && !loading && <EmptyState />}
      </CardContent>
    </Card>
  );
}
