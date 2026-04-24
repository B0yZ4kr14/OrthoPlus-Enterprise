/**
 * Lista de integrações ativas
 */

import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { CheckCircle2, XCircle, Send } from "lucide-react";
import type { ContabilConfig } from "./types";

interface IntegracoesListProps {
  configs: ContabilConfig[];
  onEnviarManual: (software: string) => void;
}

export function IntegracoesList({ configs, onEnviarManual }: IntegracoesListProps) {
  if (configs.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhuma integração configurada
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {configs.map((config) => (
        <Card key={config.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{config.software}</h4>
                  <Badge variant={config.ativo ? "success" : "secondary"}>
                    {config.ativo ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ativa
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativa
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Periodicidade: {config.periodicidade_envio}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => onEnviarManual(config.software)}
                disabled={!config.ativo}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
