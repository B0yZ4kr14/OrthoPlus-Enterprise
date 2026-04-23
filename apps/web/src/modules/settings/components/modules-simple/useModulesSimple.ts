// cspell:disable
import { useState, useCallback, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type { Module, RoadmapData } from "./types";

const categoryOrder = [
  "Atendimento Clínico",
  "Gestão Financeira",
  "Relacionamento & Vendas",
  "Conformidade & Legal",
  "Tecnologias Avançadas",
  "Outros",
];

export function useModulesSimple() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  const fetchModules = useCallback(async () => {
    try {
      const data = await apiClient.post<{ modules: Module[] }>(
        "/modules/my-modules",
      );
      setModules(data?.modules ?? []);
    } catch (error) {
      logger.error("Erro ao carregar módulos", error);
      toast.error("Erro ao carregar módulos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleToggle = useCallback(async (moduleKey: string) => {
    setToggling(moduleKey);

    try {
      const data = await apiClient.post<{ cascade_activated?: number; message?: string }>(
        "/modules/toggle",
        { module_key: moduleKey },
      );

      if ((data?.cascade_activated ?? 0) > 0) {
        toast.success(data.message ?? "Módulos ativados!");
      } else {
        toast.success("Módulo atualizado com sucesso!");
      }

      await fetchModules();
    } catch (error: unknown) {
      logger.error("Erro ao alternar módulo", error, { moduleKey });
      toast.error(error instanceof Error ? error.message : "Erro ao alterar módulo");
    } finally {
      setToggling(null);
    }
  }, [fetchModules]);

  const handleLoadRoadmap = useCallback(async () => {
    setLoadingRoadmap(true);

    try {
      const data = await apiClient.post<RoadmapData>(
        "/modules/recommend-sequence",
      );

      setRoadmapData(data);
      setShowRoadmap(true);
      toast.success("Roadmap de adoção gerado com sucesso!");
    } catch (error: unknown) {
      logger.error("Erro ao gerar roadmap", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar roadmap de adoção");
    } finally {
      setLoadingRoadmap(false);
    }
  }, []);

  const handleActivatePhase = useCallback(async (moduleNames: string[]) => {
    const modulesToActivate = modules.filter((m) =>
      moduleNames.some(
        (name) => m.name.includes(name) || name.includes(m.name),
      ),
    );

    for (const module of modulesToActivate) {
      if (!module.is_active) {
        await handleToggle(module.module_key);
      }
    }

    toast.success(`${modulesToActivate.length} módulo(s) ativado(s) com sucesso!`);
    setShowRoadmap(false);
  }, [modules, handleToggle]);

  const handleWizardActivate = useCallback(async (moduleKeys: string[]) => {
    for (const key of moduleKeys) {
      const module = modules.find((m) => m.module_key === key);
      if (module && !module.is_active) {
        await handleToggle(key);
      }
    }
  }, [modules, handleToggle]);

  const groupedModules = useMemo(() => {
    const grouped: Record<string, Module[]> = {};
    modules.forEach((mod) => {
      const category = mod.category || "Outros";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(mod);
    });
    return grouped;
  }, [modules]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedModules).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedModules]);

  const toggleExpandedModule = useCallback((moduleKey: string) => {
    setExpandedModule((prev) => (prev === moduleKey ? null : moduleKey));
  }, []);

  return {
    modules,
    loading,
    toggling,
    showPreview,
    showWizard,
    showRoadmap,
    expandedModule,
    roadmapData,
    loadingRoadmap,
    groupedModules,
    sortedCategories,
    setShowPreview,
    setShowWizard,
    setShowRoadmap,
    handleToggle,
    handleLoadRoadmap,
    handleActivatePhase,
    handleWizardActivate,
    toggleExpandedModule,
  };
}
