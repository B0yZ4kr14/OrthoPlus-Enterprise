import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TechnicalAnalysisProps {
  coinType: "BTC" | "ETH" | "USDT";
}

// Função para calcular RSI (Relative Strength Index)
function calculateRSI(prices: number[], period = 14): number[] {
  const rsi: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(50); // Valor neutro até ter dados suficientes
      continue;
    }

    let gains = 0;
    let losses = 0;

    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = 100 - 100 / (1 + rs);

    rsi.push(rsiValue);
  }

  return rsi;
}

// Função para calcular MACD (Moving Average Convergence Divergence)
function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((val, i) => val - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, i) => val - signalLine[i]);

  return { macdLine, signalLine, histogram };
}

// Função para calcular EMA (Exponential Moving Average)
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[0]);
    } else {
      const value = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(value);
    }
  }

  return ema;
}

// Função para calcular Bollinger Bands
function calculateBollingerBands(prices: number[], period = 20, stdDev = 2) {
  const sma = calculateSMA(prices, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upperBand.push(prices[i]);
      lowerBand.push(prices[i]);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const variance =
      slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    upperBand.push(mean + standardDeviation * stdDev);
    lowerBand.push(mean - standardDeviation * stdDev);
  }

  return { sma, upperBand, lowerBand };
}

// Função para calcular SMA (Simple Moving Average)
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(prices[i]);
    } else {
      const sum = prices
        .slice(i - period + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }

  return sma;
}

export function AdvancedTechnicalAnalysis({
  coinType,
}: TechnicalAnalysisProps) {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "1y">("7d");
  const [chartData, setChartData] = useState<unknown[]>([]);
  const [indicators, setIndicators] = useState<unknown>(null);

  useEffect(() => {
    generateMockData();
  }, [coinType, period]);

  const generateMockData = () => {
    const dataPoints =
      period === "24h"
        ? 24
        : period === "7d"
          ? 168
          : period === "30d"
            ? 720
            : 365;
    const basePrice =
      coinType === "BTC" ? 350000 : coinType === "ETH" ? 18000 : 5.5;

    const data = [];
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

    const enrichedData = data.map((d, i) => ({
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

    // Calcular indicadores atuais
    const currentRSI = rsi[rsi.length - 1];
    const currentMACD = macd.macdLine[macd.macdLine.length - 1];
    const currentSignal = macd.signalLine[macd.signalLine.length - 1];

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
      {/* KPIs de Indicadores */}
      {indicators && (
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
                      indicators.macdSignal === "ALTA"
                        ? "success"
                        : "destructive"
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
                  <p className="text-xs text-muted-foreground mb-1">
                    Tendência
                  </p>
                  <p className="text-2xl font-bold">{indicators.trend}</p>
                  <Badge
                    variant={
                      indicators.trend === "ALTA" ? "success" : "destructive"
                    }
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
                  <p className="text-xs text-muted-foreground mb-1">
                    Volatilidade
                  </p>
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
      )}

      {/* Seletor de Período */}
      <div className="flex items-center gap-2">
        <Button
          variant={period === "24h" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("24h")}
        >
          24h
        </Button>
        <Button
          variant={period === "7d" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("7d")}
        >
          7 dias
        </Button>
        <Button
          variant={period === "30d" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("30d")}
        >
          30 dias
        </Button>
        <Button
          variant={period === "1y" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("1y")}
        >
          1 ano
        </Button>
      </div>

      {/* Tabs de Gráficos */}
      <Tabs defaultValue="price" className="w-full">
        <TabsList>
          <TabsTrigger value="price">Preço + Bollinger</TabsTrigger>
          <TabsTrigger value="rsi">RSI</TabsTrigger>
          <TabsTrigger value="macd">MACD</TabsTrigger>
        </TabsList>

        <TabsContent value="price" className="space-y-4">
          <Card depth="normal">
            <CardHeader>
              <CardTitle>Preço com Bollinger Bands</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      format(new Date(value), "dd/MM HH:mm", { locale: ptBR })
                    }
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-lg">
                          <p className="text-xs text-muted-foreground mb-2">
                            {format(
                              new Date(payload[0].payload.timestamp),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                          <p className="text-sm font-semibold">
                            Preço: R${" "}
                            {payload[0].value.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          {payload[1] && (
                            <p className="text-xs text-muted-foreground">
                              Banda Superior: R${" "}
                              {payload[1].value.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          )}
                          {payload[3] && (
                            <p className="text-xs text-muted-foreground">
                              Banda Inferior: R${" "}
                              {payload[3].value.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upperBand"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    name="Banda Superior"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBand"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    name="Banda Inferior"
                  />
                  <Line
                    type="monotone"
                    dataKey="sma"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    dot={false}
                    name="SMA (20)"
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                    name="Preço"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsi" className="space-y-4">
          <Card depth="normal">
            <CardHeader>
              <CardTitle>RSI - Relative Strength Index</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      format(new Date(value), "dd/MM HH:mm", { locale: ptBR })
                    }
                    className="text-xs"
                  />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const rsiValue = payload[0].value as number;
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-lg">
                          <p className="text-xs text-muted-foreground mb-2">
                            {format(
                              new Date(payload[0].payload.timestamp),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                          <p className="text-sm font-semibold">
                            RSI: {rsiValue.toFixed(2)}
                          </p>
                          <Badge
                            variant={
                              rsiValue > 70
                                ? "destructive"
                                : rsiValue < 30
                                  ? "success"
                                  : "secondary"
                            }
                            className="mt-1"
                          >
                            {rsiValue > 70
                              ? "Sobrecompra"
                              : rsiValue < 30
                                ? "Sobrevenda"
                                : "Neutro"}
                          </Badge>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="RSI (14)"
                  />
                  <Line
                    type="monotone"
                    dataKey={() => 70}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Sobrecompra (70)"
                  />
                  <Line
                    type="monotone"
                    dataKey={() => 30}
                    stroke="hsl(var(--success))"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Sobrevenda (30)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macd" className="space-y-4">
          <Card depth="normal">
            <CardHeader>
              <CardTitle>
                MACD - Moving Average Convergence Divergence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      format(new Date(value), "dd/MM HH:mm", { locale: ptBR })
                    }
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-lg">
                          <p className="text-xs text-muted-foreground mb-2">
                            {format(
                              new Date(payload[0].payload.timestamp),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                          <p className="text-sm">
                            MACD: {(payload[0].value as number)?.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            Signal: {(payload[1].value as number)?.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            Histogram:{" "}
                            {(payload[2].value as number)?.toFixed(2)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="histogram"
                    fill="hsl(var(--muted))"
                    name="Histograma"
                  />
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="MACD"
                  />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                    name="Signal"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
