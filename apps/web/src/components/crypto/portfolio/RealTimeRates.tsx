import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { RefreshCw } from "lucide-react";
import { COIN_COLORS, formatBRL } from "./types";

interface RealTimeRatesProps {
  rates: Record<string, number>;
  onRefresh: () => void;
}

export function RealTimeRates({ rates, onRefresh }: RealTimeRatesProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cotações em Tempo Real</CardTitle>
          <Button type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(rates).map(([coin, rate]) => (
            <div
              key={coin}
              className="p-4 rounded-lg border text-center"
              style={{
                borderColor: COIN_COLORS[coin]
                  ? `${COIN_COLORS[coin]}33`
                  : undefined,
              }}
            >
              <p className="text-xs text-muted-foreground mb-1">{coin}</p>
              <p
                className="text-lg font-bold"
                style={{ color: COIN_COLORS[coin] || undefined }}
              >
                {formatBRL(rate)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
