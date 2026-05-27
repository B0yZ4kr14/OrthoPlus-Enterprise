// cspell:disable
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { Indicacao } from "./types";
import { getStatusIndicacaoVariant } from "./utils";

interface IndicacoesTabProps {
  indicacoes: Indicacao[];
}

export function IndicacoesTab({ indicacoes }: IndicacoesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Programa de Indicação Premiada</CardTitle>
      </CardHeader>
      <CardContent>
        {indicacoes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma indicação registrada ainda
          </p>
        ) : (
          <div className="space-y-2">
            {indicacoes.map((indicacao) => (
              <div
                key={indicacao.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {indicacao.id
                      ? indicacao.indicador_nome
                      : indicacao.indicador?.nome || "Sistema"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Indicou: {indicacao.indicado_nome} •{" "}
                    {indicacao.indicado_telefone}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="text-sm text-muted-foreground">
                    {indicacao.created_at
                      ? new Date(indicacao.created_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </div>
                  {indicacao.pontos_concedidos && (
                    <div className="font-medium text-green-600">
                      +{indicacao.pontos_concedidos} pontos
                    </div>
                  )}
                </div>
                <Badge variant={getStatusIndicacaoVariant(indicacao.status)}>
                  {indicacao.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
