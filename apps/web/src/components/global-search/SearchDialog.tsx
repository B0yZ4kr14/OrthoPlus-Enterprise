import { Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@orthoplus/core-ui/command";
import { SearchResultsGroup } from "./SearchResults";
import type { SearchResult } from "./types";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  results: SearchResult[];
  loading: boolean;
}

export function SearchDialog({
  open,
  onOpenChange,
  search,
  onSearchChange,
  results,
  loading,
}: SearchDialogProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar..."
        value={search}
        onValueChange={onSearchChange}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!loading && results.length === 0 && search && (
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        )}

        <SearchResultsGroup
          results={results}
          type="patient"
          title="Pacientes"
          onSelect={() => onOpenChange(false)}
        />
        <SearchResultsGroup
          results={results}
          type="appointment"
          title="Agendamentos"
          onSelect={() => onOpenChange(false)}
        />
        <SearchResultsGroup
          results={results}
          type="procedure"
          title="Procedimentos"
          onSelect={() => onOpenChange(false)}
        />
      </CommandList>
    </CommandDialog>
  );
}
