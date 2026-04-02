import { useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, Shield } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Funcionario,
  FuncionarioFilters,
  cargosDisponiveis,
} from "../types/funcionario.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@orthoplus/core-ui/alert-dialog";
import { getStatusColor } from "@/lib/utils/status.utils";

interface FuncionariosListProps {
  funcionarios: Funcionario[];
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: string) => void;
  onView: (funcionario: Funcionario) => void;
  onAdd: () => void;
}

export function FuncionariosList({
  funcionarios,
  onEdit,
  onDelete,
  onView,
  onAdd,
}: FuncionariosListProps) {
  const [filters, setFilters] = useState<FuncionarioFilters>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredFuncionarios = funcionarios.filter((funcionario) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !funcionario.nome.toLowerCase().includes(searchLower) &&
        !funcionario.cpf.includes(filters.search) &&
        !funcionario.email.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.status && funcionario.status !== filters.status) {
      return false;
    }
    if (filters.cargo && funcionario.cargo !== filters.cargo) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, email..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                status: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Férias">Férias</SelectItem>
              <SelectItem value="Afastado">Afastado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.cargo || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                cargo: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {cargosDisponiveis.map((cargo) => (
                <SelectItem key={cargo} value={cargo}>
                  {cargo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredFuncionarios.length} funcionário(s) encontrado(s)
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFuncionarios.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum funcionário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredFuncionarios.map((funcionario) => (
                <TableRow key={funcionario.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {funcionario.cargo === "Administrador" && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-medium">{funcionario.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>{funcionario.cpf}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{funcionario.cargo}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{funcionario.celular}</div>
                      <div className="text-muted-foreground text-xs">
                        {funcionario.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(funcionario.status)}>
                      {funcionario.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(funcionario)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(funcionario)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(funcionario.id!)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não
              pode ser desfeita e removerá todos os acessos e permissões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
