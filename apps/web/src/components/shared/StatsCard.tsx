import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  description?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

export const StatsCard = memo(function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = "default",
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: "border-border",
    primary: "border-primary/50 bg-primary/5",
    success: "border-green-500/50 bg-green-500/5",
    warning: "border-yellow-500/50 bg-yellow-500/5",
    danger: "border-red-500/50 bg-red-500/5",
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <Card
      data-testid="stats-card"
      className={cn(
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-neon-cyan/20 glass-deep border-primary/20",
        variantStyles[variant],
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold tracking-tight text-muted-foreground uppercase">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg bg-background/40 backdrop-blur-sm border border-border/30 shadow-inner")}>
          <Icon className={cn("h-5 w-5", iconColors[variant])} />
        </div>
      </CardHeader>
    <CardContent className="pt-2">
        <div className="text-3xl font-black gradient-text neon-glow-cyan tracking-tighter">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span
              className={cn(
                trend.isPositive ? "text-green-500" : "text-red-500",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            {trend.label}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
});
