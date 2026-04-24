// cspell:disable
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { formatDate } from "@/lib/utils/date.utils";
import type {
  FornecedorIntegracao,
  PedidoAutomatico,
  Metrics,
  StatusData,
  HistoricoData,
} from "./types";

export function useEstoqueIntegracoes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState<FornecedorIntegracao[]>([]);
  const [pedidos, setPedidos] = useState<PedidoAutomatico[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalPedidos: 0,
    pedidosEnviados: 0,
    pedidosConfirmados: 0,
    pedidosFalhos: 0,
    taxaSucesso: 0,
    tempoMedioResposta: 0,
  });
  const [testingAPI, setTestingAPI] = useState<string | null>(null);

  const calculateMetrics = useCallback((pedidosData: PedidoAutomatico[]): Metrics => {
    const total = pedidosData?.length || 0;
    const enviados =
      pedidosData?.filter(
        (p) => p.status === "enviado" || p.status === "confirmado",
      ).length || 0;
    const confirmados =
      pedidosData?.filter((p) => p.status === "confirmado").length || 0;
    const falhos =
      pedidosData?.filter((p) => p.status === "cancelado").length || 0;
    const taxaSucesso = total > 0 ? (confirmados / total) * 100 : 0;
    const tempoMedio = 2.5; // segundos (mock)

    return {
      totalPedidos: total,
      pedidosEnviados: enviados,
      pedidosConfirmados: confirmados,
      pedidosFalhos: falhos,
      taxaSucesso,
      tempoMedioResposta: tempoMedio,
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [fornecedoresData, pedidosData] = await Promise.all([
        apiClient.get<FornecedorIntegracao[]>("/estoque/fornecedores?api_enabled=true"),
        apiClient.get<PedidoAutomatico[]>("/estoque/pedidos/automaticos?limit=100"),
      ]);

      setFornecedores(fornecedoresData || []);
      setPedidos(pedidosData || []);
      setMetrics(calculateMetrics(pedidosData || []));
    } catch (error) {
      logger.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações de integração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, calculateMetrics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTestarAPI = useCallback(async (fornecedorId: string) => {
    try {
      setTestingAPI(fornecedorId);

      const data = await apiClient.post<{ message?: string }>(`/estoque/integracoes/testar-api`, {
        fornecedor_id: fornecedorId,
      });

      toast({
        title: "Teste concluído",
        description: data.message || "Pedido de teste enviado com sucesso",
      });

      loadData();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Erro ao testar API:", error);
      toast({
        title: "Erro no teste",
        description: _e.message || "Não foi possível testar a API",
        variant: "destructive",
      });
    } finally {
      setTestingAPI(null);
    }
  }, [toast, loadData]);

  const handleDisparaPedidosAutomaticos = useCallback(async () => {
    try {
      setLoading(true);

      const data = await apiClient.post<{ message?: string }>(
        "/estoque/pedidos/disparar-automaticos",
        {},
      );

      toast({
        title: "Pedidos enviados",
        description:
          data.message || "Pedidos automáticos processados com sucesso",
      });

      loadData();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Erro ao disparar pedidos:", error);
      toast({
        title: "Erro ao disparar pedidos",
        description:
          _e.message || "Não foi possível processar os pedidos automáticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, loadData]);

  const statusData: StatusData[] = useMemo(() => [
    { name: "Enviados", value: metrics.pedidosEnviados, color: "#3b82f6" },
    { name: "Confirmados", value: metrics.pedidosConfirmados, color: "#10b981" },
    { name: "Falhos", value: metrics.pedidosFalhos, color: "#ef4444" },
  ], [metrics]);

  const historicoData: HistoricoData[] = useMemo(() =>
    pedidos
      .slice(0, 10)
      .map((p) => ({
        data: formatDate(p.created_at, "dd/MM"),
        enviados: p.status === "enviado" || p.status === "confirmado" ? 1 : 0,
        falhos: p.status === "cancelado" ? 1 : 0,
      }))
      .reverse(),
  [pedidos]);

  return {
    loading,
    fornecedores,
    pedidos,
    metrics,
    testingAPI,
    statusData,
    historicoData,
    loadData,
    handleTestarAPI,
    handleDisparaPedidosAutomaticos,
  };
}
