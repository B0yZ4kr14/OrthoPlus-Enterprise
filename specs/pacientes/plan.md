# Implementation Plan: Pacientes (Gestao de Pacientes)

**Status**: `migrated` — Feature already implemented
**Migration date**: 2026-05-18

---

## Summary

Sistema de gestao de pacientes com ficha clinica multi-aba, busca avancada, timeline integrada e autenticacao de portal. Backend adota CQRS (commands/queries separation) e Clean Architecture com domain events. Frontend usa formulario tabulado com React Hook Form + Zod.

**Complexity**: High (3.603 frontend lines + 2.751 backend lines, 11 test files)

---

## Technical Context

### Frontend Stack
- React 18.3 + Vite 8 + TypeScript 5.8
- TanStack React Query (server state)
- React Hook Form + Zod (form validation)
- Tailwind CSS + Radix UI via `@orthoplus/core-ui`
- Direct `apiClient` usage (not use-case based like agenda module)

### Backend Stack
- Express 4 + TypeScript (strict)
- Prisma 6 (PostgreSQL)
- CQRS: Commands (write) + Queries (read) separation
- Clean Architecture: Domain entities, value objects, domain events, repositories
- Dependency injection via constructor

### API Contract
- Base path: `/api/pacientes`
- All routes protected by `clinicGuard`

---

## Constitution Check

| Principle | Status | Detail |
|-----------|--------|--------|
| CQ-1 TypeScript Strictness | Partial | Backend strict. Frontend uses `any` in API calls. |
| CQ-2 No new `as any` | Pass | `apiClient.get<any>` replaced with `PatientAPI`. `@ts-expect-error` removed from `form.reset()`. |
| FE-5 Component Placement | Pass | Form tabs migrated to `modules/pacientes/ui/tabs/`. |
| FE-6 Barrel File Policy | Pass | `index.ts` at layer boundaries. |
| SEC-2.4 Token Storage | Pass | Patient auth uses HttpOnly/Secure/SameSite=Strict cookie (`patient_session`). |
| DB-1 Prisma as Primary ORM | Pass | All persistence via Prisma. |
| AS-1 Python Boundary | N/A | Pure TypeScript module. |

---

## Project Structure

```
apps/web/src/modules/pacientes/
├── domain/
│   └── index.ts
├── hooks/
│   ├── usePatientsAPI.ts
│   ├── usePatientsQuery.ts
│   ├── usePatientsUnified.ts
│   └── usePatientTimeline.ts
├── components/
│   ├── PatientDetails.tsx
│   ├── PatientPhotoUpload.tsx
│   └── PatientTimeline.tsx
├── ui/
│   └── pages/
│       ├── PacientesListPage.tsx
│       ├── PatientDetailPage.tsx
│       ├── PatientDetail-v2.tsx
│       ├── PatientFormPage.tsx
│       └── PatientSearchPage.tsx
└── types.ts

backend/src/modules/pacientes/
├── api/
│   ├── router.ts
│   ├── PacientesController.ts
│   ├── dbRouter.ts
│   ├── commands/PatientCommandController.ts
│   └── queries/PatientQueryController.ts
├── application/
│   ├── commands/
│   │   ├── ChangePatientStatusCommand.ts
│   │   ├── CreatePatientCommand.ts
│   │   └── UpdatePatientCommand.ts
│   ├── dto/PatientDTO.ts
│   ├── queries/
│   │   ├── GetPatientQuery.ts
│   │   ├── GetPatientStatsQuery.ts
│   │   └── ListPatientsQuery.ts
│   ├── services/PacienteSearchService.ts
│   └── use-cases/
│       ├── AlterarStatusPacienteUseCase.ts
│       ├── AtualizarPacienteUseCase.ts
│       └── CadastrarPacienteUseCase.ts
├── domain/
│   ├── entities/Patient.ts
│   ├── events/PatientPhotoUpdatedEvent.ts
│   ├── repositories/IPatientRepository.ts
│   └── value-objects/
│       ├── DadosComerciaisVO.ts
│       └── PatientStatus.ts
└── infrastructure/
    ├── CoreBackupService.ts
    ├── CoreDatabaseManager.ts
    └── repositories/PatientRepositoryPostgres.ts

tests/e2e/pacientes.spec.ts
tests/e2e/modules/pacientes.spec.ts
```

---

## Deployment Context

- **Routes**: `/pacientes`, `/pacientes/novo`, `/pacientes/:id`, `/pacientes/:id/editar`
- **API**: `/api/pacientes/*` → backend port 3005
- **Database**: `patients`, `patient_accounts`, `patient_sessions`, `patient_status_history`
- **Multi-tenant**: `clinic_id` isolation on all queries

---

## Complexity Tracking

| Layer | Files | Lines | Test Coverage |
|-------|-------|-------|---------------|
| Frontend pages | 5 | ~1.200 | Partial (3 page tests) |
| Frontend hooks | 4 | ~600 | Partial (3 hook tests) |
| Frontend components | 3 | ~400 | Partial (1 component test) |
| Backend controller | 1 | ~535 | Partial |
| Backend use cases | 3 | ~300 | Partial |
| Backend domain | 4 | ~600 | Partial (1 entity test) |
| Backend infrastructure | 3 | ~400 | Partial |
| E2E | 2 | ~300 | Partial |

**Total**: ~50 files, ~6.354 lines

---

## Technical Decisions (Reverse-Engineered)

1. **CQRS Backend**: Commands separated from Queries. Controller delegates to use cases for writes and to query handlers for reads.
2. **Domain Events**: Patient entity emits events on status change, data update, photo update, inactivation.
3. **Value Objects**: `PatientStatus` and `DadosComerciaisVO` encapsulate validation and immutability.
4. **Repository Pattern**: `IPatientRepository` with Prisma implementation. Supports pagination, filtering, search.
5. **Form Tabs**: Patient form split into 7 tabs via `PatientFormTabs` component, each tab receiving `form` prop from RHF.
6. **Direct API Client**: Frontend uses `apiClient` directly instead of use-case layer (unlike agenda module).

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Frontend architectural mismatch | High | Medium | Align pacientes frontend with agenda's use-case pattern |
| Patient auth key in body | High | High | Migrate to HttpOnly cookies per SEC-2.4 |
| Document validation in frontend + backend | Medium | Low | Ensure both use same validation logic |
| Large patient list performance | Medium | Medium | Add virtual scrolling + server-side search |
