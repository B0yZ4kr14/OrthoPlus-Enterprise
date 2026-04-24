// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { TipoAnaliseCount } from "./types";

interface TiposCardProps {
  tipos: TipoAnaliseCount[];
}

export function TiposCard({ tipos }: TiposCardProps) {
  return (
    <Card className="p-6" depth="normal">
      <h3 className="text-md font-semibold mb-4">
        Tipos de Radiografia Mais Analisados
      </h3>
      <div className="space-y-2">
        {tipos.map((tipo) => (
          <div
            key={tipo.tipo}
            className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
          >
            <span className="text-sm">{tipo.tipo}</span>
            <Badge variant="outline">{tipo.quantidade} análises</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
