// cspell:disable
import {useMemo} from "react";
import { useEstoque } from "@/modules/estoque/hooks/useEstoque";
import type {
  AnaliseStats,
  FornecedorHistorico,
  ProdutoMaisPedido,
  EvolucaoPedido,
  StatusDistribuicao,
} from "./types";

export function useAnalisePedidos() {
  const { pedidos, pedidosItens, produtos, fornecedores, loading } =
    useEstoque();

  const stats: AnaliseStats = useMemo(() => {
    if (pedidos.length === 0) {
      return {
        totalPedidos: 0,
        pedidosAutomaticos: 0,
        valorTotal: 0,
        tempoMedioEntrega: 0,
        economiaAutomacao: 0,
      };
    }

    const totalPedidos = pedidos.length;
    const pedidosAutomaticos = pedidos.filter(
      (p) => p.geradoAutomaticamente,
    ).length;
    const valorTotal = pedidos.reduce((sum, p) => sum + (p.valorTotal || 0), 0);

    const pedidosRecebidos = pedidos.filter(
      (p) =>
        p.status === "RECEBIDO" && p.dataPrevistaEntrega && p.dataRecebimento,
    );
    const tempoMedioEntrega =
      pedidosRecebidos.length > 0
        ? pedidosRecebidos.reduce((sum, p) => {
            const prevista = new Date(p.dataPrevistaEntrega!);
            const recebida = new Date(p.dataRecebimento!);
            const dias = Math.ceil(
              (recebida.getTime() - prevista.getTime()) / (1000 * 60 * 60 * 24),
            );
            return sum + Math.abs(dias);
          }, 0) / pedidosRecebidos.length
        : 0;

    const custoMedioHora = 50;
    const tempoMedioPedidoManual = 0.25;
    const economiaAutomacao =
      pedidosAutomaticos * custoMedioHora * tempoMedioPedidoManual;

    return {
      totalPedidos,
      pedidosAutomaticos,
      valorTotal,
      tempoMedioEntrega,
      economiaAutomacao,
    };
  }, [pedidos]);

  const historicoFornecedor: FornecedorHistorico[] = useMemo(() => {
    const fornecedorMap = new Map<
      string,
      { total: number; quantidade: number; nome: string }
    >();

    pedidos.forEach((pedido) => {
      const fornecedorId = pedido.fornecedorId;
      if (!fornecedorId) return;
      const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
      if (fornecedor) {
        const current = fornecedorMap.get(fornecedorId) || {
          total: 0,
          quantidade: 0,
          nome: fornecedor.nome,
        };
        fornecedorMap.set(fornecedorId, {
          total: current.total + (pedido.valorTotal || 0),
          quantidade: current.quantidade + 1,
          nome: fornecedor.nome,
        });
      }
    });

    return Array.from(fornecedorMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [pedidos, fornecedores]);

  const produtosMaisPedidos: ProdutoMaisPedido[] = useMemo(() => {
    const produtoMap = new Map<
      string,
      { quantidade: number; nome: string; valor: number }
    >();

    pedidosItens.forEach((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (produto) {
        const current = produtoMap.get(item.produtoId) || {
          quantidade: 0,
          nome: produto.nome,
          valor: 0,
        };
        produtoMap.set(item.produtoId, {
          quantidade: current.quantidade + item.quantidade,
          nome: produto.nome,
          valor: current.valor + (item.valorTotal || 0),
        });
      }
    });

    return Array.from(produtoMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [pedidosItens, produtos]);

  const evolucaoPedidos: EvolucaoPedido[] = useMemo(() => {
    const mesesMap = new Map<string, { manual: number; automatico: number }>();

    pedidos.forEach((pedido) => {
      const data = new Date(pedido.dataPedido);
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;

      const current = mesesMap.get(mesAno) || { manual: 0, automatico: 0 };
      if (pedido.geradoAutomaticamente) {
        current.automatico++;
      } else {
        current.manual++;
      }
      mesesMap.set(mesAno, current);
    });

    return Array.from(mesesMap.entries())
      .map(([mes, dados]) => ({
        mes,
        manual: dados.manual,
        automatico: dados.automatico,
        total: dados.manual + dados.automatico,
      }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split("/").map(Number);
        const [mesB, anoB] = b.mes.split("/").map(Number);
        return anoA === anoB ? mesA - mesB : anoA - anoB;
      });
  }, [pedidos]);

  const statusDistribution: StatusDistribuicao[] = useMemo(() => {
    const statusMap = new Map<string, number>();
    const labels: Record<string, string> = {
      PENDENTE: "Pendente",
      ENVIADO: "Enviado",
      RECEBIDO: "Recebido",
      CANCELADO: "Cancelado",
    };

    pedidos.forEach((pedido) => {
      const current = statusMap.get(pedido.status) || 0;
      statusMap.set(pedido.status, current + 1);
    });

    return Array.from(statusMap.entries()).map(([status, quantidade]) => ({
      name: labels[status] || status,
      value: quantidade,
    }));
  }, [pedidos]);

  return {
    loading,
    pedidos,
    stats,
    historicoFornecedor,
    produtosMaisPedidos,
    evolucaoPedidos,
    statusDistribution,
  };
}
