# Tasks: Marketing Automático

**Input**: Design documents from `/specs/022-marketing/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Note**: This is a **migrated** task list — all tasks were already completed in the existing implementation.

---

## Path Conventions

OrthoPlus is a **pnpm monorepo**. Default paths:

- **Frontend**: `apps/web/src/` — React SPA (Vite + Tailwind)
- **Backend**: `backend/src/` — Express API (Prisma + PostgreSQL)
- **Tests**:
  - Frontend unit: `apps/web/src/**/*.test.{ts,tsx}` (Vitest + jsdom)
  - Backend unit: `backend/tests/unit/**/*.test.ts` (Jest + ts-jest)
  - E2E: `tests/e2e/` (Playwright)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and routing

- [x] T001 Create Prisma schema for marketing tables (`marketing_campaigns`, `marketing_campaign_sends`, `marketing_recalls`, `marketing_triggers`, `fidelidade_pacientes`)
- [x] T002 [P] Create Zod schemas in `backend/src/modules/marketing/api/schemas.ts`
- [x] T003 [P] Configure Express router with `clinicGuard` in `backend/src/modules/marketing/api/router.ts`

---

## Phase 2: User Story 1 — Gerenciar Campanhas (Priority: P1) 🎯 MVP

**Goal**: Campaign CRUD and management

### Tests for User Story 1

- [ ] T004 [P] [US1] Backend unit test: create campaign with valid data
- [ ] T005 [P] [US1] Backend unit test: list campaigns filters by clinicId
- [ ] T006 [P] [US1] Frontend unit test: `ListCampaignsUseCase`

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement `listCampanhas` in `backend/src/modules/marketing/api/controller.ts`
- [x] T008 [P] [US1] Implement `getCampanhaById` in controller
- [x] T009 [P] [US1] Implement `createCampanha` in controller with Zod validation
- [x] T010 [P] [US1] Implement `updateCampanha` in controller
- [x] T011 [P] [US1] Implement `deleteCampanha` in controller
- [x] T012 [US1] Add `ListCampaignsUseCase` in frontend
- [x] T013 [US1] Add `CreateCampaignUseCase` in frontend
- [x] T014 [US1] Add campaign management UI components

---

## Phase 3: User Story 2 — Rastrear Envios e Recalls (Priority: P2)

**Goal**: Send tracking and recall automation

### Tests for User Story 2

- [ ] T015 [P] [US2] Backend unit test: create envio with campaign link
- [ ] T016 [P] [US2] Backend unit test: process recalls batch

### Implementation for User Story 2

- [x] T017 [P] [US2] Implement `listEnvios` in controller
- [x] T018 [P] [US2] Implement `createEnvio` in controller
- [x] T019 [P] [US2] Implement `listRecalls` in controller
- [x] T020 [P] [US2] Implement `createRecall` in controller
- [x] T021 [P] [US2] Implement `processTriggers` in controller
- [x] T022 [P] [US2] Implement `processRecalls` in controller (batch)
- [x] T023 [US2] Add `ListCampaignSendsUseCase` in frontend
- [x] T024 [US2] Add `SendCampaignMessageUseCase` in frontend

---

## Phase 4: User Story 3 — Programa de Fidelidade (Priority: P2)

**Goal**: Loyalty program with points, badges, and referrals

### Tests for User Story 3

- [ ] T025 [P] [US3] Frontend unit test: badge unlock logic
- [ ] T026 [P] [US3] Frontend unit test: referral reward calculation

### Implementation for User Story 3

- [x] T027 [P] [US3] Add `ProgramaFidelidade` component with tabs
- [x] T028 [P] [US3] Add `BadgesTab` for badge display
- [x] T029 [P] [US3] Add `RecompensasTab` for rewards
- [x] T030 [P] [US3] Add `IndicacoesTab` for referrals
- [x] T031 [P] [US3] Add `PacientesTab` for patient list
- [x] T032 [P] [US3] Add `ConfigTab` for program configuration
- [x] T033 [P] [US3] Add `KPICards` for loyalty metrics

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Metrics dashboard and quality gates

- [x] T034 [P] Add `GetCampaignMetricsUseCase` for analytics
- [x] T035 [P] Add `UpdateCampaignStatusUseCase` for workflow
- [x] T036 [P] Add campaign metrics dashboard UI
- [ ] T037 Run quality gates: `pnpm type-check`, `pnpm lint`, `pnpm test`
- [ ] T038 Run backend build: `cd backend && pnpm build`
- [ ] T039 Code cleanup — no new `as any` or `@ts-ignore`
- [ ] T040 Add module documentation to `docs/marketing.md`

---

## Phase 6: Monitoring & Edge Case Mitigation *(post-implementation)*

**Purpose**: Observability and resilience

- [ ] T041 [P] Add Prometheus metric emission for marketing operations
- [ ] T042 [P] Document edge case handling for batch recall failures
- [ ] T043 Verify all edge cases from spec.md have mitigation in place

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **US1 (Phase 2)**: Depends on Setup. Core MVP.
- **US2 (Phase 3)**: Depends on US1 (needs campaigns for sends).
- **US3 (Phase 4)**: Can run parallel with US2 after US1.
- **Polish (Phase 5)**: Depends on all user stories.

---

## Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 43 |
| **Completed** | 30 |
| **Pending** | 13 |
| **Backend tests missing** | 4 |
| **Quality gates missing** | 3 |
| **Observability missing** | 3 |

---

## Gaps Found (Migration Analysis)

1. **⚠️ No backend unit tests** — Controller has 0 test coverage
2. **⚠️ Architecture drift** — Controller uses Prisma directly (no service layer)
3. **⚠️ Type safety issues** — `as any` casts in controller for Prisma queries
4. **⚠️ Module naming inconsistency** — Backend: `marketing`, Frontend: `marketing-auto`
