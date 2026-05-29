// cspell:disable
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Periodo,
  Venda,
  Stats,
  VendedorData,
  ProdutoData,
  HorarioData,
  PagamentoData,
  TempoData,
} from "./types";

export function useDashboardVendasPDV() {
  const { clinicId } = useAuth();
  const [periodo, setPeriodo] = useState<Periodo>("30d");

  const { data: vendas, isLoading } = useQuery({
    queryKey: ["pdv-vendas-analytics", clinicId, periodo],
    queryFn: async () => {
      const diasAtras = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);

      const data = await apiClient.get<Venda[]>("/financeiro/vendas-pdv", {
        params: { start_date: dataInicio.toISOString() },
      });
      return data || [];
    },
    enabled: !!clinicId,
  });

  const stats: Stats = useMemo(
    () => ({
      totalVendas: vendas?.length || 0,
      valorTotal:
        vendas?.reduce((sum, v) => sum + Number(v.valor_total), 0) || 0,
      ticketMedio: vendas?.length
        ? vendas.reduce((sum, v) => sum + Number(v.valor_total), 0) /
          vendas.length
        : 0,
      itensVendidos:
        vendas?.reduce((sum, v) => sum + (v.pdv_venda_itens?.length || 0), 0) ||
        0,
    }),
    [vendas],
  );

  const vendedoresData: VendedorData[] = useMemo(() => {
    const vendasPorVendedor =
      vendas?.reduce(
        (acc, venda) => {
          const vendedorId = venda.created_by;
          if (!acc[vendedorId]) {
            acc[vendedorId] = {
              vendedor: vendedorId.slice(0, 8),
              total: 0,
              quantidade: 0,
            };
          }
          acc[vendedorId].total += Number(venda.valor_total);
          acc[vendedorId].quantidade += 1;
          return acc;
        },
        {} as Record<string, VendedorData>,
      ) || {};

    return Object.values(vendasPorVendedor)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [vendas]);

  const produtosData: ProdutoData[] = useMemo(() => {
    const produtosMaisVendidos =
      vendas?.reduce(
        (acc, venda) => {
          venda.pdv_venda_itens?.forEach((item) => {
            const descricao = item.descricao || "Sem descrição";
            if (!acc[descricao]) {
              acc[descricao] = { produto: descricao, quantidade: 0, valor: 0 };
            }
            acc[descricao].quantidade += Number(item.quantidade);
            acc[descricao].valor += Number(item.valor_total);
          });
          return acc;
        },
        {} as Record<string, ProdutoData>,
      ) || {};

    return Object.values(produtosMaisVendidos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [vendas]);

  const horariosData: HorarioData[] = useMemo(() => {
    const vendasPorHora =
      vendas?.reduce(
        (acc, venda) => {
          const hora = new Date(venda.created_at).getHours();
          if (!acc[hora]) {
            acc[hora] = { hora: `${hora}:00`, vendas: 0, valor: 0 };
          }
          acc[hora].vendas += 1;
          acc[hora].valor += Number(venda.valor_total);
          return acc;
        },
        {} as Record<number, HorarioData>,
      ) || {};

    return Object.values(vendasPorHora).sort((a, b) => {
      const horaA = parseInt(a.hora.split(":")[0]);
      const horaB = parseInt(b.hora.split(":")[0]);
      return horaA - horaB;
    });
  }, [vendas]);

  const pagamentosData: PagamentoData[] = useMemo(() => {
    const formasPagamento =
      vendas?.reduce(
        (acc, venda) => {
          venda.pdv_pagamentos?.forEach((pag) => {
            const forma = pag.forma_pagamento;
            if (!acc[forma]) {
              acc[forma] = { name: forma, value: 0 };
            }
            acc[forma].value += Number(pag.valor);
          });
          return acc;
        },
        {} as Record<string, PagamentoData>,
      ) || {};

    return Object.values(formasPagamento);
  }, [vendas]);

  const tempoData: TempoData[] = useMemo(() => {
    const vendasTempo =
      vendas?.reduce(
        (acc, venda) => {
          const data = new Date(venda.created_at).toLocaleDateString("pt-BR");
          if (!acc[data]) {
            acc[data] = { data, vendas: 0, valor: 0 };
          }
          acc[data].vendas += 1;
          acc[data].valor += Number(venda.valor_total);
          return acc;
        },
        {} as Record<string, TempoData>,
      ) || {};

    return Object.values(vendasTempo).slice(-30);
  }, [vendas]);

  return {
    periodo,
    setPeriodo,
    vendas,
    isLoading,
    stats,
    vendedoresData,
    produtosData,
    horariosData,
    pagamentosData,
    tempoData,
  };
}
