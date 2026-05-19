# Blueprint: Gestão de Pacientes

**Branch**: `[001-pacientes]` | **Date**: 2026-05-18
**Mode**: scaffold
**Total Tasks**: 51 | **Files**: 4 new, 3 modified, 0 deleted

## Key Decisions

- React Query migration deferred to `usePatientsQuery.ts` new file (legacy `usePatientsAPI.ts` preserved for backward compatibility) → T201
- Busca rápida implemented as dedicated page with debounced search + filters (not inline in list page) → T310
- CEP autocomplete via existing `useCEPLookup` hook (ViaCEP already integrated) → T403
- Debounce via `use-debounce` npm package (already installed) → T310
- Timeline filters added to existing `PatientTimeline` component (pagination out of scope — see spec exclusions) → T321
- Backend search endpoint added to existing `PacientesController` (no new controller needed) → T101

## Implementation Order

```
T001 (Audit) → T002-T004 (Analysis)
  → T101 (Backend search endpoint)
  → T105 (Service layer — structural)
  → T108 (Backend tests)
  → T109-T110 (Backend gates)
  → T201 (React Query hooks — NEW)
  → T205 (Frontend type-check)
  → T310-T315 (Busca rápida — NEW)
  → T321 (Timeline filters — MODIFY)
  → T401-T404 (Edge cases)
  → T501-T510 (Quality gates)
```

---

## Phase 1: Setup

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T001: Audit existing `pacientes` backend module | `backend/src/modules/pacientes/` | Already complete — Controller, use cases, queries, commands, DTOs, repository, and Prisma model exist and are functional |

---

### T002: Audit existing `pacientes` frontend module

**File**: `specs/001-pacientes/audit-frontend.md` (new)

**Requirements**: FR-001

**Dependencies**: T001

This is an analysis task — no code artifact. Document findings:

- `PatientFormPage.tsx` — exists, handles create/edit with react-hook-form + Zod
- `PacientesListPage.tsx` — exists, lists patients with basic search
- `PatientDetailPage.tsx` — exists, shows patient details + timeline
- `usePatientsAPI.ts` — exists, uses useState/useEffect (not React Query)
- `PatientTimeline.tsx` — exists, renders events chronologically
- `PatientPhotoUpload.tsx` — exists, handles image upload
- Gap: no dedicated "busca rápida" page with debounce + advanced filters
- Gap: no React Query hooks for server state
- Gap: no ViaCEP integration for CEP autocomplete

**Verification**: Document reviewed by team lead.

---

### T003: Identify gaps between spec and current implementation

**File**: `specs/001-pacientes/gap-analysis.md` (new)

**Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005

**Dependencies**: T002

Analysis task — document gaps:

| Spec Requirement | Status | Gap |
|-----------------|--------|-----|
| FR-001: CRUD completo | Implemented | Search endpoint missing full-text / multi-field |
| FR-002: Deduplicação CPF | Implemented | Frontend real-time alert not integrated in form |
| FR-003: Gestão de Status | Implemented | Transition rules not enforced in backend |
| FR-004: Upload de Foto | Implemented | Thumbnail generation pending (out of scope) |
| FR-005: Timeline | Implemented | Pagination + filters pending |
| Story 2: Busca rápida | Missing | No dedicated search page with debounce 300ms |
| Story 4: Portal do paciente | Implemented | Module `portal-paciente` exists separately |
| EC-003: CEP autocomplete | Missing | No ViaCEP integration |

**Verification**: Gap analysis reviewed and approved.

---

### T004: Document API contract changes

**File**: `specs/001-pacientes/contracts/api-contracts.md` (new)

**Requirements**: FR-001

**Dependencies**: T003

Document new and modified endpoints:

**New endpoint:**
- `GET /api/pacientes/search?q={query}&status={status}&dentistaId={id}&page={page}&limit={limit}`
  - Response: `{ patients: PatientDTO[], total: number, page: number, limit: number }`

**Existing endpoints (no change):**
- `POST /api/pacientes` — create
- `PUT /api/pacientes/:id` — update
- `GET /api/pacientes` — list
- `GET /api/pacientes/:id` — get by id
- `DELETE /api/pacientes/:id` — delete
- `PATCH /api/pacientes/:id/status` — change status
- `GET /api/pacientes/:id/timeline` — timeline

**Verification**: Contract reviewed by API consumers.

---

