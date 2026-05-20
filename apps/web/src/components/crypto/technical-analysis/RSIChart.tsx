import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ChartDataItem } from "@/types/crypto";

interface RSIChartProps {
  chartData: ChartDataItem[];
}

export function RSIChart({ chartData }: RSIChartProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle>RSI - Relative Strength Index</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
            <Legend  wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
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
  );
}
