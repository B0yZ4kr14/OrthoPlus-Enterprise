import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { User, Calendar, FileText } from "lucide-react";
import type { SearchResult, Patient, Appointment, Procedure } from "./types";

export function useGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { clinicId } = useAuth();

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const fetchResults = useCallback(async () => {
    if (!debouncedSearch || !clinicId) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      const query = debouncedSearch.toLowerCase();

      const [patients, appointments, procedures] = await Promise.all([
        apiClient
          .get<any[]>(
            `/patients?clinic_id=eq.${clinicId}&or=(full_name.ilike.%25${query}%25,cpf.ilike.%25${query}%25)&limit=3&select=id,full_name,cpf`,
          )
          .catch(() => null),
        apiClient
          .get<any[]>(
            `/appointments?clinic_id=eq.${clinicId}&title=ilike.%25${query}%25&limit=3&select=id,title,start_time`,
          )
          .catch(() => null),
        apiClient
          .get<Procedure[]>(
            `/procedimentos_odontologicos?nome=ilike.%25${query}%25&limit=3&select=id,nome,codigo`,
          )
          .catch(() => null),
      ]);

      if (patients) {
        searchResults.push(
          ...patients.map((p) => ({
            id: p.id,
            title: (p as any).full_name || "",
            subtitle: (p as any).cpf || "",
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
            title: (a as any).title,
            subtitle: new Date((a as any).start_time).toLocaleDateString("pt-BR"),
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
            title: p.nome || "",
            subtitle: p.codigo || "Procedimento",
            type: "procedure" as const,
            route: `/procedimentos`,
            icon: FileText,
          })),
        );
      }

      setResults(searchResults);
    } catch (error) {
      logger.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, clinicId]);

  useEffect(() => {
    void fetchResults();
  }, [fetchResults]);

  return {
    open,
    setOpen,
    search,
    setSearch,
    results,
    loading,
  };
}
