import { useState } from "react";
import { Input } from "@orthoplus/core-ui";
import { Button } from "@orthoplus/core-ui";
import { useMemoryHubSearch } from "../hooks/useMemoryHubSearch";

export function MemoryHubSearch() {
  const [query, setQuery] = useState("");
  const { results, loading, error, search } = useMemoryHubSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          id="memory-hub-search"
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search project memory..."
          className="flex-1"
          data-testid="search-input"
        />
        <Button type="submit" disabled={loading} data-testid="search-button">
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && (
        <div
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          data-testid="search-error"
        >
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
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {result.docType}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.excerpt}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Relevance: {(result.relevanceScore * 100).toFixed(0)}%
              </span>
              <span>{result.sourcePath}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
