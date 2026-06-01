import { useState, useCallback } from "react";
import { useSearchFilesByText } from "@/hooks/api/useFiles";
import { Input } from "@orthoplus/core-ui";
import { Button } from "@orthoplus/core-ui";
import { Search, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function FileSearchOCR() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const navigate = useNavigate();

  const { data: results, isLoading } = useSearchFilesByText(activeQuery);

  const handleSearch = useCallback(() => {
    if (query.trim().length < 2) {
      toast.info("Digite pelo menos 2 caracteres para buscar");
      return;
    }
    setActiveQuery(query.trim());
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setActiveQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="file-ocr-search"
            placeholder="Buscar dentro dos documentos (OCR)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {activeQuery && results && results.length > 0 && (
        <div className="rounded-md border bg-background">
          <div className="px-3 py-2 border-b bg-muted text-xs text-muted-foreground">
            {results.length} resultado(s) para "{activeQuery}"
          </div>
          <div className="divide-y">
            {results.map((file) => (
              <button
                key={file.id}
                onClick={() => navigate(`/files?fileId=${file.id}`)}
                className="w-full flex items-start gap-3 px-3 py-2 hover:bg-muted text-left"
              >
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.nomeOriginal}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.categoria}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeQuery && results && results.length === 0 && !isLoading && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Nenhum documento encontrado contendo "{activeQuery}".
        </div>
      )}
    </div>
  );
}
