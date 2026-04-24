/**
 * Histórico de envios contábeis
 */

import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { ContabilEnvio } from "./types";

interface EnviosHistoryProps {
  envios: ContabilEnvio[];
}

export function EnviosHistory({ envios }: EnviosHistoryProps) {
  if (envios.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum envio realizado
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {envios.map((envio) => (
        <Card key={envio.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {envio.integracao_contabil_config?.software}
                  </span>
                  <Badge
                    variant={
                      envio.status === "SUCESSO"
                        ? "success"
                        : envio.status === "ERRO"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {envio.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {envio.tipo_documento} - {envio.periodo_referencia}
                </p>
                {envio.enviado_em && (
                  <p className="text-xs text-muted-foreground">
                    Enviado em:{" "}
                    {new Date(envio.enviado_em).toLocaleString("pt-BR")}
                  </p>
                )}
                {envio.erro_mensagem && (
                  <p className="text-xs text-destructive mt-1">
                    {envio.erro_mensagem}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
