// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FechamentoData } from "./types";

interface ComparisonChartProps {
  fechamento: FechamentoData | undefined;
}

export function ComparisonChart({ fechamento }: ComparisonChartProps) {
  const chartData = [
    {
      name: "Vendas PDV",
      valor: fechamento?.totalVendasPDV || 0,
      quantidade: fechamento?.quantidadeVendasPDV || 0,
    },
    {
      name: "NFCe Emitidas",
      valor: fechamento?.totalNFCe || 0,
      quantidade: fechamento?.quantidadeNFCe || 0,
    },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <Card className="p-4 mb-6">
      <h4 className="text-sm font-semibold mb-4">Comparativo de Valores</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="valor" fill="hsl(var(--primary))" name="Valor" />
          <Bar dataKey="quantidade" fill="hsl(var(--success))" name="Quantidade" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
