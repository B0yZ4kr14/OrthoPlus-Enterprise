// cspell:disable
import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type { CupomFiscalProps } from "./types";

export function useCupomFiscal({ venda, items }: CupomFiscalProps) {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const cupomRef = useRef<HTMLDivElement>(null);

  const emitirNFCeMutation = useMutation({
    mutationFn: async () => {
      const data: Record<string, any> = await apiClient.post("/emitir-nfce", {
        vendaId: venda.id,
        clinicId: clinicId,
        items: items,
        valorTotal: venda.valor_total,
      });
      return data;
    },
    onSuccess: async (data) => {
      toast({
        title: "NFCe emitida com sucesso",
        description: `Chave: ${data.nfce.chave_acesso}`,
      });
      await imprimirCupomFiscal();
    },
    onError: (error: unknown) => {
      toast({
        title: "Erro ao emitir NFCe",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const imprimirCupomFiscal = async () => {
    try {
      const data: Record<string, any> = await apiClient.post("/imprimir-cupom-sat", {
        vendaId: venda.id,
        clinicId: clinicId,
        items: (items as Record<string, any>[]).map((item) => ({
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
        })),
        valorTotal: venda.valor_total,
        formaPagamento: venda.forma_pagamento || "DINHEIRO",
      });

      if (data.success) {
        toast({
          title: "Cupom fiscal impresso",
          description: `Autorização: ${data.codigoAutorizacao}`,
        });
      } else {
        throw new Error(data.mensagem || "Erro ao imprimir cupom fiscal");
      }
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Error printing fiscal coupon:", error);
      toast({
        title: "Erro ao imprimir cupom fiscal",
        description: _e.message,
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (cupomRef.current) {
      const printWindow = window.open("", "", "height=600,width=400");
      if (printWindow) {
        printWindow.document.write("<html><head><title>Cupom Fiscal</title>");
        printWindow.document.write("<style>");
        printWindow.document.write(`
          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
          .cupom { max-width: 80mm; margin: 0 auto; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
          .right { text-align: right; }
        `);
        printWindow.document.write("</style></head><body>");
        printWindow.document.write(cupomRef.current.innerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const valorTotal = (items as Record<string, any>[]).reduce(
    (sum, item) => sum + item.valor_unitario * item.quantidade,
    0
  );

  return {
    cupomRef,
    emitirNFCeMutation,
    handlePrint,
    valorTotal,
  };
}
