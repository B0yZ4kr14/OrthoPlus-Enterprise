// cspell:disable
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { jsPDF } from "jspdf";
import type { PortfolioData, MarketComparison } from "./types";

export function addSummarySection(
  doc: jsPDF,
  portfolioData: PortfolioData,
  startY: number,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = startY;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Executivo", 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const summaryData = [
    [
      "Valor Total do Portfolio:",
      portfolioData.totalBRL.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    ],
    [
      "Ganhos Realizados:",
      `+${portfolioData.gains.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    ],
    [
      "Perdas Realizadas:",
      `-${portfolioData.losses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    ],
    [
      "Resultado Líquido:",
      (portfolioData.gains - portfolioData.losses).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    ],
    [
      "Total de Conversões:",
      portfolioData.conversionsHistory.length.toString(),
    ],
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(label, 20, yPosition);
    doc.text(value, pageWidth - 20, yPosition, { align: "right" });
    yPosition += 6;
  });

  return yPosition + 10;
}

export function addDistributionSection(
  doc: jsPDF,
  portfolioData: PortfolioData,
  startY: number,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = startY;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Distribuição por Moeda", 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  portfolioData.distribution.forEach((item) => {
    doc.text(item.coin, 20, yPosition);
    doc.text(`${item.percentage.toFixed(2)}%`, pageWidth / 2 - 10, yPosition, {
      align: "right",
    });
    doc.text(
      item.value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );
    yPosition += 6;
  });

  return yPosition + 10;
}

export function addMarketComparisonSection(
  doc: jsPDF,
  marketComparison: MarketComparison,
  startY: number,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = startY;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Comparativo com Índices de Mercado", 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const comparisonData = [
    [
      "Bitcoin (BTC):",
      `${marketComparison.btcReturn > 0 ? "+" : ""}${marketComparison.btcReturn.toFixed(2)}%`,
    ],
    [
      "S&P 500 (Estimado):",
      `${marketComparison.sp500Return > 0 ? "+" : ""}${marketComparison.sp500Return.toFixed(2)}%`,
    ],
    [
      "Seu Portfolio:",
      `${marketComparison.portfolioReturn > 0 ? "+" : ""}${marketComparison.portfolioReturn.toFixed(2)}%`,
    ],
  ];

  comparisonData.forEach(([label, value]) => {
    doc.text(label, 20, yPosition);
    doc.text(value, pageWidth - 20, yPosition, { align: "right" });
    yPosition += 6;
  });

  return yPosition + 10;
}

export function addConversionsSection(
  doc: jsPDF,
  portfolioData: PortfolioData,
  startY: number,
  pageHeight: number,
): number {
  let yPosition = startY;

  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Histórico de Conversões", 15, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Data", 15, yPosition);
  doc.text("De→Para", 50, yPosition);
  doc.text("Quantidade", 90, yPosition);
  doc.text("Valor BRL", 130, yPosition);
  doc.text("Tipo", 170, yPosition);
  yPosition += 5;

  doc.setFont("helvetica", "normal");
  doc.line(15, yPosition, 195, yPosition);
  yPosition += 5;

  portfolioData.conversionsHistory.slice(0, 15).forEach((conv) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text(format(conv.date, "dd/MM/yyyy", { locale: ptBR }), 15, yPosition);
    doc.text(`${conv.fromCoin}→${conv.toCoin}`, 50, yPosition);
    doc.text(conv.amount.toFixed(8), 90, yPosition);
    doc.text(
      conv.valueBRL.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      130,
      yPosition,
    );
    doc.text(conv.type === "gain" ? "Ganho" : "Perda", 170, yPosition);
    yPosition += 6;
  });

  return yPosition;
}
