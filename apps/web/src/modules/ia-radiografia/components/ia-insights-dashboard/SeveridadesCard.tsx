// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { SeveridadeCount } from "./types";
import { getSeveridadeColor } from "./utils";

interface SeveridadesCardProps {
  severidades: SeveridadeCount[];
}

export function SeveridadesCard({ severidades }: SeveridadesCardProps) {
  return (
    <Card className="p-6" depth="normal">
      <h3 className="text-md font-semibold mb-4">
        Distribuição por Severidade
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {severidades.map((sev) => (
          <div
            key={sev.severidade}
            className="text-center p-4 bg-accent/50 rounded-lg"
          >
            <Badge
              variant={
                getSeveridadeColor(sev.severidade) as unknown as undefined
              }
              className="mb-2"
            >
              {sev.severidade}
            </Badge>
            <p className="text-2xl font-bold">{sev.quantidade}</p>
            <p className="text-xs text-muted-foreground">casos</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
