// cspell:disable
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
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
import type { SavingsData } from "./types";

interface SavingsChartProps {
  data: SavingsData[];
}

export function SavingsChart({ data }: SavingsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Economia usando Crypto vs Métodos Tradicionais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method"  stroke="hsl(var(--muted-foreground))" />
            <YAxis
              label={{
                value: "Economia (R$)",
                angle: -90,
                position: "insideLeft",
              }}
              tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: number) =>
                `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
            />
            <Legend  wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
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
  );
}
