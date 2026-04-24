// cspell:disable
import { AlertTriangle } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { AreaProblematica } from "./types";

interface AreasCardProps {
  areas: AreaProblematica[];
}

export function AreasCard({ areas }: AreasCardProps) {
  return (
    <Card className="p-6" depth="normal">
      <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        Áreas Problemáticas Mais Frequentes
      </h3>
      <div className="space-y-3">
        {areas.map((area, index) => (
          <div
            key={area.area}
            className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20"
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                #{index + 1}
              </Badge>
              <span className="font-medium">{area.area}</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-warning">
                {area.ocorrencias}
              </p>
              <p className="text-xs text-muted-foreground">casos</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
