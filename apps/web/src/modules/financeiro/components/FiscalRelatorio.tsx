import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orthoplus/core-ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FileBarChart, Download, Search, FileSpreadsheet } from "lucide-react";

interface NFe {
  id: string;
  numero: string;
  serie?: string;
  tipo: string;
  status: string;
  valor_total: number;
  valor_icms?: number;
  valor_iss?: number;
  data_emissao: string;
  destinatario_nome?: string;
}

interface RelatorioData {
  notas: NFe[];
  totais: {
    valorTotal: number;
    valorIcms: number;
    valorIss: number;
    valorIpi: number;
    valorPis: number;
    valorCofins: number;
    quantidade: number;
  };
}

interface Props {
  data: any;
  isLoading: boolean;
  onGenerate: (filters: {
    dataInicio?: string;
    dataFim?: string;
    tipo?: string;
  }) => void;
}

export function FiscalRelatorio({ data, isLoading, onGenerate }: Props) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipo, setTipo] = useState("");

  const handleGenerate = () => {
    onGenerate({ dataInicio, dataFim, tipo });
  };

  const handleExportCSV = () => {
    if (!data?.notas.length) return;
    const headers = [
      "Numero",
      "Serie",
      "Tipo",
      "Status",
      "Data Emissao",
      "Destinatario",
      "Valor Total",
      "ICMS",
      "ISS",
    ];
    const rows = data.notas.map((n: any) => [
      n.numero,
      n.serie || "",
      n.tipo,
      n.status,
      n.data_emissao,
      n.destinatario_nome || "",
      (n.valor_total / 100).toFixed(2),
      ((n.valor_icms || 0) / 100).toFixed(2),
      ((n.valor_iss || 0) / 100).toFixed(2),
    ]);
    const csv = [headers.join(";"), ...rows.map((r: any) => r.join(";"))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-fiscal-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData =
    data?.notas.slice(0, 12).map((n: any) => ({
      name: n.numero,
      total: (n.valor_total || 0) / 100,
      icms: (n.valor_icms || 0) / 100,
      iss: (n.valor_iss || 0) / 100,
    })) || [];

  const totais = data?.totais;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileBarChart className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="NFE">NF-e</SelectItem>
                  <SelectItem value="NFCE">NFC-e</SelectItem>
                  <SelectItem value="NFSE">NFS-e</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                {isLoading ? "Gerando..." : "Gerar"}
              </Button>
              {data && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {totais && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Quantidade</p>
              <p className="text-2xl font-bold">{totais.quantidade}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">
                R${" "}
                {(totais.valorTotal / 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">ICMS</p>
              <p className="text-2xl font-bold">
                R${" "}
                {(totais.valorIcms / 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">ISS</p>
              <p className="text-2xl font-bold">
                R${" "}
                {(totais.valorIss / 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução por Nota</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Bar dataKey="total" fill="#8884d8" name="Total" />
                <Bar dataKey="icms" fill="#82ca9d" name="ICMS" />
                <Bar dataKey="iss" fill="#ffc658" name="ISS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data?.notas && data.notas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Notas Fiscais ({data.notas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">ICMS</TableHead>
                  <TableHead className="text-right">ISS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.notas.map((n: any) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      {n.numero}/{n.serie || "-"}
                    </TableCell>
                    <TableCell>{n.tipo}</TableCell>
                    <TableCell>{n.status}</TableCell>
                    <TableCell>{n.data_emissao}</TableCell>
                    <TableCell>{n.destinatario_nome || "-"}</TableCell>
                    <TableCell className="text-right">
                      R$ {((n.valor_total || 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {((n.valor_icms || 0) / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {((n.valor_iss || 0) / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
