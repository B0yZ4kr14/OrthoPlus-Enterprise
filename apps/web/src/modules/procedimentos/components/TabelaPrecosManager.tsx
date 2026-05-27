import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import { Button } from "@orthoplus/core-ui/button"
import { Input } from "@orthoplus/core-ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@orthoplus/core-ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@orthoplus/core-ui/table"
import { Badge } from "@orthoplus/core-ui/badge"
import { Pencil, Trash2, Plus, Percent } from "lucide-react"
import { toast } from "sonner"
import type { TabelaPreco, ProcedimentoPreco } from "../types/procedimento-precos.types"

export default function TabelaPrecosManager() {
  const [selectedTabela, setSelectedTabela] = useState<string | null>(null)
  const [editingTabela, setEditingTabela] = useState<TabelaPreco | null>(null)
  const [isPrecoDialogOpen, setIsPrecoDialogOpen] = useState(false)
  const [isReajusteDialogOpen, setIsReajusteDialogOpen] = useState(false)
  const [nomeTabela, setNomeTabela] = useState("")
  const [tipoTabela, setTipoTabela] = useState<"PARTICULAR" | "CONVENIO">("PARTICULAR")
  const [isDefault, setIsDefault] = useState(false)
  const [precoValor, setPrecoValor] = useState("")
  const [precoTemplate, setPrecoTemplate] = useState("")
  const [reajustePercentual, setReajustePercentual] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tabelas = [], isLoading, refetch: refetchTabelas } = useQuery({
    queryKey: ["tabelas-precos"],
    queryFn: async () => apiClient.get<TabelaPreco[]>("/procedimentos/tabelas"),
  })

  const { data: precos = [], refetch: refetchPrecos } = useQuery({
    queryKey: ["procedimento-precos", selectedTabela],
    queryFn: async () => {
      if (!selectedTabela) return []
      return apiClient.get<ProcedimentoPreco[]>(`/procedimentos/precos?tabela_id=${selectedTabela}`)
    },
    enabled: !!selectedTabela,
  })

  const { data: templates = [] } = useQuery({
    queryKey: ["procedimento-templates"],
    queryFn: async () => apiClient.get<Array<{ id: string; nome: string }>>("/procedimentos/templates"),
  })

  const handleCreateTabela = async () => {
    if (!nomeTabela.trim()) { toast.error("Nome obrigatório"); return }
    setIsSubmitting(true)
    try {
      await apiClient.post("/procedimentos/tabelas", { nome: nomeTabela, tipo: tipoTabela, is_default: isDefault })
      toast.success("Tabela criada")
      setNomeTabela(""); setTipoTabela("PARTICULAR"); setIsDefault(false)
      refetchTabelas()
    } catch { toast.error("Erro ao criar tabela") }
    finally { setIsSubmitting(false) }
  }

  const handleUpdateTabela = async () => {
    if (!editingTabela || !nomeTabela.trim()) return
    setIsSubmitting(true)
    try {
      await apiClient.patch(`/procedimentos/tabelas/${editingTabela.id}`, { nome: nomeTabela, tipo: tipoTabela, is_default: isDefault })
      toast.success("Tabela atualizada")
      setEditingTabela(null); setNomeTabela(""); setTipoTabela("PARTICULAR"); setIsDefault(false)
      refetchTabelas()
    } catch { toast.error("Erro ao atualizar tabela") }
    finally { setIsSubmitting(false) }
  }

  const handleDeleteTabela = async (id: string) => {
    if (!confirm("Remover tabela?")) return
    try {
      await apiClient.delete(`/procedimentos/tabelas/${id}`)
      toast.success("Tabela removida")
      refetchTabelas()
      if (selectedTabela === id) setSelectedTabela(null)
    } catch { toast.error("Erro ao remover tabela") }
  }

  const handleCreatePreco = async () => {
    if (!selectedTabela || !precoTemplate || !precoValor) { toast.error("Preencha todos os campos"); return }
    setIsSubmitting(true)
    try {
      await apiClient.post("/procedimentos/precos", {
        procedimento_template_id: precoTemplate,
        tabela_preco_id: selectedTabela,
        valor: Math.round(parseFloat(precoValor) * 100),
      })
      toast.success("Preço adicionado")
      setPrecoValor(""); setPrecoTemplate(""); setIsPrecoDialogOpen(false)
      refetchPrecos()
    } catch { toast.error("Erro ao adicionar preço") }
    finally { setIsSubmitting(false) }
  }

  const handleDeletePreco = async (id: string) => {
    if (!confirm("Remover preço?")) return
    try {
      await apiClient.delete(`/procedimentos/precos/${id}`)
      toast.success("Preço removido")
      refetchPrecos()
    } catch { toast.error("Erro ao remover preço") }
  }

  const handleReajuste = async () => {
    if (!selectedTabela || !reajustePercentual) return
    setIsSubmitting(true)
    try {
      await apiClient.post("/procedimentos/precos/reajuste", {
        tabela_preco_id: selectedTabela,
        percentual: parseFloat(reajustePercentual),
      })
      toast.success("Reajuste aplicado")
      setReajustePercentual(""); setIsReajusteDialogOpen(false)
      refetchPrecos()
    } catch { toast.error("Erro ao aplicar reajuste") }
    finally { setIsSubmitting(false) }
  }

  const startEdit = (t: TabelaPreco) => {
    setEditingTabela(t)
    setNomeTabela(t.nome)
    setTipoTabela(t.tipo)
    setIsDefault(t.is_default)
  }

  if (isLoading) return <div className="p-4">Carregando tabelas...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold">
          {editingTabela ? "Editar Tabela" : "Nova Tabela de Preços"}
        </h3>
        <div className="flex flex-wrap gap-3">
          <Input value={nomeTabela} onChange={(e) => setNomeTabela(e.target.value)} placeholder="Nome da tabela" className="w-64" />
          <select value={tipoTabela} onChange={(e) => setTipoTabela(e.target.value as "PARTICULAR" | "CONVENIO")} className="h-10 rounded-md border px-3">
            <option value="PARTICULAR">Particular</option>
            <option value="CONVENIO">Convênio</option>
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Padrão
          </label>
          <Button onClick={editingTabela ? handleUpdateTabela : handleCreateTabela} disabled={isSubmitting}>
            {editingTabela ? "Salvar" : "Criar"}
          </Button>
          {editingTabela && (
            <Button variant="outline" onClick={() => { setEditingTabela(null); setNomeTabela(""); setTipoTabela("PARTICULAR"); setIsDefault(false) }}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Padrão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-40">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tabelas.map((t: TabelaPreco) => (
            <TableRow
              key={t.id}
              className={selectedTabela === t.id ? "bg-muted/50" : ""}
              onClick={() => setSelectedTabela(t.id)}
            >
              <TableCell className="font-medium">{t.nome}</TableCell>
              <TableCell>
                <Badge variant={t.tipo === "PARTICULAR" ? "default" : "secondary"}>{t.tipo}</Badge>
              </TableCell>
              <TableCell>{t.is_default ? "Sim" : "Não"}</TableCell>
              <TableCell>{t.is_active ? "Ativa" : "Inativa"}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => startEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteTabela(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTabela && (
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Preços — {tabelas.find((t: TabelaPreco) => t.id === selectedTabela)?.nome}
            </h3>
            <div className="flex gap-2">
              <Dialog open={isReajusteDialogOpen} onOpenChange={setIsReajusteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Percent className="mr-1 h-4 w-4" /> Reajuste</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Reajuste em Lote</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input value={reajustePercentual} onChange={(e) => setReajustePercentual(e.target.value)} type="number" step="0.01" placeholder="Percentual (ex: 10 ou -5)" />
                    <Button onClick={handleReajuste} disabled={isSubmitting}>Aplicar</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isPrecoDialogOpen} onOpenChange={setIsPrecoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Adicionar Preço</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Preço</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <select value={precoTemplate} onChange={(e) => setPrecoTemplate(e.target.value)} className="h-10 w-full rounded-md border px-3">
                      <option value="">Selecione o procedimento</option>
                      {templates?.map((tm: { id: string; nome: string }) => (
                        <option key={tm.id} value={tm.id}>{tm.nome}</option>
                      ))}
                    </select>
                    <Input value={precoValor} onChange={(e) => setPrecoValor(e.target.value)} type="number" step="0.01" placeholder="Valor (R$)" />
                    <Button onClick={handleCreatePreco} disabled={isSubmitting}>Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Retorno (dias)</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {precos.map((p: ProcedimentoPreco) => (
                <TableRow key={p.id}>
                  <TableCell>{p.procedimento_template?.nome || p.procedimento_template_id}</TableCell>
                  <TableCell>R$ {(p.valor / 100).toFixed(2)}</TableCell>
                  <TableCell>{p.tempo_retorno_dias ?? "—"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeletePreco(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {precos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum preço cadastrado</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
