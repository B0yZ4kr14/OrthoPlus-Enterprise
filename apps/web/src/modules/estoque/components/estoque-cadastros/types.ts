// cspell:disable
import type { Produto, Fornecedor, Categoria } from "../../types/estoque.types";

export type ViewMode = "list" | "form";
export type EntityType = "produto" | "fornecedor" | "categoria";

export interface ItemToDelete {
  id: string;
  type: EntityType;
}

export interface EstoqueCadastrosState {
  produtoViewMode: ViewMode;
  fornecedorViewMode: ViewMode;
  categoriaViewMode: ViewMode;
  selectedProduto?: Produto;
  selectedFornecedor?: Fornecedor;
  selectedCategoria?: Categoria;
  scannerOpen: boolean;
  deleteDialogOpen: boolean;
  itemToDelete: ItemToDelete | null;
  searchProduto: string;
  searchFornecedor: string;
}

export interface SummaryData {
  produtosCount: number;
  produtosAtivos: number;
  fornecedoresCount: number;
  fornecedoresAtivos: number;
  categoriasCount: number;
}
