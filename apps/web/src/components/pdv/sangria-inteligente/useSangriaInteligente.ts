// cspell:disable
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import type { SugestaoIA } from "./types";

export function useSangriaInteligente(caixaId: string, valorAtualCaixa: number) {
  const { clinicId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [valorSangria, setValorSangria] = useState<number>(0);
  const [observacoes, setObservacoes] = useState("");

  const {
    data: sugestaoIA,
    isLoading,
    refetch,
  } = useQuery<SugestaoIA>({
    queryKey: ["sugestao-sangria", clinicId, valorAtualCaixa],
    queryFn: async () => {
      const data = await apiClient.post<SugestaoIA>("/sugerir-sangria-ia", {
        clinicId: clinicId || "",
        valorAtualCaixa,
      });
      return data;
    },
    enabled: !!clinicId && valorAtualCaixa > 0,
    refetchInterval: 300000,
  });

  useEffect(() => {
    if (sugestaoIA?.deveSugerirSangria && sugestaoIA?.valorSugerido > 0) {
      setValorSangria(sugestaoIA.valorSugerido);
      setObservacoes(`Sangria sugerida automaticamente pela IA: ${sugestaoIA.motivo}`);
    }
  }, [sugestaoIA]);

  const sangriaMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      await apiClient.post("/caixa-movimentos", {
        clinic_id: clinicId,
        caixa_id: caixaId,
        tipo: "SANGRIA",
        valor: valorSangria,
        observacoes,
        motivo_sangria: sugestaoIA?.deveSugerirSangria ? sugestaoIA.motivo : "Manual",
        sugerido_por_ia: sugestaoIA?.deveSugerirSangria || false,
        risco_calculado: sugestaoIA?.analise?.riscoPercentual || 0,
        horario_risco: new Date().getHours().toString(),
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caixa-movimentos"] });
      sonnerToast.success(`R$ ${valorSangria.toFixed(2)} removido do caixa`);
      setValorSangria(0);
      setObservacoes("");
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao realizar sangria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSangria = useCallback(() => {
    if (valorSangria <= 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um valor maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (valorSangria > valorAtualCaixa) {
      toast({
        title: "Valor inválido",
        description: "Valor da sangria não pode ser maior que o disponível em caixa",
        variant: "destructive",
      });
      return;
    }

    sangriaMutation.mutate();
  }, [valorSangria, valorAtualCaixa, sangriaMutation, toast]);

  return {
    sugestaoIA,
    isLoading,
    valorSangria,
    setValorSangria,
    observacoes,
    setObservacoes,
    isPending: sangriaMutation.isPending,
    handleSangria,
  };
}
