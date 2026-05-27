import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface TISSGlosa {
  id: string;
  clinic_id: string;
  guide_number: string;
  patient_id: string;
  insurance_company: string;
  procedure_code: string;
  procedure_name: string;
  amount: number;
  status: string;
  glosa_amount?: number;
  glosa_reason?: string;
  glosa_date?: string;
  service_date: string;
  created_at: string;
}

export function useTISSGlosas() {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: glosas = [], isLoading } = useQuery({
    queryKey: ["tiss-glosas", clinicId],
    queryFn: async () => {
      const response = await apiClient.get<TISSGlosa[]>("/tiss/glosas");
      return response;
    },
    enabled: !!clinicId,
  });

  const updateGlosa = useMutation({
    mutationFn: async ({ id, glosa_reason, glosa_amount }: { id: string; glosa_reason: string; glosa_amount: number }) => {
      const response = await apiClient.patch<TISSGlosa>(`/tiss/glosas/${id}`, { glosa_reason, glosa_amount });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-glosas"] });
      queryClient.invalidateQueries({ queryKey: ["tiss-guides"] });
      queryClient.invalidateQueries({ queryKey: ["tiss-statistics"] });
      toast.success("Glosa registrada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar glosa: ${error.message}`);
    },
  });

  const reprocessarGlosa = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<TISSGlosa>(`/tiss/glosas/${id}/reprocessar`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-glosas"] });
      queryClient.invalidateQueries({ queryKey: ["tiss-guides"] });
      queryClient.invalidateQueries({ queryKey: ["tiss-statistics"] });
      toast.success("Guia reprocessada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao reprocessar guia: ${error.message}`);
    },
  });

  return {
    glosas,
    isLoading,
    updateGlosa: updateGlosa.mutate,
    isUpdatingGlosa: updateGlosa.isPending,
    reprocessarGlosa: reprocessarGlosa.mutate,
    isReprocessando: reprocessarGlosa.isPending,
  };
}
