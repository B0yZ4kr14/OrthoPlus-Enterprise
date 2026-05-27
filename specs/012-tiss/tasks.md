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
  - Prisma models: `tiss_guides`, `tiss_batches`, `tiss_convenios`
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
  - Page: `TISSPage` with tabs (Dashboard, Guias, Lotes, Glosas, Convênios)
  - Hooks: `useTISS.ts`, `useTISSGuides.ts`, `useTISSStatistics.ts`, `useTISSGlosas.ts`, `useTISSConvenios.ts`
  - Components: `TISSDashboard`, `TISSGuideForm`, `TISSBatchList`, `TISSGlosasManager`, `TISSConveniosManager`
- [~] T206 — **PARTIAL** — Dashboard wired to real data via `/statistics`; GuideForm and BatchList still need full real-data integration

---

## Phase 4: User Stories

#### US1: Cadastrar Convênio (Priority: P1)
- [x] T300-T305 — **IMPLEMENTED** — Convênio management backend, hook, and UI
  - Model: `tiss_convenios` with full CRUD
  - Component: `TISSConveniosManager.tsx`
  - Hook: `useTISSConvenios.ts`

#### US2: Solicitar Autorização (GUIA TISS) (Priority: P1)
- [~] T310-T315 — **PARTIAL** — Form exists with basic submit handling
  - `TISSGuideForm.tsx` has form state and submit
  - `useTISS` hook has `createGuide` mutation wired
  - No XML TISS generation per spec (TIS-FR-002)
  - No SOAP webservice integration

#### US3: Consultar Status de Autorização (Priority: P2)
- [~] T320-T325 — **PARTIAL** — Batch list UI fetches real data but may need enhanced filtering
  - `TISSBatchList.tsx` connected to API
  - `useTISS` fetches real batch data

#### US4: Faturamento de Glosas (Priority: P3)
- [x] T330-T335 — **IMPLEMENTED** — Glosa processing backend and UI
  - Schema: `glosa_amount`, `glosa_date`, `glosa_reason` added to `tiss_guides`
  - Endpoints: `GET /tiss/glosas`, `PATCH /tiss/glosas/:id`, `POST /tiss/glosas/:id/reprocessar`
  - Component: `TISSGlosasManager.tsx` with table, dialog, reprocess action
  - Hook: `useTISSGlosas.ts`

#### US5: Relatórios TISS (Priority: Could Have)
- [x] T340-T345 — **IMPLEMENTED** — `TISSDashboard` connected to `/statistics` endpoint
  - Real-time KPIs: pendentes, enviadas, aprovação, glosas
  - Hook: `useTISSStatistics.ts`

---

## Phase 5: Quality Gates

- [x] T501-T505 — Build/type-check/lint passing
- [x] T506 Backend tests — PASS (`tissController.test.ts`)
- [ ] T507 E2E tests — **MISSING**
- [x] T508 Security audit — **PASS** — All `(prisma as any)` casts removed from controller

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Phase 1 (Setup) | 4 | 4 | ✅ 100% |
| Phase 2 (Backend) | 10 | 10 | ✅ 100% |
| Phase 3 (Frontend Foundation) | 6 | 5 | ⚠️ 83% |
| Phase 4 (User Stories) | 20 | 14 | ⚠️ 70% |
| Phase 5 (Quality Gates) | 5 | 4 | ✅ 80% |
| **Total** | **45** | **37** | **~82% COMPLETE** |

## Identified Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-001 | **MEDIUM** | GuideForm and BatchList need full real-data polish |
| GAP-002 | **MEDIUM** | No XML TISS generation or SOAP webservice integration (TIS-FR-002) |
| GAP-003 | **MEDIUM** | No E2E tests for TISS flows |
| GAP-004 | **LOW** | `useTISS` hook still has some mock/hardcoded patterns |
