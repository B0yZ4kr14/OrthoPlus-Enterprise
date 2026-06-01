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
import { SearchInput } from "@/components/shared/SearchInput";
import { FornecedorForm } from "../../components/fornecedor-form";
import { FornecedoresList } from "../../components/FornecedoresList";
import type { Fornecedor } from "../../types/estoque.types";
import type { ViewMode } from "./types";

interface FornecedoresTabProps {
  viewMode: ViewMode;
  fornecedores: Fornecedor[];
  selectedFornecedor?: Fornecedor;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (id: string) => void;
  onSubmit: (data: Fornecedor) => void;
  onCancel: () => void;
}

export function FornecedoresTab({
  viewMode,
  fornecedores,
  selectedFornecedor,
  searchValue,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onSubmit,
  onCancel,
}: FornecedoresTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fornecedores</CardTitle>
            <CardDescription>
              Gerencie o cadastro de fornecedores
            </CardDescription>
          </div>
          <Button type="button" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "list" ? (
          <div className="space-y-4">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Buscar fornecedores por nome ou CNPJ..."
            />
            <FornecedoresList
              fornecedores={fornecedores}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ) : (
          <FornecedorForm
            fornecedor={selectedFornecedor}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        )}
      </CardContent>
    </Card>
  );
}
