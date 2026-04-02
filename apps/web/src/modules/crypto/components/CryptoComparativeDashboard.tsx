// Dashboard de comparação de rentabilidade: Crypto vs Métodos Tradicionais (PIX, Cartão)
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";

interface CryptoComparativeDashboardProps {
  transactions: unknown[];
}

export function CryptoComparativeDashboard({
  transactions,
}: CryptoComparativeDashboardProps) {
  // Calcular métricas de crypto
  const cryptoStats = transactions
    .filter((t) => t.status === "CONFIRMADO" || t.status === "CONVERTIDO")
    .reduce(
      (acc, t) => {
        acc.totalBRL += t.amount_brl || 0;
        acc.totalFees += t.processing_fee_brl || 0;
        acc.netAmount += t.net_amount_brl || 0;
        acc.count += 1;
        return acc;
      },
      { totalBRL: 0, totalFees: 0, netAmount: 0, count: 0 },
    );

  // Taxas médias dos métodos tradicionais (referência de mercado)
  const TRADITIONAL_FEES = {
    PIX: 0.99, // ~1% (taxa média cobrada por gateways de pagamento)
    CREDIT_CARD: 3.99, // ~4% (taxa média cartão de crédito)
    DEBIT_CARD: 2.49, // ~2.5% (taxa média cartão de débito)
    BOLETO: 3.49, // ~3.5% (taxa média boleto bancário)
  };

  const cryptoFeePercentage =
    cryptoStats.totalBRL > 0
      ? (cryptoStats.totalFees / cryptoStats.totalBRL) * 100
      : 0;

  // Simular quanto seria pago em métodos tradicionais
  const comparisonData = [
    {
      method: "Crypto",
      fee: cryptoStats.totalFees,
      feePercentage: cryptoFeePercentage,
      netAmount: cryptoStats.netAmount,
      color: "#f97316", // orange-500
    },
    {
      method: "PIX",
      fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.PIX) / 100,
      feePercentage: TRADITIONAL_FEES.PIX,
      netAmount:
        cryptoStats.totalBRL -
        (cryptoStats.totalBRL * TRADITIONAL_FEES.PIX) / 100,
      color: "#10b981", // green-500
    },
    {
      method: "Cartão Débito",
      fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.DEBIT_CARD) / 100,
      feePercentage: TRADITIONAL_FEES.DEBIT_CARD,
      netAmount:
        cryptoStats.totalBRL -
        (cryptoStats.totalBRL * TRADITIONAL_FEES.DEBIT_CARD) / 100,
      color: "#3b82f6", // blue-500
    },
    {
      method: "Cartão Crédito",
      fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.CREDIT_CARD) / 100,
      feePercentage: TRADITIONAL_FEES.CREDIT_CARD,
      netAmount:
        cryptoStats.totalBRL -
        (cryptoStats.totalBRL * TRADITIONAL_FEES.CREDIT_CARD) / 100,
      color: "#8b5cf6", // purple-500
    },
    {
      method: "Boleto",
      fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.BOLETO) / 100,
      feePercentage: TRADITIONAL_FEES.BOLETO,
      netAmount:
        cryptoStats.totalBRL -
        (cryptoStats.totalBRL * TRADITIONAL_FEES.BOLETO) / 100,
      color: "#ef4444", // red-500
    },
  ];

  // Calcular economia vs métodos tradicionais
  const savingsData = comparisonData.slice(1).map((method) => ({
    method: `vs ${method.method}`,
    savings: method.fee - cryptoStats.totalFees,
    savingsPercentage:
      ((method.fee - cryptoStats.totalFees) / method.fee) * 100,
  }));

  const totalSavings = savingsData.reduce((sum, item) => sum + item.savings, 0);
  const avgSavingsPercentage =
    savingsData.reduce((sum, item) => sum + item.savingsPercentage, 0) /
    savingsData.length;

  // Dados para gráfico de pizza (distribuição de taxas)
  const pieData = comparisonData.map((item) => ({
    name: item.method,
    value: item.fee,
    color: item.color,
  }));

  if (cryptoStats.count === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma transação crypto confirmada ainda.</p>
          <p className="text-sm mt-2">
            Confirme pagamentos para visualizar análise comparativa.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs de Comparação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          variant="metric"
          depth="normal"
          className="p-6 border-l-orange-500"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Taxa Crypto Média
              </p>
              <p className="text-2xl font-bold text-orange-500">
                {cryptoFeePercentage.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                R${" "}
                {cryptoStats.totalFees.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <Percent className="h-10 w-10 text-orange-500 opacity-20 shrink-0" />
          </div>
        </Card>

        <Card
          variant="metric"
          depth="normal"
          className="p-6 border-l-green-500"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Economia Total
              </p>
              <p className="text-2xl font-bold text-green-500">
                R${" "}
                {totalSavings.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                vs métodos tradicionais
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500 opacity-20 shrink-0" />
          </div>
        </Card>

        <Card variant="metric" depth="normal" className="p-6 border-l-blue-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Economia Média
              </p>
              <p className="text-2xl font-bold text-blue-500">
                {avgSavingsPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">menos taxas</p>
            </div>
            <TrendingDown className="h-10 w-10 text-blue-500 opacity-20 shrink-0" />
          </div>
        </Card>

        <Card
          variant="metric"
          depth="normal"
          className="p-6 border-l-purple-500"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Valor Líquido
              </p>
              <p className="text-2xl font-bold text-purple-500">
                R${" "}
                {cryptoStats.netAmount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                recebido após taxas
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-500 opacity-20 shrink-0" />
          </div>
        </Card>
      </div>

      {/* Alert de Economia */}
      {totalSavings > 100 && (
        <Alert className="bg-green-500/10 border-green-500/50">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            <strong>Excelente!</strong> Você está economizando{" "}
            <strong>
              R${" "}
              {totalSavings.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </strong>{" "}
            em taxas usando pagamentos em criptomoedas comparado a métodos
            tradicionais.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras: Comparação de Taxas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Comparação de Taxas por Método
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis
                  label={{
                    value: "Taxa (R$)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value: unknown, name) => {
                    if (name === "fee") {
                      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
                    }
                    return value;
                  }}
                  labelFormatter={(label) => `Método: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="fee"
                  name="Taxa Cobrada"
                  fill="#f97316"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza: Distribuição de Taxas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Distribuição de Taxas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) =>
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha: Economia vs Métodos Tradicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Economia usando Crypto vs Métodos Tradicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis
                label={{
                  value: "Economia (R$)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
              />
              <Tooltip
                formatter={(value: unknown) =>
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                }
              />
              <Legend />
              <Bar
                dataKey="savings"
                name="Economia em Taxas"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada de Comparação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Análise Detalhada por Método
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Método</th>
                  <th className="text-right py-3 px-4">Taxa %</th>
                  <th className="text-right py-3 px-4">Taxa R$</th>
                  <th className="text-right py-3 px-4">Valor Líquido</th>
                  <th className="text-right py-3 px-4">Diferença vs Crypto</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item) => {
                  const diff = item.fee - cryptoStats.totalFees;
                  const isCrypto = item.method === "Crypto";

                  return (
                    <tr
                      key={item.method}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium">
                        {item.method}
                        {isCrypto && (
                          <Badge variant="default" className="ml-2">
                            Atual
                          </Badge>
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        {item.feePercentage.toFixed(2)}%
                      </td>
                      <td className="text-right py-3 px-4">
                        R${" "}
                        {item.fee.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-right py-3 px-4">
                        R${" "}
                        {item.netAmount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-right py-3 px-4">
                        {isCrypto ? (
                          <span className="text-muted-foreground">-</span>
                        ) : diff > 0 ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            -R${" "}
                            {diff.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            +R${" "}
                            {Math.abs(diff).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
