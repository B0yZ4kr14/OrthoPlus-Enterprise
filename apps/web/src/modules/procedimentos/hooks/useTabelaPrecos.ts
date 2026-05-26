import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import type {
  TabelaPreco,
  ProcedimentoPreco,
  CriarTabelaPreco,
  AtualizarTabelaPreco,
  CriarProcedimentoPreco,
  ReajusteLote,
} from "../types/procedimento-precos.types"

const BASE = "/procedimentos"

export function useTabelasPrecos() {
  return useQuery({
    queryKey: ["tabelas-precos"],
    queryFn: async () => apiClient.get<TabelaPreco[]>(`${BASE}/tabelas`),
  })
}

export function useTabelaPreco(id: string | null) {
  return useQuery({
    queryKey: ["tabelas-precos", id],
    queryFn: async () => {
      if (!id) return null
      return apiClient.get<TabelaPreco & { precos: ProcedimentoPreco[] }>(`${BASE}/tabelas/${id}`)
    },
    enabled: !!id,
  })
}

export function useCreateTabelaPreco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CriarTabelaPreco) =>
      apiClient.post<TabelaPreco>(`${BASE}/tabelas`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tabelas-precos"] }),
  })
}

export function useUpdateTabelaPreco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarTabelaPreco }) =>
      apiClient.patch<TabelaPreco>(`${BASE}/tabelas/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tabelas-precos"] }),
  })
}

export function useDeleteTabelaPreco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`${BASE}/tabelas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tabelas-precos"] }),
  })
}

export function usePrecosProcedimentos(tabelaId?: string, templateId?: string) {
  const params = new URLSearchParams()
  if (tabelaId) params.append("tabela_id", tabelaId)
  if (templateId) params.append("template_id", templateId)
  return useQuery({
    queryKey: ["procedimento-precos", tabelaId, templateId],
    queryFn: async () => apiClient.get<ProcedimentoPreco[]>(`${BASE}/precos?${params.toString()}`),
  })
}

export function useCreateProcedimentoPreco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CriarProcedimentoPreco) =>
      apiClient.post<ProcedimentoPreco>(`${BASE}/precos`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["procedimento-precos"] }),
  })
}

export function useUpdateProcedimentoPreco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CriarProcedimentoPreco> }) =>
      apiClient.patch<ProcedimentoPreco>(`${BASE}/precos/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["procedimento-precos"] }),
  })
}

export function useDeleteProcedimentoPreco() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`${BASE}/precos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["procedimento-precos"] }),
  })
}

export function useReajusteLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReajusteLote) =>
      apiClient.post(`${BASE}/precos/reajuste`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["procedimento-precos"] })
      qc.invalidateQueries({ queryKey: ["tabelas-precos"] })
    },
  })
}
