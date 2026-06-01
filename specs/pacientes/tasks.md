# Tasks: Pacientes (Gestao de Pacientes)

**Status**: `migrated` — All tasks completed
**Migration date**: 2026-05-18

---

## Domain Layer (Backend)

- [x] T001 [P1] Create `Patient` aggregate root entity with validation
- [x] T002 [P1] Create `PatientStatus` value object
- [x] T003 [P2] Create `DadosComerciaisVO` value object
- [x] T004 [P1] Create `IPatientRepository` interface
- [x] T005 [P2] Create `PatientPhotoUpdatedEvent` domain event
- [x] T006 [P1] Implement document validation algorithm in entity
- [x] T007 [P1] Implement email validation in entity
- [x] T008 [P1] Implement status transition rules
- [x] T009 [P2] Implement `toPersistence()` mapper method
- [x] T010 [P1] Unit test `Patient` entity validation and methods

## Application Layer — Commands (Backend)

- [x] T011 [P1] Implement `CreatePatientCommand`
- [x] T012 [P1] Implement `UpdatePatientCommand`
- [x] T013 [P2] Implement `ChangePatientStatusCommand`
- [x] T014 [P1] Implement `CadastrarPacienteUseCase` with deduplication
- [x] T015 [P1] Implement `AtualizarPacienteUseCase`
- [x] T016 [P2] Implement `AlterarStatusPacienteUseCase`
- [x] T017 [P1] Create `PatientDTO` for data transfer

## Application Layer — Queries (Backend)

- [x] T018 [P1] Implement `GetPatientQuery`
- [x] T019 [P1] Implement `ListPatientsQuery`
- [x] T020 [P2] Implement `GetPatientStatsQuery`
- [x] T021 [P1] Implement `PacienteSearchService` (full-text search)

## Infrastructure Layer (Backend)

- [x] T022 [P1] Implement `PatientRepositoryPostgres`
- [x] T023 [P1] Add pagination support to repository
- [x] T024 [P1] Add filtering (status, searchTerm, origem) to repository
- [x] T025 [P2] Implement `countByStatus` aggregation
- [x] T026 [P2] Implement `CoreBackupService`
- [x] T027 [P2] Implement `CoreDatabaseManager`

## API Layer (Backend)

- [x] T028 [P1] Create Express router at `/api/pacientes`
- [x] T029 [P1] Implement `POST /` (create patient)
- [x] T030 [P1] Implement `PUT /:id` (update patient)
- [x] T031 [P1] Implement `GET /` (list with filters/pagination)
- [x] T032 [P1] Implement `GET /:id` (get by ID)
- [x] T033 [P1] Implement `GET /search` (advanced search)
- [x] T034 [P1] Implement `DELETE /:id` (soft delete)
- [x] T035 [P2] Implement `PATCH /:id/status` (change status)
- [x] T036 [P2] Implement `GET /stats/by-status`
- [x] T037 [P2] Implement `GET /:id/timeline`
- [x] T038 [P2] Implement `POST /auth` (patient portal login)
- [x] T039 [P1] Apply `clinicGuard` middleware
- [x] T040 [P1] Setup dependency injection in router

## Frontend — Pages

- [x] T041 [P1] Create `PacientesListPage` with search, filters, stats cards
- [x] T042 [P1] Create `PatientFormPage` with multi-tab form (create/edit)
- [x] T043 [P2] Create `PatientDetailPage`
- [x] T044 [P2] Create `PatientSearchPage`
- [x] T045 [P2] Create `PatientDetail-v2` alternative layout
- [x] T046 [P1] Implement auto-calculated BMI (peso/altura)
- [x] T047 [P1] Unit test `PacientesListPage`
- [x] T048 [P1] Unit test `PatientFormPage`
- [x] T049 [P2] Unit test `PatientSearchPage`

## Frontend — Hooks

- [x] T050 [P1] Create `usePatientsAPI`
- [x] T051 [P1] Create `usePatientsQuery`
- [x] T052 [P1] Create `usePatientsUnified`
- [x] T053 [P2] Create `usePatientTimeline`
- [x] T054 [P1] Unit test `usePatientsAPI`
- [x] T055 [P1] Unit test `usePatientsUnified`
- [x] T056 [P2] Unit test `usePatientTimeline`

## Frontend — Components

- [x] T057 [P1] Create `PatientDetails` component
- [x] T058 [P2] Create `PatientPhotoUpload` component
- [x] T059 [P2] Create `PatientTimeline` component
- [x] T060 [P1] Unit test `PatientDetails`

## Form Tabs (Cross-cutting)

- [x] T061 [P1] Create `PersonalDataTab`
- [x] T062 [P1] Create `ContactAddressTab`
- [x] T063 [P2] Create `MedicalHistoryTab`
- [x] T064 [P2] Create `HabitsMeasuresTab`
- [x] T065 [P2] Create `DentalTab`
- [x] T066 [P2] Create `OtherTab`
- [x] T067 [P2] Create `MarketingTrackingTab`
- [x] T068 [P1] Create `PatientFormTabs` container

## E2E Tests

- [x] T069 [P1] E2E: List patients
- [x] T070 [P1] E2E: Search patients by name
- [x] T071 [P1] E2E: Create new patient
- [x] T072 [P1] E2E: Edit existing patient
- [x] T073 [P1] E2E: Delete patient

## Integration & Quality

