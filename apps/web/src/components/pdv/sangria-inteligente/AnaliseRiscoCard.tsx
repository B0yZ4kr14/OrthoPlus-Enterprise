// cspell:disable
import { Shield, Clock, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { AnaliseIA } from "./types";

interface AnaliseRiscoCardProps {
  analise: AnaliseIA | null;
}

export function AnaliseRiscoCard({ analise }: AnaliseRiscoCardProps) {
  if (!analise) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Análise de Risco IA</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>Horário</span>
          </div>
          <p className="font-semibold">{analise.horaAtual}:00h</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span>Em Caixa</span>
          </div>
          <p className="font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(analise.valorAtualCaixa)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Incidentes</span>
          </div>
          <p className="font-semibold">{analise.totalIncidentes}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span>Média Sangrias</span>
          </div>
          <p className="font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(analise.mediaValorSangrias)}
          </p>
        </div>
      </div>

      {analise.horariosRisco.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium mb-2">Horários de Maior Risco:</p>
          <div className="flex gap-2">
            {analise.horariosRisco.map((hr) => (
              <Badge key={hr.hora} variant="outline">
                {hr.hora}:00h ({hr.incidentes} incidentes)
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
