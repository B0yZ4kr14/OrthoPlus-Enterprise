import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface StatusCount {
  status: string;
  _count: { id: number };
  _sum: { amount: number };
}

interface BatchStatusCount {
  status: string;
  _count: { id: number };
  _sum: { total_amount: number };
}

export interface TISSStatistics {
  guides: {
    total: number;
    total_amount: number;
    by_status: StatusCount[];
  };
  batches: {
    by_status: BatchStatusCount[];
  };
}

export function useTISSStatistics() {
  const { clinicId } = useAuth();

  return useQuery({
    queryKey: ["tiss-statistics", clinicId],
    queryFn: async () => {
      const response = await apiClient.get<TISSStatistics>("/tiss/statistics");
      return response;
    },
    enabled: !!clinicId,
  });
}
