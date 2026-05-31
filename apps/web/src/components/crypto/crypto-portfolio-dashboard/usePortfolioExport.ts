import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import { generateCryptoPerformanceReport } from "../CryptoPerformanceReport";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type { PortfolioData } from "./types";
import { formatBRL } from "./types";

export function usePortfolioExport(portfolioData: PortfolioData | null) {
  const exportToCSV = () => {
    if (!portfolioData) return;

    const csvContent = [
      ["Portfólio de Criptomoedas"],
      ["Data:", new Date().toLocaleDateString("pt-BR")],
      [""],
      ["Resumo"],
      ["Valor Total (BRL):", formatBRL(portfolioData.totalBRL)],
      ["Ganhos:", formatBRL(portfolioData.gains)],
      ["Perdas:", formatBRL(portfolioData.losses)],
      [""],
      ["Distribuição por Moeda"],
      ["Moeda", "Valor (BRL)", "Percentual"],
      ...portfolioData.distribution.map((item) => [
        item.coin,
        formatBRL(item.value),
        `${item.percentage.toFixed(2)}%`,
      ]),
      [""],
      ["Histórico de Conversões"],
      ["Data", "De", "Para", "Quantidade", "Taxa", "Valor BRL", "Tipo"],
      ...portfolioData.conversionsHistory.map((conv) => [
        format(conv.date, "dd/MM/yyyy HH:mm", { locale: ptBR }),
        conv.fromCoin,
        conv.toCoin,
        conv.amount.toFixed(8),
        conv.rate.toFixed(2),
        formatBRL(conv.valueBRL),
        conv.type === "gain" ? "Ganho" : "Perda",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-crypto-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const exportToPDF = async () => {
    if (!portfolioData) return;

    toast.loading("Gerando relatório PDF...");

    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await generateCryptoPerformanceReport(
        portfolioData,
        "Clínica",
        startDate,
        endDate,
      );

      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      logger.error("Erro ao gerar relatório", error);
      toast.error("Erro ao gerar relatório PDF");
    }
  };

  return { exportToCSV, exportToPDF };
}
