import { Badge } from "@orthoplus/core-ui/badge";
import { CheckCircle, XCircle, Clock, Globe } from "lucide-react";
import type { StatusConfig } from "./types";

interface StatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  COMPLETED: { variant: "success", icon: "check", label: "Completo" },
  FAILED: { variant: "destructive", icon: "x", label: "Falhou" },
  PENDING: { variant: "warning", icon: "clock", label: "Pendente" },
  IN_PROGRESS: { variant: "default", icon: "globe", label: "Em Progresso" },
};

const ICONS = {
  check: CheckCircle,
  x: XCircle,
  clock: Clock,
  globe: Globe,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = ICONS[config.icon];

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