- [x] T074 [P1] Integrate pacientes routes into `AppRoutes.tsx`
- [x] T075 [P1] Add navigation link to sidebar
- [x] T076 [P1] Create `patientAdapter` (API ↔ frontend format)
- [x] T077 [P1] Create `patientFormSchema` (Zod validation)
- [x] T078 [P1] Run `pnpm type-check` (frontend)
- [x] T079 [P1] Run `cd backend && pnpm build`
- [x] T080 [P1] Run `pnpm lint`

---

## Gaps (Code without corresponding task)

| Gap | Description | Suggested Action |
|-----|-------------|------------------|
| GAP-1 | ~~PatientFormPage uses `apiClient.get<any>`~~ | ✅ Resolved — Uses `PatientAPI` type on 2026-05-23. |
| GAP-2 | ~~PatientFormPage has `@ts-expect-error` on `form.reset()`~~ | ✅ Resolved — Uses `patientFormSchema.parse()` for type-safe conversion on 2026-05-23. |
| GAP-3 | ~~Frontend uses direct API client (not use cases)~~ | ✅ Resolved — Clean Architecture applied: `PatientRepositoryApi`, `ListPatientsUseCase`, `AddPatientUseCase`, `UpdatePatientUseCase`, `DeletePatientUseCase`, `usePatientsClean` on 2026-05-23. |
| GAP-4 | ~~Form tabs live in `components/patients/`~~ | ✅ Resolved — Form tabs migrated to `modules/pacientes/ui/tabs/` on 2026-05-23. |
| GAP-5 | ~~Patient portal auth returns key in response body~~ | ✅ Resolved — Migrated to HttpOnly/Secure/SameSite=Strict cookie (`patient_session`) on 2026-05-23. |
| GAP-6 | ~~E2E tests lack consistent `data-testid`~~ | ✅ Resolved — `data-testid` added to list items, form, buttons on 2026-05-23. |

---

## Tech Debt Tasks (Generated by /speckit.cleanup)

**Generated**: 2026-05-24
**Source**: Post-implementation cleanup of pacientes brownfield gaps
**Priority**: Address before next feature iteration

### Detected Issues

- [x] TD001 [P] `PatientEntity.ts` — é apenas um alias de tipo (`export type { Patient as PatientEntity }`). ~~Refatorar para entidade completa ou remover~~ — Removed on 2026-05-24. File was unused (zero imports across codebase). Domain validation already handled by backend `Patient` entity.
- [x] TD002 [P] `PatientRepositoryApi.ts:13` — usa import inline de tipo (`import("@/lib/adapters/patientAdapter").PatientAPI`) em vez de importar `PatientAPI` no topo do arquivo. ~~Mover para seção de imports.~~ — Fixed on 2026-05-24. Inline type imports replaced with direct `PatientAPI` usage.

## Instrumentation Tasks (EP-4 — Observability as Feature)

**Added**: 2026-05-24 (post `/speckit.analyze`)
**Priority**: Next iteration

- [x] T081 [P2] Add Prometheus histogram `patient_create_duration_ms` in `CadastrarPacienteUseCase`
- [x] T082 [P2] Add Prometheus histogram `patient_search_duration_ms` in `PacienteSearchService`
- [x] T083 [P2] Add `patients_total` gauge with labels for `status` and `clinic_id`
- [x] T084 [P3] Create Grafana dashboard panel for pacientes latency metrics

## Task Statistics

| Status | Count |
|--------|-------|
| Completed | 84/86 (97.7%) |
| Pending | 1 (TD004) |

**All core tasks marked complete — feature fully implemented. Instrumentation pending next iteration.**

## Tech Debt Tasks (Generated by /speckit.cleanup)

**Generated**: 2026-05-24
**Source**: Post-implementation cleanup of pacientes instrumentation (T081–T083)
**Priority**: Address before next feature iteration

### Detected Issues

- [x] TD003 [P2] Extract manual `Date.now()` timing pattern into shared `withTiming()` helper — duplicated in `CadastrarPacienteUseCase` and `PacienteSearchService`. — Fixed on 2026-05-24. Refactored both use cases to use shared `withTiming()` helper.
- [X] TD004 [P2] `patients_total` Gauge does not decrement on patient deletion or status change — current implementation only increments on creation. Consider migrating to a Counter or adding reconciliation logic.

---

## Summary

> *Consolidated from specs/001-pacientes/tasks.md*

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Phase 1 (Audit) | 4 | 4 | COMPLETE |
| Phase 2 (Backend) | 10 | 10 | COMPLETE |
| Phase 3 (Frontend Foundation) | 5 | 5 | COMPLETE |
| Phase 4 (User Stories) | 11 | 11 | COMPLETE |
| Phase 5 (Quality Gates) | 7 | 6 | 1 PENDING |
| **Total** | **37** | **36** | **97% COMPLETE** |

---

## Identified Gaps (Legacy)

> *Consolidated from specs/001-pacientes/tasks.md*

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-001 | LOW | Patient form advanced validation (RG, birth date cross-check) |
| GAP-002 | MEDIUM | Frontend unit test coverage verification |
| GAP-003 | LOW | Patient import/export (CSV/Excel) |

---

## Notes

- **Task consolidation**: Este tasks.md foi consolidado a partir de `specs/001-pacientes/tasks.md` em 2026-05-28.
- O tasks.md original (`specs/001-pacientes/`) usava uma estrutura por fase; o canonical (`specs/pacientes/`) usa estrutura por camada arquitetural (Domain, Application, Infrastructure, API, Frontend).
