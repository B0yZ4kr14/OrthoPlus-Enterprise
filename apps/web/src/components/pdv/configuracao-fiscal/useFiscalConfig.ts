// cspell:disable
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { FiscalFormData, FiscalConfig } from "./types";

const DEFAULT_FORM_DATA: FiscalFormData = {
  ambiente: "HOMOLOGACAO",
  tipo_emissao: "NFCE",
  cnpj: "",
  razao_social: "",
  nome_fantasia: "",
  inscricao_estadual: "",
  regime_tributario: "SIMPLES_NACIONAL",
  codigo_regime_tributario: 1,
  csc_id: "",
  csc_token: "",
  serie_nfce: 1,
  email_contabilidade: "",
  contingencia_enabled: false,
  is_active: true,
};

export function useFiscalConfig() {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FiscalFormData>(DEFAULT_FORM_DATA);

  const { data: fiscalConfig, isLoading } = useQuery({
    queryKey: ["faturamento-config", clinicId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ config: FiscalConfig | null }>("/faturamento/config");
        return response.config;
      } catch (error: unknown) {
        const err = error as Record<string, unknown>;
        if (err?.status !== 404) throw error;
        return null;
      }
    },
    enabled: !!clinicId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FiscalFormData) => {
      const payload = {
        cnpj_emitente: data.cnpj,
        razao_social: data.razao_social,
        ambiente: data.ambiente.toLowerCase(),
        regime_tributario: data.regime_tributario,
        inscricao_estadual: data.inscricao_estadual,
        serie_nfce: String(data.serie_nfce),
        // Map other fields as needed
      };
      await apiClient.post("/faturamento/config", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faturamento-config"] });
      toast({
        title: "Configuração salva",
        description: "Configuração fiscal atualizada com sucesso",
      });
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao salvar",
        description: msg,
        variant: "destructive",
      });
    },
  });

  const updateFormData = <K extends keyof FiscalFormData>(
    field: K,
    value: FiscalFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return {
    fiscalConfig,
    formData,
    isLoading,
    isSaving: saveMutation.isPending,
    updateFormData,
    handleSubmit,
  };
}
