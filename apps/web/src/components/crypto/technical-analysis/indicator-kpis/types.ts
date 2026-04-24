import type { TechnicalIndicatorResults, TimePeriod } from "@/types/crypto";

export type { TechnicalIndicatorResults, TimePeriod };

export interface IndicatorKPIsProps {
  indicators: TechnicalIndicatorResults;
  period: TimePeriod;
}

export interface KPICardProps {
  title: string;
  value: string;
  badgeText: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success";
  icon: React.ReactNode;
}
