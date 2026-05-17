# Tasks: Gestão Financeira

**Input**: Design documents from `/specs/004-financeiro//`

**Prerequisites**: plan.md (required), spec.md (required)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project verification and module audit

- [ ] T001 Audit existing `financeiro` backend module (Prisma models, controllers, routes)
- [ ] T002 Audit existing `financeiro` frontend module (components, hooks, pages)
- [ ] T003 Identify gaps between spec and current implementation
- [ ] T004 Document API contract changes (if any)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T101 [P] Backend: Lançamentos Financeiros — CRUD de receitas e despesas com categorização.
- [ ] T102 [P] Backend: Caixa Registradora — Controle de entradas e saídas do dia.
- [ ] T103 [P] Backend: Contas a Receber — Gestão de recebíveis (parcelas de tratamento).
- [ ] T104 [P] Prisma schema update + migration generation
- [ ] T105 [P] Extend `financeiroService.ts` with new operations
- [ ] T106 [P] Extend `financeiroController.ts` with new endpoints
- [ ] T107 [P] Add clinicGuard to all new routes
- [ ] T108 [P] Backend unit tests for new service methods
- [ ] T109 Run `cd backend && pnpm type-check` (0 errors)
- [ ] T110 Run `cd backend && pnpm test` (all pass)

**Checkpoint**: Backend API ready — all new endpoints tested

---

## Phase 3: Frontend Foundation

**Purpose**: Data access layer and shared UI components

- [ ] T201 [P] Update/add React Query hooks for `financeiro` endpoints
- [ ] T202 [P] Create/update reusable components in `financeiro/ui/components/`
- [ ] T203 [P] Add form validation (Zod schema matching backend DTOs)
- [ ] T204 [P] Add routes to `AppRoutes.tsx` (if new pages)
- [ ] T205 [P] Run `cd apps/web && pnpm type-check` (0 errors)

**Checkpoint**: Frontend can fetch and display data from new backend endpoints

---

## Phase 4: User Story Implementation

#### US1: Fechamento de Caixa (Priority: P1) 🎯 MVP

**Goal**: Implement fechamento de caixa per spec Story 1

**Independent Test**: Verify via UI + API integration

- [ ] T300 [P] [US1] UI: Create main page/component for Fechamento de Caixa
- [ ] T301 [P] [US1] UI: Form handlers and state management
- [ ] T302 [US1] UI: Validation and error states
- [ ] T303 [US1] UI: Success feedback (toast/redirect)
- [ ] T304 [P] [US1] API: Connect frontend to backend endpoints
- [ ] T305 [P] [US1] Test: Component + integration tests

#### US2: Contas a Receber (Priority: P1) 🎯 MVP

**Goal**: Implement contas a receber per spec Story 2

**Independent Test**: Verify via UI + API integration

- [ ] T310 [P] [US2] UI: Create main page/component for Contas a Receber
- [ ] T311 [P] [US2] UI: Form handlers and state management
- [ ] T312 [US2] UI: Validation and error states
- [ ] T313 [US2] UI: Success feedback (toast/redirect)
- [ ] T314 [P] [US2] API: Connect frontend to backend endpoints
- [ ] T315 [P] [US2] Test: Component + integration tests

#### US3: Conciliação Bancária (Priority: P2) 🎯 MVP

**Goal**: Implement conciliação bancária per spec Story 3

**Independent Test**: Verify via UI + API integration

- [ ] T320 [P] [US3] UI: Create main page/component for Conciliação Bancária
- [ ] T321 [P] [US3] UI: Form handlers and state management
- [ ] T322 [US3] UI: Validation and error states
- [ ] T323 [US3] UI: Success feedback (toast/redirect)
- [ ] T324 [P] [US3] API: Connect frontend to backend endpoints
- [ ] T325 [P] [US3] Test: Component + integration tests

#### US4: Relatório DRE (Priority: P3) 🎯 MVP

**Goal**: Implement relatório dre per spec Story 4

**Independent Test**: Verify via UI + API integration

- [ ] T330 [P] [US4] UI: Create main page/component for Relatório DRE
- [ ] T331 [P] [US4] UI: Form handlers and state management
- [ ] T332 [US4] UI: Validation and error states
- [ ] T333 [US4] UI: Success feedback (toast/redirect)
- [ ] T334 [P] [US4] API: Connect frontend to backend endpoints
- [ ] T335 [P] [US4] Test: Component + integration tests

---

## Phase 5: Edge Cases & Polish

- [ ] T401 Handle edge case: Pagamento Parcial — Registro do valor pago, saldo devedor atualizado, nova parcela ou continuidade conforme configuração
- [ ] T402 Handle edge case: Estorno — Lançamento de estorno no caixa, reversão da baixa, notificação ao financeiro
- [ ] T403 Handle edge case: Caixa Negativo — Alerta visual, bloqueio de novas saídas (configurável), notificação ao admin

---

---

## Phase 6: Quality Gates

- [ ] T501 `pnpm type-check` passes (0 errors) — backend
- [ ] T502 `pnpm type-check` passes (0 errors) — frontend
- [ ] T503 `pnpm lint` passes (0 errors)
- [ ] T504 `pnpm build` succeeds
- [ ] T505 Backend tests pass
- [ ] T506 clinicGuard applied to all new routes
- [ ] T507 No new `as any` or `@ts-ignore`
- [ ] T508 `@orthoplus/core-ui` used for generic UI components
- [ ] T509 `date.utils.ts` used for date formatting (not date-fns directly)
- [ ] T510 AGENTS.md updated if architecture changed

---

## Dependencies & Execution Order

| Phase | Depends On | Parallelizable |
|-------|-----------|----------------|
| Phase 1 (Audit) | — | — |
| Phase 2 (Backend) | Phase 1 | Backend tasks marked [P] |
| Phase 3 (Frontend Foundation) | Phase 2 | — |
| Phase 4 (User Stories) | Phase 3 | Different stories if staffed |
| Phase 5 (Edge Cases) | Phase 4 | — |
| Phase 6 (Quality Gates) | All above | — |

### Critical Path

```
T001-T004 (Audit) → T101-T110 (Backend) → T201-T205 (Frontend Foundation)
→ US1 → US2 → US3 → US4 → Edge Cases → Quality Gates
```

---

## Notes

- **[P]** = Parallelizable (different files, no dependencies)
- Each user story independently testable
- Brownfield: extend existing `financeiro` module, don't rebuild
- Use `apiClient` from `lib/api/apiClient.ts` for all HTTP calls
- Use `useAuth()` from `contexts/AuthContext.tsx` for auth state
