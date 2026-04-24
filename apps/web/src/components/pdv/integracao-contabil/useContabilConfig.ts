/**
 * Hook para gerenciamento de dados de integração contábil
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type { ContabilConfig, ContabilEnvio, ConfigFormData } from "./types";

interface UseContabilConfigReturn {
  configs: ContabilConfig[];
  envios: ContabilEnvio[];
  loading: boolean;
  saving: boolean;
  loadData: () => Promise<void>;
  saveConfig: (formData: ConfigFormData, clinicId: string) => Promise<void>;
  enviarManual: (software: string, clinicId: string) => Promise<void>;
}

export function useContabilConfig(
  selectedClinic: string | null,
  toast: (props: { title: string; description?: string; variant?: "default" | "destructive" }) => void
): UseContabilConfigReturn {
  const [configs, setConfigs] = useState<ContabilConfig[]>([]);
  const [envios, setEnvios] = useState<ContabilEnvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedClinic) return;

    try {
      setLoading(true);

      const [configsData, enviosData] = await Promise.all([
        apiClient.get<ContabilConfig[]>("/integracao-contabil-config", {
          params: { clinic_id: selectedClinic },
        }),
        apiClient.get<ContabilEnvio[]>("/integracao-contabil-envios", {
          params: { clinic_id: selectedClinic },
        }),
      ]);

      const configsList = Array.isArray(configsData)
        ? configsData
        : [configsData].filter(Boolean);
      const enviosList = Array.isArray(enviosData)
        ? enviosData
        : [enviosData].filter(Boolean);

      setConfigs(
        configsList.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setEnvios(
        enviosList
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 50)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClinic, toast]);

  const saveConfig = async (formData: ConfigFormData, clinicId: string) => {
    try {
      setSaving(true);

      const payload = {
        ...formData,
        clinic_id: clinicId,
      };

      await apiClient.post("/integracao-contabil-config/upsert", payload);

      toast({
        title: "Configuração salva",
        description: "Integração contábil configurada com sucesso",
      });

      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("Error saving config:", error);
      toast({
        title: "Erro ao salvar configuração",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const enviarManual = async (software: string, clinicId: string) => {
    try {
      const periodo = new Date().toISOString().slice(0, 7); // YYYY-MM

      await apiClient.post("/enviar-dados-contabilidade", {
        clinicId: clinicId,
        tipoDocumento: "SPED_FISCAL",
        periodoReferencia: periodo,
        forcarEnvio: true,
      });

      toast({
        title: "Envio iniciado",
        description: `Enviando dados para ${software}...`,
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar",
        description: error?.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    configs,
    envios,
    loading,
    saving,
    loadData,
    saveConfig,
    enviarManual,
  };
}
