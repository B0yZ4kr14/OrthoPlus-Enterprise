// cspell:disable
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import { addHeader } from "./pdfHeader";
import {
  addSummarySection,
  addDistributionSection,
  addMarketComparisonSection,
  addConversionsSection,
} from "./pdfSections";
import { addFooter } from "./pdfFooter";
import { fetchMarketComparison } from "./marketData";
import type { PortfolioData } from "./types";

export async function generateCryptoPerformanceReport(
  portfolioData: PortfolioData,
  clinicName: string,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();

  let yPosition = addHeader(doc, clinicName, startDate, endDate);

  yPosition = addSummarySection(doc, portfolioData, yPosition);
  yPosition = addDistributionSection(doc, portfolioData, yPosition);

  const marketComparison = await fetchMarketComparison(startDate, endDate);
  yPosition = addMarketComparisonSection(doc, marketComparison, yPosition);

  addConversionsSection(doc, portfolioData, yPosition, pageHeight);
  addFooter(doc);

  const fileName = `relatorio-crypto-${format(startDate, "yyyy-MM")}.pdf`;
  doc.save(fileName);
}
