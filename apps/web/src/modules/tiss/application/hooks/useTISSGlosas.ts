import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface GlosaData {
  glosa_amount: number;
  glosa_date: string;
  glosa_reason: string;
}

export function useTISSGlosas() {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: glosas = [], isLoading } = useQuery({
    queryKey: ["tiss-glosas", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<Record<string, any>[]>('/tiss/glosas');
      return data;
    },
    enabled: !!clinicId,
  });

  const registerGlosa = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GlosaData }) => {
      const response = await apiClient.patch<unknown>(`/tiss/glosas/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-glosas", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["tiss-guides", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["tiss-statistics", clinicId] });
      toast.success("Glosa registrada!");
    },
    onError: () => {
      toast.error("Erro ao registrar glosa");
    },
  });

  const reprocessarGlosa = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<unknown>(`/tiss/glosas/${id}/reprocessar`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-glosas", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["tiss-guides", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["tiss-statistics", clinicId] });
      toast.success("Guia reprocessada!");
    },
    onError: () => {
      toast.error("Erro ao reprocessar glosa");
    },
  });

  return {
    glosas,
    isLoading,
    registerGlosa: registerGlosa.mutateAsync,
    reprocessarGlosa: reprocessarGlosa.mutateAsync,
    isRegistering: registerGlosa.isPending,
    isReprocessing: reprocessarGlosa.isPending,
  };
}
