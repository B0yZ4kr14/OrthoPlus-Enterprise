import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import { toast } from "sonner"
import { useEffect } from "react"
import { frontendMetrics } from "@/lib/metrics"

export interface AdminResourceOptions<T, CreateInput, UpdateInput> {
  resource: string
  clinicId: string | undefined
  enabled?: boolean
}

export function useAdminResource<T, CreateInput = unknown, UpdateInput = unknown>(
  options: AdminResourceOptions<T, CreateInput, UpdateInput>,
) {
  const { resource, clinicId, enabled = true } = options
  const queryClient = useQueryClient()
  const queryKey = [resource, clinicId]

  const { data: items = [], isLoading, error } = useQuery<T[]>({
    queryKey,
    queryFn: async () => {
      if (!clinicId) return []
      const data = await apiClient.get<T[]>(`/admin/${resource}`)
      return Array.isArray(data) ? data : []
    },
    enabled: enabled && !!clinicId,
  })

  // Emit render metric for EP-4 compliance
  useEffect(() => {
    frontendMetrics.recordHookRender(`useAdminResource_${resource}`, window.location.pathname)
  }, [resource])

  const create = useMutation({
    mutationFn: async (input: CreateInput) => {
      if (!clinicId) throw new Error("Missing clinic context")
      return apiClient.post(`/admin/${resource}`, { clinic_id: clinicId, ...input as object })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success(`${resource} criado com sucesso`)
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar ${resource}: ${err.message}`)
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateInput }) => {
      if (!clinicId) throw new Error("Missing clinic context")
      return apiClient.patch(`/admin/${resource}/${id}`, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success(`${resource} atualizado com sucesso`)
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar ${resource}: ${err.message}`)
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!clinicId) throw new Error("Missing clinic context")
      return apiClient.delete(`/admin/${resource}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success(`${resource} removido com sucesso`)
    },
    onError: (err: Error) => {
      toast.error(`Erro ao remover ${resource}: ${err.message}`)
    },
  })

  return {
    items,
    isLoading,
    error,
    create: create.mutate,
    isCreating: create.isPending,
    update: update.mutate,
    isUpdating: update.isPending,
    remove: remove.mutate,
    isRemoving: remove.isPending,
  }
}
