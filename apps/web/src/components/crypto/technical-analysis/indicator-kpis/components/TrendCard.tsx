import { TrendingUp, TrendingDown } from "lucide-react";
import { KPICard } from "./KPICard";

interface TrendCardProps {
  trend: string;
}

export function TrendCard({ trend }: TrendCardProps) {
  const isBullish = trend === "ALTA";
  const Icon = isBullish ? TrendingUp : TrendingDown;
  const iconClass = isBullish
    ? "h-8 w-8 text-success opacity-20"
    : "h-8 w-8 text-destructive opacity-20";

  return (
    <KPICard
      title="Tendência"
      value={trend}
      badgeText={isBullish ? "Bullish" : "Bearish"}
      badgeVariant={isBullish ? "success" : "destructive"}
      icon={<Icon className={iconClass} />}
    />
  );
}
