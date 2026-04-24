import { Badge } from "@orthoplus/core-ui/badge";
import type { PaymentStatus } from "./types";

const STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  paid: { label: "Em Dia", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  overdue: { label: "Em Atraso", variant: "destructive" },
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
