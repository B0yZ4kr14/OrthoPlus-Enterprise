import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

export interface NFe {
  id: string;
  clinic_id: string;
  venda_id?: string;
  tipo_nota: string;
  numero: number;
  serie: number;
  chave_acesso: string;
  valor_total: number;
  status: string;
  protocolo?: string;
  xml_autorizacao?: string;
  motivo_cancelamento?: string;
  data_cancelamento?: string;
  data_emissao: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNFeData {
  vendaId?: string;
  tipoNota: "NFE" | "NFCE" | "NFSE";
  numero: number;
  serie?: number;
  chaveAcesso: string;
  valorTotal: number;
  dataEmissao: string;
}

export function useNFes() {
  const queryClient = useQueryClient();

  const { data: nfes = [], isLoading } = useQuery({
    queryKey: ["faturamento-nfes"],
    queryFn: async () => {
      const response = await apiClient.get<{ nfes: NFe[] }>(
        "/faturamento/nfes",
      );
      return response.nfes;
    },
  });

  const createNFe = useMutation({
    mutationFn: async (data: CreateNFeData) => {
      const response = await apiClient.post<{ data: NFe }>(
        "/faturamento/nfes",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faturamento-nfes"] });
      toast.success("NFe criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar NFe");
    },
  });

  const authorizeNFe = useMutation({
    mutationFn: async ({
      id,
      protocolo,
      xml,
    }: {
      id: string;
      protocolo: string;
      xml: string;
    }) => {
      await apiClient.post(`/faturamento/nfes/${id}/autorizar`, {
        protocolo,
        xml,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faturamento-nfes"] });
      toast.success("NFe autorizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao autorizar NFe");
    },
  });

  const cancelNFe = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      await apiClient.post(`/faturamento/nfes/${id}/cancelar`, { motivo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faturamento-nfes"] });
      toast.success("NFe cancelada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao cancelar NFe");
    },
  });

  return {
    nfes,
    isLoading,
    createNFe: createNFe.mutate,
    authorizeNFe: authorizeNFe.mutate,
    cancelNFe: cancelNFe.mutate,
    isCreating: createNFe.isPending,
    isAuthorizing: authorizeNFe.isPending,
    isCanceling: cancelNFe.isPending,
  };
}
