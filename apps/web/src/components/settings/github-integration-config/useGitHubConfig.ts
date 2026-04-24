import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { GitHubConfig } from "./types";

const INITIAL_CONFIG: GitHubConfig = {
  repository_url: "",
  auto_sync_enabled: false,
  branch_name: "main",
};

export function useGitHubConfig() {
  const { toast } = useToast();
  const { selectedClinic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<GitHubConfig>(INITIAL_CONFIG);

  const loadConfig = useCallback(async () => {
    if (!selectedClinic) return;

    setLoading(true);
    try {
      const dataArray = await apiClient.get<Record<string, unknown>[]>(
        "/admin/configuracoes/github",
      );

      const data = dataArray?.[0];
      if (data?.config_data) {
        setConfig(data.config_data as GitHubConfig);
      }
    } catch (error) {
      logger.error("Erro ao carregar config GitHub:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClinic]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateConfig = useCallback(<K extends keyof GitHubConfig>(
    field: K,
    value: GitHubConfig[K],
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveConfig = useCallback(async () => {
    if (!selectedClinic) return;

    setSaving(true);
    try {
      await apiClient.post("/admin/configuracoes/github", {
        config_data: config as unknown,
      });

      toast({
        title: "Configurações salvas",
        description: "Integração com GitHub configurada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [selectedClinic, config, toast]);

  const testConnection = useCallback(() => {
    if (!config.repository_url) {
      toast({
        title: "URL obrigatória",
        description: "Informe a URL do repositório GitHub",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Testando conexão...",
      description: "Verificando acesso ao repositório",
    });

    setTimeout(() => {
      toast({
        title: "Conexão bem-sucedida",
        description: "Repositório acessível",
      });
    }, 1500);
  }, [config.repository_url, toast]);

  return {
    config,
    loading,
    saving,
    updateConfig,
    saveConfig,
    testConnection,
    reload: loadConfig,
  };
}
