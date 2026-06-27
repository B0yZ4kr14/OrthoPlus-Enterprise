import { Module } from "@/core/config/modules.config";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ToggleModuleResponse {
  error?: string;
  success?: boolean;
  message?: string;
}

// Cache simples para módulos (5 minutos)
let modulesCache: { data: Module[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadModules = useCallback(
    async (forceRefresh = false) => {
      try {
        // Verificar cache
        if (
          !forceRefresh &&
          modulesCache &&
          Date.now() - modulesCache.timestamp < CACHE_DURATION
        ) {
          setModules(modulesCache.data);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const data = await apiClient.get<{ modules: Module[] }>(
          "/configuracoes/modulos/clinic",
        );

        if (!data || !data.modules) {
          throw new Error("Resposta inválida do servidor");
        }

        // Atualizar cache
        modulesCache = {
          data: data.modules,
          timestamp: Date.now(),
        };

        setModules(data.modules);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast({
          title: "Erro ao carregar módulos",
          description: "Não foi possível carregar seus módulos. Tente novamente.",
          variant: "destructive",
        });
        toast({
          title: "Erro ao carregar módulos",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const toggleModule = useCallback(
    async (moduleKey: string) => {
      try {
        const data = await apiClient.post<ToggleModuleResponse>(
          "/configuracoes/modulos/toggle",
          { module_key: moduleKey },
        );

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.success) {
          toast({
            title: "Módulo atualizado",
            description:
              data.message || "O status do módulo foi alterado com sucesso.",
          });
          // Invalidar cache e recarregar
          modulesCache = null;
          await loadModules(true);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao alterar status";
        toast({
          title: "Erro ao alterar módulo",
          description: "Não foi possível alterar o estado do módulo.",
          variant: "destructive",
        });
        toast({
          title: "Erro ao alterar módulo",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [toast, loadModules],
  );

  // Memoizar lista de módulos ativos
  const activeModules = useMemo(
    () => modules.filter((m) => m.is_active).map((m) => m.module_key),
    [modules],
  );

  return {
    modules,
    loading,
    error,
    loadModules,
    toggleModule,
    activeModules, // Exportar lista de módulos ativos
  };
}
