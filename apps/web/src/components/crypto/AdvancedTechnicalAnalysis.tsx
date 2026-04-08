import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import type { ChartDataItem, TechnicalIndicatorResults, CoinType, TimePeriod } from "@/types/crypto";
import { IndicatorKPIs } from "./technical-analysis/IndicatorKPIs";
import { PeriodSelector } from "./technical-analysis/PeriodSelector";
import { PriceChart } from "./technical-analysis/PriceChart";
import { RSIChart } from "./technical-analysis/RSIChart";
import { MACDChart } from "./technical-analysis/MACDChart";
import {
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from "./technical-analysis/indicators";

interface TechnicalAnalysisProps {
  coinType: CoinType;
}

const BASE_PRICES: Record<string, number> = {
  BTC: 350000,
  ETH: 18000,
  USDT: 5.5,
};

function getDataPoints(period: TimePeriod): number {
  switch (period) {
    case "24h": return 24;
    case "7d": return 168;
    case "30d": return 720;
    case "1y": return 365;
    default: return 168;
  }
}

export function AdvancedTechnicalAnalysis({
  coinType,
}: TechnicalAnalysisProps) {
  const [period, setPeriod] = useState<TimePeriod>("7d");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicatorResults | null>(null);

  useEffect(() => {
    generateMockData();
  }, [coinType, period]);

  const generateMockData = () => {
    const dataPoints = getDataPoints(period);
    const basePrice = BASE_PRICES[coinType] || 5.5;

    const data: ChartDataItem[] = [];
    let currentPrice = basePrice;

    for (let i = 0; i < dataPoints; i++) {
      const change = (Math.random() - 0.48) * (basePrice * 0.02);
      currentPrice += change;

      data.push({
        timestamp: new Date(Date.now() - (dataPoints - i) * 60 * 60 * 1000),
        price: currentPrice,
        volume: Math.random() * 1000000,
      });
    }

    const prices = data.map((d) => d.price);
    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);
    const bollinger = calculateBollingerBands(prices);

    const enrichedData: ChartDataItem[] = data.map((d, i) => ({
      ...d,
      rsi: rsi[i],
      macd: macd.macdLine[i],
      signal: macd.signalLine[i],
      histogram: macd.histogram[i],
      sma: bollinger.sma[i],
      upperBand: bollinger.upperBand[i],
      lowerBand: bollinger.lowerBand[i],
    }));

    setChartData(enrichedData);

    const lastIdx = data.length - 1;
    const currentRSI = rsi[lastIdx];
    const currentMACD = macd.macdLine[lastIdx];
    const currentSignal = macd.signalLine[lastIdx];

    setIndicators({
      rsi: currentRSI,
      rsiSignal:
        currentRSI > 70
          ? "SOBRECOMPRA"
          : currentRSI < 30
            ? "SOBREVENDA"
            : "NEUTRO",
      macd: currentMACD,
      macdSignal: currentMACD > currentSignal ? "ALTA" : "BAIXA",
      trend: currentPrice > prices[0] ? "ALTA" : "BAIXA",
      volatility: (
        ((Math.max(...prices) - Math.min(...prices)) / Math.min(...prices)) *
        100
      ).toFixed(2),
    });
  };

  return (
    <div className="space-y-6">
      {indicators && (
        <IndicatorKPIs indicators={indicators} period={period} />
      )}

      <PeriodSelector period={period} onPeriodChange={setPeriod} />

      <Tabs defaultValue="price" className="w-full">
        <TabsList>
          <TabsTrigger value="price">Preço + Bollinger</TabsTrigger>
          <TabsTrigger value="rsi">RSI</TabsTrigger>
          <TabsTrigger value="macd">MACD</TabsTrigger>
        </TabsList>

        <TabsContent value="price" className="space-y-4">
          <PriceChart chartData={chartData} />
        </TabsContent>

        <TabsContent value="rsi" className="space-y-4">
          <RSIChart chartData={chartData} />
        </TabsContent>

        <TabsContent value="macd" className="space-y-4">
          <MACDChart chartData={chartData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
