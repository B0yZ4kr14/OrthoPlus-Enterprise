import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"

export function usePdvEstoqueAlerta() {
  return useQuery({
    queryKey: ["pdv-estoque-alerta"],
    queryFn: async () => {
      const data = await apiClient.get<Array<{
        id: string
        descricao: string
        estoque_atual: number
        estoque_minimo: number
      }>>("/pdv/estoque-alerta")
      return data
    },
  })
}
