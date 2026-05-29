import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";
import { useConfetti } from "@/hooks/useConfetti";
import type { PaymentMethod } from "./types";

export function usePaymentSubmission(
  contaId: string,
  metodo: PaymentMethod,
  getPaymentData: () => {
    valorNumerico: number;
    dadosPagamento: Record<string, string>;
  },
  onSuccess: () => void,
  onClose: () => void,
  resetForm: () => void,
) {
  const { triggerSuccessConfetti } = useConfetti();
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const { valorNumerico, dadosPagamento } = getPaymentData();

        if (isNaN(valorNumerico) || valorNumerico <= 0) {
          throw new Error("Valor inválido");
        }

        const data = await apiClient.post<unknown>("/financeiro/processar", {
          conta_receber_id: contaId,
          valor: valorNumerico,
          metodo_pagamento: metodo,
          dados_pagamento: dadosPagamento,
        });

        triggerSuccessConfetti();

        toast.success("Pagamento processado com sucesso!", {
          description: `Transação: ${(data as { transacao_id?: string }).transacao_id || "N/A"}`,
        });

        resetForm();
        onSuccess();
        onClose();
      } catch (error: unknown) {
        const _e = error instanceof Error ? error : { message: String(error) };
        logger.error("Erro ao processar pagamento:", error);
        toast.error("Erro ao processar pagamento", {
          description: _e.message || "Tente novamente",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      contaId,
      metodo,
      getPaymentData,
      onSuccess,
      onClose,
      resetForm,
      triggerSuccessConfetti,
    ],
  );

  return { submit, loading };
}
