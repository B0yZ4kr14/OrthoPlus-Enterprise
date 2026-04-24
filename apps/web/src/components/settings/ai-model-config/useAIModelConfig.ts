// cspell:disable
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type { AIModelConfig } from "./types";

interface UseAIModelConfigProps {
  selectedClinic: string | null;
}

export function useAIModelConfig({ selectedClinic }: UseAIModelConfigProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<AIModelConfig>({
    default_provider: "lovable",
    temperature: 0.7,
    max_tokens: 2000,
  });

  const loadConfig = useCallback(async () => {
    if (!selectedClinic) return;

    setLoading(true);
    try {
      const dataArray = await apiClient.get<Record<string, unknown>[]>(
        "/admin/configuracoes/ai_models"
      );

      const data = dataArray?.[0];

      if (data?.config_data) {
        setConfig(data.config_data as AIModelConfig);
      }
    } catch (error) {
      logger.error("Erro ao carregar config IA:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClinic]);

  useEffect(() => {
    loadConfig();
  }, [selectedClinic, loadConfig]);

  const saveConfig = useCallback(async () => {
    if (!selectedClinic) return;

    setSaving(true);
    try {
      await apiClient.post("/admin/configuracoes/ai_models", {
        config_data: config as unknown,
      });

      toast({
        title: "Configurações salvas",
        description: "Modelos de IA configurados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [selectedClinic, config, toast]);

  const toggleShowKey = useCallback((provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  }, []);

  const updateConfig = useCallback((updates: Partial<AIModelConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    config,
    loading,
    saving,
    showKeys,
    loadConfig,
    saveConfig,
    toggleShowKey,
    updateConfig,
  };
}
