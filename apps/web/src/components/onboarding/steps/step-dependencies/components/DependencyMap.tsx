import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { GitBranch, CheckCircle2 } from "lucide-react";
import type { Dependency } from "../constants/dependencies";

interface DependencyMapProps {
  dependencies: Dependency[];
}

export function DependencyMap({ dependencies }: DependencyMapProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <GitBranch className="h-5 w-5" />
        Mapa de Dependências
      </h3>

      <div className="space-y-3">
        {dependencies.map((dep, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{dep.module}</span>
                    <span className="text-muted-foreground">depende de</span>
                    {dep.requires.map((req, i) => (
                      <Badge key={i} variant="secondary">
                        {req}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{dep.reason}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
