import { memo, useEffect, useMemo } from "react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { fadeUp, useAccessibleAnimation } from "@/lib/animations";

interface StatCardMemoProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: "blue" | "purple" | "green" | "orange" | "red";
  index?: number;
}

function useCountUp(value: string | number) {
  const target = useMemo(() => {
    if (typeof value === "number") return value;
    const cleaned = value
      .replace(/R\$\s?/g, "")
      .replace(/%/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }, [value]);

  const isCurrency = typeof value === "string" && value.startsWith("R$");
  const isPercent = typeof value === "string" && value.endsWith("%");

  const count = useMotionValue(0);
  const spring = useSpring(count, {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    if (target !== null) {
      count.set(target);
    }
  }, [count, target]);

  const display = useTransform(spring, (latest) => {
    if (target === null) return String(value);
    const num = Math.round(latest);
    if (isCurrency) return "R$ " + num.toLocaleString("pt-BR");
    if (isPercent) return num + "%";
    return num.toLocaleString("pt-BR");
  });

  return { display, hasAnimation: target !== null };
}

export const StatCardMemo = memo(function StatCardMemo({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  index = 0,
}: StatCardMemoProps) {
  const { display, hasAnimation } = useCountUp(value);
  const accessible = useAccessibleAnimation();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.08, ...(accessible.transition || {}) }}
    >
      <Card
        role="group"
        aria-label={`${title}: ${value}`}
        className={cn(
          "relative overflow-hidden",
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "hover:shadow-lg hover:-translate-y-0.5",
          "transition-all duration-200"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
                {hasAnimation ? (
                  <motion.span>{display}</motion.span>
                ) : (
                  value
                )}
              </p>

              {trend && (
                <div className="flex items-center gap-1.5 text-sm">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      trend.isPositive
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                    )}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-3 w-3" aria-hidden="true" />
                    )}
                    {Math.abs(trend.value)}%
                  </span>
                  {subtitle && (
                    <span className="text-muted-foreground text-xs">
                      {subtitle}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shrink-0"
              aria-hidden="true"
            >
              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
