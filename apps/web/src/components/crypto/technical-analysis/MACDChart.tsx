import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ChartDataItem } from "@/types/crypto";

interface MACDChartProps {
  chartData: ChartDataItem[];
}

export function MACDChart({ chartData }: MACDChartProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle>
          MACD - Moving Average Convergence Divergence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
            <Legend  wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
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
  );
}
