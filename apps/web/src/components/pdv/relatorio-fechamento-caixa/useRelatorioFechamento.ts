// cspell:disable
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { RelatorioFechamentoCaixaProps, FechamentoData } from "./types";

export function useRelatorioFechamento({ caixaMovimentoId }: RelatorioFechamentoCaixaProps) {
  const { clinicId } = useAuth();
  const { toast } = useToast();
  const [gerandoSped, setGerandoSped] = useState(false);

  const { data: fechamento, isLoading } = useQuery({
    queryKey: ["fechamento-caixa", caixaMovimentoId],
    queryFn: async () => {
      const vendas: unknown[] = await apiClient.get("/pdv-vendas", {
        caixa_movimento_id: caixaMovimentoId,
      });

      const totalVendasPDV =
        vendas?.reduce((sum, v) => sum + Number((v as Record<string, number>).valor_total), 0) || 0;

      const vendaIds = vendas?.map((v) => (v as Record<string, string>).id) || [];
      const nfces: unknown[] =
        vendaIds.length > 0
          ? await apiClient.get("/nfce-emitidas", {
              venda_id: `in.(${vendaIds.join(",")})`,
            })
          : [];

      const totalNFCe =
        nfces?.reduce((sum, n) => sum + Number((n as Record<string, number>).valor_total), 0) || 0;

      const vendasComNFCe = new Set(nfces?.map((n) => (n as Record<string, string>).venda_id) || []);
      const vendasSemNFCe = vendas?.filter((v) => !vendasComNFCe.has((v as Record<string, string>).id)).length || 0;

      const divergencia = totalVendasPDV - totalNFCe;
      const percentualDivergencia = totalVendasPDV > 0 ? (divergencia / totalVendasPDV) * 100 : 0;

      return {
        totalVendasPDV,
        totalNFCe,
        divergencia,
        percentualDivergencia,
        quantidadeVendasPDV: vendas?.length || 0,
        quantidadeNFCe: nfces?.length || 0,
        vendasSemNFCe,
        vendas,
        nfces,
      } as FechamentoData;
    },
    enabled: !!caixaMovimentoId,
  });

  const gerarSpedMutation = useMutation({
    mutationFn: async () => {
      setGerandoSped(true);
      const dataHoje = new Date().toISOString().split("T")[0];

      const data = await apiClient.post("/gerar-sped-fiscal", {
        clinicId,
        dataInicio: dataHoje,
        dataFim: dataHoje,
      });

      return data;
    },
    onSuccess: (data) => {
      const blob = new Blob([(data as Record<string, string>).arquivo], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SPED_${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "SPED Fiscal gerado",
        description: `${(data as Record<string, { totalNFCe: number }>).estatisticas.totalNFCe} NFCe processadas`,
      });
      setGerandoSped(false);
    },
    onError: (error: unknown) => {
      toast({
        title: "Erro ao gerar SPED",
        description: (error as Error).message,
        variant: "destructive",
      });
      setGerandoSped(false);
    },
  });

  return { fechamento, isLoading, gerandoSped, gerarSpedMutation };
}
