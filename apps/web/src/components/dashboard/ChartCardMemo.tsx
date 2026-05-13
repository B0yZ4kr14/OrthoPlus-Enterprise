import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { scaleIn } from "@/lib/animations";
import { formatBRL, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ChartCardMemoProps {
  title: string;
  description?: string;
  data: unknown[];
  type: "bar" | "line";
  dataKey: string;
  xAxisKey: string;
  secondaryDataKey?: string;
  valueFormatter?: (value: number) => string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  dataKey: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  data,
  xAxisKey,
  valueFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  data: unknown[];
  xAxisKey: string;
  valueFormatter?: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const currentIndex = data.findIndex((d) => {
    const record = d as Record<string, unknown>;
    return String(record[xAxisKey]) === String(label);
  });

  const prevData =
    currentIndex > 0 ? (data[currentIndex - 1] as Record<string, number>) : null;

  return (
    <div className="bg-white dark:bg-[hsl(var(--card))] shadow-lg rounded-lg p-3 border border-slate-100 dark:border-[hsl(var(--border))] min-w-[140px]">
      <p className="text-xs font-medium text-slate-500 mb-2">{String(label)}</p>
      <div className="space-y-1.5">
        {payload.map((item) => {
          const prevValue = prevData ? prevData[item.dataKey] : null;
          let delta: number | null = null;
          if (
            prevValue !== null &&
            prevValue !== undefined &&
            prevValue !== 0
          ) {
            delta = ((item.value - prevValue) / prevValue) * 100;
          }

          const formattedValue = valueFormatter
            ? valueFormatter(item.value)
            : String(item.value);

          return (
            <div
              key={item.dataKey}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-600 dark:text-[hsl(var(--muted-foreground))]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 dark:text-[hsl(var(--foreground))] block">
                  {formattedValue}
                </span>
                {delta !== null && (
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      delta >= 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"
                    )}
                  >
                    {delta >= 0 ? "+" : ""}
                    {formatPercent(delta, 1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LegendPayloadItem {
  id: string;
  value: string;
  type: string;
  color: string;
}

function CustomLegend({
  payload,
  hiddenKeys,
  onToggle,
}: {
  payload?: LegendPayloadItem[];
  hiddenKeys: string[];
  onToggle: (key: string) => void;
}) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {payload.map((entry) => {
        const isHidden = hiddenKeys.includes(entry.value);
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onToggle(entry.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border min-h-[44px] focus-visible:ring-2 focus-visible:ring-[hsl(var(--interactive))] focus-visible:ring-offset-1 focus-visible:outline-none",
              isHidden
                ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--muted-foreground))] dark:border-[hsl(var(--border))] opacity-60 line-through"
                : "bg-white text-slate-700 border-slate-200 dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--foreground))] dark:border-[hsl(var(--border))] shadow-sm hover:shadow-md"
            )}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </button>
        );
      })}
    </div>
  );
}

export const ChartCardMemo = memo(function ChartCardMemo({
  title,
  description,
  data,
  type,
  dataKey,
  xAxisKey,
  secondaryDataKey,
  valueFormatter,
}: ChartCardMemoProps) {
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);

  const toggleKey = useCallback((key: string) => {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const isBar = type === "bar";

  const ariaLabel = description
    ? `Gráfico de ${title}: ${description}`
    : `Gráfico de ${title}`;

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
                    <th>{xAxisKey}</th>
                    <th>{dataKey}</th>
                    {secondaryDataKey && <th>{secondaryDataKey}</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => {
                    const record = row as Record<string, unknown>;
                    return (
                      <tr key={i}>
                        <td>{String(record[xAxisKey])}</td>
                        <td>{String(record[dataKey])}</td>
                        {secondaryDataKey && (
                          <td>{String(record[secondaryDataKey])}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </span>
            <ResponsiveContainer width="100%" height={300}>
              {isBar ? (
                <BarChart data={data}>
                  <defs>
                    <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey={xAxisKey} />
                  <YAxis />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip
                        active={props.active}
                        payload={props.payload as TooltipPayloadItem[]}
                        label={props.label}
                        data={data}
                        xAxisKey={xAxisKey}
                        valueFormatter={valueFormatter}
                      />
                    )}
                  />
                  <Legend
                    content={(props) => (
                      <CustomLegend
                        payload={props.payload as LegendPayloadItem[]}
                        hiddenKeys={hiddenKeys}
                        onToggle={toggleKey}
                      />
                    )}
                  />
                  <Bar
                    dataKey={dataKey}
                    fill="url(#gradientPrimary)"
                    radius={[6, 6, 0, 0]}
                    name={dataKey}
                    hide={hiddenKeys.includes(dataKey)}
                  />
                  {secondaryDataKey && (
                    <Bar
                      dataKey={secondaryDataKey}
                      fill="url(#gradientSecondary)"
                      radius={[6, 6, 0, 0]}
                      name={secondaryDataKey}
                      hide={hiddenKeys.includes(secondaryDataKey)}
                    />
                  )}
                </BarChart>
              ) : (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey={xAxisKey} />
                  <YAxis />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip
                        active={props.active}
                        payload={props.payload as TooltipPayloadItem[]}
                        label={props.label}
                        data={data}
                        xAxisKey={xAxisKey}
                        valueFormatter={valueFormatter}
                      />
                    )}
                  />
                  <Legend
                    content={(props) => (
                      <CustomLegend
                        payload={props.payload as LegendPayloadItem[]}
                        hiddenKeys={hiddenKeys}
                        onToggle={toggleKey}
                      />
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#gradientPrimary)"
                    dot={{ r: 4, fill: "#10B981" }}
                    name={dataKey}
                    hide={hiddenKeys.includes(dataKey)}
                  />
                  {secondaryDataKey && (
                    <Area
                      type="monotone"
                      dataKey={secondaryDataKey}
                      stroke="#64748B"
                      strokeWidth={2}
                      fill="url(#gradientSecondary)"
                      dot={{ r: 4, fill: "#64748B" }}
                      name={secondaryDataKey}
                      hide={hiddenKeys.includes(secondaryDataKey)}
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
