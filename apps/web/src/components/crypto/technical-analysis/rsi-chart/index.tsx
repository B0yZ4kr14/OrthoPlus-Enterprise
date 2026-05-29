import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { RSIChartProps } from "./types";
import { RSITooltip } from "./components/RSITooltip";
import { RSILine, OverboughtLine, OversoldLine } from "./components/RSILines";

export * from "./types";
export { RSITooltip, RSILine, OverboughtLine, OversoldLine };

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
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<RSITooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
            <RSILine />
            <OverboughtLine />
            <OversoldLine />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
