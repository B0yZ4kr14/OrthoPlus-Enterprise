import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@orthoplus/core-ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@orthoplus/core-ui/alert";
import { Settings, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import confetti from "canvas-confetti";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { ModuleData } from "../components/types";
import { ModulesToolbar } from "../components/ModulesToolbar";
import { ModuleCard } from "../components/ModuleCard";
import { ModuleSuggestions } from "../components/ModuleSuggestions";

export default function ModulesAdmin() {
  const { toast } = useToast();
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [hasCompletedOnboarding] = useLocalStorage<boolean>(
    "ortho-onboarding-completed",
    false,
  );
  const [moduleActivations, setModuleActivations] = useLocalStorage<
    Record<string, boolean>
  >("ortho-module-activations", {});

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setOnboardingOpen(true);
    }
  }, [hasCompletedOnboarding]);

  const fetchModules = async () => {
    try {
      const data = await apiClient.post<{ modules: ModuleData[] }>(
        "/modules/my-modules",
      );
      setModules(data?.modules ?? []);
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao carregar módulos", variant: "destructive" });
      toast({
        title: "Erro",
        description: "Erro ao carregar módulos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps -- fetchModules captures no external deps */
  useEffect(() => {
    fetchModules();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleToggle = async (moduleKey: string, currentState: boolean) => {
    setToggling(moduleKey);

    const module = modules.find((m) => m.module_key === moduleKey);
    if (currentState && module && !module.can_deactivate) {
      const cardElement = cardRefs.current[moduleKey];
      if (cardElement) {
        cardElement.classList.add("animate-shake");
        setTimeout(() => cardElement.classList.remove("animate-shake"), 500);
      }

      toast({
        title: "Módulo bloqueado",
        description: `Este módulo não pode ser desativado pois é requerido por: ${module.blocking_dependencies.join(", ")}`,
        variant: "destructive",
      });
      setToggling(null);
      return;
    }

    try {
      await apiClient.post("/modules/toggle", {
        module_key: moduleKey,
      });

      const newState = !currentState;

      if (newState) {
        const wasActivatedBefore = moduleActivations[moduleKey];
        if (!wasActivatedBefore) {
          const cardElement = cardRefs.current[moduleKey];
          if (cardElement) {
            const rect = cardElement.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
              particleCount: 100,
              spread: 70,
              origin: { x, y },
              colors: ["#2dd4bf", "#14b8a6", "#0d9488", "#fbbf24", "#f59e0b"],
            });
          }
          setModuleActivations((prev) => ({ ...prev, [moduleKey]: true }));
        }
      }

      toast({
        title: newState ? "Módulo ativado!" : "Módulo desativado!",
        description: `O módulo ${moduleKey} foi ${newState ? "ativado" : "desativado"}.`,
      });
      await fetchModules();
    } catch (error: unknown) {
      toast({ title: "Erro", description: "Erro ao alternar módulo", variant: "destructive" });

      const cardElement = cardRefs.current[moduleKey];
      if (cardElement) {
        cardElement.classList.add("animate-shake");
        setTimeout(() => cardElement.classList.remove("animate-shake"), 500);
      }

      const errorMsg =
        error instanceof Error
          ? error.message
          : "Erro ao alterar estado do módulo";
      toast({
        title: "Erro ao alterar módulo",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setToggling(null);
    }
  };

  const handleRequest = async (moduleKey: string, moduleName: string) => {
    try {
      await apiClient.post("/modules/request-new-module", {
        module_key: moduleKey,
      });

      toast({
        title: "Solicitação enviada!",
        description: `Sua solicitação para o módulo ${moduleName} foi enviada ao time comercial.`,
      });
    } catch (error: unknown) {
      toast({ title: "Erro", description: "Erro na requisição", variant: "destructive" });
      toast({
        title: "Erro ao solicitar módulo",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleExportConfig = () => {
    const activeModules = modules
      .filter((m) => m.is_active)
      .map((m) => ({
        module_key: m.module_key,
        name: m.name,
        category: m.category,
      }));

    const config = {
      exported_at: new Date().toISOString(),
      total_modules: activeModules.length,
      modules: activeModules,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ortho-modules-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Configuração exportada!",
      description: `${activeModules.length} módulos exportados com sucesso.`,
    });
  };

  const handleImportConfig = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const config = JSON.parse(text);

      if (!config.modules || !Array.isArray(config.modules)) {
        throw new Error("Formato de arquivo inválido");
      }

      toast({
        title: "Importando configuração...",
        description: `Processando ${config.modules.length} módulos...`,
      });

      let activated = 0;
      for (const mod of config.modules) {
        const existingModule = modules.find(
          (m) => m.module_key === mod.module_key,
        );
        if (
          existingModule &&
          !existingModule.is_active &&
          existingModule.can_activate
        ) {
          await apiClient.post("/modules/toggle", {
            body: { module_key: mod.module_key },
          });
          activated++;
        }
      }

      await fetchModules();
      toast({
        title: "Importação concluída!",
        description: `${activated} módulos ativados com sucesso.`,
      });
    } catch (error: unknown) {
      toast({ title: "Erro", description: "Erro ao importar", variant: "destructive" });
      toast({
        title: "Erro ao importar",
        description:
          error instanceof Error
            ? error.message
            : "Verifique o formato do arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const activeModulesList = modules
        .filter((m) => m.is_active)
        .map((m) => m.name)
        .join(", ");
      const inactiveModulesList = modules
        .filter((m) => !m.is_active)
        .map((m) => m.name)
        .join(", ");

      const data = await apiClient.post<{ suggestions?: string[] }>(
        "/modules/suggest",
        {
          body: {
            activeModules: activeModulesList,
            inactiveModules: inactiveModulesList,
          },
        },
      );

      setSuggestions(data?.suggestions ?? []);
      toast({
        title: "Sugestões geradas!",
        description: "Confira as recomendações de módulos abaixo.",
      });
    } catch (error: unknown) {
      toast({ title: "Erro", description: "Erro ao carregar sugestões", variant: "destructive" });
      toast({
        title: "Erro ao gerar sugestões",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const groupedModules = Array.isArray(modules)
    ? modules.reduce(
        (acc, module) => {
          if (!acc[module.category]) acc[module.category] = [];
          acc[module.category].push(module);
          return acc;
        },
        {} as Record<string, ModuleData[]>,
      )
    : {};

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando módulos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Settings}
          title="Administração de Módulos"
          description="Gerencie quais módulos estão ativos na sua clínica"
        />

        <ModulesToolbar
          onOpenOnboarding={() => setOnboardingOpen(true)}
          onExportConfig={handleExportConfig}
          onImportConfig={handleImportConfig}
          onGetSuggestions={handleGetSuggestions}
          loadingSuggestions={loadingSuggestions}
          onRefresh={fetchModules}
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Gestão de Módulos</AlertTitle>
        <AlertDescription>
          Alguns módulos dependem de outros para funcionar. O sistema indica
          automaticamente quando há dependências que impedem ativação ou
          desativação.
        </AlertDescription>
      </Alert>

      <ModuleSuggestions suggestions={suggestions} />

      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">{category}</h2>
            <Badge variant="info" className="text-xs">
              {categoryModules.filter((m) => m.is_active).length} /{" "}
              {categoryModules.length} ativos
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryModules.map((module) => (
              <ModuleCard
                key={module.module_key}
                module={module}
                isToggling={toggling === module.module_key}
                onToggle={handleToggle}
                onRequest={handleRequest}
              />
            ))}
          </div>
        </div>
      ))}

      {onboardingOpen && (
        <OnboardingWizard
          open={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
          onComplete={() => {
            setOnboardingOpen(false);
            fetchModules();
          }}
        />
      )}
    </div>
  );
}
