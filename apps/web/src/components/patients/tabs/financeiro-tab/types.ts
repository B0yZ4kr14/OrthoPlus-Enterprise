import type { LucideIcon } from "lucide-react";

export interface FinanceiroTabProps {
  patient: Record<string, unknown>;
}

export interface PaymentStatusConfig {
  label: string;
  variant: "default" | "warning" | "destructive" | "outline";
  icon: LucideIcon;
}
