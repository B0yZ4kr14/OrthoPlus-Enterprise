import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import type { GraphData } from "@orthoplus/shared-types";

export function useMemoryHubGraph() {
  const query = useQuery<GraphData, Error>({
    queryKey: ["memory-hub", "graph"],
    queryFn: async () => {
      return apiClient.get<GraphData>("/memory-hub/graph");
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    graph: query.data || { nodes: [], edges: [] },
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refresh: async () => {
      await query.refetch();
    },
  };
}
