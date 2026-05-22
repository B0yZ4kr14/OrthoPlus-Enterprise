import { useState, useCallback } from "react"
import { SearchResult, SearchFilters } from "../types"

interface UseMemoryHubSearchReturn {
  results: SearchResult[]
  loading: boolean
  error: string | null
  search: (query: string, filters?: SearchFilters) => Promise<void>
}

export function useMemoryHubSearch(): UseMemoryHubSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, filters?: SearchFilters) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/memory-hub/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filters }),
      })
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}
