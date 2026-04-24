// cspell:disable
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Percent } from "lucide-react";
import TechnicalIndicators from "../TechnicalIndicators";
import type {
  ExchangeRate,
  RateHistoryData,
  VolumeData,
  SavingsComparisonData,
  AnalysisStats,
} from "./types";

interface AnalysisTabsProps {
  exchangeRates: ExchangeRate[];
  stats: AnalysisStats;
  rateHistoryData: RateHistoryData[];
  volumeData: VolumeData[];
  savingsComparisonData: SavingsComparisonData[];
}

export function AnalysisTabs({
  exchangeRates,
  stats,
  rateHistoryData,
  volumeData,
  savingsComparisonData,
}: AnalysisTabsProps) {
  return (
    <Tabs defaultValue="rates" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="rates">Histórico de Taxas</TabsTrigger>
        <TabsTrigger value="volume">Volume de Transações</TabsTrigger>
        <TabsTrigger value="savings">Economia Acumulada</TabsTrigger>
      </TabsList>

      <TabsContent value="rates" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card depth="normal">
            <CardHeader>
              <CardTitle>Histórico de Taxas de Câmbio (30 dias)</CardTitle>
              <CardDescription>
                Acompanhe a variação das taxas de câmbio para identificar
                melhores momentos de conversão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rateHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="BTC"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="ETH"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="USDT"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <TechnicalIndicators rates={exchangeRates} />
        </div>
      </TabsContent>

      <TabsContent value="volume" className="space-y-4">
        <Card depth="normal">
          <CardHeader>
            <CardTitle>Volume de Transações por Dia</CardTitle>
            <CardDescription>
              Visualize o volume de pagamentos em criptomoedas ao longo do
              tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="volume"
                  fill="hsl(var(--primary))"
                  name="Volume (R$)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="savings" className="space-y-4">
        <Card depth="normal">
          <CardHeader>
            <CardTitle>Economia vs Métodos Tradicionais</CardTitle>
            <CardDescription>
              Compare as taxas de pagamento em criptomoedas com métodos
              tradicionais (PIX, Cartão)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Métodos Tradicionais
                    </span>
                    <Badge variant="outline">~3.5% taxa média</Badge>
                  </div>
                  <div className="text-3xl font-bold text-destructive">
                    R${" "}
                    {stats.traditionalFees.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Taxa total em PIX/Cartão
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Criptomoedas</span>
                    <Badge variant="success">~0.5% taxa</Badge>
                  </div>
                  <div className="text-3xl font-bold text-success">
                    R${" "}
                    {stats.cryptoFees.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Taxa total em Crypto
                  </p>
                </div>
              </div>

              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-5 w-5 text-success" />
                  <span className="font-semibold text-success">
                    Economia de {stats.savingsPercent}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você economizou{" "}
                  <span className="font-bold text-success">
                    R${" "}
                    {stats.savings.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>{" "}
                  usando pagamentos em criptomoedas ao invés de métodos
                  tradicionais.
                </p>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={savingsComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="método" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="custo"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    name="Custo Total (R$)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
