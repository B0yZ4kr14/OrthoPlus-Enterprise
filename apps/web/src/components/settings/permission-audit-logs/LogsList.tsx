// cspell:disable
import { Shield } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { ScrollArea } from "@orthoplus/core-ui/scroll-area";
import { LogItem } from "./LogItem";
import type { AuditLog } from "./types";

interface LogsListProps {
  logs: AuditLog[];
}

export function LogsList({ logs }: LogsListProps) {
  return (
    <Card>
      <ScrollArea className="h-[500px]">
        <div className="p-6 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro de auditoria encontrado</p>
            </div>
          ) : (
            logs.map((log) => <LogItem key={log.id} log={log} />)
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
