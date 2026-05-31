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
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import {
  useTISSConvenios,
  Convenio,
} from "@/modules/tiss/application/hooks/useTISSConvenios";

export function TISSConveniosManager() {
  const {
    convenios,
    isLoading,
    createConvenio,
    updateConvenio,
    deleteConvenio,
    isCreating,
    isUpdating,
  } = useTISSConvenios();
  const [editing, setEditing] = useState<Convenio | null>(null);
  const [form, setForm] = useState<Partial<Convenio>>({ is_active: true });
  const [open, setOpen] = useState(false);

  const resetForm = () => {
    setForm({ is_active: true });
    setEditing(null);
  };

  const handleEdit = (c: Convenio) => {
    setEditing(c);
    setForm(c);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) return;
    if (editing) {
      updateConvenio({ id: editing.id, data: form });
    } else {
      createConvenio(form);
    }
    setOpen(false);
    resetForm();
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
        <h3 className="text-lg font-semibold">
          Convênios ({convenios.length})
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Convênio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Convênio" : "Novo Convênio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="convenio-nome">Nome *</Label>
                <Input
                  id="convenio-nome"
                  value={form.nome || ""}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="convenio-codigo">Código Operadora</Label>
                  <Input
                    id="convenio-codigo"
                    value={form.codigo_operadora || ""}
                    onChange={(e) =>
                      setForm({ ...form, codigo_operadora: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="convenio-cnpj">CNPJ</Label>
                  <Input
                    id="convenio-cnpj"
                    value={form.cnpj || ""}
                    onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="convenio-ans">Registro ANS</Label>
                  <Input
                    id="convenio-ans"
                    value={form.registro_ans || ""}
                    onChange={(e) =>
                      setForm({ ...form, registro_ans: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="convenio-tipo">Tipo Plano</Label>
                  <Input
                    id="convenio-tipo"
                    value={form.tipo_plano || ""}
                    onChange={(e) =>
                      setForm({ ...form, tipo_plano: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  <Save className="h-4 w-4 mr-1" />
                  {editing ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Registro ANS</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {convenios.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{c.codigo_operadora || "-"}</TableCell>
                  <TableCell>{c.cnpj || "-"}</TableCell>
                  <TableCell>{c.registro_ans || "-"}</TableCell>
                  <TableCell>{c.tipo_plano || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "default" : "secondary"}>
                      {c.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteConvenio(c.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
