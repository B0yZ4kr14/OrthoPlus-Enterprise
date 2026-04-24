// cspell:disable
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { AuthConfig } from "./types";

export function useAuthConfig() {
  const { toast } = useToast();
  const { selectedClinic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AuthConfig>({
    email_password_enabled: true,
    google_oauth_enabled: false,
    auto_confirm_email: true,
    password_min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_special_char: true,
  });

  const loadConfig = async () => {
    if (!selectedClinic) return;

    setLoading(true);
    try {
      const dataArray = await apiClient.get<Record<string, any>[]>(
        "/admin/configuracoes/auth"
      );
      const data = dataArray?.[0];

      if (data?.config_data) {
        setConfig(data.config_data as AuthConfig);
      }
    } catch (error) {
      logger.error("Erro ao carregar config auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedClinic) return;

    setSaving(true);
    try {
      await apiClient.post("/admin/configuracoes/auth", {
        config_data: config as unknown,
      });

      toast({
        title: "Configurações salvas",
        description: "Configurações de autenticação atualizadas com sucesso",
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
  };

  const updateConfig = (updates: Partial<AuthConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    loadConfig();
  }, [selectedClinic]);

  return { config, loading, saving, loadConfig, saveConfig, updateConfig };
}
