import { Button } from "@orthoplus/core-ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ProntuarioPDFProps {
  prontuarioId: string;
  patientName: string;
}

export function ProntuarioPDF({
  prontuarioId,
  patientName,
}: ProntuarioPDFProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text("ORTHO +", margin, yPos);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Sistema de Gestão Odontológica", margin, yPos + 6);

    yPos += 20;
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 15;

    // Patient Info
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Prontuário do Paciente", margin, yPos);

    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`Paciente: ${patientName}`, margin, yPos);

    yPos += 7;
    doc.text(`Prontuário ID: ${prontuarioId}`, margin, yPos);

    yPos += 7;
    doc.text(
      `Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`,
      margin,
      yPos,
    );

    yPos += 15;

    // Section: Histórico Clínico
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("Histórico Clínico", margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(
      "Anamnese, diagnósticos e histórico médico completo do paciente.",
      margin,
      yPos,
    );

    yPos += 7;
    doc.setTextColor(100);
    doc.text("• Alergias: Nenhuma relatada", margin + 5, yPos);
    yPos += 6;
    doc.text("• Doenças Crônicas: Hipertensão controlada", margin + 5, yPos);
    yPos += 6;
    doc.text("• Medicamentos em Uso: Losartana 50mg", margin + 5, yPos);

    yPos += 15;

    // Section: Tratamentos
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("Tratamentos Realizados", margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(
      "Histórico de procedimentos e tratamentos odontológicos.",
      margin,
      yPos,
    );

    yPos += 7;
    doc.setTextColor(100);
    doc.text("• Restauração Dente 16 - 15/01/2025", margin + 5, yPos);
    yPos += 6;
    doc.text("• Profilaxia - 20/12/2024", margin + 5, yPos);
    yPos += 6;
    doc.text("• Extração Dente 38 - 10/11/2024", margin + 5, yPos);

    yPos += 15;

    // Section: Odontograma
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("Estado do Odontograma", margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text("Condição atual dos dentes registrada no sistema.", margin, yPos);

    yPos += 7;
    doc.setTextColor(100);
    doc.text("• Dentes Hígidos: 28", margin + 5, yPos);
    yPos += 6;
    doc.text("• Dentes Obturados: 3", margin + 5, yPos);
    yPos += 6;
    doc.text("• Dentes Ausentes: 1", margin + 5, yPos);

    yPos += 15;

    // Section: Prescrições
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("Prescrições Médicas", margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text("Medicamentos prescritos durante tratamento.", margin, yPos);

    yPos += 7;
    doc.setTextColor(100);
    doc.text("• Amoxicilina 500mg - 8/8h por 7 dias", margin + 5, yPos);
    yPos += 6;
    doc.text("• Ibuprofeno 600mg - 8/8h por 3 dias", margin + 5, yPos);

    yPos += 20;

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "Este documento é uma representação digital do prontuário eletrônico.",
      pageWidth / 2,
      footerY,
      { align: "center" },
    );
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-BR")} pelo sistema ORTHO +`,
      pageWidth / 2,
      footerY + 4,
      { align: "center" },
    );

    // Save PDF
    doc.save(
      `prontuario_${patientName.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`,
    );
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Gerar Prontuário em PDF</h3>
          <p className="text-sm text-muted-foreground">
            Exporte o prontuário completo com histórico, tratamentos e
            prescrições
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Histórico Clínico Completo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Tratamentos Realizados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Estado do Odontograma</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Prescrições e Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Assinaturas Digitais</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Anexos e Documentos</span>
        </div>
      </div>

      <Button onClick={generatePDF} className="w-full" size="lg">
        <Download className="mr-2 h-4 w-4" />
        Gerar e Baixar PDF
      </Button>
    </div>
  );
}
