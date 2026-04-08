import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { PortfolioDistributionItem } from "./types";
import { formatBRL, COIN_COLORS } from "./types";

interface PortfolioDistributionChartProps {
  distribution: PortfolioDistributionItem[];
  totalCrypto: Record<string, number>;
}

export function PortfolioDistributionChart({
  distribution,
  totalCrypto,
}: PortfolioDistributionChartProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle>Distribuição do Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ coin, percentage }) =>
                `${coin} (${percentage.toFixed(1)}%)`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatBRL(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {distribution.map((item) => (
            <div
              key={item.coin}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COIN_COLORS[item.coin] || "#666" }}
                />
                <span className="font-semibold">{item.coin}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatBRL(item.value)}</p>
                <p className="text-xs text-muted-foreground">
                  {totalCrypto[item.coin]?.toFixed(8)} {item.coin}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
