import { Card } from "@orthoplus/core-ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendDataPoint } from "./types";

interface TrendChartProps {
  data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tendência de Backups (30 dias)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date"  stroke="hsl(var(--muted-foreground))" />
          <YAxis  stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          <Bar dataKey="success" fill="hsl(var(--success))" name="Sucesso" />
          <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Falha" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
