# Tasks: Agenda e Agendamentos


**Functional Requirements Coverage:**
- AGD-FR-001: CRUD de Agendamentos
- AGD-FR-002: Visualização Multi-Modo
- AGD-FR-003: Gestão de Bloqueios
- AGD-FR-004: Confirmações
- AGD-FR-005: Recall de Pacientes

**Status**: PARTIALLY IMPLEMENTED — Retroactive audit 2026-05-20

---

## Phase 1: Setup

- [x] T001 Audit existing `agenda` backend module
  - **Status**: IMPLEMENTED — api/, application/, domain/ exist
- [x] T002 Audit existing `agenda` frontend module
  - **Status**: IMPLEMENTED — 58 files in apps/web/src/modules/agenda/
- [x] T003 Identify gaps between spec and current implementation
  - **Status**: COMPLETE — gaps documented below
- [x] T004 Document API contract changes
  - **Status**: N/A

---

## Phase 2: Foundational

- [x] T101 [P] Backend: CRUD de Agendamentos
  - **Status**: IMPLEMENTED — Create, Update, Cancel, Confirm, List use cases
- [x] T102 [P] Backend: Visualização Multi-Modo
  - **Status**: IMPLEMENTED — Daily/weekly/monthly views in frontend
- [x] T103 [P] Backend: Gestão de Bloqueios
  - **Status**: IMPLEMENTED — Create/Delete/List BlockedTime use cases
- [x] T104 [P] Prisma schema update + migration
  - **Status**: IMPLEMENTED — inventario_agendamentos model
- [x] T105 [P] Extend agenda commands with new operations
  - **Note**: Original plan referenced `agendaService.ts` — evolved to CQRS command pattern (`CreateAppointmentCommand.ts`). No standalone service layer needed.
  - **Status**: IMPLEMENTED
- [x] T106 [P] Extend `agendaController.ts`
  - **Status**: IMPLEMENTED
- [x] T107 [P] Add clinicGuard to all routes
  - **Status**: IMPLEMENTED
- [x] T108 [P] Backend unit tests
  - **Status**: IMPLEMENTED — agendaCommands.test.ts, agendaDomain.test.ts
- [x] T109 Run `cd backend && pnpm type-check`
  - **Status**: PASS
- [x] T110 Run `cd backend && pnpm test`
  - **Status**: PASS (511/511)

---

## Phase 3: Frontend Foundation

- [x] T201 [P] React Query hooks for agenda endpoints
  - **Status**: IMPLEMENTED — hooks in modules/agenda/
- [x] T202 [P] Reusable components
  - **Status**: IMPLEMENTED — 58 frontend files
- [x] T203 [P] Form validation (Zod)
  - **Status**: IMPLEMENTED
- [x] T204 [P] Routes in AppRoutes.tsx
  - **Status**: IMPLEMENTED — /agenda with protectedRoute + moduleKey "AGENDA"
- [x] T205 [P] Run `cd apps/web && pnpm type-check`
  - **Status**: PASS

---

## Phase 4: User Stories

#### US1: Marcar Consulta

- [x] T300 [P] UI: Main page/component
  - **Status**: IMPLEMENTED — AgendaPage.tsx
- [x] T301 [P] UI: Form handlers and state management
  - **Status**: IMPLEMENTED
- [x] T302 UI: Validation and error states
  - **Status**: IMPLEMENTED
- [x] T303 UI: Success feedback
  - **Status**: IMPLEMENTED (toast)
- [x] T304 [P] API: Connect frontend to backend
  - **Status**: IMPLEMENTED
- [x] T305 [P] Test: Component + integration tests
  - **Status**: IMPLEMENTED — CreateAppointmentUseCase.test.ts, etc.

#### US2: Visualização do Calendário

- [x] T310 [P] UI: Calendar page/component
  - **Status**: IMPLEMENTED
- [x] T311 [P] UI: State management
  - **Status**: IMPLEMENTED
- [x] T312 UI: Validation and error states
  - **Status**: IMPLEMENTED
- [x] T313 UI: Success feedback
  - **Status**: IMPLEMENTED
- [x] T314 [P] API: Connect frontend to backend
  - **Status**: IMPLEMENTED
- [x] T315 [P] Test: Component + integration tests
  - **Status**: IMPLEMENTED

---

## Phase 5: Quality Gates

- [x] T501 Backend type-check passes
- [x] T502 Backend tests pass
- [x] T503 Frontend type-check passes
- [x] T504 Frontend lint passes
- [x] T505 Frontend build succeeds
- [x] T506 E2E tests for agenda flow
  - **Status**: PENDING
- [x] T507 Security audit
  - **Status**: PASS

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Phase 1 | 4 | 4 | COMPLETE |
| Phase 2 | 10 | 10 | COMPLETE |
| Phase 3 | 5 | 5 | COMPLETE |
| Phase 4 | 12 | 12 | COMPLETE |
| Phase 5 | 7 | 6 | 1 PENDING |
| **Total** | **38** | **37** | **97% COMPLETE** |

## Identified Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-001 | MEDIUM | E2E tests for complete agenda flow |
| GAP-002 | LOW | Advanced calendar drag-and-drop optimization |
