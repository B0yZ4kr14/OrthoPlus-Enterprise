import { useState } from "react";
import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import {
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const SIMULATION_MODULES = [
  { id: "FINANCEIRO", name: "Financeiro", active: true, essential: false },
  {
    id: "SPLIT",
    name: "Split de Pagamento",
    active: true,
    essential: false,
    requires: ["FINANCEIRO"],
  },
  {
    id: "COBRANCA",
    name: "Inadimplência",
    active: false,
    essential: false,
    requires: ["FINANCEIRO"],
  },
];

export function StepSimulation() {
  const [modules, setModules] = useState(SIMULATION_MODULES);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const canDeactivate = (moduleId: string) => {
    const dependents = modules.filter(
      (m) => m.active && m.requires?.includes(moduleId),
    );
    return dependents.length === 0;
  };

  const canActivate = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module?.requires) return true;

    return module.requires.every(
      (req) => modules.find((m) => m.id === req)?.active,
    );
  };

  const toggleModule = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    if (module.active) {
      if (!canDeactivate(moduleId)) {
        const dependents = modules
          .filter((m) => m.active && m.requires?.includes(moduleId))
          .map((m) => m.name);

        toast.error(`Não é possível desativar ${module.name}`, {
          description: `Desative primeiro: ${dependents.join(", ")}`,
        });
        setLastAction(
          `❌ Falha ao desativar ${module.name} (dependências ativas)`,
        );
        return;
      }

      setModules(
        modules.map((m) => (m.id === moduleId ? { ...m, active: false } : m)),
      );
      toast.success(`${module.name} desativado`);
      setLastAction(`✅ ${module.name} desativado com sucesso`);
    } else {
      if (!canActivate(moduleId)) {
        const missing =
          module.requires
            ?.filter((req) => !modules.find((m) => m.id === req)?.active)
            .map((req) => modules.find((m) => m.id === req)?.name) || [];

        toast.error(`Não é possível ativar ${module.name}`, {
          description: `Ative primeiro: ${missing.join(", ")}`,
        });
        setLastAction(
          `❌ Falha ao ativar ${module.name} (dependências inativas)`,
        );
        return;
      }

      setModules(
        modules.map((m) => (m.id === moduleId ? { ...m, active: true } : m)),
      );
      toast.success(`${module.name} ativado`);
      setLastAction(`✅ ${module.name} ativado com sucesso`);
    }
  };

  const resetSimulation = () => {
    setModules(SIMULATION_MODULES);
    setLastAction(null);
    toast.info("Simulação reiniciada");
  };

  return (
    <div className="space-y-6">
      <Alert>
        <PlayCircle className="h-4 w-4" />
        <AlertDescription>
          Esta é uma simulação interativa. Tente ativar e desativar módulos para
          ver como o sistema valida as dependências em tempo real.
        </AlertDescription>
      </Alert>

      {lastAction && (
        <Card className="p-4 bg-muted/50 border-dashed">
          <p className="text-sm font-mono">{lastAction}</p>
        </Card>
      )}

      <div className="space-y-3">
        {modules.map((module) => {
          const canToggle = module.active
            ? canDeactivate(module.id)
            : canActivate(module.id);

          const dependents = module.active
            ? modules.filter((m) => m.active && m.requires?.includes(module.id))
            : [];

          const missingDeps =
            !module.active && module.requires
              ? module.requires.filter(
                  (req) => !modules.find((m) => m.id === req)?.active,
                )
              : [];

          return (
            <Card
              key={module.id}
              className={`p-4 ${module.active ? "bg-card" : "bg-muted/30"}`}
            >
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
                    onClick={() => toggleModule(module.id)}
                  >
                    {module.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>

                {!canToggle && module.active && dependents.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Não pode desativar:{" "}
                      <strong>
                        {dependents.map((d) => d.name).join(", ")}
                      </strong>{" "}
                      depende(m) deste módulo
                    </p>
                  </div>
                )}

                {!canToggle && !module.active && missingDeps.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Requer:{" "}
                      <strong>
                        {missingDeps
                          .map((id) => modules.find((m) => m.id === id)?.name)
                          .join(", ")}
                      </strong>{" "}
                      ativo(s)
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={resetSimulation}
      >
        <RefreshCw className="h-4 w-4" />
        Reiniciar Simulação
      </Button>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-3">🎯 Experimente</h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            Tente desativar "Financeiro" (não funcionará enquanto Split estiver
            ativo)
          </li>
          <li>Desative "Split de Pagamento" primeiro</li>
          <li>Agora desative "Financeiro" (funcionará)</li>
          <li>
            Tente ativar "Inadimplência" (não funcionará sem Financeiro ativo)
          </li>
          <li>Ative "Financeiro" novamente e depois "Inadimplência"</li>
        </ol>
      </Card>
    </div>
  );
}
