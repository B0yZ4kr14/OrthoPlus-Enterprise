import { DollarSign, TrendingUp, TrendingDown, AlertCircle, type LucideIcon } from "lucide-react";
import type { PaymentStatusConfig } from "./types";

export function useFinanceiroTab(paymentStatus: string) {
  const getPaymentStatusConfig = (status: string): PaymentStatusConfig => {
    switch (status) {
      case "em_dia":
        return { label: "Em Dia", variant: "default", icon: TrendingUp };
      case "atrasado":
        return { label: "Atrasado", variant: "warning", icon: AlertCircle };
      case "inadimplente":
        return { label: "Inadimplente", variant: "destructive", icon: TrendingDown };
      default:
        return { label: status, variant: "outline", icon: DollarSign };
    }
  };

  return { getPaymentStatusConfig };
}
