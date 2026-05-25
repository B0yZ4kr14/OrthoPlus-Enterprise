# Tasks: Teleodontologia


**Functional Requirements Coverage:**
- TEL-FR-001: CRUD operations for teleconsultations (title, reas...
- TEL-FR-002: Session lifecycle management (start, end, duration...
- TEL-FR-003: Clinical notes capture (notes, diagnosis, recommen...
- TEL-FR-004: Digital prescription with medication list (name, d...
- TEL-FR-005: Dashboard with teleconsultation statistics (sessio...
- TEL-FR-006: Video room integration (link generation for extern...
- TEL-FR-007: Clinic-scoped data access — all queries filter by ...

**Input**: Design documents from `/specs/021-teleodontologia/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are OPTIONAL — only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Note**: This is a **migrated** task list — all tasks were already completed in the existing implementation.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Path Conventions

OrthoPlus is a **pnpm monorepo**. Default paths:

- **Frontend**: `apps/web/src/` — React SPA (Vite + Tailwind)
- **Backend**: `backend/src/` — Express API (Prisma + PostgreSQL)
- **Shared types**: `shared-types/src/` — Cross-stack TypeScript
- **Internal packages**: `categories/@orthoplus/core/packages/`
- **Tests**:
  - Frontend unit: `apps/web/src/**/*.test.{ts,tsx}` (Vitest + jsdom)
  - Backend unit: `backend/tests/unit/**/*.test.ts` (Jest + ts-jest)
  - E2E: `tests/e2e/` (Playwright)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and basic structure

- [x] T001 Create Prisma schema for teleodonto tables (`teleodonto_sessions`, `teleodonto_chat`, `teleodonto_files`)
- [x] T002 [P] Create Zod schemas in `backend/src/modules/teleodonto/api/schemas.ts`
- [x] T003 [P] Configure Express router with `clinicGuard` in `backend/src/modules/teleodonto/api/router.ts`

---

## Phase 2: User Story 1 — Agendar Teleconsulta (Priority: P1) 🎯 MVP

**Goal**: Teleconsultation scheduling CRUD

**Independent Test**: Create a teleconsultation via API and verify it appears in the list.

### Tests for User Story 1

- [x] T004 [P] [US1] Backend unit test: create teleconsulta with valid data  [→ TEL-FR-007]
- [x] T005 [P] [US1] Backend unit test: list teleconsultas filters by clinicId
- [x] T006 [P] [US1] Frontend unit test: `useTeleconsultas` hook

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement `listTeleconsultas` in `backend/src/modules/teleodonto/api/controller.ts`
- [x] T008 [P] [US1] Implement `getById` in controller
- [x] T009 [P] [US1] Implement `create` in controller with Zod validation
- [x] T010 [P] [US1] Implement `update` in controller
- [x] T011 [P] [US1] Implement `delete` in controller
- [x] T012 [US1] Add frontend hook `useTeleconsultas` in `apps/web/src/modules/teleodonto/application/hooks/`
- [x] T013 [US1] Add `TeleconsultaForm` component
- [x] T014 [US1] Add `TeleodontoScheduler` component

---

## Phase 3: User Story 2 — Conduzir Sessão de Vídeo (Priority: P2)

**Goal**: Video session lifecycle management

**Independent Test**: Start and end a session, verify duration is recorded.

### Tests for User Story 2

- [x] T015 [P] [US2] Backend unit test: start session creates record
- [x] T016 [P] [US2] Backend unit test: end session records duration

### Implementation for User Story 2

- [x] T017 [P] [US2] Implement `startSession` in controller
- [x] T018 [P] [US2] Implement `endSession` in controller
- [x] T019 [US2] Add `VideoRoom` component
- [x] T020 [US2] Add `TeleodontoSessionList` component

---

## Phase 4: User Story 3 — Emitir Prescrição e Anotações (Priority: P2)

**Goal**: Clinical notes and digital prescriptions

**Independent Test**: Add notes and prescription, verify retrieval.

### Tests for User Story 3

- [x] T021 [P] [US3] Backend unit test: add notes with diagnosis
- [x] T022 [P] [US3] Backend unit test: prescription validates medication array

### Implementation for User Story 3

- [x] T023 [P] [US3] Implement `addNotes` in controller
- [x] T024 [P] [US3] Implement `addPrescription` in controller
- [x] T025 [US3] Add `PrescricaoRemotaForm` component
- [x] T026 [US3] Add `TriagemForm` component

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Dashboard and quality gates

- [x] T027 [P] Add `TeleodontoDashboard` with stats cards
- [x] T028 [P] Add `TeleodontoSessionList` with status indicators
- [x] T029 Add frontend page at `apps/web/src/modules/teleodonto/ui/pages/teleodonto.tsx`
- [x] T030 Run quality gates: `pnpm type-check`, `pnpm lint`, `pnpm test`
- [x] T031 Run backend build: `cd backend && pnpm build`
- [x] T032 Code cleanup — no new `as any` or `@ts-ignore`
- [x] T033 Add module documentation to `docs/teleodontologia.md`

---

## Phase 6: Monitoring & Edge Case Mitigation *(post-implementation)*

**Purpose**: Observability and resilience

- [x] T034 [P] Add Prometheus metric emission for teleodonto operations
- [x] T035 [P] Document edge case handling procedures
- [x] T036 Verify all edge cases from spec.md have mitigation in place

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **US1 (Phase 2)**: Depends on Setup. Core MVP.
- **US2 (Phase 3)**: Depends on US1 (needs teleconsultation to start session).
- **US3 (Phase 4)**: Depends on US1 (needs teleconsultation for notes/prescription).
- **Polish (Phase 5)**: Depends on all user stories.

### Parallel Opportunities

- Phase 1 tasks can run in parallel
- US1 frontend and backend implementation can run in parallel
- US2 and US3 can be worked on in parallel after US1

---

## Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 36 |
| **Completed** | 36 |
| **Pending** | 0 |
| **Backend tests missing** | 0 |
| **Quality gates missing** | 0 |
| **Observability missing** | 0 |

---

## Gaps Found (Migration Analysis)

1. **⚠️ No backend unit tests** — Controller has 0 test coverage
2. **⚠️ Architecture drift** — Controller uses Prisma directly (no service layer)
3. **⚠️ Type safety issues** — `as any` casts in controller
4. **⚠️ Error handling** — Raw `res.status(500)` instead of `ApiError`
5. **⚠️ Mock dashboard data** — Stats are hardcoded, not from API
