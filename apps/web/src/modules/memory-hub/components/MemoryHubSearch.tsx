import { useState } from "react"
import { useMemoryHubSearch } from "../hooks/useMemoryHubSearch"

export function MemoryHubSearch() {
  const [query, setQuery] = useState("")
  const { results, loading, error, search } = useMemoryHubSearch()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      search(query)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search project memory..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-testid="search-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          data-testid="search-button"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" data-testid="search-error">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {results.map((result) => (
          <div
            key={result.id}
            className="rounded-lg border p-4 hover:bg-accent/50"
            data-testid="search-result"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{result.title}</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{result.docType}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{result.excerpt}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Relevance: {(result.relevanceScore * 100).toFixed(0)}%</span>
              <span>{result.sourcePath}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
