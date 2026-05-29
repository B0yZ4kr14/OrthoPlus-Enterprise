import { useState } from "react";
import { useDentistasStore } from "@/modules/dentistas/hooks/useDentistasStore";
import { DentistasList } from "@/modules/dentistas/components/DentistasList";
import { DentistaForm } from "@/modules/dentistas/components/dentista-form";
import { DentistaDetails } from "@/modules/dentistas/components/DentistaDetails";
import { Dentista } from "@/modules/dentistas/types/dentista.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserCog, Plus } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";

type ViewMode = "list" | "form" | "details";

export default function DentistasPage() {
  const { dentistas, loading, addDentista, updateDentista, deleteDentista } =
    useDentistasStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDentista, setSelectedDentista] = useState<
    Dentista | undefined
  >();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = () => {
    setSelectedDentista(undefined);
    setViewMode("form");
    setDialogOpen(true);
  };

  const handleEdit = (dentista: Dentista) => {
    setSelectedDentista(dentista);
    setViewMode("form");
    setDialogOpen(true);
  };

  const handleView = (dentista: Dentista) => {
    setSelectedDentista(dentista);
    setViewMode("details");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Dentista) => {
    if (selectedDentista?.id) {
      updateDentista(selectedDentista.id, data);
    } else {
      addDentista(data);
    }
    setDialogOpen(false);
    setSelectedDentista(undefined);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedDentista(undefined);
  };

  const handleDelete = (id: string) => {
    deleteDentista(id);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dentistas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={UserCog}
        title="Dentistas"
        description="Gerenciamento de dentistas e especialistas"
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Dentista
          </Button>
        }
      />

      {/* List View */}
      <DentistasList
        dentistas={dentistas}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Dialog for Form and Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === "form"
                ? selectedDentista
                  ? "Editar Dentista"
                  : "Novo Dentista"
                : "Detalhes do Dentista"}
            </DialogTitle>
          </DialogHeader>

          {viewMode === "form" && (
            <DentistaForm
              dentista={selectedDentista}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          {viewMode === "details" && selectedDentista && (
            <DentistaDetails
              dentista={selectedDentista}
              onEdit={() => setViewMode("form")}
              onClose={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
