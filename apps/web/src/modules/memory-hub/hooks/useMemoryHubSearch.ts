import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import { SearchResult, SearchFilters } from "../types"

interface SearchResponse {
  results: SearchResult[]
  total: number
}

interface UseMemoryHubSearchReturn {
  results: SearchResult[]
  loading: boolean
  error: string | null
  search: (query: string, filters?: SearchFilters) => void
}

export function useMemoryHubSearch(): UseMemoryHubSearchReturn {
  const mutation = useMutation({
    mutationFn: async ({
      query,
      filters,
    }: {
      query: string
      filters?: SearchFilters
    }) => {
      return await apiClient.post<SearchResponse>("/memory-hub/search", {
        query,
        filters,
      })
    },
  })

  const search = (query: string, filters?: SearchFilters) => {
    mutation.mutate({ query, filters })
  }

  return {
    results: mutation.data?.results || [],
    loading: mutation.isPending,
    error: mutation.error
      ? mutation.error instanceof Error
        ? mutation.error.message
        : "Search failed"
      : null,
    search,
  }
}
