import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

export interface Convenio {
  id: string;
  clinic_id: string;
  nome: string;
  codigo_operadora?: string;
  cnpj?: string;
  registro_ans?: string;
  tipo_plano?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTISSConvenios() {
  const queryClient = useQueryClient();

  const { data: convenios = [], isLoading } = useQuery({
    queryKey: ["tiss-convenios"],
    queryFn: async () => {
      return await apiClient.get<Convenio[]>("/tiss/convenios");
    },
  });

  const createConvenio = useMutation({
    mutationFn: async (data: Partial<Convenio>) => {
      return await apiClient.post<Convenio>("/tiss/convenios", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-convenios"] });
      toast.success("Convênio criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar convênio");
    },
  });

  const updateConvenio = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Convenio>;
    }) => {
      return await apiClient.patch<Convenio>(`/tiss/convenios/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-convenios"] });
      toast.success("Convênio atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar convênio");
    },
  });

  const deleteConvenio = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/tiss/convenios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiss-convenios"] });
      toast.success("Convênio removido com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover convênio");
    },
  });

  return {
    convenios,
    isLoading,
    createConvenio: createConvenio.mutate,
    updateConvenio: updateConvenio.mutate,
    deleteConvenio: deleteConvenio.mutate,
    isCreating: createConvenio.isPending,
    isUpdating: updateConvenio.isPending,
    isDeleting: deleteConvenio.isPending,
  };
}
