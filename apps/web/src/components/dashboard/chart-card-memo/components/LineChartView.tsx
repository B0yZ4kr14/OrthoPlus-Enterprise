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
import type { ChartCardMemoProps } from "../types";

type LineChartViewProps = Pick<ChartCardMemoProps, "data" | "dataKey" | "xAxisKey" | "secondaryDataKey">;

export function LineChartView({
  data,
  dataKey,
  xAxisKey,
  secondaryDataKey,
}: LineChartViewProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 4 }}
        />
        {secondaryDataKey && (
          <Line
            type="monotone"
            dataKey={secondaryDataKey}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--muted-foreground))", r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
