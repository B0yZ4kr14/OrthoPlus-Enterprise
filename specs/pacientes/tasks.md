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
| GAP-1 | PatientFormPage uses `apiClient.get<any>` | Remove `any`, use proper type |
| GAP-2 | PatientFormPage has `@ts-expect-error` on `form.reset()` | Fix type mismatch in adapter |
| GAP-3 | Frontend uses direct API client (not use cases) | Align with agenda module's Clean Architecture |
| GAP-4 | Form tabs live in `components/patients/` not `modules/pacientes/` | Migrate per FE-5 |
| GAP-5 | ~~Patient portal auth returns key in response body~~ | ✅ Resolved — Migrated to HttpOnly/Secure/SameSite=Strict cookie (`patient_session`) on 2026-05-23. |
| GAP-6 | E2E tests lack consistent `data-testid` | Add test IDs to list items and form fields |

---

## Task Statistics

| Status | Count |
|--------|-------|
| Completed | 80/80 (100%) |
| Pending | 0 |

**All tasks marked complete — feature fully implemented.**