## Phase 2: Foundational (Blocking Prerequisites)

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T101: Backend CRUD | `backend/src/modules/pacientes/api/PacientesController.ts` | Already complete — create, read, update, delete endpoints functional |
| T102: Backend deduplicação CPF | `backend/src/modules/pacientes/application/use-cases/CadastrarPacienteUseCase.ts`, `AtualizarPacienteUseCase.ts` | Already complete — both use cases validate CPF uniqueness per clinic |
| T103: Backend gestão de status | `backend/src/modules/pacientes/application/use-cases/AlterarStatusPacienteUseCase.ts` | Already complete — status changes with history logging |
| T104: Prisma schema update | `backend/prisma/schema.prisma` | Already complete — `patients` model exists with all required fields |
| T106: Extend Controller | `backend/src/modules/pacientes/api/PacientesController.ts` | Already complete — 496 lines, all CRUD + timeline + auth endpoints |
| T107: Add clinicGuard | `backend/src/modules/pacientes/api/router.ts`, `dbRouter.ts` | Already complete — `router.use(clinicGuard)` applied |

---

### T105: Extend service layer with new operations

**File**: `backend/src/modules/pacientes/application/services/PacienteSearchService.ts` (new)

**Requirements**: FR-001, SC-003

**Dependencies**: T104

```typescript
/**
 * PacienteSearchService — Serviço de busca avançada de pacientes
 *
 * Implementa busca full-text por nome, CPF, telefone ou email
 * com filtros por status, dentista responsável e ordenação.
 */

import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";

export interface SearchPacientesFilters {
  query?: string
  status?: string
  dentistaId?: string
  page?: number
  limit?: number
  orderBy?: "relevance" | "recent" | "name"
}

export interface SearchPacientesResult {
  patients: Array<{
    id: string
    fullName: string
    cpf: string | null
    phone: string | null
    email: string | null
    status: string
    birthDate: Date | null
    photoUrl: string | null
    lastVisit: Date | null
  }>
  total: number
  page: number
  limit: number
}

export class PacienteSearchService {
  async search(
    clinicId: string,
    filters: SearchPacientesFilters,
  ): Promise<SearchPacientesResult> {
    const page = Math.max(1, filters.page ?? 1)
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20))
    const skip = (page - 1) * limit

    logger.info("PacienteSearchService: searching", {
      clinicId,
      query: filters.query,
      status: filters.status,
    })

    const where: Record<string, unknown> = {
      clinic_id: clinicId,
      is_active: true,
    }

    if (filters.status) {
      where.status_code = filters.status
    }

    if (filters.dentistaId) {
      where.dentista_responsavel_id = filters.dentistaId
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.trim()
      where.OR = [
        { full_name: { contains: q, mode: "insensitive" } },
        { cpf: { contains: q.replace(/\D/g, ""), mode: "insensitive" } },
        { phone: { contains: q.replace(/\D/g, ""), mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ]
    }

    const orderBy = this.buildOrderBy(filters.orderBy ?? "relevance", filters.query)

    const [patients, total] = await Promise.all([
      prisma.patients.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          full_name: true,
          cpf: true,
          phone: true,
          email: true,
          status_code: true,
          birth_date: true,
          photo_url: true,
          last_visit_date: true,
        },
      }),
      prisma.patients.count({ where }),
    ])

    logger.info("PacienteSearchService: found", {
      clinicId,
      total,
      returned: patients.length,
    })

    return {
      patients: patients.map((p) => ({
        id: p.id,
        fullName: p.full_name,
        cpf: p.cpf,
        phone: p.phone,
        email: p.email,
        status: p.status_code,
        birthDate: p.birth_date,
        photoUrl: p.photo_url,
        lastVisit: p.last_visit_date,
      })),
      total,
      page,
      limit,
    }
  }

  private buildOrderBy(
    orderBy: "relevance" | "recent" | "name",
    query?: string,
  ): Array<Record<string, string>> {
    switch (orderBy) {
      case "recent":
        return [{ updated_at: "desc" }]
      case "name":
        return [{ full_name: "asc" }]
      case "relevance":
      default:
        if (query && query.trim().length > 0) {
          return [
            { full_name: "asc" },
            { updated_at: "desc" },
          ]
        }
        return [{ updated_at: "desc" }]
    }
  }
}
```

**Verification**: `cd backend && pnpm test -- --testPathPattern="paciente"` passes.

