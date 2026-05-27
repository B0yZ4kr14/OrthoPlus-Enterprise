import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Loader2,
  User,
  Calendar,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@orthoplus/core-ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { ScrollArea } from "@orthoplus/core-ui/scroll-area";
import { useGlobalSearch } from "./useGlobalSearch";
import type { SearchResultItem } from "@orthoplus/shared-types";
import type { ModuleConfig } from "./types";

const MODULE_CONFIG: Record<string, ModuleConfig> = {
  pacientes: {
    label: "Pacientes",
    icon: User,
    badgeVariant: "info",
    getRoute: (item) => `/pacientes/${item.entityId}`,
  },
  agenda: {
    label: "Agendamentos",
    icon: Calendar,
    badgeVariant: "success",
    getRoute: () => `/agenda`,
  },
  pep: {
    label: "Prontuários",
    icon: FileText,
    badgeVariant: "warning",
    getRoute: (item) => `/pep/prontuarios/${item.entityId}`,
  },
};

function getModuleConfig(module: string): ModuleConfig {
  return (
    MODULE_CONFIG[module] || {
      label: module.charAt(0).toUpperCase() + module.slice(1),
      icon: FileText,
      badgeVariant: "secondary",
      getRoute: (item) => `/`,
    }
  );
}

function getRouteForItem(item: SearchResultItem): string {
  const config = getModuleConfig(item.module);
  return config.getRoute(item);
}

function HighlightedSnippet({ snippet }: { snippet: string }) {
  if (!snippet) return null;

  const parts = snippet.split(/(<mark>.*?<\/mark>)/g);

  return (
    <span className="text-xs text-muted-foreground truncate">
      {parts.map((part, i) => {
        if (part.startsWith("<mark>") && part.endsWith("</mark>")) {
          const text = part.slice(6, -7);
          return (
            <mark
              key={i}
              className="bg-warning/30 dark:bg-warning/60 rounded-sm px-0.5 text-foreground"
            >
              {text}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

const GlobalSearch = memo(function GlobalSearch() {
  const navigate = useNavigate();
  const {
    open,
    setOpen,
    query,
    setQuery,
    results,
    groupedResults,
    loading,
    error,
    hasMore,
    loadMore,
    total,
  } = useGlobalSearch();

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      const route = getRouteForItem(item);
      navigate(route);
      setOpen(false);
    },
    [navigate, setOpen],
  );

  const modules = Object.keys(groupedResults);
  const hasResults = modules.length > 0;

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full md:w-64 pl-9 pr-3 py-2 text-sm text-muted-foreground border border-border/60 rounded-lg bg-background/80 hover:bg-accent/50 hover:border-border transition-all duration-200 text-left group"
        aria-label="Abrir busca global"
      >
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors" />
        <span className="truncate">Buscar paciente, agendamento...</span>
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-muted border border-border/50 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 gap-0 max-w-[700px] w-[calc(100%-2rem)] border-border/60 shadow-2xl">
          <DialogTitle className="sr-only">Busca Global</DialogTitle>

          <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar pacientes, agendamentos, prontuários..."
                value={query}
                onValueChange={setQuery}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            <CommandList className="max-h-[60vh] overflow-hidden">
              <ScrollArea className="h-full max-h-[60vh]">
                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Buscando...
                    </span>
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div className="flex flex-col items-center justify-center py-10 px-4 gap-2">
                    <X className="h-6 w-6 text-destructive" />
                    <span className="text-sm text-destructive text-center">
                      {error}
                    </span>
                  </div>
                )}

                {/* Empty state */}
                {!loading && !error && query.trim() && !hasResults && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/40" />
                      <p>Nenhum resultado encontrado para &quot;{query}&quot;</p>
                      <p className="text-xs text-muted-foreground/60">
                        Tente buscar com termos diferentes
                      </p>
                    </div>
                  </div>
                )}

                {/* Results grouped by module */}
                {!loading &&
                  !error &&
                  hasResults &&
                  modules.map((moduleKey) => {
                    const config = getModuleConfig(moduleKey);
                    const items = groupedResults[moduleKey];
                    const Icon = config.icon;

                    return (
                      <CommandGroup
                        key={moduleKey}
                        heading={
                          <div className="flex items-center gap-2 py-1">
                            <Badge variant={config.badgeVariant} className="text-[10px] px-1.5 py-0">
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {items.length} resultado{items.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        }
                      >
                        {items.map((item) => (
                          <CommandItem
                            key={item.id}
                            onSelect={() => handleSelect(item)}
                            className="cursor-pointer"
                          >
                            <Icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="truncate font-medium">
                                {item.title}
                              </span>
                              {item.snippet && (
                                <HighlightedSnippet snippet={item.snippet} />
                              )}
                            </div>
                            {item.score > 0 && (
                              <span className="text-[10px] text-muted-foreground/60 ml-2 shrink-0">
                                {Math.round(item.score * 100)}%
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  })}

                {/* Load more */}
                {!loading && !error && hasMore && hasResults && (
                  <div className="px-2 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
                      onClick={loadMore}
                    >
                      <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                      Carregar mais resultados ({results.length} de {total})
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default GlobalSearch;
