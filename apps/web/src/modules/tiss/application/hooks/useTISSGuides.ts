import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseTISSGuidesOptions {
  batchStatus?: string;
}

export const useTISSGuides = (options: UseTISSGuidesOptions = {}) => {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();
  const { batchStatus } = options;

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["tiss-guides", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<Record<string, any>[]>('/tiss/guias');
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ["tiss-batches", clinicId, batchStatus],
    queryFn: async () => {
      if (!clinicId) return [];
      const config = batchStatus ? { params: { status: batchStatus } } : undefined;
      const data = await apiClient.get<Record<string, any>[]>('/tiss/lotes', config);
      return data;
    },
    enabled: !!clinicId,
  });

  const createGuide = useMutation({
    mutationFn: async (guideData: unknown) => {
      const response = await apiClient.post<unknown>("/tiss/guias", guideData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-guides", clinicId] });
      toast.success("Guia TISS criada!");
    },
    onError: () => {
      toast.error("Erro ao criar guia");
    },
  });

  const createBatch = useMutation({
    mutationFn: async (guideIds: string[]) => {
      const response = await apiClient.post<unknown>("/tiss/lotes", {
        guide_ids: guideIds,
        batch_number: `LOTE-${Date.now()}`,
        insurance_company: "A_DEFINIR",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-batches", clinicId] });
      toast.success("Lote criado!");
    },
    onError: () => {
      toast.error("Erro ao criar lote");
    },
  });

  return {
    guides,
    batches,
    isLoading: isLoading || isLoadingBatches,
    createGuide: createGuide.mutateAsync,
    createBatch: createBatch.mutateAsync,
    isCreating: createGuide.isPending,
    isCreatingBatch: createBatch.isPending,
  };
};
