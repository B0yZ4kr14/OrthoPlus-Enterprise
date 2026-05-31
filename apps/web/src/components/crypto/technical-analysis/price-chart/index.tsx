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
  Legend,
} from "recharts";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import type { PriceChartProps } from "./types";
import { PriceTooltip } from "./components/PriceTooltip";
import {
  UpperBandArea,
  LowerBandArea,
  SMALine,
  PriceLine,
} from "./components/BollingerBands";

export * from "./types";
export { PriceTooltip, UpperBandArea, LowerBandArea, SMALine, PriceLine };

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
            <YAxis className="text-xs" stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<PriceTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
            <UpperBandArea />
            <LowerBandArea />
            <SMALine />
            <PriceLine />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
