// cspell:disable
import { useState, useCallback } from "react";
import { useEstoque } from "../../hooks/useEstoque";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type { Previsao, EventoFuturo, ResumoPrevisao } from "./types";

export function usePrevisaoReposicao() {
  const { produtos, movimentacoes } = useEstoque();
  const [previsoes, setPrevisoes] = useState<Previsao[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resumo, setResumo] = useState<ResumoPrevisao | null>(null);
  const [eventosFuturos, setEventosFuturos] = useState<EventoFuturo[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const gerarPrevisoes = useCallback(async () => {
    setLoading(true);
    try {
      const produtosParaAnalise = produtos
        .filter((p) => p.quantidadeAtual <= p.quantidadeMinima * 1.5)
        .map((produto) => {
          const movimentacoesProduto = movimentacoes.filter(
            (m) => m.produtoId === produto.id,
          );

          return {
            produtoId: produto.id,
            produtoNome: produto.nome,
            quantidadeAtual: produto.quantidadeAtual,
            quantidadeMinima: produto.quantidadeMinima,
            movimentacoes: movimentacoesProduto.map((m) => ({
              data: m.createdAt,
              quantidade: m.quantidade,
              tipo: m.tipo,
            })),
          };
        });

      if (produtosParaAnalise.length === 0) {
        toast.info("Nenhum produto necessita análise de reposição no momento");
        setLoading(false);
        return;
      }

      const data = await apiClient.post<{
        previsoes: Previsao[];
        resumo: ResumoPrevisao;
      }>("/estoque/previsao/gerar", {
        produtos: produtosParaAnalise,
        eventosFuturos: eventosFuturos.length > 0 ? eventosFuturos : undefined,
      });

      setPrevisoes(data.previsoes || []);
      setResumo(data.resumo || {});
      toast.success("Previsões geradas com sucesso pela IA!");
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Erro ao gerar previsões:", error);
      toast.error(_e.message || "Erro ao gerar previsões de reposição");
    } finally {
      setLoading(false);
    }
  }, [produtos, movimentacoes, eventosFuturos]);

  const enviarAlertaEmail = useCallback(async () => {
    if (!previsoes || previsoes.length === 0) {
      toast.error("Gere as previsões antes de enviar alertas");
      return;
    }

    setSendingEmail(true);
    try {
      await apiClient.post("/estoque/previsao/alertas/email", {
        previsoes,
        resumo,
        eventosFuturos: eventosFuturos.length > 0 ? eventosFuturos : undefined,
      });

      toast.success("Alertas enviados por email para gestores!");
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Erro ao enviar alertas:", error);
      toast.error(_e.message || "Erro ao enviar alertas por email");
    } finally {
      setSendingEmail(false);
    }
  }, [previsoes, resumo, eventosFuturos]);

  const adicionarEvento = useCallback((evento: EventoFuturo) => {
    setEventosFuturos((prev) => [...prev, evento]);
    toast.success("Evento futuro adicionado! Gere as previsões novamente.");
  }, []);

  const removerEvento = useCallback((index: number) => {
    setEventosFuturos((prev) => prev.filter((_, i) => i !== index));
    toast.success("Evento removido");
  }, []);

  return {
    produtos,
    previsoes,
    loading,
    sendingEmail,
    resumo,
    eventosFuturos,
    dialogOpen,
    setDialogOpen,
    gerarPrevisoes,
    enviarAlertaEmail,
    adicionarEvento,
    removerEvento,
  };
}
