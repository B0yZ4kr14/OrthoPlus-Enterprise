// cspell:disable
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Plus } from "lucide-react";
import { CategoriaForm } from "../../components/CategoriaForm";
import { CategoriasList } from "../../components/CategoriasList";
import type { Categoria } from "../../types/estoque.types";
import type { ViewMode } from "./types";

interface CategoriasTabProps {
  viewMode: ViewMode;
  categorias: Categoria[];
  selectedCategoria?: Categoria;
  onAdd: () => void;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: string) => void;
  onSubmit: (data: Categoria) => void;
  onCancel: () => void;
}

export function CategoriasTab({
  viewMode,
  categorias,
  selectedCategoria,
  onAdd,
  onEdit,
  onDelete,
  onSubmit,
  onCancel,
}: CategoriasTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Organize produtos em categorias</CardDescription>
          </div>
          <Button type="button" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "list" ? (
          <CategoriasList
            categorias={categorias}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <CategoriaForm
            categoria={selectedCategoria}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        )}
      </CardContent>
    </Card>
  );
}
