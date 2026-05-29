import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { ContaReceber } from "../../types/financeiro-completo.types";

export function useContasReceber() {
  const { user, selectedClinic } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterPeriodo, setFilterPeriodo] = useState<string>("mes");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);
  const [sendingCobranca, setSendingCobranca] = useState<string | null>(null);

  const loadContasReceber = useCallback(async () => {
    if (!user || !selectedClinic) return;

    try {
      const data = await apiClient.get<ContaReceber[]>(
        "/financeiro/contas-receber",
      );
      setContasReceber(data || []);
    } catch (error) {
      console.error("Erro ao carregar contas a receber:", error);
      toast.error("Erro ao carregar contas a receber");
    } finally {
      setLoading(false);
    }
  }, [user, selectedClinic]);

  const addContaReceber = async (
    conta: Omit<ContaReceber, "id" | "created_at" | "updated_at">,
  ) => {
    if (!user || !selectedClinic) return;

    try {
      const payload = {
        ...conta,
        clinic_id: selectedClinic,
        created_by: user.id,
      };

      const data = await apiClient.post<ContaReceber>(
        "/financeiro/contas-receber",
        payload,
      );
      await loadContasReceber();
      toast.success("Conta a receber adicionada com sucesso!");
      return data || null;
    } catch (error) {
      console.error("Erro ao adicionar conta a receber:", error);
      toast.error("Erro ao adicionar conta a receber");
      throw error;
    }
  };

  const updateContaReceber = async (
    id: string,
    updates: Partial<ContaReceber>,
  ) => {
    try {
      await apiClient.patch(`/financeiro/contas-receber/${id}`, updates);
      await loadContasReceber();
      toast.success("Conta a receber atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar conta a receber:", error);
      toast.error("Erro ao atualizar conta a receber");
      throw error;
    }
  };

  const deleteContaReceber = async (id: string) => {
    try {
      await apiClient.delete(`/financeiro/contas-receber/${id}`);
      await loadContasReceber();
      toast.success("Conta a receber excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir conta a receber:", error);
      toast.error("Erro ao excluir conta a receber");
      throw error;
    }
  };

  const handleEnviarCobranca = async (id: string) => {
    setSendingCobranca(id);
    try {
      // Simulação de envio de cobrança (WhatsApp/Email)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Cobrança enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar cobrança");
    } finally {
      setSendingCobranca(null);
    }
  };

  const handleOpenPayment = (conta: ContaReceber) => {
    setSelectedConta(conta);
    setPaymentDialogOpen(true);
  };

  const exportarPDF = () => {
    toast.info("Exportando relatório PDF...");
    // Lógica delegada ou utilitária
  };

  const exportarExcel = () => {
    toast.info("Exportando relatório Excel...");
    // Lógica delegada ou utilitária
  };

  // Filtragem local para performance
  const filteredContas = useMemo(() => {
    return contasReceber.filter((conta) => {
      const matchesSearch =
        conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conta.patient_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "todos" || conta.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [contasReceber, searchTerm, filterStatus]);

  useEffect(() => {
    loadContasReceber();
  }, [loadContasReceber]);

  return {
    state: {
      contasReceber,
      filteredContas,
      loading,
      searchTerm,
      filterStatus,
      filterPeriodo,
      dialogOpen,
      paymentDialogOpen,
      selectedConta,
      sendingCobranca,
    },
    actions: {
      setSearchTerm,
      setFilterStatus,
      setFilterPeriodo,
      setDialogOpen,
      setPaymentDialogOpen,
      setSelectedConta,
      loadContasReceber,
      addContaReceber,
      updateContaReceber,
      deleteContaReceber,
      handleEnviarCobranca,
      handleOpenPayment,
      exportarPDF,
      exportarExcel,
    },
  };
}
