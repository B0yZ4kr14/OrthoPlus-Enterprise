import { BarChart3 } from "lucide-react";
import { KPICard } from "./KPICard";

interface VolatilityCardProps {
  volatility: string;
  period: string;
}

export function VolatilityCard({ volatility, period }: VolatilityCardProps) {
  return (
    <KPICard
      title="Volatilidade"
      value={`${volatility}%`}
      badgeText={`Período ${period}`}
      badgeVariant="outline"
      icon={<BarChart3 className="h-8 w-8 text-muted-foreground opacity-20" />}
    />
  );
}
