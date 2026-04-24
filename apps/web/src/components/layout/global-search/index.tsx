import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@orthoplus/core-ui/command";
import { useNavigate } from "react-router-dom";
import { User, FileSpreadsheet, Calendar } from "lucide-react";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useGlobalSearchDialog } from "./hooks/useGlobalSearchDialog";
import { SearchGroup } from "./components/SearchGroup";

export * from "./types";
export { SearchGroup };
export { useGlobalSearchDialog };

export function GlobalSearch() {
  const { open, setOpen, query, setQuery, debouncedQuery } =
    useGlobalSearchDialog();
  const navigate = useNavigate();
  const { data: results } = useGlobalSearch(debouncedQuery);

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar pacientes, prontuários, orçamentos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {results?.patients && results.patients.length > 0 && (
          <SearchGroup
            heading="Pacientes"
            results={results.patients}
            icon={<User className="mr-2 h-4 w-4" />}
            onSelect={handleSelect}
          />
        )}

        {results?.budgets && results.budgets.length > 0 && (
          <SearchGroup
            heading="Orçamentos"
            results={results.budgets}
            icon={<FileSpreadsheet className="mr-2 h-4 w-4" />}
            onSelect={handleSelect}
          />
        )}

        {results?.appointments && results.appointments.length > 0 && (
          <SearchGroup
            heading="Agendamentos"
            results={results.appointments}
            icon={<Calendar className="mr-2 h-4 w-4" />}
            onSelect={handleSelect}
          />
        )}
      </CommandList>
    </CommandDialog>
  );
}
