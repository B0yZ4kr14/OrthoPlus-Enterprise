import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { ContaReceber } from "@/modules/financeiro/types/financeiro-completo.types";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

interface ContasReceberChartProps {
  contasReceber: ContaReceber[];
}

export function ContasReceberChart({ contasReceber }: ContasReceberChartProps) {
  const totalReceber = contasReceber
    .filter((c) => c.status !== "pago" && c.status !== "cancelado")
    .reduce((sum, c) => sum + (c.valor - (c.valor_pago || 0)), 0);

  const totalRecebido = contasReceber
    .filter((c) => c.status === "pago")
    .reduce((sum, c) => sum + (c.valor_pago || c.valor), 0);

  const chartData = [
    { name: "Recebido", value: totalRecebido, color: "hsl(var(--success))" },
    { name: "Em Aberto", value: totalReceber, color: "hsl(var(--warning))" },
  ];

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Recebido vs Em Aberto</CardTitle>
        <CardDescription>Visão geral do status de recebimentos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatBRL(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
