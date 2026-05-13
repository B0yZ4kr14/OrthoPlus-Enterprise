/**
 * useModulos Hook
 * Hook para gestão de módulos do sistema via REST API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface Module {
  id: number;
  module_key: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  dependencies?: string[];
}

interface ModulesResponse {
  modules: Module[];
}

export const useModulos = () => {
  const queryClient = useQueryClient();

  // Listar todos os módulos
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["modulos"],
    queryFn: async () => {
      return await apiClient.get<ModulesResponse>("/configuracoes/modulos");
    },
    enabled: !!token,
  });

  // Toggle módulo (ativar/desativar)
  const toggleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      return await apiClient.post(`/configuracoes/modulos/${moduleId}/toggle`);
    },
    onSuccess: (response: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["modulos"] });
      const res = response as { module: { is_active: boolean } };
      const action = res.module.is_active ? "ativado" : "desativado";
      toast.success(`Módulo ${action} com sucesso!`);
    },
    onError: (error: unknown) => {
      // Erro 412 indica dependências não atendidas
      const axiosErr = error as { response?: { status?: number; data?: { error?: string } } };
      if (axiosErr.response?.status === 412) {
        toast.error(
          axiosErr.response.data?.error ??
            "Falha ao alterar módulo devido a dependências",
        );
      }
    },
  });

  // Obter dependências entre módulos
  const { data: dependencies } = useQuery({
    queryKey: ["modulos", "dependencies"],
    queryFn: async () => {
      return await apiClient.get("/configuracoes/modulos/dependencies");
    },
    enabled: !!token,
  });

  // Helper para verificar se módulo está ativo
  const isModuleActive = (moduleKey: string): boolean => {
    return (
      data?.modules.find((m) => m.module_key === moduleKey)?.is_active || false
    );
  };

  // Obter módulos ativos
  const activeModules = data?.modules.filter((m) => m.is_active) || [];

  // Obter módulos por categoria
  const getModulesByCategory = (category: string) => {
    return data?.modules.filter((m) => m.category === category) || [];
  };

  return {
    modules: data?.modules || [],
    activeModules,
    isLoading,
    error,
    toggleModule: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    dependencies,
    isModuleActive,
    getModulesByCategory,
  };
};
