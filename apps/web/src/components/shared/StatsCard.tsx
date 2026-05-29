import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { CardTopBorder } from "./CardTopBorder";

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
  const variantBorder = {
    default: "border-border",
    primary: "border-interactive/30",
    success: "border-success/30",
    warning: "border-warning/30",
    danger: "border-destructive/30",
  };

  const iconBg = {
    default: "bg-muted",
    primary: "bg-interactive/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
    danger: "bg-destructive/10",
  };

  const iconColor = {
    default: "text-muted-foreground",
    primary: "text-interactive",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <Card
      data-testid="stats-card"
      className={cn(
        "stat-card-premium glass-card overflow-hidden relative group hover:-translate-y-0.5 transition-transform duration-300",
        variantBorder[variant],
        className,
      )}
    >
      <CardTopBorder color="interactive" opacity={30} />
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-5 px-5">
        <CardTitle className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow",
            iconBg[variant],
          )}
        >
          <Icon
            className={cn("h-4 w-4", iconColor[variant])}
            aria-hidden="true"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-5 px-5">
        <div className="text-3xl font-bold text-foreground tracking-tight font-display">
          {value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-full text-[10px]",
                trend.isPositive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground/70">{trend.label}</span>
          </p>
        )}
        {description && (
          <p className="text-[11px] text-muted-foreground/60 mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
