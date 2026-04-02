import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLGPDRequests = () => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["lgpd-requests", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<unknown[]>("/lgpd/solicitacoes");
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: consents = [], isLoading: isLoadingConsents } = useQuery({
    queryKey: ["lgpd-consents", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<unknown[]>("/lgpd/consentimentos");
      return data;
    },
    enabled: !!clinicId,
  });

  const createRequest = useMutation({
    mutationFn: async (requestData: unknown) => {
      const response = await apiClient.post<unknown>("/lgpd/solicitacoes", {
        ...requestData,
        requested_by: user?.id,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lgpd-requests", clinicId] });
      toast.success("Solicitação criada!");
    },
    onError: () => {
      toast.error("Erro ao criar solicitação");
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/lgpd/solicitacoes/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lgpd-requests", clinicId] });
      toast.success("Status atualizado!");
    },
  });

  return {
    requests,
    consents,
    isLoading: isLoading || isLoadingConsents,
    createRequest: createRequest.mutate,
    updateRequestStatus: updateRequestStatus.mutate,
  };
};
