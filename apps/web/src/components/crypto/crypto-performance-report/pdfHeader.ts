// cspell:disable
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { jsPDF } from "jspdf";

export function addHeader(
  doc: jsPDF,
  clinicName: string,
  startDate: Date,
  endDate: Date,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Performance Cripto", pageWidth / 2, yPosition, {
    align: "center",
  });

  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(clinicName, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 8;
  doc.setFontSize(10);
  doc.text(
    `Período: ${format(startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`,
    pageWidth / 2,
    yPosition,
    { align: "center" },
  );

  return yPosition + 15;
}