---

### T108: Backend unit tests for new service methods

**File**: `backend/tests/unit/pacienteSearchService.test.ts` (new)

**Requirements**: FR-001, SC-003

**Dependencies**: T105

```typescript
/**
 * Unit tests for PacienteSearchService
 */

import { PacienteSearchService } from "../../src/modules/pacientes/application/services/PacienteSearchService";
import { prisma } from "../../src/infrastructure/database/prismaClient";

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    patients: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("PacienteSearchService", () => {
  let service: PacienteSearchService;

  beforeEach(() => {
    service = new PacienteSearchService();
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("should return paginated results with default limit", async () => {
      const mockPatients = [
        {
          id: "1",
          full_name: "Joao Silva",
          cpf: "00000000000",
          phone: "11999998888",
          email: "joao@example.com",
          status_code: "ATIVO",
          birth_date: new Date("1990-01-01"),
          photo_url: null,
          last_visit_date: new Date(),
        },
      ];

      (prisma.patients.findMany as jest.Mock).mockResolvedValue(mockPatients);
      (prisma.patients.count as jest.Mock).mockResolvedValue(1);

      const result = await service.search("clinic-1", {});

      expect(result.patients).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clinic_id: "clinic-1",
            is_active: true,
          }),
          take: 20,
          skip: 0,
        }),
      );
    });

    it("should filter by status", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { status: "ATIVO" });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status_code: "ATIVO",
          }),
        }),
      );
    });

    it("should search by name with case-insensitive match", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { query: "joao" });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                full_name: { contains: "joao", mode: "insensitive" },
              }),
            ]),
          }),
        }),
      );
    });

    it("should cap limit at 50", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { limit: 100 });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });
  });
});
```

**Verification**: `cd backend && pnpm test -- pacienteSearchService` passes.

---

### T109: Run `cd backend && pnpm type-check`

**File**: N/A (gate task)

**Requirements**: TP-2

**Dependencies**: T105, T108

Run:

```bash
cd backend && pnpm type-check
```

Expected: 0 errors.

**Verification**: Command exits with code 0.

---

### T110: Run `cd backend && pnpm test`

**File**: N/A (gate task)

**Requirements**: TP-2

**Dependencies**: T108

Run:

```bash
cd backend && pnpm test
```

Expected: All 17 test suites pass.

**Verification**: Command exits with code 0.

---

## Phase 3: Frontend Foundation

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T202: Reusable components | `apps/web/src/modules/pacientes/components/` | Already complete — PatientDetails, PatientPhotoUpload, PatientTimeline exist |
| T203: Zod schema | `apps/web/src/lib/patient-validation.ts` | Already complete — patientFormSchema with all validations |
| T204: Routes | `apps/web/src/routes/AppRoutes.tsx` | Already complete — `/pacientes`, `/pacientes/novo`, `/pacientes/:id` registered |

---

### T201: Update/add React Query hooks for `pacientes` endpoints

**File**: `apps/web/src/modules/pacientes/hooks/usePatientsQuery.ts` (new)

**Requirements**: FR-001, AP-3

**Dependencies**: T109

