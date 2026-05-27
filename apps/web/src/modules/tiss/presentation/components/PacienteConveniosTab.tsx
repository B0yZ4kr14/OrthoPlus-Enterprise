import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orthoplus/core-ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Plus, Pencil, Trash2, Save, X, Shield } from "lucide-react";
import { useTISSConvenios } from "@/modules/tiss/application/hooks/useTISSConvenios";
import { usePacienteConvenios } from "@/modules/tiss/application/hooks/usePacienteConvenios";

interface PacienteConveniosTabProps {
  patientId: string;
}

export function PacienteConveniosTab({ patientId }: PacienteConveniosTabProps) {
  const { convenios } = useTISSConvenios();
  const { vinculos, isLoading, createVinculo, updateVinculo, deleteVinculo, isCreating, isUpdating } = usePacienteConvenios(patientId);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    convenio_id: "",
    numero_carteira: "",
    validade_carteira: "",
  });
  const [open, setOpen] = useState(false);

  const resetForm = () => {
    setForm({ convenio_id: "", numero_carteira: "", validade_carteira: "" });
    setEditing(null);
  };

  const handleEdit = (v: any) => {
    setEditing(v.id);
    setForm({
      convenio_id: v.convenio_id,
      numero_carteira: v.numero_carteira || "",
      validade_carteira: v.validade_carteira || "",
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.convenio_id) return;
    if (editing) {
      updateVinculo({ id: editing, data: form });
    } else {
      createVinculo({ patient_id: patientId, ...form });
    }
    setOpen(false);
    resetForm();
  };

  const getConvenioNome = (convenioId: string) => {
    const c = convenios.find((c) => c.id === convenioId);
    return c?.nome || convenioId;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Carregando convênios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Convênios do Paciente ({vinculos.length})</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Vincular Convênio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Vinculo" : "Vincular Convênio"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Convênio *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.convenio_id}
                  onChange={(e) => setForm({ ...form, convenio_id: e.target.value })}
                  required
                >
                  <option value="">Selecione um convênio</option>
                  {convenios.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número da Carteira</Label>
                  <Input
                    value={form.numero_carteira}
                    onChange={(e) => setForm({ ...form, numero_carteira: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Validade da Carteira</Label>
                  <Input
                    type="date"
                    value={form.validade_carteira}
                    onChange={(e) => setForm({ ...form, validade_carteira: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  <Save className="h-4 w-4 mr-1" />
                  {editing ? "Salvar" : "Vincular"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {vinculos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum convênio vinculado a este paciente
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Convênio</TableHead>
                  <TableHead>Número da Carteira</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vinculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {getConvenioNome(v.convenio_id)}
                      </div>
                    </TableCell>
                    <TableCell>{v.numero_carteira || "-"}</TableCell>
                    <TableCell>
                      {v.validade_carteira
                        ? new Date(v.validade_carteira).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.is_active ? "default" : "secondary"}>
                        {v.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(v)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteVinculo(v.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
