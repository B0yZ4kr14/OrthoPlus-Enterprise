import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card"
import { Button } from "@orthoplus/core-ui/button"
import { Input } from "@orthoplus/core-ui/input"
import { Label } from "@orthoplus/core-ui/label"
import { LoadingState } from "@/components/shared/LoadingState"
import { FileText, Download } from "lucide-react"

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

  const handleExport = (format: "csv" | "excel") => {
    console.log(`Export ${format} triggered`)
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
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
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
