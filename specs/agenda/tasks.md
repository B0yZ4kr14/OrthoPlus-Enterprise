# Tasks: Agenda (Gestão de Agendamentos)

**Status**: `migrated` — All tasks completed  
**Migration date**: 2026-05-18

---

## Domain Layer

- [x] T001 [P1] Create `Appointment` entity with validation and status transitions
- [x] T002 [P1] Create `BlockedTime` entity
- [x] T003 [P2] Create `DentistSchedule` entity
- [x] T004 [P1] Define `IAppointmentRepository` interface
- [x] T005 [P1] Define `IBlockedTimeRepository` interface
- [x] T006 [P2] Define `IDentistScheduleRepository` interface
- [x] T007 [P1] Create `AppointmentScheduledEvent` domain event
- [x] T008 [P1] Unit test `Appointment` entity validation and methods
- [x] T009 [P2] Unit test `BlockedTime` entity

## Application Layer (Use Cases)

- [x] T010 [P1] Implement `CreateAppointmentUseCase` with conflict detection
- [x] T011 [P1] Implement `UpdateAppointmentUseCase`
- [x] T012 [P1] Implement `CancelAppointmentUseCase`
- [x] T013 [P1] Implement `ConfirmAppointmentUseCase`
- [x] T014 [P1] Implement `ListAppointmentsUseCase`
- [x] T015 [P2] Implement `CreateBlockedTimeUseCase`
- [x] T016 [P2] Implement `DeleteBlockedTimeUseCase`
- [x] T017 [P2] Implement `ListBlockedTimesUseCase`
- [x] T018 [P2] Implement `CreateDentistScheduleUseCase`
- [x] T019 [P2] Implement `UpdateDentistScheduleUseCase`
- [x] T020 [P2] Implement `ListDentistSchedulesUseCase`
- [x] T021 [P2] Implement `DeleteDentistScheduleUseCase`
- [x] T022 [P1] Unit test `CreateAppointmentUseCase`
- [x] T023 [P1] Unit test `ListAppointmentsUseCase`
- [x] T024 [P1] Unit test `CancelAppointmentUseCase`

## Infrastructure Layer

- [x] T025 [P1] Implement `AppointmentRepositoryApi` (HTTP client)
- [x] T026 [P1] Implement `BlockedTimeRepositoryApi`
- [x] T027 [P2] Implement `DentistScheduleRepositoryApi`
- [x] T028 [P1] Create `AppointmentMapper` (domain ↔ DTO)
- [x] T029 [P2] Create `BlockedTimeMapper`
- [x] T030 [P2] Create `DentistScheduleMapper`
- [x] T031 [P1] Unit test `AppointmentMapper`

## Presentation Layer

- [x] T032 [P1] Create `AgendaContext` with week navigation state
- [x] T033 [P1] Create `useAppointments` hook (TanStack Query + use cases)
- [x] T034 [P2] Create `useBlockedTimes` hook
- [x] T035 [P2] Create `useDentistSchedules` hook
- [x] T036 [P1] Unit test `AgendaContext`
- [x] T037 [P1] Unit test `useAppointments` hook

## UI Layer

- [x] T038 [P1] Create `WeekCalendar` component
- [x] T039 [P1] Create `AppointmentCard` component
- [x] T040 [P1] Create `AppointmentForm` component (modal)
- [x] T041 [P1] Create `AppointmentDetailsDialog` component
- [x] T042 [P2] Create `BlockedTimeForm` component
- [x] T043 [P2] Create `DentistScheduleForm` component
- [x] T044 [P1] Create `AgendaPage` with Tabs (Calendar / List)
- [x] T045 [P2] Create `AgendaClinicaPage` variant
- [x] T046 [P1] Unit test `AgendaPage`

## Backend API

- [x] T047 [P1] Create Express router at `/api/agenda`
- [x] T048 [P1] Implement `GET /appointments` with filters (dentist, patient, status, date range)
- [x] T049 [P1] Implement `GET /appointments/:id`
- [x] T050 [P1] Implement `POST /appointments` with Zod validation
- [x] T051 [P1] Implement `PATCH /appointments/:id`
- [x] T052 [P1] Implement `DELETE /appointments/:id`
- [x] T053 [P1] Implement `GET /appointments/conflict` (conflict detection)
- [x] T054 [P2] Implement `GET/POST/PATCH/DELETE /confirmations`
- [x] T055 [P2] Implement `GET/POST/DELETE /blocked-times`
- [x] T056 [P2] Implement `GET/POST/PATCH/DELETE /schedules`
- [x] T057 [P1] Apply `clinicGuard` middleware to all routes
- [x] T058 [P1] Create Zod schemas for all request bodies

## Backend Domain (Partial CA)

- [x] T059 [P2] Create backend `Appointment` domain entity
- [x] T060 [P2] Create `AppointmentCreatedEvent`
- [x] T061 [P2] Create `CreateAppointmentCommand`
- [x] T062 [P2] Unit test backend domain entity
- [x] T063 [P2] Unit test backend commands

## E2E Tests

- [x] T064 [P1] E2E: Display calendar view
- [x] T065 [P1] E2E: Create new appointment
- [x] T066 [P1] E2E: Validate required fields
- [x] T067 [P1] E2E: Edit existing appointment
- [x] T068 [P1] E2E: Change appointment status
- [x] T069 [P2] E2E: Send patient reminder
- [x] T070 [P2] E2E: Navigate between months
- [x] T071 [P2] E2E: Filter appointments by dentist
- [x] T072 [P1] E2E: Submit appointment form with time
- [x] T073 [P1] E2E: Submit deletion flow form

## Integration & Quality

- [x] T074 [P1] Integrate agenda module into `AppRoutes.tsx`
- [x] T075 [P1] Add navigation link to sidebar/menu
- [x] T076 [P1] Run `pnpm type-check` (frontend)
- [x] T077 [P1] Run `cd backend && pnpm build`
- [x] T078 [P1] Run `pnpm lint`
- [x] T079 [P1] Run E2E tests (`tests/e2e/agenda.spec.ts`)

---

## Gaps (Code without corresponding task)

| Gap | Description | Suggested Action |
|-----|-------------|------------------|
| GAP-1 | ~~Backend `agendaController.ts` has `@ts-nocheck`~~ | ✅ Resolved — `@ts-nocheck` removed on 2026-05-23. File compiles under strict mode. |
| GAP-2 | ~~`CreateAppointmentUseCase` has `@ts-expect-error`~~ | ✅ Resolved — `AppointmentType` used instead of `string` on 2026-05-23. |
| GAP-3 | Backend controller doesn't use domain commands | Align backend to use `CreateAppointmentCommand` |
| GAP-4 | ~~E2E tests use fragile locators~~ | ✅ Resolved — 20+ `data-testid` attributes added on 2026-05-23. |
| GAP-5 | ~~No rate limiting on `/api/agenda/*`~~ | ✅ Resolved — Express rate limiter added (200 req/15min) on 2026-05-23. |

---

## Task Statistics

| Status | Count |
|--------|-------|
| Completed | 79/79 (100%) |
| Pending | 0 |

**All tasks marked complete — feature fully implemented.**
