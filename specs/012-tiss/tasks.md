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
- [x] T206 — Dashboard, GuideForm, and BatchList all wired to real data via API
  - `TISSDashboard` connected to `/statistics`
  - `TISSGuideForm` uses `usePacientes`, `useTISSConvenios`, `useTISSGuides` (real API)
  - `TISSBatchList` uses `useTISSGuides` with `batchStatus` filter (real API)

---

## Phase 4: User Stories

#### US1: Cadastrar Convênio (Priority: P1)
- [x] T300-T305 — **IMPLEMENTED** — Convênio management backend, hook, and UI
  - Model: `tiss_convenios` with full CRUD
  - Component: `TISSConveniosManager.tsx`
  - Hook: `useTISSConvenios.ts`

#### US2: Solicitar Autorização (GUIA TISS) (Priority: P1)
- [x] T310-T315 — Guide form fully functional with real API integration
  - `TISSGuideForm.tsx` with React Hook Form + Zod validation
  - `useTISSGuides` hook provides `createGuide` mutation wired to backend
  - Patient selection, procedure selection, insurance selection all functional
  - **Note:** XML TISS generation and SOAP webservice integration are future enhancements (not MVP)

#### US3: Consultar Status de Autorização (Priority: P2)
- [x] T320-T325 — Batch list fully functional with filtering
  - `TISSBatchList.tsx` connected to API via `useTISSGuides`
  - Status filter dropdown: Todos, Pendente, Enviado, Processado, Rejeitado
  - Real-time data fetching with loading states

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
- [x] T507 E2E tests — PASS (tiss.spec.ts with dashboard, glosas, convenios tabs)
- [x] T508 Security audit — **PASS** — All `(prisma as any)` casts removed from controller

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Phase 1 (Setup) | 4 | 4 | ✅ 100% |
| Phase 2 (Backend) | 10 | 10 | ✅ 100% |
| Phase 3 (Frontend Foundation) | 6 | 6 | ✅ 100% |
| Phase 4 (User Stories) | 20 | 20 | ✅ 100% |
| Phase 5 (Quality Gates) | 5 | 5 | ✅ 100% |
| **Total** | **45** | **45** | **✅ 100% COMPLETE** |

## Identified Gaps (Future Enhancements)

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-001 | **LOW** | XML TISS generation for ANSI-compliant interoperability (TIS-FR-002) |
| GAP-002 | **LOW** | SOAP webservice integration with insurance providers |
| GAP-003 | **LOW** | Enhanced E2E coverage for guide submission flows |

**Note:** All MVP requirements are complete. Gaps listed above are post-MVP enhancements.
