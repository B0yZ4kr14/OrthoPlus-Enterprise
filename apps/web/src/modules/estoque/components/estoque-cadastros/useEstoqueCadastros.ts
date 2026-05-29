// cspell:disable
import { useState, useMemo, useCallback } from "react";
import { useEstoque } from "@/modules/estoque/hooks/useEstoque";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Produto, Fornecedor, Categoria } from "../../types/estoque.types";

import type { ViewMode, ItemToDelete, SummaryData } from "./types";

export function useEstoqueCadastros() {
  const { toast } = useToast();
  const {
    produtos,
    fornecedores,
    categorias,
    loading,
    addProduto,
    updateProduto,
    deleteProduto,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    addCategoria,
    updateCategoria,
    deleteCategoria,
  } = useEstoque();

  const [produtoViewMode, setProdutoViewMode] = useState<ViewMode>("list");
  const [fornecedorViewMode, setFornecedorViewMode] =
    useState<ViewMode>("list");
  const [categoriaViewMode, setCategoriaViewMode] = useState<ViewMode>("list");

  const [selectedProduto, setSelectedProduto] = useState<Produto | undefined>();
  const [selectedFornecedor, setSelectedFornecedor] = useState<
    Fornecedor | undefined
  >();
  const [selectedCategoria, setSelectedCategoria] = useState<
    Categoria | undefined
  >();
  const [scannerOpen, setScannerOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);

  const [searchProduto, setSearchProduto] = useState("");
  const [searchFornecedor, setSearchFornecedor] = useState("");

  const summary: SummaryData = useMemo(
    () => ({
      produtosCount: produtos.length,
      produtosAtivos: produtos.filter((p) => p.ativo).length,
      fornecedoresCount: fornecedores.length,
      fornecedoresAtivos: fornecedores.filter((f) => f.ativo).length,
      categoriasCount: categorias.length,
    }),
    [produtos, fornecedores, categorias],
  );

  const filteredProdutos = useMemo(
    () =>
      produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
          p.codigo?.toLowerCase().includes(searchProduto.toLowerCase()),
      ),
    [produtos, searchProduto],
  );

  const filteredFornecedores = useMemo(
    () =>
      fornecedores.filter(
        (f) =>
          f.nome.toLowerCase().includes(searchFornecedor.toLowerCase()) ||
          f.cnpj?.toLowerCase().includes(searchFornecedor.toLowerCase()),
      ),
    [fornecedores, searchFornecedor],
  );

  // Produtos handlers
  const handleAddProduto = useCallback(() => {
    setSelectedProduto(undefined);
    setProdutoViewMode("form");
  }, []);

  const handleEditProduto = useCallback((produto: Produto) => {
    setSelectedProduto(produto);
    setProdutoViewMode("form");
  }, []);

  const handleSubmitProduto = useCallback(
    (data: Produto) => {
      if (selectedProduto) {
        updateProduto(selectedProduto.id!, data);
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        addProduto(data);
        toast({
          title: "Sucesso",
          description: "Produto cadastrado com sucesso!",
        });
      }
      setProdutoViewMode("list");
      setSelectedProduto(undefined);
    },
    [selectedProduto, addProduto, updateProduto, toast],
  );

  const handleDeleteProduto = useCallback((id: string) => {
    setItemToDelete({ id, type: "produto" });
    setDeleteDialogOpen(true);
  }, []);

  // Fornecedores handlers
  const handleAddFornecedor = useCallback(() => {
    setSelectedFornecedor(undefined);
    setFornecedorViewMode("form");
  }, []);

  const handleEditFornecedor = useCallback((fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setFornecedorViewMode("form");
  }, []);

  const handleSubmitFornecedor = useCallback(
    async (data: Fornecedor) => {
      try {
        if (selectedFornecedor) {
          await updateFornecedor(selectedFornecedor.id!, data);
          toast({
            title: "Sucesso",
            description: "Fornecedor atualizado com sucesso!",
          });
        } else {
          await addFornecedor(data);
          toast({
            title: "Sucesso",
            description: "Fornecedor cadastrado com sucesso!",
          });
        }
        setFornecedorViewMode("list");
        setSelectedFornecedor(undefined);
      } catch (error) {
        logger.error("Erro ao salvar fornecedor:", error);
        toast({
          title: "Erro",
          description: "Erro ao salvar fornecedor",
          variant: "destructive",
        });
      }
    },
    [selectedFornecedor, addFornecedor, updateFornecedor, toast],
  );

  const handleDeleteFornecedor = useCallback((id: string) => {
    setItemToDelete({ id, type: "fornecedor" });
    setDeleteDialogOpen(true);
  }, []);

  // Categorias handlers
  const handleAddCategoria = useCallback(() => {
    setSelectedCategoria(undefined);
    setCategoriaViewMode("form");
  }, []);

  const handleEditCategoria = useCallback((categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setCategoriaViewMode("form");
  }, []);

  const handleSubmitCategoria = useCallback(
    async (data: Categoria) => {
      try {
        if (selectedCategoria) {
          await updateCategoria(selectedCategoria.id!, data);
          toast({
            title: "Sucesso",
            description: "Categoria atualizada com sucesso!",
          });
        } else {
          await addCategoria(data);
          toast({
            title: "Sucesso",
            description: "Categoria cadastrada com sucesso!",
          });
        }
        setCategoriaViewMode("list");
        setSelectedCategoria(undefined);
      } catch (error) {
        logger.error("Erro ao salvar categoria:", error);
        toast({
          title: "Erro",
          description: "Erro ao salvar categoria",
          variant: "destructive",
        });
      }
    },
    [selectedCategoria, addCategoria, updateCategoria, toast],
  );

  const handleDeleteCategoria = useCallback((id: string) => {
    setItemToDelete({ id, type: "categoria" });
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case "produto":
          await deleteProduto(itemToDelete.id);
          toast({
            title: "Sucesso",
            description: "Produto excluído com sucesso!",
          });
          break;
        case "fornecedor":
          await deleteFornecedor(itemToDelete.id);
          toast({
            title: "Sucesso",
            description: "Fornecedor excluído com sucesso!",
          });
          break;
        case "categoria":
          await deleteCategoria(itemToDelete.id);
          toast({
            title: "Sucesso",
            description: "Categoria excluída com sucesso!",
          });
          break;
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      logger.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir item",
        variant: "destructive",
      });
    }
  }, [itemToDelete, deleteProduto, deleteFornecedor, deleteCategoria, toast]);

  const handleScanSuccess = useCallback(
    (barcode: string) => {
      const produto = produtos.find(
        (p) => p.codigoBarras === barcode || p.codigo === barcode,
      );
      if (produto) {
        setSelectedProduto(produto);
        setProdutoViewMode("form");
        toast({
          title: "Sucesso",
          description: `Produto encontrado: ${produto.nome}`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Produto não encontrado com este código de barras",
          variant: "destructive",
        });
      }
    },
    [produtos, toast],
  );

  return {
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
    setProdutoViewMode,
    setFornecedorViewMode,
    setCategoriaViewMode,
    setScannerOpen,
    setDeleteDialogOpen,
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
  };
}
