import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Cobranca } from "../types/cobranca.types";

export function useInadimplencia() {
  const {
    data: inadimplentes = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Cobranca[]>({
    queryKey: ["inadimplentes"],
    queryFn: () =>
      apiClient.get<Cobranca[]>("/api/inadimplencia/inadimplentes"),
  });

  const stats = {
    totalEmAberto: inadimplentes.reduce(
      (acc, curr) => acc + (curr.valor_pendente || 0),
      0,
    ),
    totalVencido: inadimplentes
      .filter((i) => i.status === "PENDENTE" || i.status === "EM_COBRANCA")
      .reduce((acc, curr) => acc + (curr.valor_pendente || 0), 0),
    totalAVencer: inadimplentes
      .filter((i) => i.status === "ACORDO") // Simplified logic for demo/real data bridge
      .reduce((acc, curr) => acc + (curr.valor_pendente || 0), 0),
    countTotal: inadimplentes.length,
    countVencidos: inadimplentes.filter(
      (i) => i.status === "PENDENTE" || i.status === "EM_COBRANCA",
    ).length,
    countAVencer: inadimplentes.filter((i) => i.status === "ACORDO").length,
    taxaRecuperacao: 75, // Placeholder for now, could be calculated if we had 'PAGO' in this list
  };

  return {
    inadimplentes,
    stats,
    isLoading,
    error,
    refetch,
  };
}
