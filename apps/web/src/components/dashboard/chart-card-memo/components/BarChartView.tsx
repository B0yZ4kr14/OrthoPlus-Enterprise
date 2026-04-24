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
import type { ChartCardMemoProps } from "../types";

type BarChartViewProps = Pick<ChartCardMemoProps, "data" | "dataKey" | "xAxisKey" | "secondaryDataKey">;

export function BarChartView({
  data,
  dataKey,
  xAxisKey,
  secondaryDataKey,
}: BarChartViewProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
        <Bar
          dataKey={dataKey}
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
        />
        {secondaryDataKey && (
          <Bar
            dataKey={secondaryDataKey}
            fill="hsl(var(--muted))"
            radius={[8, 8, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
