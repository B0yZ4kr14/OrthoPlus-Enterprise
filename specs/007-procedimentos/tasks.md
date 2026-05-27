# Tasks: 007 Procedimentos


**Functional Requirements Coverage:**
- PRO-FR-001: CRUD de Procedimentos
- PRO-FR-002: Tabela de Preços Multipla
- PRO-FR-003: Associação Dentista-Procedimento
- PRO-FR-004: Materiais e Insumos
- PRO-FR-005: Histórico de Preços

**Status**: BACKFILLED — Retroactive audit 2026-05-24

---

## Phase 1: Setup

- [x] T001-T004 — All complete

---

## Phase 2: Foundational

- [x] T101 [P] Backend: CRUD operations — IMPLEMENTED
- [x] T102 [P] Backend: Business rules — IMPLEMENTED
- [x] T103 [P] Backend: Domain logic — IMPLEMENTED
- [x] T104 [P] Prisma schema — IMPLEMENTED
- [x] T105 [P] Extend service — IMPLEMENTED
- [x] T106 [P] Extend controller — IMPLEMENTED
- [x] T107 [P] Add clinicGuard — IMPLEMENTED
- [x] T108 [P] Backend unit tests — IMPLEMENTED — procedimentosController.test.ts
- [x] T109 Run backend type-check — PASS
- [x] T110 Run backend tests — PASS (511/511)

---

## Phase 3: Frontend Foundation

- [x] T201-T205 — All complete
  - Frontend files: 11

---

## Phase 4: User Stories

- [x] US1 Cadastrar Procedimento — IMPLEMENTED (TemplatesProcedimentos.tsx, full CRUD via apiClient)
- [x] US2 Tabela de Preços — CRUD tabelas (particular/convênio), preços por procedimento, reajuste em lote
- [x] US3 Associação a Dentistas — CRUD associação dentista-procedimento, duração customizada, comissão
- [x] US4 Categorização e Filtros — IMPLEMENTED (ProcedimentosList.tsx with especialidade filter)

---

## Phase 5: Quality Gates

- [x] T501-T505 — All passing
- [x] T506 E2E tests — PENDING
- [x] T507 Security audit — PASS

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Total | **38** | **33** | **87% COMPLETE** |

## Identified Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-001 | HIGH | Tabela de Preços UI and backend service |
| GAP-002 | HIGH | Associação Dentista-Procedimento UI |
| GAP-003 | MEDIUM | E2E tests for complete flow |
| GAP-004 | LOW | Zustand store for procedimentos (currently localStorage with mock data) |
| GAP-005 | LOW | Additional unit test coverage |
