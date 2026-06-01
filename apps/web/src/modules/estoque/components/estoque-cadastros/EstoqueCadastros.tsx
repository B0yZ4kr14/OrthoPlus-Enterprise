// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { Package, Scan } from "lucide-react";
import { BarcodeScannerDialog } from "../../components/BarcodeScannerDialog";
import { useEstoqueCadastros } from "./useEstoqueCadastros";
import { SummaryCards } from "./SummaryCards";
import { ProdutosTab } from "./ProdutosTab";
import { FornecedoresTab } from "./FornecedoresTab";
import { CategoriasTab } from "./CategoriasTab";

export function EstoqueCadastros() {
  const {
    loading,
    summary,
    categorias,
    fornecedores,
    filteredProdutos,
    filteredFornecedores,
    produtoViewMode,
    fornecedorViewMode,
    categoriaViewMode,
    selectedProduto,
    selectedFornecedor,
    selectedCategoria,
    scannerOpen,
    deleteDialogOpen,
    itemToDelete,
    searchProduto,
    searchFornecedor,
    setScannerOpen,
    setDeleteDialogOpen,
    setProdutoViewMode,
    setFornecedorViewMode,
    setCategoriaViewMode,
    setSearchProduto,
    setSearchFornecedor,
    handleAddProduto,
    handleEditProduto,
    handleSubmitProduto,
    handleDeleteProduto,
    handleAddFornecedor,
    handleEditFornecedor,
    handleSubmitFornecedor,
    handleDeleteFornecedor,
    handleAddCategoria,
    handleEditCategoria,
    handleSubmitCategoria,
    handleDeleteCategoria,
    confirmDelete,
    handleScanSuccess,
  } = useEstoqueCadastros();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Package}
          title="Cadastros de Estoque"
          description="Gestão de produtos, fornecedores e categorias do estoque"
        />
        <LoadingState
          variant="spinner"
          size="lg"
          message="Carregando cadastros..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          icon={Package}
          title="Cadastros de Estoque"
          description="Gestão de produtos, fornecedores e categorias do estoque"
        />
        <Button type="button"
          onClick={() => setScannerOpen(true)}
          variant="outline"
          className="hover-scale"
        >
          <Scan className="mr-2 h-4 w-4" />
          Scanner de Código de Barras
        </Button>
      </div>

      <SummaryCards data={summary} />

      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          <ProdutosTab
            viewMode={produtoViewMode}
            produtos={filteredProdutos}
            categorias={categorias}
            fornecedores={fornecedores}
            selectedProduto={selectedProduto}
            searchValue={searchProduto}
            onSearchChange={setSearchProduto}
            onAdd={handleAddProduto}
            onEdit={handleEditProduto}
            onDelete={handleDeleteProduto}
            onSubmit={handleSubmitProduto}
            onCancel={() => {
              setProdutoViewMode("list");
            }}
          />
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          <FornecedoresTab
            viewMode={fornecedorViewMode}
            fornecedores={filteredFornecedores}
            selectedFornecedor={selectedFornecedor}
            searchValue={searchFornecedor}
            onSearchChange={setSearchFornecedor}
            onAdd={handleAddFornecedor}
            onEdit={handleEditFornecedor}
            onDelete={handleDeleteFornecedor}
            onSubmit={handleSubmitFornecedor}
            onCancel={() => {
              setFornecedorViewMode("list");
            }}
          />
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <CategoriasTab
            viewMode={categoriaViewMode}
            categorias={categorias}
            selectedCategoria={selectedCategoria}
            onAdd={handleAddCategoria}
            onEdit={handleEditCategoria}
            onDelete={handleDeleteCategoria}
            onSubmit={handleSubmitCategoria}
            onCancel={() => {
              setCategoriaViewMode("list");
            }}
          />
        </TabsContent>
      </Tabs>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir este ${itemToDelete?.type}? Esta ação não pode ser desfeita.`}
      />

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}

export default EstoqueCadastros;
