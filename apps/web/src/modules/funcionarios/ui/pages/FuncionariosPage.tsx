import { useState } from "react";
import { useFuncionarios } from "@/modules/funcionarios/hooks/useFuncionarios";
import { FuncionariosList } from "@/modules/funcionarios/components/FuncionariosList";
import { FuncionarioForm } from "@/modules/funcionarios/components/funcionario-form";
import { FuncionarioDetails } from "@/modules/funcionarios/components/FuncionarioDetails";
import { Funcionario } from "@/modules/funcionarios/types/funcionario.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersRound, Plus } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";

type ViewMode = "list" | "form" | "details";

export default function FuncionariosPage() {
  const {
    funcionarios,
    loading,
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
  } = useFuncionarios();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFuncionario, setSelectedFuncionario] = useState<
    Funcionario | undefined
  >();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = () => {
    setSelectedFuncionario(undefined);
    setViewMode("form");
    setDialogOpen(true);
  };

  const handleEdit = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setViewMode("form");
    setDialogOpen(true);
  };

  const handleView = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setViewMode("details");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Funcionario) => {
    if (selectedFuncionario?.id) {
      updateFuncionario(selectedFuncionario.id, data);
    } else {
      addFuncionario(data);
    }
    setDialogOpen(false);
    setSelectedFuncionario(undefined);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedFuncionario(undefined);
  };

  const handleDelete = (id: string) => {
    deleteFuncionario(id);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando funcionários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        icon={UsersRound} 
        title="Funcionários" 
        description="Gestão da equipe e colaboradores da clínica" 
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Button>
        } 
      />

      {/* List View */}
      <FuncionariosList
        funcionarios={funcionarios}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Dialog for Form and Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === "form"
                ? selectedFuncionario
                  ? "Editar Funcionário"
                  : "Novo Funcionário"
                : "Detalhes do Funcionário"}
            </DialogTitle>
          </DialogHeader>

          {viewMode === "form" && (
            <FuncionarioForm
              funcionario={selectedFuncionario}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          {viewMode === "details" && selectedFuncionario && (
            <FuncionarioDetails
              funcionario={selectedFuncionario}
              onEdit={() => setViewMode("form")}
              onClose={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
