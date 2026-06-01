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
import { ProdutoForm } from "../../components/ProdutoForm";
import { ProdutosList } from "../../components/ProdutosList";
import type { Produto, Categoria, Fornecedor } from "../../types/estoque.types";
import type { ViewMode } from "./types";

interface ProdutosTabProps {
  viewMode: ViewMode;
  produtos: Produto[];
  categorias: Categoria[];
  fornecedores: Fornecedor[];
  selectedProduto?: Produto;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onSubmit: (data: Produto) => void;
  onCancel: () => void;
}

export function ProdutosTab({
  viewMode,
  produtos,
  categorias,
  fornecedores,
  selectedProduto,
  searchValue,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onSubmit,
  onCancel,
}: ProdutosTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>
              Gerencie o cadastro de produtos do estoque
            </CardDescription>
          </div>
          <Button type="button" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "list" ? (
          <div className="space-y-4">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Buscar produtos por nome ou código..."
            />
            <ProdutosList
              produtos={produtos}
              categorias={categorias}
              fornecedores={fornecedores}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ) : (
          <ProdutoForm
            produto={selectedProduto}
            categorias={categorias}
            fornecedores={fornecedores}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        )}
      </CardContent>
    </Card>
  );
}
