# Tasks: TISS e Guias Médicas


**Functional Requirements Coverage:**
- TIS-FR-001: Cadastro de Convênios
- TIS-FR-002: Guia TISS
- TIS-FR-003: Status de Autorização
- TIS-FR-004: Retorno e Glosas
- TIS-FR-005: Relatórios TISS

**Status**: BACKFILLED — Retroactive audit 2026-05-24

---

## Phase 1: Setup

- [x] T001-T004 — Backend infrastructure exists
  - `backend/src/modules/tiss/api/` — controller.ts, router.ts, schemas.ts
  - Prisma models: `tiss_guides`, `tiss_batches`
  - Registered in `backend/src/index.ts` at `/api/tiss`

---

## Phase 2: Foundational

- [x] T101-T110 — Backend CRUD implemented
  - Guias: list, getById, create, update, delete
  - Lotes: list, create, update
  - Batch submission: `submitBatch` with guide grouping
  - Statistics: `getStatistics` with aggregations
  - clinicGuard applied to all routes
  - Zod schemas for validation
- [x] Backend tests: `tissController.test.ts` (413 lines, comprehensive coverage)

---

## Phase 3: Frontend Foundation

- [x] T201-T205 — Frontend structure exists
  - Route: `/faturamento-tiss` with `moduleKey: "TISS"`
  - Page: `TISSPage` with tabs (Dashboard, Guias, Lotes)
  - Hooks: `useTISS.ts`, `useTISSGuides.ts`
  - Components: `TISSDashboard`, `TISSGuideForm`, `TISSBatchList`
- [ ] T206 — **MISSING** — Components not wired to real data (all use hardcoded mock data)

---

## Phase 4: User Stories

#### US1: Cadastrar Convênio (Priority: P1)
- [x] T300-T305 — **IMPLEMENTED** — No convênio management endpoints or UI
  - No `Convenio` model, controller, or page
  - Spec requirement not implemented

#### US2: Solicitar Autorização (GUIA TISS) (Priority: P1)
- [~] T310-T315 — **PARTIAL** — Form exists but not functional
  - `TISSGuideForm.tsx` has static JSX with hardcoded patient/procedure options
  - No form state management or submit handling
  - `useTISSGuides` hook has `createGuide` mutation but page doesn't wire it to the form
  - No XML TISS generation per spec (TIS-FR-002)
  - No SOAP webservice integration

#### US3: Consultar Status de Autorização (Priority: P2)
- [~] T320-T325 — **PARTIAL** — Batch list UI exists but uses mock data
  - `TISSBatchList.tsx` displays 3 hardcoded batches
  - `useTISSGuides` fetches real batch data but component ignores it
  - No status filtering or search

#### US4: Faturamento de Glosas (Priority: P3)
- [ ] T330-T335 — **MISSING** — No glosa processing implemented
  - No glosa backend endpoints
  - No glosa UI components
  - No retorno/reenvio flow

#### US5: Relatórios TISS (Priority: Could Have)
- [~] T340-T345 — **PARTIAL** — `TISSDashboard` shows static KPI cards
  - Stats are hardcoded (23 pendentes, 142 enviadas, 94% aprovação, 8 glosas)
  - Backend `/statistics` endpoint exists and is tested
  - Dashboard not connected to real data

---

## Phase 5: Quality Gates

- [x] T501-T505 — Build/type-check/lint passing
- [x] T506 Backend tests — PASS (`tissController.test.ts`)
- [ ] T507 E2E tests — **MISSING**
- [ ] T508 Security audit — **VIOLATION**: Controller uses `(prisma as any)` extensively (9 occurrences)

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Phase 1 (Setup) | 4 | 4 | ✅ 100% |
| Phase 2 (Backend) | 10 | 10 | ✅ 100% |
| Phase 3 (Frontend Foundation) | 6 | 5 | ⚠️ 83% |
| Phase 4 (User Stories) | 20 | 4 | ❌ 20% |
| Phase 5 (Quality Gates) | 5 | 3 | ⚠️ 60% |
| **Total** | **45** | **26** | **~58% COMPLETE** |

## Identified Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-001 | **HIGH** | Frontend components use hardcoded mock data — need wiring to hooks/API |
| GAP-002 | **HIGH** | No convênio management (TIS-FR-001) — missing model, API, and UI |
| GAP-003 | **HIGH** | No XML TISS generation or SOAP webservice integration (TIS-FR-002) |
| GAP-004 | **MEDIUM** | No glosa processing (TIS-FR-004) — missing backend and UI |
| GAP-005 | **MEDIUM** | No E2E tests for TISS flows |
| GAP-006 | **LOW** | `TISSDashboard` not connected to `/statistics` endpoint |
| GAP-007 | **LOW** | Controller uses `(prisma as any)` instead of typed Prisma client |