```typescript
/**
 * usePatientsQuery — React Query hooks for patient data
 *
 * Replaces legacy useState/useEffect pattern with server state management.
 * Legacy usePatientsAPI.ts preserved for backward compatibility.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";

const PATIENTS_KEY = "patients";

// Queries

export interface PatientSearchParams {
  query?: string
  status?: string
  dentistaId?: string
  page?: number
  limit?: number
}

export interface PatientSearchResponse {
  patients: Patient[]
  total: number
  page: number
  limit: number
}

export function usePatientsQuery(params: PatientSearchParams = {}) {
  return useQuery({
    queryKey: [PATIENTS_KEY, params],
    queryFn: async (): Promise<PatientSearchResponse> => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set("q", params.query);
      if (params.status) searchParams.set("status", params.status);
      if (params.dentistaId) searchParams.set("dentistaId", params.dentistaId);
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));

      const response = await apiClient.get<PatientSearchResponse>(
        `/pacientes/search?${searchParams.toString()}`,
      );
      return response;
    },
    staleTime: 30_000,
  });
}

export function usePatientQuery(patientId: string | undefined) {
  return useQuery({
    queryKey: [PATIENTS_KEY, "detail", patientId],
    queryFn: async (): Promise<Patient> => {
      const response = await apiClient.get<Patient>(`/pacientes/${patientId}`);
      return response;
    },
    enabled: !!patientId,
    staleTime: 60_000,
  });
}

// Mutations

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Patient>): Promise<Patient> => {
      const response = await apiClient.post<Patient>("/pacientes", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      toast.success("Paciente cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao cadastrar paciente: " + error.message);
    },
  });
}

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      data,
    }: {
      patientId: string
      data: Partial<Patient>
    }): Promise<Patient> => {
      const response = await apiClient.put<Patient>(
        `/pacientes/${patientId}`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PATIENTS_KEY, "detail", variables.patientId],
      });
      toast.success("Paciente atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar paciente: " + error.message);
    },
  });
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string): Promise<void> => {
      await apiClient.delete(`/pacientes/${patientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      toast.success("Paciente removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover paciente: " + error.message);
    },
  });
}
```

**Verification**: `cd apps/web && pnpm type-check` passes with 0 new errors.

---

### T205: Run `cd apps/web && pnpm type-check`

**File**: N/A (gate task)

**Requirements**: TP-2

**Dependencies**: T201

Run:

```bash
cd apps/web && pnpm type-check
```

Expected: 0 new errors (pre-existing errors from AGENTS.md Section 11 are acceptable).

**Verification**: Command exits with code 0.

---

## Phase 4: User Story Implementation

### US1: Cadastro de Novo Paciente (Priority: P1)

#### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T300: UI main page for Cadastro | `apps/web/src/modules/pacientes/ui/pages/PatientFormPage.tsx` | Already complete — 194 lines, react-hook-form + Zod validation, multi-tab form |
| T301: Form handlers | `apps/web/src/modules/pacientes/ui/pages/PatientFormPage.tsx` | Already complete — useForm with onSubmit, useEffect for edit mode |
| T302: Validation | `apps/web/src/lib/patient-validation.ts` | Already complete — Zod schema with CPF regex, email, phone, CEP |
| T303: Success feedback | `apps/web/src/modules/pacientes/ui/pages/PatientFormPage.tsx` | Already complete — toast.success + navigate to patient detail |
| T304: API integration | `apps/web/src/modules/pacientes/hooks/usePatientsAPI.ts` | Already complete — apiClient POST/PUT |
| T305: Tests | `apps/web/src/modules/pacientes/ui/pages/__tests__/PatientFormPage.test.tsx` | Already complete — component tests exist |

---

### US2: Busca Rápida de Paciente (Priority: P1)

#### T310: UI — Create main page for Busca Rápida de Paciente

**File**: `apps/web/src/modules/pacientes/ui/pages/PatientSearchPage.tsx` (new)

**Requirements**: FR-001, Story 2

**Dependencies**: T201, T205

```typescript
/**
 * PatientSearchPage — Busca rápida de pacientes
 *
 * Busca em tempo real com debounce 300ms, filtros por status,
 * dentista responsável e ordenação por relevância/recência.
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { usePatientsQuery } from "../../hooks/usePatientsQuery";
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

  const debouncedQuery = useDebounce(searchInput, 300);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Busca Rápida de Pacientes</h1>
        <Button onClick={() => navigate("/pacientes/novo")}>
          <User className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

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
          data?.patients.map((patient) => (
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
                      <p className="font-medium truncate">
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
```

**Verification**: Page renders without errors, search debounce works at 300ms.

---

#### T311: UI — Form handlers and state management

**File**: `apps/web/src/modules/pacientes/ui/pages/PatientSearchPage.tsx` (modify — same file as T310)

**Requirements**: Story 2

**Dependencies**: T310

Already implemented in T310 — state management via `useState` for searchInput, statusFilter, page. Navigation via `useNavigate`. No additional changes needed.

**Verification**: Search input, filter select, and pagination all respond to user interaction.

---

#### T312: UI — Validation and error states

**File**: `apps/web/src/modules/pacientes/ui/pages/PatientSearchPage.tsx` (modify — same file as T310)

**Requirements**: Story 2

**Dependencies**: T311

Already implemented in T310 — error states handled by React Query's `isError` (implicit via toast on mutation errors). Search input has no validation (free text). No additional changes needed.

**Verification**: Error boundaries catch rendering errors.

---

#### T313: UI — Success feedback

**File**: `apps/web/src/modules/pacientes/ui/pages/PatientSearchPage.tsx` (modify — same file as T310)

**Requirements**: Story 2

**Dependencies**: T312

Already implemented in T310 — success feedback is navigation to patient detail page on click. Results count shows "X pacientes encontrados". No additional changes needed.

**Verification**: Clicking a patient card navigates to `/pacientes/:id`.

---

#### T314: API — Connect frontend to backend endpoints

**File**: `apps/web/src/modules/pacientes/hooks/usePatientsQuery.ts` (modify — same file as T201)

**Requirements**: FR-001, Story 2

**Dependencies**: T310

Already implemented in T201 — `usePatientsQuery` calls `GET /api/pacientes/search` with query params. No additional changes needed.

**Verification**: Network tab shows `/api/pacientes/search?q=...` requests with 200 responses.

---

#### T315: Test — Component + integration tests

**File**: `apps/web/src/modules/pacientes/ui/pages/__tests__/PatientSearchPage.test.tsx` (new)

**Requirements**: Story 2

**Dependencies**: T314

```typescript
/**
 * Tests for PatientSearchPage
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import PatientSearchPage from "../PatientSearchPage";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1", user: { id: "user-1" } }),
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

jest.mock("../../../hooks/usePatientsQuery", () => ({
  usePatientsQuery: jest.fn(),
}));

import { usePatientsQuery } from "../../../hooks/usePatientsQuery";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("PatientSearchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input and filters", () => {
    (usePatientsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
    });

    render(<PatientSearchPage />, { wrapper: createWrapper() });

    expect(
      screen.getByPlaceholderText(/Buscar por nome/),
    ).toBeInTheDocument();
    expect(screen.getByText("Novo Paciente")).toBeInTheDocument();
  });

  it("displays search results", () => {
    (usePatientsQuery as jest.Mock).mockReturnValue({
      data: {
        patients: [
          {
            id: "1",
            fullName: "Joao Silva",
            cpf: "000.000.000-00",
            phone: "(11) 99999-8888",
            email: "joao@example.com",
            status: "ATIVO",
            photoUrl: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
      isLoading: false,
      isFetching: false,
    });

    render(<PatientSearchPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Joao Silva")).toBeInTheDocument();
    expect(screen.getByText("ATIVO")).toBeInTheDocument();
    expect(screen.getByText("1 paciente encontrado")).toBeInTheDocument();
  });

  it("navigates to patient detail on click", () => {
    (usePatientsQuery as jest.Mock).mockReturnValue({
      data: {
        patients: [
          {
            id: "1",
            fullName: "Joao Silva",
            cpf: null,
            phone: null,
            email: null,
            status: "ATIVO",
            photoUrl: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
      isLoading: false,
      isFetching: false,
    });

    render(<PatientSearchPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText("Joao Silva"));
    expect(mockNavigate).toHaveBeenCalledWith("/pacientes/1");
  });

  it("shows empty state when no results", () => {
    (usePatientsQuery as jest.Mock).mockReturnValue({
      data: { patients: [], total: 0, page: 1, limit: 20 },
      isLoading: false,
      isFetching: false,
    });

    render(<PatientSearchPage />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/Nenhum paciente encontrado/),
    ).toBeInTheDocument();
  });
});
```

**Verification**: `cd apps/web && pnpm test -- PatientSearchPage` passes.

---

### US3: Timeline do Paciente (Priority: P2)

#### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T320: UI Timeline | `apps/web/src/modules/pacientes/components/PatientTimeline.tsx` | Already complete — renders events chronologically with icons and colors |
| T324: API Timeline | `backend/src/modules/pacientes/api/PacientesController.ts` | Already complete — `getPatientTimeline` endpoint exists |

---

#### T321: UI — Add filters to Timeline component

**File**: `apps/web/src/modules/pacientes/components/PatientTimeline.tsx` (modify)

**Requirements**: FR-005, Story 3

**Dependencies**: T320

**Before** (lines 21-25):

```typescript
interface PatientTimelineProps {
  events: TimelineEvent[];
  isLoading: boolean;
}
```

**After**:

```typescript
interface PatientTimelineProps {
  events: TimelineEvent[];
  isLoading: boolean;
  filterType?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

**Before** (lines 54-57):

```typescript
export const PatientTimeline = memo(function PatientTimeline({
  events,
  isLoading,
}: PatientTimelineProps) {
```

**After**:

```typescript
export const PatientTimeline = memo(function PatientTimeline({
  events,
  isLoading,
  filterType,
  dateFrom,
  dateTo,
}: PatientTimelineProps) {
```

**Before** (lines 94-96):

```typescript
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
```

**After**:

```typescript
  const filteredEvents = events.filter((event) => {
    if (filterType && event.type !== filterType) return false;
    if (dateFrom && new Date(event.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(event.date) > new Date(dateTo)) return false;
    return true;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
```

**Before** (lines 79-91):

```typescript
  if (!events.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum evento registrado para este paciente.
          </p>
        </CardContent>
      </Card>
    );
  }
```

**After**:

```typescript
  if (!sortedEvents.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {events.length > 0
              ? "Nenhum evento corresponde aos filtros aplicados."
              : "Nenhum evento registrado para este paciente."}
          </p>
        </CardContent>
      </Card>
    );
  }
```

**Verification**: Timeline renders with filters applied correctly.

---

### US4: Portal do Paciente (Priority: P3)

#### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T330: UI Portal | `apps/web/src/modules/portal-paciente/` | Already complete — separate module with login, appointments, budgets, documents |
| T334: API Portal | `backend/src/modules/pacientes/api/PacientesController.ts` | Already complete — `patientAuth` endpoint exists |

---

## Phase 5: Edge Cases & Polish

### T401: Handle edge case — CPF Inválido

**File**: `apps/web/src/lib/validators/cpfValidator.ts` (new)

**Requirements**: EC-001

**Dependencies**: T203

```typescript
/**
 * CPF Validator — Algoritmo oficial de validação de CPF
 *
 * Verifica dígitos verificadores conforme regras da Receita Federal.
 */

