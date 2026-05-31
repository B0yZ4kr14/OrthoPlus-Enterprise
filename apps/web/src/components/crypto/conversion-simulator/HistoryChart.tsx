// cspell:disable
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import type { HistoricalData, BestMoment } from "./types";

interface HistoryChartProps {
  data: HistoricalData[];
  bestMoment: BestMoment | null;
}

export function HistoryChart({ data, bestMoment }: HistoryChartProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle>Histórico de Cotações (30 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                format(new Date(value), "dd/MM", { locale: ptBR })
              }
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="bg-card border rounded-lg p-3 shadow-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(item.date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                    <p className="text-sm font-semibold">
                      R${" "}
                      {Number(payload[0].value ?? 0).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className={`text-xs ${
                        item.variation > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {item.variation > 0 ? "+" : ""}
                      {item.variation.toFixed(2)}%
                    </p>
                  </div>
                );
              }}
            />
            {bestMoment && (
              <ReferenceLine
                y={bestMoment.maxRate}
                stroke="hsl(var(--success))"
                strokeDasharray="5 5"
                label={{
                  value: "Máxima",
                  position: "top",
                  fill: "hsl(var(--success))",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
