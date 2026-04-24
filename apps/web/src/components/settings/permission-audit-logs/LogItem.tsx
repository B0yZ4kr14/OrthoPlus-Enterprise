// cspell:disable
import { Check, X, FileText, Calendar } from "lucide-react";
import { Badge } from "@orthoplus/core-ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ACTION_LABELS } from "./constants";
import type { AuditLog } from "./types";

interface LogItemProps {
  log: AuditLog;
}

export function LogItem({ log }: LogItemProps) {
  const actionConfig = ACTION_LABELS[log.action] || {
    label: log.action,
    variant: "default" as const,
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
        {log.action === "PERMISSION_GRANTED" ? (
          <Check className="h-5 w-5 text-success" />
        ) : log.action === "PERMISSION_REVOKED" ? (
          <X className="h-5 w-5 text-destructive" />
        ) : (
          <FileText className="h-5 w-5 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={actionConfig.variant} className="text-xs">
            {actionConfig.label}
          </Badge>
          {log.template_name && (
            <Badge variant="outline" className="text-xs">
              {log.template_name}
            </Badge>
          )}
        </div>

        <p className="text-sm font-medium mb-1">
          <span className="text-primary">{log.user.full_name}</span>
          {" alterou permissões de "}
          <span className="text-primary">{log.target_user.full_name}</span>
        </p>

        {log.module && (
          <p className="text-sm text-muted-foreground mb-1">
            Módulo: {log.module.name}
          </p>
        )}

        {log.details?.module_keys && (
          <p className="text-sm text-muted-foreground mb-1">
            {log.details.permissions_count as number} permissões aplicadas
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Calendar className="h-3 w-3" />
          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </div>
      </div>
    </div>
  );
}
