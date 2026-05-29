import { Badge } from "@orthoplus/core-ui/badge";
import type { PaymentStatus, BudgetStatus } from "./types";

const PAYMENT_STATUS_CONFIG: Record<string, any> = {
  em_dia: { label: "Em Dia", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  atrasado: { label: "Atrasado", variant: "destructive" },
};

const BUDGET_STATUS_CONFIG: Record<string, any> = {
  aprovado: { label: "Aprovado", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  rejeitado: { label: "Rejeitado", variant: "destructive" },
  rascunho: { label: "Rascunho", variant: "outline" },
};

export function getPaymentStatusBadge(status: string) {
  const config =
    PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pendente;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function getBudgetStatusBadge(status: string) {
  const config = BUDGET_STATUS_CONFIG[status] || BUDGET_STATUS_CONFIG.pendente;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
