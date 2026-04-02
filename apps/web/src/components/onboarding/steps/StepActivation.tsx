import { useState } from "react";
import { Card } from "@orthoplus/core-ui/card";
import { Switch } from "@orthoplus/core-ui/switch";
import { Badge } from "@orthoplus/core-ui/badge";
import { Info, CheckCircle2, XCircle } from "lucide-react";

const SAMPLE_MODULES = [
  { id: "DASHBOARD", name: "Dashboard", category: "Core", essential: true },
  {
    id: "PACIENTES",
    name: "Pacientes",
    category: "Cadastros",
    essential: true,
  },
  {
    id: "PEP",
    name: "Prontuário Eletrônico",
    category: "Clínica",
    essential: true,
  },
  {
    id: "AGENDA",
    name: "Agenda Inteligente",
    category: "Clínica",
    essential: false,
  },
  {
    id: "FINANCEIRO",
    name: "Gestão Financeira",
    category: "Financeiro",
    essential: false,
  },
  {
    id: "SPLIT_PAGAMENTO",
    name: "Split de Pagamento",
    category: "Financeiro",
    essential: false,
  },
  {
    id: "ESTOQUE",
    name: "Controle de Estoque",
    category: "Operacional",
    essential: false,
  },
  {
    id: "BI",
    name: "Business Intelligence",
    category: "Analytics",
    essential: false,
  },
];

export function StepActivation() {
  const [activeModules, setActiveModules] = useState<string[]>(
    SAMPLE_MODULES.filter((m) => m.essential).map((m) => m.id),
  );

  const toggleModule = (id: string) => {
    const module = SAMPLE_MODULES.find((m) => m.id === id);
    if (module?.essential) return;

    if (activeModules.includes(id)) {
      setActiveModules(activeModules.filter((m) => m !== id));
    } else {
      setActiveModules([...activeModules, id]);
    }
  };

  const groupedModules = SAMPLE_MODULES.reduce(
    (acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    },
    {} as Record<string, typeof SAMPLE_MODULES>,
  );

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">
              Como funciona a ativação de módulos?
            </h3>
            <p className="text-sm text-muted-foreground">
              Você pode ativar ou desativar módulos a qualquer momento. Módulos
              marcados como
              <strong> "Essencial"</strong> não podem ser desativados pois são
              fundamentais para o funcionamento do sistema. Esta é uma
              demonstração - após o onboarding, você poderá configurar os
              módulos reais em <strong>Configurações → Meus Módulos</strong>.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {activeModules.length} de {SAMPLE_MODULES.length} módulos ativos
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{activeModules.length} Ativos</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>{SAMPLE_MODULES.length - activeModules.length} Inativos</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedModules).map(([category, modules]) => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              {category}
              <Badge variant="outline">{modules.length}</Badge>
            </h3>

            <div className="space-y-2">
              {modules.map((module) => {
                const isActive = activeModules.includes(module.id);
                return (
                  <Card
                    key={module.id}
                    className={`p-4 transition-all ${
                      isActive ? "bg-card" : "bg-muted/30 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{module.name}</span>
                            {module.essential && (
                              <Badge variant="secondary" className="text-xs">
                                Essencial
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {module.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {isActive ? "Ativo" : "Inativo"}
                        </span>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleModule(module.id)}
                          disabled={module.essential}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
