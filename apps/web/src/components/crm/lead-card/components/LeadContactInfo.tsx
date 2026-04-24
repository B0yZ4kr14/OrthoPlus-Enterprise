import { Mail, Phone, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils/date.utils";
import type { Lead } from "../types";

interface LeadContactInfoProps {
  lead: Lead;
}

export function LeadContactInfo({ lead }: LeadContactInfoProps) {
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      {lead.email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>{lead.email}</span>
        </div>
      )}

      {lead.telefone && (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{lead.telefone}</span>
        </div>
      )}

      {lead.proximoContato && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Próximo contato:{" "}
            {formatDate(lead.proximoContato)}
          </span>
        </div>
      )}

      {lead.responsavelId && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Responsável: {lead.responsavelId}</span>
        </div>
      )}
    </div>
  );
}
