import { TrendingUp } from "lucide-react";
import { KPICard } from "./KPICard";

interface MACDCardProps {
  macd: number;
  macdSignal: string;
}

export function MACDCard({ macd, macdSignal }: MACDCardProps) {
  return (
    <KPICard
      title="MACD"
      value={macd.toFixed(2)}
      badgeText={`Sinal de ${macdSignal}`}
      badgeVariant={macdSignal === "ALTA" ? "success" : "destructive"}
      icon={<TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />}
    />
  );
}
