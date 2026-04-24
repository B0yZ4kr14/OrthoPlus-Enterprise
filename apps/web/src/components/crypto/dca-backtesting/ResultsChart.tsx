// cspell:disable
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BacktestResult } from "./types";

interface ResultsChartProps {
  results: BacktestResult[];
}

export function ResultsChart({ results }: ResultsChartProps) {
  return (
    <div>
      <h3 className="font-semibold mb-4">Evolução do Patrimônio</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={results}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis
            className="text-xs"
            tickFormatter={(value) =>
              value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                notation: "compact",
              })
            }
          />
          <Tooltip
            formatter={(value: number) =>
              value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            }
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="dcaValue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="DCA"
            dot={{ fill: "hsl(var(--primary))" }}
          />
          <Line
            type="monotone"
            dataKey="lumpSumValue"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            name="Lump Sum"
            dot={{ fill: "hsl(var(--secondary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
