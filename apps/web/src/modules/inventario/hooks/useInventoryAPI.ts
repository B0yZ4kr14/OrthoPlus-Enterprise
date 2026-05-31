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
      const response = await apiClient.get<{
        data: Array<Record<string, unknown>>;
      }>("/inventario/produtos");

      // Converter dados da API para formato frontend
      const transformed: Product[] = response.data.map((apiProduct) => ({
        id: String(apiProduct.id),
        nome: String(apiProduct.nome),
        codigo: String(apiProduct.codigo),
        categoria: String(apiProduct.categoria),
        descricao: apiProduct.descricao
          ? String(apiProduct.descricao)
          : undefined,
        unidadeMedida: String(apiProduct.unidade_medida),
        estoqueAtual: Number(apiProduct.estoque_atual),
        estoqueMinimo: Number(apiProduct.estoque_minimo),
        estoqueMaximo: Number(apiProduct.estoque_maximo),
        valorUnitario: Number(apiProduct.valor_unitario),
        fornecedor: apiProduct.fornecedor
          ? String(apiProduct.fornecedor)
          : undefined,
        localizacao: apiProduct.localizacao
          ? String(apiProduct.localizacao)
          : undefined,
        ativo: Boolean(apiProduct.ativo),
        createdAt: String(apiProduct.created_at),
        updatedAt: String(apiProduct.updated_at),
      }));

      setProducts(transformed);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      // Erro silencioso - hook retorna erro para UI
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
      // Erro silencioso - hook retorna erro para UI
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
      // Erro silencioso - hook retorna erro para UI
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
      // Erro silencioso - hook retorna erro para UI
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
      // Erro silencioso - hook retorna erro para UI
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
