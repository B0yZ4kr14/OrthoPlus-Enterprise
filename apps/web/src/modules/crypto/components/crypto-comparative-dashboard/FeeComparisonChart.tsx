// cspell:disable
import { Percent } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
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
import type { ComparisonMethod } from "./types";

interface FeeComparisonChartProps {
  data: ComparisonMethod[];
}

export function FeeComparisonChart({ data }: FeeComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Comparação de Taxas por Método
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              label={{
                value: "Taxa (R$)",
                angle: -90,
                position: "insideLeft",
              }}
              tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: number) =>
                `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
              labelFormatter={(label) => `Método: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
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
  );
}
