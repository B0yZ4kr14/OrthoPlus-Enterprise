import { useState } from "react";
import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { useEstoque } from "@/modules/estoque/hooks/useEstoque";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
// jsPDF and ExcelJS loaded dynamically on report generation to reduce initial bundle

type ReportType =
  | "movimentacoes"
  | "produtos-fornecedor"
  | "valor-inventario"
  | "historico-requisicoes";
type ReportFormat = "pdf" | "excel";

export function EstoqueRelatorios() {
  const { produtos, movimentacoes, requisicoes, fornecedores, categorias } =
    useEstoque();
  const [reportType, setReportType] = useState<ReportType>("movimentacoes");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fornecedorId, setFornecedorId] = useState("");

  const generatePDFReport = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Relatório de Estoque", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, yPos);
    yPos += 15;

    // Conteúdo baseado no tipo de relatório
    if (reportType === "movimentacoes") {
      doc.setFontSize(14);
      doc.text("Movimentações por Período", 20, yPos);
      yPos += 10;

      const filteredMovs = movimentacoes.filter((m) => {
        const dataMovimentacao = new Date(m.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataMovimentacao >= start && dataMovimentacao <= end;
      });

      doc.setFontSize(10);
      filteredMovs.slice(0, 30).forEach((mov) => {
        const produto = produtos.find((p) => p.id === mov.produtoId);
        const text = `${new Date(mov.createdAt!).toLocaleDateString("pt-BR")} - ${mov.tipo} - ${produto?.nome || "N/A"} - Qtd: ${mov.quantidade}`;
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });

      doc.text(`Total de movimentações: ${filteredMovs.length}`, 20, yPos + 10);
    } else if (reportType === "produtos-fornecedor") {
      doc.setFontSize(14);
      doc.text("Produtos por Fornecedor", 20, yPos);
      yPos += 10;

      const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
      if (fornecedor) {
        doc.setFontSize(12);
        doc.text(`Fornecedor: ${fornecedor.nome}`, 20, yPos);
        yPos += 10;
      }

      const fornecedorSelecionado = fornecedores.find((f) => f.id === fornecedorId)
      const filteredProds = fornecedorId && fornecedorSelecionado
        ? produtos.filter((p) => p.fornecedor === fornecedorSelecionado.nome)
        : produtos

      doc.setFontSize(10)
      filteredProds.forEach((prod) => {
        const text = `${prod.nome} - Cat: ${prod.categoria || "N/A"} - Qtd: ${prod.quantidadeAtual} - R$ ${prod.valorUnitario.toFixed(2)}`
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else if (reportType === "valor-inventario") {
      doc.setFontSize(14);
      doc.text("Valor do Inventário", 20, yPos);
      yPos += 10;

      const valorTotal = produtos.reduce(
        (sum, p) => sum + p.quantidadeAtual * p.valorUnitario,
        0,
      )

      doc.setFontSize(12);
      doc.text(
        `Valor Total do Inventário: R$ ${valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        20,
        yPos,
      );
      yPos += 15;

      doc.setFontSize(10)
      produtos.forEach((prod) => {
        const valorProd = prod.quantidadeAtual * prod.valorUnitario
        const text = `${prod.nome} - Qtd: ${prod.quantidadeAtual} x R$ ${prod.valorUnitario.toFixed(2)} = R$ ${valorProd.toFixed(2)}`
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else if (reportType === "historico-requisicoes") {
      doc.setFontSize(14);
      doc.text("Histórico de Requisições", 20, yPos);
      yPos += 10;

      const filteredReqs = requisicoes.filter((r) => {
        const dataRequisicao = new Date(r.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataRequisicao >= start && dataRequisicao <= end;
      });

      doc.setFontSize(10);
      filteredReqs.slice(0, 30).forEach((req) => {
        const produto = produtos.find((p) => p.id === req.produtoId);
        const text = `${new Date(req.createdAt!).toLocaleDateString("pt-BR")} - ${produto?.nome || "N/A"} - Qtd: ${req.quantidade} - Status: ${req.status}`;
        doc.text(text, 20, yPos);
        yPos += 7;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });

      doc.text(`Total de requisições: ${filteredReqs.length}`, 20, yPos + 10);
    }

    doc.save(`relatorio-estoque-${reportType}-${Date.now()}.pdf`);
    toast.success("Relatório PDF gerado com sucesso!");
  };

  const generateExcelReport = async () => {
    let data: unknown[] = [];
    let sheetName = "Relatório";

    if (reportType === "movimentacoes") {
      const filteredMovs = movimentacoes.filter((m) => {
        const dataMovimentacao = new Date(m.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataMovimentacao >= start && dataMovimentacao <= end;
      });

      data = filteredMovs.map((mov) => {
        const produto = produtos.find((p) => p.id === mov.produtoId);
        const fornecedor = fornecedores.find((f) => f.id === mov.fornecedorId);
        return {
          Data: new Date(mov.createdAt!).toLocaleDateString("pt-BR"),
          Tipo: mov.tipo,
          Produto: produto?.nome || "N/A",
          Quantidade: mov.quantidade,
          Lote: mov.lote || "-",
          Fornecedor: fornecedor?.nome || "-",
          "Valor Unitário": mov.valorUnitario || 0,
          "Valor Total": mov.valorTotal || 0,
          Motivo: mov.motivo,
        };
      });
      sheetName = "Movimentações";
    } else if (reportType === "produtos-fornecedor") {
      const fornecedorSelecionado = fornecedores.find((f) => f.id === fornecedorId)
      const filteredProds = fornecedorId && fornecedorSelecionado
        ? produtos.filter((p) => p.fornecedor === fornecedorSelecionado.nome)
        : produtos

      data = filteredProds.map((prod) => {
        const fornecedor = fornecedores.find((f) => f.nome === prod.fornecedor)
        return {
          Código: prod.codigo_barra,
          Produto: prod.nome,
          Categoria: prod.categoria || "N/A",
          Fornecedor: fornecedor?.nome || prod.fornecedor || "N/A",
          "Quantidade Atual": prod.quantidadeAtual,
          "Quantidade Mínima": prod.quantidadeMinima,
          "Preço Compra": prod.valorUnitario,
          "Preço Venda": 0,
          "Valor Total": prod.quantidadeAtual * prod.valorUnitario,
          Status: prod.ativo ? "Ativo" : "Inativo",
        }
      })
      sheetName = "Produtos";
    } else if (reportType === "valor-inventario") {
      data = produtos.map((prod) => {
        return {
          Código: prod.codigo_barra,
          Produto: prod.nome,
          Categoria: prod.categoria || "N/A",
          Quantidade: prod.quantidadeAtual,
          "Preço Unitário": prod.valorUnitario,
          "Valor Total": prod.quantidadeAtual * prod.valorUnitario,
        }
      })
      sheetName = "Inventário";
    } else if (reportType === "historico-requisicoes") {
      const filteredReqs = requisicoes.filter((r) => {
        const dataRequisicao = new Date(r.createdAt!);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return dataRequisicao >= start && dataRequisicao <= end;
      });

      data = filteredReqs.map((req) => {
        const produto = produtos.find((p) => p.id === req.produtoId);
        return {
          Data: new Date(req.createdAt!).toLocaleDateString("pt-BR"),
          Produto: produto?.nome || "N/A",
          Quantidade: req.quantidade,
          Motivo: req.motivo,
          Prioridade: req.prioridade,
          Status: req.status,
          "Solicitado Por": req.solicitadoPor,
          "Aprovado Por": req.aprovadoPor || "-",
          "Data Aprovação": req.dataAprovacao
            ? new Date(req.dataAprovacao).toLocaleDateString("pt-BR")
            : "-",
        };
      });
      sheetName = "Requisições";
    }

    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      const columns = Object.keys(data[0] as Record<string, unknown>);
      worksheet.columns = columns.map((col) => ({ header: col, key: col }));
      (data as Record<string, unknown>[]).forEach((row) =>
        worksheet.addRow(row),
      );
    }

    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `relatorio-estoque-${reportType}-${Date.now()}.xlsx`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Relatório Excel gerado com sucesso!");
      })
      .catch((err: unknown) => {
        console.error("Erro ao gerar Excel:", err);
        toast.error("Erro ao gerar relatório Excel");
      });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Geração de Relatórios</h2>

      <div className="space-y-6">
        <div>
          <Label>Tipo de Relatório</Label>
          <Select
            value={reportType}
            onValueChange={(value) => setReportType(value as ReportType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movimentacoes">
                Movimentações por Período
              </SelectItem>
              <SelectItem value="produtos-fornecedor">
                Produtos por Fornecedor
              </SelectItem>
              <SelectItem value="valor-inventario">
                Valor do Inventário
              </SelectItem>
              <SelectItem value="historico-requisicoes">
                Histórico de Requisições
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(reportType === "movimentacoes" ||
          reportType === "historico-requisicoes") && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {reportType === "produtos-fornecedor" && (
          <div>
            <Label>Fornecedor (Opcional)</Label>
            <Select value={fornecedorId} onValueChange={setFornecedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os fornecedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os fornecedores</SelectItem>
                {fornecedores.map((forn) => (
                  <SelectItem key={forn.id} value={forn.id!}>
                    {forn.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button onClick={generatePDFReport} className="flex-1">
            <FileDown className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
          <Button
            onClick={generateExcelReport}
            variant="outline"
            className="flex-1"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Gerar Excel
          </Button>
        </div>
      </div>
    </Card>
  );
}
