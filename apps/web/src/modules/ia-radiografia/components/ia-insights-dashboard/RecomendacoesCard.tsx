// cspell:disable
import { Lightbulb, Target } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@orthoplus/core-ui/alert";
import type { RecomendacaoPreventiva } from "./types";
import { getPrioridadeColor } from "./utils";

interface RecomendacoesCardProps {
  recomendacoes: RecomendacaoPreventiva[];
}

export function RecomendacoesCard({ recomendacoes }: RecomendacoesCardProps) {
  return (
    <Card className="p-6 bg-success/5 border-success/20" depth="normal">
      <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-success" />
        Recomendações Preventivas
      </h3>
      <div className="space-y-4">
        {recomendacoes.map((rec) => (
          <Alert
            key={rec.titulo}
            className="border-l-4"
            style={{
              borderLeftColor: `hsl(var(--${getPrioridadeColor(rec.prioridade)}))`,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <AlertTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {rec.titulo}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  {rec.descricao}
                </AlertDescription>
              </div>
              <Badge variant={getPrioridadeColor(rec.prioridade) as unknown as undefined}>
                {rec.prioridade.toUpperCase()}
              </Badge>
            </div>
          </Alert>
        ))}
      </div>
    </Card>
  );
}
