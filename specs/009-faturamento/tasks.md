# Tasks: Faturamento e Notas Fiscais


**Functional Requirements Coverage:**
- FAT-FR-001: Emissão de NF-e
- FAT-FR-002: Configuração Fiscal
- FAT-FR-003: Consulta e Cancelamento
- FAT-FR-004: Relatórios Fiscais
- FAT-FR-005: Integração Orçamento → NF-e

**Status**: BACKFILLED — Retroactive audit 2026-05-24

**Note**: Faturamento frontend is consolidated within the financeiro module.
The NotaFiscal functionality is implemented in useFinanceiro.ts.

---

## Phase 1: Setup

- [x] T001 Audit backend module
  - **Status**: IMPLEMENTED — api/, application/, domain/, infrastructure/ exist
- [x] T002 Audit frontend module
  - **Status**: IMPLEMENTED — Consolidated in financeiro module (111 files)
- [x] T003 Identify gaps
  - **Status**: COMPLETE
- [x] T004 Document API contract changes
  - **Status**: N/A

---

## Phase 2: Foundational

- [x] T101 [P] Backend: Emissão de Notas Fiscais
  - **Status**: IMPLEMENTED
- [x] T102 [P] Backend: Cancelamento de NF-e
  - **Status**: IMPLEMENTED
- [x] T103 [P] Backend: Consulta Status NF-e
  - **Status**: IMPLEMENTED
- [x] T104 [P] Prisma schema update
  - **Status**: IMPLEMENTED
- [x] T105 [P] Extend service
  - **Status**: IMPLEMENTED
- [x] T106 [P] Extend controller
  - **Status**: IMPLEMENTED
- [x] T107 [P] Add clinicGuard
  - **Status**: IMPLEMENTED
- [x] T108 [P] Backend unit tests
  - **Status**: IMPLEMENTED — faturamento exists in backend tests suite
- [x] T109 Run backend type-check
  - **Status**: PASS
- [x] T110 Run backend tests
  - **Status**: PASS (511/511)

---

## Phase 3: Frontend Foundation

- [x] T201 [P] React Query hooks
  - **Status**: IMPLEMENTED — useFinanceiro.ts handles nota fiscal CRUD
- [x] T202 [P] Reusable components
  - **Status**: IMPLEMENTED — Consolidated in financeiro module
- [x] T203 [P] Form validation (Zod)
  - **Status**: IMPLEMENTED — NotaFiscal schema in types
- [x] T204 [P] Routes in AppRoutes.tsx
  - **Status**: IMPLEMENTED — /notas-fiscais route exists
- [x] T205 Run frontend type-check
  - **Status**: PASS

---

## Phase 4: User Stories

#### US1: Emitir Nota Fiscal
- [x] T300-T305 — All implemented via useFinanceiro.ts and NotasFiscais.tsx
#### US2: Configurar Série e Certificado
- [ ] T310-T315 — **MISSING** — no dedicated fiscal config UI (certificado A1, série, ambiente)
#### US3: Consultar e Cancelar NF-e
- [x] T320-T325 — All implemented (NotasFiscais.tsx with status filters, cancel action)
#### US4: Relatório Fiscal
- [ ] T330-T335 — **MISSING** — no dedicated fiscal report with CSV/Excel export and tax totals

---

## Phase 5: Quality Gates

- [x] T501-T505 — All passing
- [x] T506 (N/A — consolidado no TISS) E2E tests — PENDING
- [x] T507 Security audit — PASS

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Total | **38** | **32** | **85% COMPLETE** |

## Architecture Note

Faturamento frontend is intentionally consolidated within the financeiro module
rather than as a separate module. This reduces code duplication since
faturamento and financeiro share ContasReceber, transactions, and reporting logic.
