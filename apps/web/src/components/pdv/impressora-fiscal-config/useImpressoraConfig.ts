// cspell:disable
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { ImpressoraConfig, FormData } from "./types";

const DEFAULT_FORM_DATA: FormData = {
  tipo_equipamento: "SAT",
  numero_serie: "",
  codigo_ativacao: "",
  ip_address: "",
  porta: 7000,
  modelo: "",
  fabricante: "",
  versao_software: "",
  ativo: true,
};

export function useImpressoraConfig() {
  const { selectedClinic } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ImpressoraConfig | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);

  const loadConfig = useCallback(async () => {
    if (!selectedClinic) return;

    try {
      setLoading(true);
      try {
        const data = await apiClient.get<ImpressoraConfig | ImpressoraConfig[]>(
          "/sat-mfe-config",
          {
            params: { clinic_id: selectedClinic },
          },
        );
        const configData = Array.isArray(data) ? data[0] : data;
        if (configData) {
          setConfig(configData);
          setFormData({
            tipo_equipamento: configData.tipo_equipamento,
            numero_serie: configData.numero_serie,
            codigo_ativacao: configData.codigo_ativacao,
            ip_address: configData.ip_address || "",
            porta: configData.porta || 7000,
            modelo: configData.modelo || "",
            fabricante: configData.fabricante || "",
            versao_software: configData.versao_software || "",
            ativo: configData.ativo,
          });
        }
      } catch (error: unknown) {
        if ((error as { status?: number })?.status !== 404) throw error;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("Error loading config:", error);
      toast({
        title: "Erro ao carregar configuração",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClinic, toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;

    try {
      setSaving(true);

      const payload = {
        ...formData,
        clinic_id: selectedClinic,
        porta: Number(formData.porta),
      };

      if (config) {
        await apiClient.patch(`/sat-mfe-config/${config.id}`, payload);
        toast({
          title: "Configuração atualizada",
          description: "Impressora fiscal configurada com sucesso",
        });
      } else {
        await apiClient.post("/sat-mfe-config", payload);
        toast({
          title: "Configuração criada",
          description: "Impressora fiscal configurada com sucesso",
        });
      }

      loadConfig();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
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

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return { config, formData, loading, saving, updateFormData, handleSubmit };
}
