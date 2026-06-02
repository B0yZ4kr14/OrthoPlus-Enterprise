import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orthoplus/core-ui/table";
import { Badge } from "@orthoplus/core-ui/badge";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { DentistaProcedimento } from "../types/procedimento-precos.types";

export default function DentistaProcedimentosManager() {
  const [selectedDentista, setSelectedDentista] = useState<string>("");
  const [selectedProc, setSelectedProc] = useState<string>("");
  const [duracao, setDuracao] = useState("");
  const [comissao, setComissao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: associacoes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dentista-procedimentos", selectedDentista],
    queryFn: async () => {
      const params = selectedDentista ? `?dentista_id=${selectedDentista}` : "";
      return apiClient.get<DentistaProcedimento[]>(
        `/procedimentos/dentista-procedimentos${params}`,
      );
    },
  });

  const { data: dentistas = [] } = useQuery({
    queryKey: ["dentistas-list"],
    queryFn: async () => {
      return apiClient.get<Array<{ id: string; nome: string }>>("/dentistas");
    },
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["procedimento-templates"],
    queryFn: async () => {
      return apiClient.get<Array<{ id: string; nome: string }>>(
        "/procedimentos/templates",
      );
    },
  });

  const handleCreate = async () => {
    if (!selectedDentista || !selectedProc) {
      toast.error("Selecione dentista e procedimento");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post("/procedimentos/dentista-procedimentos", {
        dentista_id: selectedDentista,
        procedimento_template_id: selectedProc,
        duracao_customizada_min: duracao ? parseInt(duracao) : null,
        comissao_percentual: comissao ? parseFloat(comissao) : 0,
      });
      toast.success("Associação criada");
      setSelectedProc("");
      setDuracao("");
      setComissao("");
      refetch();
    } catch {
      toast.error("Erro ao criar associação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover associação?")) return;
    try {
      await apiClient.delete(`/procedimentos/dentista-procedimentos/${id}`);
      toast.success("Associação removida");
      refetch();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/procedimentos/dentista-procedimentos/${id}`, {
        is_active: !isActive,
      });
      toast.success("Status atualizado");
      refetch();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  if (isLoading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold">Nova Associação</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedDentista}
            onChange={(e) => setSelectedDentista(e.target.value)}
            className="h-10 rounded-md border px-3 w-48"
          >
            <option value="">Selecione o dentista</option>
            {dentistas.map((d: { id: string; nome: string }) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
          <select
            value={selectedProc}
            onChange={(e) => setSelectedProc(e.target.value)}
            className="h-10 rounded-md border px-3 w-48"
          >
            <option value="">Selecione o procedimento</option>
            {templates.map((t: { id: string; nome: string }) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <Input
            id="proc-duracao"
            aria-label="Duração em minutos"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            type="number"
            placeholder="Duração (min)"
            className="w-32"
          />
          <Input
            id="proc-comissao"
            aria-label="Comissão percentual"
            value={comissao}
            onChange={(e) => setComissao(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Comissão %"
            className="w-32"
          />
          <Button type="button" onClick={handleCreate} disabled={isSubmitting}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dentista</TableHead>
            <TableHead>Procedimento</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Comissão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {associacoes.map((a: DentistaProcedimento) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.dentista_id}</TableCell>
              <TableCell>
                {a.procedimento_template?.nome || a.procedimento_template_id}
              </TableCell>
              <TableCell>
                {a.duracao_customizada_min
                  ? `${a.duracao_customizada_min} min`
                  : "Padrão"}
              </TableCell>
              <TableCell>{a.comissao_percentual}%</TableCell>
              <TableCell>
                <Badge
                  variant={a.is_active ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => handleToggle(a.id, a.is_active)}
                >
                  {a.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelete(a.id)}
                  aria-label="Excluir associação"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {associacoes.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                Nenhuma associação cadastrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
