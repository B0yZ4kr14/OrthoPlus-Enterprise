import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { TEFTransaction, TEFOperationType } from "./types";

export function useTEFPayment(
  vendaId: string,
  valorTotal: number,
  onSuccess?: () => void,
) {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const [processando, setProcessando] = useState(false);
  const [tipoOperacao, setTipoOperacao] = useState<TEFOperationType>("DEBITO");
  const [numParcelas, setNumParcelas] = useState(1);
  const [transacao, setTransacao] = useState<TEFTransaction["transacao"] | null>(null);
  const [showComprovante, setShowComprovante] = useState(false);

  const processar = useCallback(async () => {
    try {
      setProcessando(true);

      const data = await apiClient.post<TEFTransaction>("/processar-pagamento-tef", {
        clinic_id: clinicId,
        venda_id: vendaId,
        tipo_operacao: tipoOperacao,
        valor: valorTotal,
        num_parcelas: tipoOperacao === "CREDITO" ? numParcelas : 1,
        provedor: "SITEF",
      });

      if (data.success) {
        setTransacao(data.transacao);
        setShowComprovante(true);
        toast({
          title: "Pagamento Aprovado",
          description: `Transação aprovada com sucesso. NSU: ${data.transacao.nsu_sitef}`,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Pagamento Negado",
          description: data.error || "A transação foi negada pela operadora",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("Erro ao processar TEF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento via TEF",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  }, [clinicId, vendaId, tipoOperacao, valorTotal, numParcelas, onSuccess, toast]);

  const reset = useCallback(() => {
    setShowComprovante(false);
    setTransacao(null);
  }, []);

  return {
    processando,
    tipoOperacao,
    setTipoOperacao,
    numParcelas,
    setNumParcelas,
    transacao,
    showComprovante,
    setShowComprovante,
    processar,
    reset,
  };
}
