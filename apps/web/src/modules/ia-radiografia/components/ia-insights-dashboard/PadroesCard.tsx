// cspell:disable
import { TrendingUp } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { ProblemaPattern } from "./types";

interface PadroesCardProps {
  padroes: ProblemaPattern[];
}

export function PadroesCard({ padroes }: PadroesCardProps) {
  return (
    <Card className="p-6" depth="normal">
      <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Padrões Mais Comuns Detectados
      </h3>
      <div className="space-y-3">
        {padroes.map((padrao, index) => (
          <div
            key={padrao.tipo}
            className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                #{index + 1}
              </Badge>
              <span className="font-medium">{padrao.tipo}</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">
                {padrao.ocorrencias}
              </p>
              <p className="text-xs text-muted-foreground">ocorrências</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
