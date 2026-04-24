import { Badge } from "@orthoplus/core-ui/badge";
import { TrendingUp } from "lucide-react";
import type { Lead } from "../types";
import { statusLabels, statusColors } from "../constants/status";

interface LeadHeaderProps {
  lead: Lead;
}

export function LeadHeader({ lead }: LeadHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{lead.nome}</h3>
        <Badge className={statusColors[lead.status]} variant="outline">
          {statusLabels[lead.status]}
        </Badge>
      </div>
      {lead.valorEstimado && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>R$ {lead.valorEstimado.toLocaleString("pt-BR")}</span>
        </div>
      )}
    </div>
  );
}
