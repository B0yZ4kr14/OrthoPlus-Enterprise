import type { IndicatorKPIsProps } from "./types";
import { RSICard } from "./components/RSICard";
import { MACDCard } from "./components/MACDCard";
import { TrendCard } from "./components/TrendCard";
import { VolatilityCard } from "./components/VolatilityCard";

export * from "./types";
export { KPICard } from "./components/KPICard";
export { RSICard } from "./components/RSICard";
export { MACDCard } from "./components/MACDCard";
export { TrendCard } from "./components/TrendCard";
export { VolatilityCard } from "./components/VolatilityCard";

export function IndicatorKPIs({ indicators, period }: IndicatorKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <RSICard rsi={indicators.rsi} rsiSignal={indicators.rsiSignal} />
      <MACDCard macd={indicators.macd} macdSignal={indicators.macdSignal} />
      <TrendCard trend={indicators.trend} />
      <VolatilityCard volatility={indicators.volatility} period={period} />
    </div>
  );
}
