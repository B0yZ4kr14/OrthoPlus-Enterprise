/**
 * useInventoryAPI Hook
 * Hook para gestão de inventário via REST API
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

export interface Product {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  descricao?: string;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  valorUnitario: number;
  fornecedor?: string;
  localizacao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useInventoryAPI() {
  const { clinicId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<{ data: unknown[] }>(
        "/inventario/produtos",
      );

      // Converter dados da API para formato frontend
      const transformed: Product[] = response.data.map(
        (apiProduct: unknown) => ({
          // @ts-expect-error — TS18046
          id: apiProduct.id,
          // @ts-expect-error — TS18046
          nome: apiProduct.nome,
          // @ts-expect-error — TS18046
          codigo: apiProduct.codigo,
          // @ts-expect-error — TS18046
          categoria: apiProduct.categoria,
          // @ts-expect-error — TS18046
          descricao: apiProduct.descricao,
          // @ts-expect-error — TS18046
          unidadeMedida: apiProduct.unidade_medida,
          // @ts-expect-error — TS18046
          estoqueAtual: apiProduct.estoque_atual,
          // @ts-expect-error — TS18046
          estoqueMinimo: apiProduct.estoque_minimo,
          // @ts-expect-error — TS18046
          estoqueMaximo: apiProduct.estoque_maximo,
          // @ts-expect-error — TS18046
          valorUnitario: apiProduct.valor_unitario,
          // @ts-expect-error — TS18046
          fornecedor: apiProduct.fornecedor,
          // @ts-expect-error — TS18046
          localizacao: apiProduct.localizacao,
          // @ts-expect-error — TS18046
          ativo: apiProduct.ativo,
          // @ts-expect-error — TS18046
          createdAt: apiProduct.created_at,
          // @ts-expect-error — TS18046
          updatedAt: apiProduct.updated_at,
        }),
      );

      setProducts(transformed);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos: " + _e.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = async (data: Partial<Product>) => {
    if (!clinicId) {
      toast.error("Nenhuma clínica selecionada");
      return;
    }

    try {
      await apiClient.post("/inventario/produtos", {
        clinicId,
        nome: data.nome,
        codigo: data.codigo,
        categoria: data.categoria,
        descricao: data.descricao,
        unidadeMedida: data.unidadeMedida,
        estoqueMinimo: data.estoqueMinimo,
        estoqueMaximo: data.estoqueMaximo,
        valorUnitario: data.valorUnitario,
        fornecedor: data.fornecedor,
        localizacao: data.localizacao,
      });

      toast.success("Produto cadastrado com sucesso!");
      await loadProducts();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      console.error("Error adding product:", error);
      toast.error("Erro ao cadastrar produto: " + _e.message);
      throw error;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await apiClient.patch(`/inventario/produtos/${id}`, {
        nome: data.nome,
        estoqueMinimo: data.estoqueMinimo,
        estoqueMaximo: data.estoqueMaximo,
        valorUnitario: data.valorUnitario,
        ativo: data.ativo,
      });

      toast.success("Produto atualizado com sucesso!");
      await loadProducts();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto: " + _e.message);
      throw error;
    }
  };

  const adjustStock = async (
    id: string,
    quantidade: number,
    motivo: string,
  ) => {
    try {
      await apiClient.post(`/inventario/produtos/${id}/ajustar-estoque`, {
        quantidade,
        motivo,
      });

      toast.success("Estoque ajustado com sucesso!");
      await loadProducts();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      console.error("Error adjusting stock:", error);
      toast.error("Erro ao ajustar estoque: " + _e.message);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiClient.delete(`/inventario/produtos/${id}`);
      toast.success("Produto removido com sucesso!");
      await loadProducts();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      console.error("Error deleting product:", error);
      toast.error("Erro ao remover produto: " + _e.message);
      throw error;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    adjustStock,
    deleteProduct,
    reloadProducts: loadProducts,
  };
}
