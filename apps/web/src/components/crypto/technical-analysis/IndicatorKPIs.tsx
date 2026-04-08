import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import type { TechnicalIndicatorResults, TimePeriod } from "@/types/crypto";

interface IndicatorKPIsProps {
  indicators: TechnicalIndicatorResults;
  period: TimePeriod;
}

export function IndicatorKPIs({ indicators, period }: IndicatorKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card depth="normal">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">RSI (14)</p>
              <p className="text-2xl font-bold">
                {indicators.rsi.toFixed(2)}
              </p>
              <Badge
                variant={
                  indicators.rsiSignal === "SOBRECOMPRA"
                    ? "destructive"
                    : indicators.rsiSignal === "SOBREVENDA"
                      ? "success"
                      : "secondary"
                }
                className="mt-2"
              >
                {indicators.rsiSignal}
              </Badge>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">MACD</p>
              <p className="text-2xl font-bold">
                {indicators.macd.toFixed(2)}
              </p>
              <Badge
                variant={
                  indicators.macdSignal === "ALTA" ? "success" : "destructive"
                }
                className="mt-2"
              >
                Sinal de {indicators.macdSignal}
              </Badge>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tendência</p>
              <p className="text-2xl font-bold">{indicators.trend}</p>
              <Badge
                variant={indicators.trend === "ALTA" ? "success" : "destructive"}
                className="mt-2"
              >
                {indicators.trend === "ALTA" ? "Bullish" : "Bearish"}
              </Badge>
            </div>
            {indicators.trend === "ALTA" ? (
              <TrendingUp className="h-8 w-8 text-success opacity-20" />
            ) : (
              <TrendingDown className="h-8 w-8 text-destructive opacity-20" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volatilidade</p>
              <p className="text-2xl font-bold">{indicators.volatility}%</p>
              <Badge variant="outline" className="mt-2">
                Período {period}
              </Badge>
            </div>
            <BarChart3 className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
