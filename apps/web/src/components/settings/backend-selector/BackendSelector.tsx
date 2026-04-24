import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Server, Clock } from "lucide-react";
import { useBackendStatus } from "./useBackendStatus";
import { StatusBadge } from "./StatusBadge";

export function BackendSelector() {
  const backend = useBackendStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Servidor Local</CardTitle>
        <CardDescription>
          A aplicação está conectada ao servidor local (Ubuntu Server) usando a nova
          infraestrutura.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4 rounded-lg border border-primary p-4 bg-primary/5">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-semibold">
                <Server className="h-5 w-5 text-primary" />
                OrthoPlus Backend (Express)
              </div>
              <StatusBadge status={backend.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Servidor PostgreSQL e API Node.js local/on-premises. Controle total da sua
              infraestrutura.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>URL: {backend.url}</span>
              {backend.latency !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {backend.latency}ms
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
