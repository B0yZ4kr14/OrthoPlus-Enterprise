import { useState, memo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";

import { scaleIn } from "@/lib/animations";

interface PieChartCardProps {
  data: Array<{ name: string; value: number; color: string }>;
  title: string;
  description?: string;
}

function ActivePieShape(props: React.ComponentProps<typeof Sector>) {
  return <Sector {...props} outerRadius={(props.outerRadius ?? 0) + 4} />;
}

function PieTooltip({
  active,
  payload,
  data,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  data: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-3 border border-slate-100 dark:border-slate-700 min-w-[120px]">
      <p className="text-xs font-medium text-slate-500 mb-1">{item.name}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {item.value}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{percent}%</p>
    </div>
  );
}

export const PieChartCard = memo(function PieChartCard({
  data,
  title,
  description,
}: PieChartCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const summary = data
    .map((entry) => {
      const percent =
        total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
      return `${entry.name}: ${percent}%`;
    })
    .join(", ");

  const ariaLabel = `Distribuição de ${title}: ${summary}`;

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={ariaLabel}>
            <span className="sr-only">
              <table>
                <caption>{ariaLabel}</caption>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Porcentagem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry, i) => {
                    const percent =
                      total > 0
                        ? ((entry.value / total) * 100).toFixed(1)
                        : "0.0";
                    return (
                      <tr key={i}>
                        <td>{entry.name}</td>
                        <td>{entry.value}</td>
                        <td>{percent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </span>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {data.map((entry, index) => (
                    <linearGradient
                      key={`pie-grad-${index}`}
                      id={`pieGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={entry.color}
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="100%"
                        stopColor={entry.color}
                        stopOpacity={0.4}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Tooltip
                  content={(props) => (
                    <PieTooltip
                      active={props.active}
                      payload={props.payload as Array<{ name: string; value: number }>}
                      data={data}
                    />
                  )}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={ActivePieShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient-${index})`}
                      stroke="none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {data.map((entry) => {
              const percent =
                total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
              return (
                <div
                  key={entry.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-300">
                    {entry.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
