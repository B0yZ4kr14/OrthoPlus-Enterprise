import { useContasReceber } from "@/modules/financeiro/application/hooks/useContasReceber";
import { format } from "date-fns";
import { toast } from "sonner";

export function useContasReceberController() {
  const { state, actions } = useContasReceber();

  const totalReceber = state.contasReceber
    .filter((c) => c.status !== "pago" && c.status !== "cancelado")
    .reduce((sum, c) => sum + (c.valor - (c.valor_pago || 0)), 0);

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const formatBRL = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    doc.setFontSize(18);
    doc.text("Relatório de Contas a Receber", 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${state.filterPeriodo}`, 14, 32);
    doc.text(`Total a Receber: ${formatBRL(totalReceber)}`, 14, 40);

    let y = 50;
    state.filteredContas.forEach((conta, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${conta.patient_name} - ${formatBRL(conta.valor)} - ${conta.status}`, 14, y);
      y += 10;
    });

    doc.save(`contas-receber-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportarExcel = async () => {
    const { default: ExcelJS } = await import("exceljs");
    const data = state.filteredContas.map((conta) => ({
      Cliente: conta.patient_name,
      Descrição: conta.descricao,
      Valor: conta.valor,
      Vencimento: format(new Date(conta.data_vencimento), "dd/MM/yyyy"),
      Status: conta.status,
      "Valor Pago": conta.valor_pago || 0,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Contas a Receber");

    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      worksheet.columns = columns.map((col) => ({ header: col, key: col }));
      data.forEach((row) => worksheet.addRow(row as Record<string, unknown>));
    }

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `contas-receber-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Excel exportado com sucesso!");
    } catch (err: unknown) {
      console.error("Erro ao exportar Excel:", err);
      toast.error("Erro ao exportar para Excel");
    }
  };

  return {
    state: {
      ...state,
      totalReceber
    },
    actions: {
      ...actions,
      exportarPDF,
      exportarExcel
    }
  };
}

