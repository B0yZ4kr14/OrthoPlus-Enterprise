import { Badge } from "@orthoplus/core-ui/badge";
import { Wifi, WifiOff, Clock } from "lucide-react";
import type { BackendConfig, StatusConfig } from "./types";

interface StatusBadgeProps {
  status: BackendConfig["status"];
}

const STATUS_CONFIG: Record<BackendConfig["status"], StatusConfig> = {
  online: { variant: "default", icon: "wifi", text: "Online" },
  offline: { variant: "destructive", icon: "wifi-off", text: "Offline" },
  checking: { variant: "outline", icon: "clock", text: "Verificando..." },
};

const ICONS = {
  wifi: Wifi,
  "wifi-off": WifiOff,
  clock: Clock,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = ICONS[config.icon];

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}
