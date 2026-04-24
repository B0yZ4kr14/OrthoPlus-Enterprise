// cspell:disable
import { useState, useMemo } from "react";
import { useInventario } from "@/modules/estoque/hooks/useInventario";
import type {
  KpiData,
  TendenciaAcuracidade,
  PerdasMensais,
  ProdutoPerda,
  CriticidadeItem,
} from "./types";

export function useInventarioDashboard() {
  const { inventarios, inventarioItems, loading } = useInventario();
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  const kpis: KpiData = useMemo(() => {
    const now = new Date();
    const periodDays = parseInt(selectedPeriod);
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const inventariosPeriodo = inventarios.filter((inv) => {
      const createdAt = inv.createdAt ? new Date(inv.createdAt) : null;
      return createdAt && createdAt >= periodStart;
    });

    const totalInventarios = inventariosPeriodo.length;
    const totalDivergencias = inventariosPeriodo.reduce(
      (sum, inv) => sum + (inv.divergenciasEncontradas || 0),
      0,
    );
    const totalPerdas = inventariosPeriodo.reduce(
      (sum, inv) => sum + (inv.valorDivergencias || 0),
      0,
    );
    const totalItensAnalisados = inventariosPeriodo.reduce(
      (sum, inv) => sum + (inv.totalItens || 0),
      0,
    );
    const acuracidadeMedia =
      totalItensAnalisados > 0
        ? ((totalItensAnalisados - totalDivergencias) / totalItensAnalisados) * 100
        : 100;

    const prevPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const inventariosPeriodoAnterior = inventarios.filter((inv) => {
      const createdAt = inv.createdAt ? new Date(inv.createdAt) : null;
      return createdAt && createdAt >= prevPeriodStart && createdAt < periodStart;
    });

    const perdasPeriodoAnterior = inventariosPeriodoAnterior.reduce(
      (sum, inv) => sum + (inv.valorDivergencias || 0),
      0,
    );
    const variacaoPerdas =
      perdasPeriodoAnterior > 0
        ? ((totalPerdas - perdasPeriodoAnterior) / perdasPeriodoAnterior) * 100
        : 0;

    return {
      totalInventarios,
      totalDivergencias,
      totalPerdas,
      acuracidadeMedia,
      variacaoPerdas,
      totalItensAnalisados,
    };
  }, [inventarios, selectedPeriod]);

  const tendenciaAcuracidade: TendenciaAcuracidade[] = useMemo(() => {
    const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        mes: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        mesNum: date.getMonth(),
        anoNum: date.getFullYear(),
      };
    });

    return ultimos6Meses.map(({ mes, mesNum, anoNum }) => {
      const inventariosMes = inventarios.filter((inv) => {
        const createdAt = inv.createdAt ? new Date(inv.createdAt) : null;
        return createdAt && createdAt.getMonth() === mesNum && createdAt.getFullYear() === anoNum;
      });

      const totalItens = inventariosMes.reduce((sum, inv) => sum + (inv.totalItens || 0), 0);
      const totalDiverg = inventariosMes.reduce(
        (sum, inv) => sum + (inv.divergenciasEncontradas || 0),
        0,
      );
      const acuracidade = totalItens > 0 ? ((totalItens - totalDiverg) / totalItens) * 100 : 100;

      return {
        mes,
        acuracidade: parseFloat(acuracidade.toFixed(2)),
        divergencias: totalDiverg,
      };
    });
  }, [inventarios]);

  const perdasMensais: PerdasMensais[] = useMemo(() => {
    const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        mes: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        mesNum: date.getMonth(),
        anoNum: date.getFullYear(),
      };
    });

    return ultimos6Meses.map(({ mes, mesNum, anoNum }) => {
      const inventariosMes = inventarios.filter((inv) => {
        const createdAt = inv.createdAt ? new Date(inv.createdAt) : null;
        return createdAt && createdAt.getMonth() === mesNum && createdAt.getFullYear() === anoNum;
      });

      const perdas = inventariosMes.reduce((sum, inv) => sum + (inv.valorDivergencias || 0), 0);

      return { mes, perdas: parseFloat(perdas.toFixed(2)) };
    });
  }, [inventarios]);

  const rankingProdutos: ProdutoPerda[] = useMemo(() => {
    const produtoPerdas = new Map<string, { nome: string; perda: number; quantidade: number }>();

    inventarioItems.forEach((item) => {
      if (item.valorDivergencia && item.valorDivergencia > 0) {
        const existing = produtoPerdas.get(item.produtoId);
        if (existing) {
          existing.perda += item.valorDivergencia;
          existing.quantidade += Math.abs(item.divergencia || 0);
        } else {
          produtoPerdas.set(item.produtoId, {
            nome: item.produtoNome || "Produto",
            perda: item.valorDivergencia,
            quantidade: Math.abs(item.divergencia || 0),
          });
        }
      }
    });

    return Array.from(produtoPerdas.values())
      .sort((a, b) => b.perda - a.perda)
      .slice(0, 10);
  }, [inventarioItems]);

  const distribuicaoCriticidade: CriticidadeItem[] = useMemo(() => {
    const criticidade = { baixa: 0, media: 0, alta: 0, critica: 0 };

    inventarioItems.forEach((item) => {
      const percentual = item.percentualDivergencia || 0;
      if (percentual < 5) criticidade.baixa++;
      else if (percentual < 10) criticidade.media++;
      else if (percentual < 20) criticidade.alta++;
      else criticidade.critica++;
    });

    return [
      { name: "Baixa (< 5%)", value: criticidade.baixa, color: "#10b981" },
      { name: "Média (5-10%)", value: criticidade.media, color: "#f59e0b" },
      { name: "Alta (10-20%)", value: criticidade.alta, color: "#ef4444" },
      { name: "Crítica (> 20%)", value: criticidade.critica, color: "#7c3aed" },
    ];
  }, [inventarioItems]);

  return {
    loading,
    selectedPeriod,
    setSelectedPeriod,
    kpis,
    tendenciaAcuracidade,
    perdasMensais,
    rankingProdutos,
    distribuicaoCriticidade,
  };
}