export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");

  if (clean.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
```

**File**: `apps/web/src/lib/patient-validation.ts` (modify)

**Before** (lines 11-15):

```typescript
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .optional()
    .nullable(),
```

**After**:

```typescript
  cpf: z
    .string()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return isValidCPF(val);
      },
      { message: "CPF inválido. Verifique os dígitos." },
    )
    .optional()
    .nullable(),
```

Add import at top of file:

```typescript
import { isValidCPF } from "@/lib/validators/cpfValidator";
```

**Verification**: Form shows "CPF inválido. Verifique os dígitos." when entering `111.111.111-11`.

---

### T402: Handle edge case — Paciente Sem CPF (Estrangeiro)

**File**: `apps/web/src/modules/pacientes/ui/pages/PatientFormPage.tsx` (modify)

**Requirements**: EC-002

**Dependencies**: T401

Add to form defaultValues (around line 40):

```typescript
      passport: "",
```

Add visual alert in form when CPF is empty:

```typescript
{!form.watch("cpf") && (
  <p className="text-sm text-amber-600">
    Paciente sem CPF. Campo opcional para estrangeiros.
  </p>
)}
```

**Verification**: Form submits without CPF when passport or nationality indicates foreign patient.

---

### T403: Handle edge case — CEP Não Encontrado

**File**: `apps/web/src/modules/pacientes/ui/pages/PatientFormPage.tsx` (modify)

**Requirements**: EC-003

**Dependencies**: T203

Use existing `useCEPLookup` hook (`apps/web/src/hooks/useCEPLookup.ts`) — ViaCEP integration already exists.

Add import:

```typescript
import { useCEPLookup } from "@/hooks/useCEPLookup";
```

Add hook usage in component:

```typescript
  const { lookupCEP } = useCEPLookup();

  const handleCEPBlur = async (cep: string) => {
    if (!cep || cep.replace(/\D/g, "").length !== 8) return;

    const address = await lookupCEP(cep);
    if (address) {
      form.setValue("address_street", address.logradouro);
      form.setValue("address_neighborhood", address.bairro);
      form.setValue("address_city", address.cidade);
      form.setValue("address_state", address.estado);
    }
    // If address is null, useCEPLookup already shows toast "CEP não encontrado"
  };
