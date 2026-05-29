import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

export interface PacienteConvenio {
  id: string;
  clinic_id: string;
  patient_id: string;
  convenio_id: string;
  numero_carteira?: string;
  validade_carteira?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePacienteConvenios(patientId?: string) {
  const queryClient = useQueryClient();

  const { data: vinculos = [], isLoading } = useQuery({
    queryKey: ["paciente-convenios", patientId],
    queryFn: async () => {
      const params = patientId ? `?patient_id=${patientId}` : "";
      return await apiClient.get<PacienteConvenio[]>(
        `/tiss/paciente-convenios${params}`,
      );
    },
    enabled: !!patientId,
  });

  const createVinculo = useMutation({
    mutationFn: async (data: Partial<PacienteConvenio>) => {
      return await apiClient.post<PacienteConvenio>(
        "/tiss/paciente-convenios",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente-convenios"] });
      toast.success("Convenio vinculado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao vincular convenio");
    },
  });

  const updateVinculo = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PacienteConvenio>;
    }) => {
      return await apiClient.patch<PacienteConvenio>(
        `/tiss/paciente-convenios/${id}`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente-convenios"] });
      toast.success("Vinculo atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar vinculo");
    },
  });

  const deleteVinculo = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/tiss/paciente-convenios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paciente-convenios"] });
      toast.success("Vinculo removido com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover vinculo");
    },
  });

  return {
    vinculos,
    isLoading,
    createVinculo: createVinculo.mutate,
    updateVinculo: updateVinculo.mutate,
    deleteVinculo: deleteVinculo.mutate,
    isCreating: createVinculo.isPending,
    isUpdating: updateVinculo.isPending,
    isDeleting: deleteVinculo.isPending,
  };
}
