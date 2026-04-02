import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExchangeRate {
  exchange: string;
  rate: number;
  fee: number;
  netAmount: number;
  color: string;
}

export function ConversionSimulator() {
  const [coinType, setCoinType] = useState<"BTC" | "ETH" | "USDT">("BTC");
  const [amount, setAmount] = useState<string>("1");
  const [historicalData, setHistoricalData] = useState<unknown[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [bestMoment, setBestMoment] = useState<unknown>(null);

  useEffect(() => {
    generateHistoricalData();
    generateExchangeRates();
  }, [coinType, amount]);

  const generateHistoricalData = () => {
    const days = 30;
    const baseRate =
      coinType === "BTC" ? 350000 : coinType === "ETH" ? 18000 : 5.5;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const variation = (Math.random() - 0.5) * (baseRate * 0.05);
      const rate = baseRate + variation;

      data.push({
        date,
        rate,
        variation: (variation / baseRate) * 100,
      });
    }

    setHistoricalData(data);

    // Calcular melhor momento para converter
    const maxRate = Math.max(...data.map((d) => d.rate));
    const currentRate = data[data.length - 1].rate;
    const percentageFromMax = ((currentRate - maxRate) / maxRate) * 100;

    setBestMoment({
      maxRate,
      currentRate,
      percentageFromMax,
      recommendation:
        percentageFromMax > -5
          ? "CONVERTER_AGORA"
          : percentageFromMax > -15
            ? "AGUARDAR"
            : "EXCELENTE_MOMENTO",
    });
  };

  const generateExchangeRates = () => {
    const baseRate =
      coinType === "BTC" ? 350000 : coinType === "ETH" ? 18000 : 5.5;
    const amountNum = parseFloat(amount) || 1;

    const exchanges = [
      { name: "Binance", baseFee: 0.1, color: "#F3BA2F" },
      { name: "Coinbase", baseFee: 0.5, color: "#0052FF" },
      { name: "Kraken", baseFee: 0.26, color: "#5741D9" },
      { name: "Bybit", baseFee: 0.1, color: "#F7A600" },
      { name: "Mercado Bitcoin", baseFee: 0.3, color: "#00B8E6" },
    ];

    const rates: ExchangeRate[] = exchanges.map((exchange) => {
      const rateVariation = (Math.random() - 0.5) * (baseRate * 0.01);
      const rate = baseRate + rateVariation;
      const grossAmount = rate * amountNum;
      const feeAmount = grossAmount * (exchange.baseFee / 100);
      const netAmount = grossAmount - feeAmount;

      return {
        exchange: exchange.name,
        rate,
        fee: exchange.baseFee,
        netAmount,
        color: exchange.color,
      };
    });

    // Ordenar por melhor taxa líquida
    rates.sort((a, b) => b.netAmount - a.netAmount);
    setExchangeRates(rates);
  };

  const getRecommendationBadge = () => {
    if (!bestMoment) return null;

    switch (bestMoment.recommendation) {
      case "CONVERTER_AGORA":
        return (
          <Badge variant="success" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Momento Ótimo para Converter
          </Badge>
        );
      case "AGUARDAR":
        return (
          <Badge variant="secondary" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Aguardar Melhor Momento
          </Badge>
        );
      case "EXCELENTE_MOMENTO":
        return (
          <Badge variant="success" className="gap-2 animate-pulse">
            <Award className="h-4 w-4" />
            Excelente Momento! Taxa Abaixo da Máxima
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração da Simulação */}
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Simulador de Conversão Cripto → BRL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Criptomoeda</Label>
              <Select
                value={coinType}
                onValueChange={(value: unknown) => setCoinType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.0"
              />
            </div>
          </div>

          <Button
            onClick={() => {
              generateHistoricalData();
              generateExchangeRates();
            }}
            className="w-full"
          >
            Atualizar Simulação
          </Button>
        </CardContent>
      </Card>

      {/* Recomendação Baseada em Histórico */}
      {bestMoment && (
        <Alert className="border-primary/50 bg-primary/5">
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold mb-2">
                Análise de Momento de Conversão
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Taxa Atual:</span>
                  <p className="font-semibold">
                    R${" "}
                    {bestMoment.currentRate.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Taxa Máxima (30d):
                  </span>
                  <p className="font-semibold">
                    R${" "}
                    {bestMoment.maxRate.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Diferença da Máxima:
                  </span>
                  <p
                    className={`font-semibold flex items-center gap-1 ${
                      bestMoment.percentageFromMax > 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {bestMoment.percentageFromMax > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(bestMoment.percentageFromMax).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="shrink-0 ml-4">{getRecommendationBadge()}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Gráfico de Histórico de Cotações */}
      <Card depth="normal">
        <CardHeader>
          <CardTitle>Histórico de Cotações (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  format(new Date(value), "dd/MM", { locale: ptBR })
                }
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-card border rounded-lg p-3 shadow-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(
                          new Date(payload[0].payload.date),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        )}
                      </p>
                      <p className="text-sm font-semibold">
                        R${" "}
                        {payload[0].value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p
                        className={`text-xs ${
                          payload[0].payload.variation > 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {payload[0].payload.variation > 0 ? "+" : ""}
                        {payload[0].payload.variation.toFixed(2)}%
                      </p>
                    </div>
                  );
                }}
              />
              {bestMoment && (
                <ReferenceLine
                  y={bestMoment.maxRate}
                  stroke="hsl(var(--success))"
                  strokeDasharray="5 5"
                  label={{
                    value: "Máxima",
                    position: "top",
                    fill: "hsl(var(--success))",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparativo de Exchanges */}
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Comparativo de Taxas por Exchange</span>
            {exchangeRates.length > 0 && (
              <Badge variant="outline" className="gap-2">
                <Award className="h-4 w-4" />
                Melhor: {exchangeRates[0].exchange}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exchangeRates.map((rate, index) => (
            <div
              key={rate.exchange}
              className={`p-4 rounded-lg border-2 transition-all ${
                index === 0
                  ? "border-success bg-success/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {index === 0 && <Award className="h-5 w-5 text-success" />}
                  <div>
                    <h4 className="font-semibold">{rate.exchange}</h4>
                    <p className="text-xs text-muted-foreground">
                      Taxa: {rate.fee}%
                    </p>
                  </div>
                </div>
                <Badge variant={index === 0 ? "success" : "outline"}>
                  #{index + 1}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Cotação</p>
                  <p className="font-semibold">
                    R${" "}
                    {rate.rate.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Valor Bruto</p>
                  <p className="font-semibold">
                    R${" "}
                    {(rate.rate * parseFloat(amount || "1")).toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Valor Líquido</p>
                  <p
                    className={`font-semibold ${index === 0 ? "text-success" : ""}`}
                  >
                    R${" "}
                    {rate.netAmount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {index === 0 && exchangeRates.length > 1 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-success">
                    💰 Economia de R${" "}
                    {(
                      rate.netAmount -
                      exchangeRates[exchangeRates.length - 1].netAmount
                    ).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    comparado à pior taxa
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
