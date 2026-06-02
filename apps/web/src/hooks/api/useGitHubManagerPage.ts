import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";

export interface GitHubData {
  commits: any[];
  branches: any[];
  pull_requests: any[];
  workflows: any[];
}

export const useGitHubManagerPage = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["github-manager-page"],
    queryFn: async () => {
      const reposRes = await apiClient.get<{ repositories: { id: string }[] }>(
        "/github/repositories",
      );
      const repo = reposRes.repositories?.[0];
      if (!repo) throw new Error("Nenhum repositório conectado");

      const [branchesRes, prsRes, workflowsRes] = await Promise.all([
        apiClient.get<{ branches: any[] }>(
          `/github/repositories/${repo.id}/branches`,
        ),
        apiClient.get<{ pullRequests: any[] }>(
          `/github/repositories/${repo.id}/pull-requests`,
        ),
        apiClient.get<{ workflows: any[] }>(
          `/github/repositories/${repo.id}/workflows`,
        ),
      ]);

      return {
        commits: [],
        branches: branchesRes.branches || [],
        pull_requests: prsRes.pullRequests || [],
        workflows: workflowsRes.workflows || [],
      } as GitHubData;
    },
  });

  return {
    data,
    isLoading,
    refresh: refetch,
  };
};
