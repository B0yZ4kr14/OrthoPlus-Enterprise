import { useState, useEffect, memo } from "react";
import { Search, Loader2, User, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import type { Patient, Appointment, Procedure } from "@orthoplus/shared-types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@orthoplus/core-ui/command";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "patient" | "appointment" | "procedure" | "transaction" | "product";
  route: string;
  icon: React.ElementType;
}

const GlobalSearch = memo(function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clinicId } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!debouncedSearch || !clinicId) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      const searchResults: SearchResult[] = [];
      try {
        const query = debouncedSearch.toLowerCase();

        // Buscar pacientes, agendamentos e procedimentos em paralelo
        const [patients, appointments, procedures] = await Promise.all([
          apiClient
            .get<Patient[]>(`/patients?clinic_id=eq.${clinicId}&or=(full_name.ilike.%25${query}%25,cpf.ilike.%25${query}%25)&limit=3&select=id,full_name,cpf`)
            .catch(() => null),
          apiClient
            .get<Appointment[]>(`/appointments?clinic_id=eq.${clinicId}&title=ilike.%25${query}%25&limit=3&select=id,title,start_time`)
            .catch(() => null),
          apiClient
            .get<Procedure[]>(`/procedimentos_odontologicos?nome=ilike.%25${query}%25&limit=3&select=id,nome,codigo`)
            .catch(() => null),
        ]);

        if (patients) {
          searchResults.push(
            ...patients.map((p) => ({
              id: p.id,
              title: p.name || (p as unknown as {full_name: string}).full_name || "",
              subtitle: p.cpf || "",
              type: "patient" as const,
              route: `/pacientes/${p.id}`,
              icon: User,
            })),
          );
        }

        if (appointments) {
          searchResults.push(
            ...appointments.map((a) => ({
              id: a.id,
              title: a.title,
              subtitle: new Date(a.start_time).toLocaleDateString("pt-BR"),
              type: "appointment" as const,
              route: `/agenda`,
              icon: Calendar,
            })),
          );
        }

        if (procedures) {
          searchResults.push(
            ...procedures.map((p) => ({
              id: p.id,
              title: p.nome,
              subtitle: p.codigo || "Procedimento",
              type: "procedure" as const,
              route: `/procedimentos`,
              icon: FileText,
            })),
          );
        }

        setResults(searchResults);
      } catch (error) {
        console.error("Erro ao buscar:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchResults();
  }, [debouncedSearch, clinicId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full md:w-64 pl-9 pr-3 py-2 text-sm text-muted-foreground border border-border/60 rounded-lg bg-background/80 hover:bg-accent/50 hover:border-border transition-all duration-200 text-left group"
      >
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors" />
        <span className="truncate">Buscar paciente, agendamento...</span>
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-muted border border-border/50 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar..."
          value={search}
          onValueChange={setSearch}
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

          {results.filter((r) => r.type === "patient").length > 0 && (
            <CommandGroup heading="Pacientes">
              {results
                .filter((r) => r.type === "patient")
                .map((r) => (
                  <CommandItem
                    key={r.id}
                    onSelect={() => {
                      navigate(r.route);
                      setOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{r.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {results.filter((r) => r.type === "appointment").length > 0 && (
            <CommandGroup heading="Agendamentos">
              {results
                .filter((r) => r.type === "appointment")
                .map((r) => (
                  <CommandItem
                    key={r.id}
                    onSelect={() => {
                      navigate(r.route);
                      setOpen(false);
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{r.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {results.filter((r) => r.type === "procedure").length > 0 && (
            <CommandGroup heading="Procedimentos">
              {results
                .filter((r) => r.type === "procedure")
                .map((r) => (
                  <CommandItem
                    key={r.id}
                    onSelect={() => {
                      navigate(r.route);
                      setOpen(false);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{r.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
});

export default GlobalSearch;
