import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { SimulationModule } from "./types";

interface ModuleCardProps {
  module: SimulationModule;
  canToggle: boolean;
  dependents: SimulationModule[];
  missingDeps: string[];
  allModules: SimulationModule[];
  onToggle: (id: string) => void;
}

export function ModuleCard({
  module,
  canToggle,
  dependents,
  missingDeps,
  allModules,
  onToggle,
}: ModuleCardProps) {
  return (
    <Card className={`p-4 ${module.active ? "bg-card" : "bg-muted/30"}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {module.active ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{module.name}</span>
                {module.requires && (
                  <Badge variant="outline" className="text-xs">
                    Depende de {module.requires.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {module.active ? "Módulo ativo" : "Módulo inativo"}
              </p>
            </div>
          </div>

          <Button
            variant={module.active ? "destructive" : "default"}
            size="sm"
            onClick={() => onToggle(module.id)}
          >
            {module.active ? "Desativar" : "Ativar"}
          </Button>
        </div>

        {!canToggle && module.active && dependents.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">
              Não pode desativar:{" "}
              <strong>{dependents.map((d) => d.name).join(", ")}</strong>{" "}
              depende(m) deste módulo
            </p>
          </div>
        )}

        {!canToggle && !module.active && missingDeps.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-warning">
              Requer:{" "}
              <strong>
                {missingDeps
                  .map((id) => allModules.find((m) => m.id === id)?.name)
                  .join(", ")}
              </strong>{" "}
              ativo(s)
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
