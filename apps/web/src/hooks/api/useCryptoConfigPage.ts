import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface ExchangeItem {
  id: string;
  name: string;
  config: string;
  status: string;
}

interface PortfolioData {
  total_value_usd: number;
  total_btc: number;
  assets: Array<{
    symbol: string;
    amount: number;
    value_usd: number;
  }>;
}

interface ExchangeFormData {
  name: string;
  config: string;
  passphrase: string;
}

export const useCryptoConfigPage = () => {
  const queryClient = useQueryClient();

  const { data: exchanges = [], isLoading: isLoadingExchanges } = useQuery({
    queryKey: ["crypto-config-page", "exchanges"],
    queryFn: async () => {
      return await apiClient.get<ExchangeItem[]>("/crypto-config/exchanges");
    },
  });

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["crypto-config-page", "portfolio"],
    queryFn: async () => {
      return await apiClient.get<PortfolioData>("/crypto-config/portfolio");
    },
  });

  const addExchangeMutation = useMutation({
    mutationFn: async (data: ExchangeFormData) => {
      return await apiClient.post("/crypto-config/exchanges", data);
    },
    onSuccess: () => {
      toast.success("Exchange adicionada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["crypto-config-page"] });
    },
    onError: () => {
      toast.error("Erro ao adicionar exchange");
    },
  });

  return {
    exchanges,
    portfolio,
    isLoading: isLoadingExchanges || isLoadingPortfolio,
    isLoadingExchanges,
    isLoadingPortfolio,
    addExchange: addExchangeMutation.mutate,
    isAdding: addExchangeMutation.isPending,
  };
};
