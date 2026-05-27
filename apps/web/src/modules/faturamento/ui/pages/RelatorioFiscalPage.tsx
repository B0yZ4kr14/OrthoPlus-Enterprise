import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card"
import { Button } from "@orthoplus/core-ui/button"
import { Input } from "@orthoplus/core-ui/input"
import { Label } from "@orthoplus/core-ui/label"
import { LoadingState } from "@/components/shared/LoadingState"
import { FileText, Download, TrendingUp } from "lucide-react"
import ExcelJS from "exceljs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface RelatorioFilters {
  dataInicio?: string
  dataFim?: string
  tipo?: string
}

interface RelatorioResponse {
  notas: Array<{
    id: string
    numero: number
    serie: number
    chave_acesso: string
    valor_total: number
    valor_icms: number
    valor_iss: number
    status: string
    data_emissao: string
  }>
  totais: {
    valorTotal: number
    valorIcms: number
    valorIss: number
    valorIpi: number
    valorPis: number
    valorCofins: number
    quantidade: number
  }
}

export default function RelatorioFiscalPage() {
  const { clinicId } = useAuth()
  const [filters, setFilters] = useState<RelatorioFilters>({})

  const { data, isLoading } = useQuery({
    queryKey: ["faturamento-relatorio", clinicId, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.dataInicio) params.append("dataInicio", filters.dataInicio)
      if (filters.dataFim) params.append("dataFim", filters.dataFim)
      if (filters.tipo) params.append("tipo", filters.tipo)
      const response = await apiClient.get<RelatorioResponse>(`/faturamento/relatorio?${params.toString()}`)
      return response
    },
    enabled: !!clinicId,
  })

  const handleExportCSV = () => {
    if (!data) return
    const headers = ["Numero", "Serie", "Chave Acesso", "Valor Total", "ICMS", "ISS", "Status", "Data Emissao"]
    const rows = data.notas.map((n) => [
      n.numero,
      n.serie,
      n.chave_acesso,
      (n.valor_total / 100).toFixed(2),
      (n.valor_icms / 100).toFixed(2),
      (n.valor_iss / 100).toFixed(2),
      n.status,
      n.data_emissao,
    ])
    const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-fiscal-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = async () => {
    if (!data) return
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Relatorio Fiscal")
    worksheet.columns = [
      { header: "Numero", key: "numero", width: 12 },
      { header: "Serie", key: "serie", width: 8 },
      { header: "Chave Acesso", key: "chave_acesso", width: 50 },
      { header: "Valor Total", key: "valor_total", width: 15 },
      { header: "ICMS", key: "valor_icms", width: 15 },
      { header: "ISS", key: "valor_iss", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Data Emissao", key: "data_emissao", width: 18 },
    ]
    data.notas.forEach((n) => {
      worksheet.addRow({
        numero: n.numero,
        serie: n.serie,
        chave_acesso: n.chave_acesso,
        valor_total: (n.valor_total / 100).toFixed(2),
        valor_icms: (n.valor_icms / 100).toFixed(2),
        valor_iss: (n.valor_iss / 100).toFixed(2),
        status: n.status,
        data_emissao: n.data_emissao,
      })
    })
    // Add totals row
    worksheet.addRow({})
    worksheet.addRow({
      numero: "TOTAIS",
      valor_total: (data.totais.valorTotal / 100).toFixed(2),
      valor_icms: (data.totais.valorIcms / 100).toFixed(2),
      valor_iss: (data.totais.valorIss / 100).toFixed(2),
    })
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-fiscal-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Relatorio Fiscal</h1>
            <p className="text-sm text-muted-foreground">
              Visualize e exporte dados fiscais da clinica
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data Inicio</Label>
              <Input
                type="date"
                onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Nota</Label>
              <Input
                placeholder="NFE, NFCE, NFSE"
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total em Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(data.totais.valorTotal / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ICMS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(data.totais.valorIcms / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totais.quantidade}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Evolucao por Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.notas.map((n) => ({
                      data: n.data_emissao,
                      valor: n.valor_total / 100,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) =>
                        `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      }
                    />
                    <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Numero</th>
                      <th className="text-left py-2 px-4">Serie</th>
                      <th className="text-left py-2 px-4">Chave</th>
                      <th className="text-right py-2 px-4">Valor Total</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.notas.map((nota) => (
                      <tr key={nota.id} className="border-b">
                        <td className="py-2 px-4">{nota.numero}</td>
                        <td className="py-2 px-4">{nota.serie}</td>
                        <td className="py-2 px-4 font-mono text-xs">{nota.chave_acesso}</td>
                        <td className="py-2 px-4 text-right">
                          R$ {(nota.valor_total / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10">
                            {nota.status}
                          </span>
                        </td>
                        <td className="py-2 px-4">{nota.data_emissao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
