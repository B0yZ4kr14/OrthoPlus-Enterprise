import { Badge } from "@orthoplus/core-ui/badge";
import { Shield } from "lucide-react";
import type { KruxStatus } from "./types";

interface StatusDisplayProps {
  status: KruxStatus;
}

const STATUS_LABELS: Record<KruxStatus, string> = {
  idle: "Aguardando transação assinada",
  scanning: "Escaneando QR Code...",
  signed: "Transação assinada recebida",
};

const STATUS_BADGES: Record<KruxStatus, { label: string; variant: "default" | "secondary" }> = {
  idle: { label: "Inativo", variant: "secondary" },
  scanning: { label: "Escaneando", variant: "secondary" },
  signed: { label: "Pronto", variant: "default" },
};

export function StatusDisplay({ status }: StatusDisplayProps) {
  const badge = STATUS_BADGES[status];

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <p className="font-semibold">Status Krux</p>
          <p className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</p>
        </div>
      </div>
      <Badge variant={badge.variant}>{badge.label}</Badge>
    </div>
  );
}
