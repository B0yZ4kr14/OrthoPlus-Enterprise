import { Activity } from "lucide-react";
import { KPICard } from "./KPICard";
import type { TechnicalIndicatorResults } from "../types";

interface RSICardProps {
  rsi: number;
  rsiSignal: string;
}

export function RSICard({ rsi, rsiSignal }: RSICardProps) {
  const getVariant = () => {
    if (rsiSignal === "SOBRECOMPRA") return "destructive";
    if (rsiSignal === "SOBREVENDA") return "success";
    return "secondary";
  };

  return (
    <KPICard
      title="RSI (14)"
      value={rsi.toFixed(2)}
      badgeText={rsiSignal}
      badgeVariant={getVariant()}
      icon={<Activity className="h-8 w-8 text-muted-foreground opacity-50" />}
    />
  );
}
