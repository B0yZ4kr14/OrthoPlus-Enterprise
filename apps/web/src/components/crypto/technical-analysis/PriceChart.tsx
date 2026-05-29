import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Line,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ChartDataItem } from "@/types/crypto";

interface PriceChartProps {
  chartData: ChartDataItem[];
}

export function PriceChart({ chartData }: PriceChartProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle>Preço com Bollinger Bands</CardTitle>
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
                    <p className="text-sm font-semibold">
                      Preço: R${" "}
                      {typeof payload[0]?.value === "number"
                        ? payload[0].value.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })
                        : "0,00"}
                    </p>
                    {payload[1] && typeof payload[1].value === "number" && (
                      <p className="text-xs text-muted-foreground">
                        Banda Superior: R${" "}
                        {payload[1].value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    )}
                    {payload[3] && typeof payload[3].value === "number" && (
                      <p className="text-xs text-muted-foreground">
                        Banda Inferior: R${" "}
                        {payload[3].value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
            <Area
              type="monotone"
              dataKey="upperBand"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Banda Superior"
            />
            <Area
              type="monotone"
              dataKey="lowerBand"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Banda Inferior"
            />
            <Line
              type="monotone"
              dataKey="sma"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              dot={false}
              name="SMA (20)"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              name="Preço"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
