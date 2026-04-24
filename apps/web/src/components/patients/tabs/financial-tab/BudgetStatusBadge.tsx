import { Badge } from "@orthoplus/core-ui/badge";
import type { BudgetStatus } from "./types";

const STATUS_CONFIG: Record<BudgetStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
  completed: { label: "Concluído", variant: "outline" },
};

interface BudgetStatusBadgeProps {
  status: BudgetStatus;
}

export function BudgetStatusBadge({ status }: BudgetStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
