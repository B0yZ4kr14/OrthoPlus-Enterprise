/**
 * PatientSearchPage — Busca rápida de pacientes
 *
 * Busca em tempo real com debounce 300ms, filtros por status,
 * dentista responsável e ordenação por relevância/recência.
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import {
  usePatientsQuery,
  type PatientSearchItem,
} from "../../hooks/usePatientsQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import {
  Search,
  User,
  Phone,
  Mail,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "NOVO", label: "Novo" },
  { value: "ATIVO", label: "Ativo" },
  { value: "EM_TRATAMENTO", label: "Em Tratamento" },
  { value: "INATIVO", label: "Inativo" },
  { value: "ARQUIVADO", label: "Arquivado" },
];

export default function PatientSearchPage() {
  const navigate = useNavigate();
  const { clinicId } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [debouncedQuery] = useDebounce(searchInput, 300);

  const { data, isLoading, isFetching } = usePatientsQuery({
    query: debouncedQuery,
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter]);

  const handlePatientClick = useCallback(
    (patientId: string) => {
      navigate(`/pacientes/${patientId}`);
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
  }, []);

  const hasFilters = searchInput || statusFilter;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Busca Rapida de Pacientes"
        description="Pesquise pacientes por nome, CPF, telefone ou email"
        icon={Search}
        actions={
          <Button onClick={() => navigate("/pacientes/novo")}>
            <User className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        }
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, telefone ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Limpar
          </Button>
        )}
      </div>

      {data && (
        <p className="text-sm text-muted-foreground">
          {data.total} paciente{data.total !== 1 ? "s" : ""} encontrado
          {data.total !== 1 ? "s" : ""}
          {isFetching && " (atualizando...)"}
        </p>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.patients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasFilters
                  ? "Nenhum paciente encontrado com os filtros aplicados."
                  : "Digite algo para buscar pacientes."}
              </p>
            </CardContent>
          </Card>
        ) : (
          data?.patients?.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handlePatientClick(patient.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {patient.photoUrl ? (
                      <img
                        src={patient.photoUrl}
                        alt={patient.fullName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="font-medium truncate"
                        title={patient.fullName}
                      >
                        {patient.fullName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {patient.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {patient.cpf && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {patient.cpf}
                        </span>
                      )}
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                      )}
                      {patient.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {Math.ceil(data.total / data.limit)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(data.total / data.limit)}
            onClick={() =>
              setPage((p) =>
                Math.min(Math.ceil(data.total / data.limit), p + 1),
              )
            }
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