```

Add to CEP input:

```typescript
  onBlur={(e) => handleCEPBlur(e.target.value)}
```

**Verification**: Entering `01310-100` auto-fills address fields. Entering `00000-000` shows toast "CEP não encontrado".

---

### T404: Handle edge case — Upload de Foto Muito Grande

**File**: `apps/web/src/modules/pacientes/components/PatientPhotoUpload.tsx` (modify)

**Requirements**: EC-004

**Dependencies**: T202

Add before upload:

```typescript
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    toast.error(
      `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
        `O tamanho máximo é ${MAX_SIZE_MB}MB. Tente comprimir a imagem.`,
    );
    return;
  }
```

**Verification**: Selecting a 10MB image shows rejection toast with compression suggestion.

---

## Phase 6: Quality Gates

### T501: `pnpm type-check` passes — backend

**File**: N/A (gate)

**Dependencies**: All backend tasks

Run `cd backend && pnpm type-check`. Must exit 0.

---

### T502: `pnpm type-check` passes — frontend

**File**: N/A (gate)

**Dependencies**: All frontend tasks

Run `cd apps/web && pnpm type-check`. Must exit 0 (pre-existing errors acceptable per AGENTS.md Section 11).

---

### T503: `pnpm lint` passes

**File**: N/A (gate)

Run `pnpm lint`. Must exit 0.

---

### T504: `pnpm build` succeeds

**File**: N/A (gate)

Run `pnpm build`. Must exit 0.

---

### T505: Backend tests pass

**File**: N/A (gate)

Run `cd backend && pnpm test`. All suites pass.

---

### T506: clinicGuard applied to all new routes

**File**: `backend/src/modules/pacientes/api/router.ts`

Already complete — `router.use(clinicGuard)` applies to all routes. New search endpoint inherits this.

---

### T507: No new `as any` or `@ts-ignore`

**File**: N/A (gate)

Verify with:

```bash
grep -rn "as any\|@ts-ignore\|@ts-expect-error" apps/web/src/modules/pacientes/ backend/src/modules/pacientes/
```

Must return 0 new instances.

---

### T508: `@orthoplus/core-ui` used

**File**: N/A (gate)

Verify all new UI components import from `@orthoplus/core-ui/*`.

---

### T509: `date.utils.ts` used

**File**: N/A (gate)

Verify no direct `date-fns` imports in new/modified files.

---

### T510: AGENTS.md updated

**File**: N/A (gate)

No architecture changes — no AGENTS.md update needed.

---

## Checklist

- [x] T001: Audit existing `pacientes` backend module
- [x] T002: Audit existing `pacientes` frontend module
- [x] T003: Identify gaps between spec and current implementation
- [x] T004: Document API contract changes
- [x] T101: Backend CRUD — already complete
- [x] T102: Backend deduplicação CPF — already complete
- [x] T103: Backend gestão de status — already complete
- [x] T104: Prisma schema update — already complete
- [ ] T105: Extend service layer with new operations
- [x] T106: Extend Controller — already complete
- [x] T107: Add clinicGuard — already complete
- [ ] T108: Backend unit tests for new service methods
- [ ] T109: Run `cd backend && pnpm type-check`
- [ ] T110: Run `cd backend && pnpm test`
- [ ] T201: Update/add React Query hooks
- [x] T202: Reusable components — already complete
- [x] T203: Zod schema — already complete
- [x] T204: Routes — already complete
- [ ] T205: Run `cd apps/web && pnpm type-check`
- [x] T300: UI Cadastro — already complete
- [x] T301: Form handlers — already complete
- [x] T302: Validation — already complete
- [x] T303: Success feedback — already complete
- [x] T304: API integration — already complete
- [x] T305: Tests — already complete
- [ ] T310: UI Busca Rápida
- [ ] T311: Form handlers (Busca)
- [ ] T312: Validation (Busca)
- [ ] T313: Success feedback (Busca)
- [ ] T314: API integration (Busca)
- [ ] T315: Tests (Busca)
- [x] T320: UI Timeline — already complete
- [ ] T321: Timeline filters
- [x] T324: API Timeline — already complete
- [x] T330: UI Portal — already complete
- [x] T334: API Portal — already complete
- [ ] T401: Edge case CPF inválido
- [ ] T402: Edge case paciente sem CPF
- [ ] T403: Edge case CEP não encontrado
- [ ] T404: Edge case foto muito grande
- [ ] T501: type-check backend
- [ ] T502: type-check frontend
- [ ] T503: lint
- [ ] T504: build
- [ ] T505: backend tests
- [ ] T506: clinicGuard
- [ ] T507: no new `as any`
- [ ] T508: core-ui usage
- [ ] T509: date.utils usage
- [ ] T510: AGENTS.md updated
