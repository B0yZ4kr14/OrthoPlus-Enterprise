// cspell:disable
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import type { BancoConfig } from "./types";

const DEFAULT_CONFIG: BancoConfig = {
  banco_nome: "",
  banco_codigo: "",
  agencia: "",
  conta: "",
  api_url: "",
  api_key: "",
  api_secret: "",
  certificado_path: "",
  ativo: true,
};

const BANCOS = [
  { codigo: "001", nome: "Banco do Brasil" },
  { codigo: "033", nome: "Santander" },
  { codigo: "104", nome: "Caixa Econômica" },
  { codigo: "237", nome: "Bradesco" },
  { codigo: "341", nome: "Itaú" },
  { codigo: "756", nome: "Sicoob" },
];

export function useConfiguracaoBancaria() {
  const { selectedClinic } = useAuth();
  const [configs, setConfigs] = useState<BancoConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<BancoConfig | null>(null);

  const loadConfigs = useCallback(async () => {
    if (!selectedClinic) return;

    try {
      const data = await apiClient.get(
        `/banco-config?clinic_id=${selectedClinic}`,
      );
      setConfigs(Array.isArray(data) ? data : data ? [data] : []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao carregar configurações: ${msg}`);
    }
  }, [selectedClinic]);

  const handleSave = async () => {
    if (!editando || !selectedClinic) return;

    setLoading(true);
    try {
      const payload = { ...editando, clinic_id: selectedClinic };

      if (editando.id) {
        await apiClient.patch(`/banco-config/${editando.id}`, payload);
        toast.success("Configuração atualizada com sucesso");
      } else {
        await apiClient.post("/banco-config", payload);
        toast.success("Configuração criada com sucesso");
      }

      setEditando(null);
      loadConfigs();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao salvar: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSincronizar = async (configId: string) => {
    setLoading(true);
    try {
      const hoje = new Date();
      const trintaDiasAtras = new Date(
        hoje.getTime() - 30 * 24 * 60 * 60 * 1000,
      );

      const data = await apiClient.post<any>("/sincronizar-extrato-bancario", {
        bancoConfigId: configId,
        dataInicio: trintaDiasAtras.toISOString().split("T")[0],
        dataFim: hoje.toISOString().split("T")[0],
      });
      toast.success(
        `${data.lancamentos_sincronizados} lançamentos sincronizados (${data.conciliados_automaticamente} conciliados)`,
      );
      loadConfigs();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao sincronizar: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta configuração bancária?"))
      return;

    try {
      await apiClient.delete(`/banco-config/${id}`);
      toast.success("Configuração excluída com sucesso");
      loadConfigs();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao excluir: ${msg}`);
    }
  };

  const updateEditando = <K extends keyof BancoConfig>(
    field: K,
    value: BancoConfig[K],
  ) => {
    setEditando((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const startNewConfig = () => setEditando(DEFAULT_CONFIG);

  return {
    configs,
    loading,
    editando,
    bancos: BANCOS,
    loadConfigs,
    handleSave,
    handleSincronizar,
    handleDelete,
    updateEditando,
    startNewConfig,
    setEditando,
  };
}
