// cspell:disable
import { Activity, AlertTriangle, Target, TrendingUp } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";

interface KPICardsProps {
  totalAnalises: number;
  taxaMediaProblemas: string | number;
  precisaoMediaGeral: number;
  padroesCount: number;
}

export function KPICards({
  totalAnalises,
  taxaMediaProblemas,
  precisaoMediaGeral,
  padroesCount,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4 bg-primary/5 border-primary/20" depth="subtle">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Total de Análises
          </span>
        </div>
        <p className="text-2xl font-bold">{totalAnalises}</p>
      </Card>

      <Card className="p-4 bg-warning/5 border-warning/20" depth="subtle">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-xs text-muted-foreground">
            Média Problemas/Análise
          </span>
        </div>
        <p className="text-2xl font-bold text-warning">{taxaMediaProblemas}</p>
      </Card>

      <Card className="p-4 bg-success/5 border-success/20" depth="subtle">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-success" />
          <span className="text-xs text-muted-foreground">
            Precisão Média IA
          </span>
        </div>
        <p className="text-2xl font-bold text-success">{precisaoMediaGeral}%</p>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20" depth="subtle">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Padrões Identificados
          </span>
        </div>
        <p className="text-2xl font-bold">{padroesCount}</p>
      </Card>
    </div>
  );
}
