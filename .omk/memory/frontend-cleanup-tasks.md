# Tasks: Frontend Cleanup & Type Safety Hardening

**Source**: Frontend Analysis Report 2026-05-23  
**Scope**: apps/web/src/ — Component architecture, type safety, barrel files, orphan code  
**Prerequisites**: Type-check passing (0 errors), lint passing (0 errors), build passing  
**Governance**: constitution.md v1.2.0, architecture_constitution.md, security_constitution.md

---

## Phase 1: Type Safety Foundation (Week 1)

**Goal**: Reduce @ts-expect-error and as any debt without breaking existing functionality.  
**Constitution**: CQ-1 (TypeScript strictness), CQ-2 (No new debt patterns)

### react-joyride Types (COMPLETE)

- [x] T001 Create react-joyride.d.ts with full module declaration
- [x] T002 Remove @ts-expect-error suppressions from 5 crypto/tour files
- [x] T003 Verify type-check passes after joyride fixes

### useModulos Hook (COMPLETE)

- [x] T004 Fix ModuleDependencies scope in hooks/api/useModulos.ts
- [x] T005 Verify ModulesContext receives correct type via useModulos()

### Remaining High-Impact Type Fixes

- [x] T006 Audit top 20 @ts-expect-error suppressions by file count
- [ ] T007 Fix agenda/api/agendaController.ts Prisma type mismatches (4 errors)
- [ ] T008 Fix crypto-pagamentos alias mismatches in tsconfig
- [x] T009 Remove 5+ useless @ts-expect-error directives

**Checkpoint**: @ts-expect-error count < 650 (from 702). as any count stable.

---

## Phase 2: Orphan & Duplicate Cleanup (Week 2)

**Goal**: Remove dead code and consolidate duplicates.  
**Constitution**: EP-2 (Pragmatic Architecture), CQ-2 (No new debt)

### Orphan Component Removal

- [x] T010 Remove components/dashboard/ subtree (7+ orphan files)
- [x] T011 Remove components/crm/KanbanBoard.tsx (orphan)
- [x] T012 Remove components/agenda/DraggableAppointment.tsx and DroppableTimeSlot.tsx
- [x] T013 Remove components/campaigns/.../OriginInput.tsx
- [x] T014 Remove components/pdv/CryptoPaymentPDV.tsx and IntegracaoContabilConfig.tsx

### Root-Level vs Nested Deduplication

- [x] T015 Consolidate BarcodeScanner: delete root components/BarcodeScanner.tsx
- [x] T016 Consolidate CryptoRatesWidget: delete root components/CryptoRatesWidget.tsx
- [x] T017 Consolidate GlobalSearch: delete root components/GlobalSearch.tsx
- [x] T018 Consolidate PerformanceMonitor: delete root components/PerformanceMonitor.tsx
- [x] T019 Consolidate ShowcaseComponents: delete root components/ShowcaseComponents.tsx

### Duplicate Component Merge (components/ vs modules/)

- [ ] T020 Evaluate LeadCard duplication and pick canonical version
- [ ] T021 Evaluate LeadForm duplication
- [ ] T022 Evaluate HistoricoTab, OdontogramaTab, TratamentosTab duplication

**Checkpoint**: Orphan count = 0. Duplicate count reduced by 50%.

---

## Phase 3: Barrel File & Export Cleanup (Week 2-3)

**Goal**: Remove dead barrel exports to reduce cognitive load.  
**Constitution**: EP-1 (Clarity Over Cleverness)

- [ ] T023 Audit components/crypto/*/index.ts barrel files
- [ ] T024 Audit components/pdv/*/index.ts barrel files
- [ ] T025 Audit components/settings/*/index.ts barrel files
- [ ] T026 Audit components/onboarding/*/index.ts barrel files
- [ ] T027 Audit components/dashboard/*/index.ts barrel files
- [ ] T028 Create script to auto-detect unused barrel exports

**Checkpoint**: 35+ unused barrel exports identified; action taken on each.

---

## Phase 4: Security & Architecture Hardening (Week 3)

**Goal**: Address security anti-patterns and architecture boundary issues.  
**Constitution**: Security Constitution, Architecture Constitution

### Security

- [ ] T029 Replace localStorage token storage with HttpOnly cookie-only auth
  - Security Risk: XSS can steal accessToken from localStorage
  - Constitution: Section 2.1 — Authentication tokens: High sensitivity
  - Impact: High — affects all 37 modules
  - Approach: Gradual migration; start with auth module
- [ ] T030 Fix userRoleRef anti-pattern in AuthContext.tsx
  - Ref updated during render — use useMemo or useEffect instead

### Architecture

- [ ] T031 Document components/ vs modules/ boundary decision
- [ ] T032 Create migration guide: moving components from components/ to modules/
- [ ] T033 Standardize barrel file policy

**Checkpoint**: Security anti-patterns documented with remediation plan.

---

## Phase 5: Component Splitting & Quality (Week 4)

**Goal**: Split monolithic components; add tests for cleaned areas.  
**Constitution**: EP-4 (Observability), CQ-1 (Strictness)

### Large Component Splitting

- [ ] T034 Split components/settings/BackupRestoreDialog.tsx (519 lines)
- [ ] T035 Split modules/estoque/ui/pages/EstoqueIntegracoes.tsx (543 lines)
- [ ] T036 Split modules/pep/ui/pages/PEPPage.tsx (500 lines)

### Testing

- [ ] T037 Add Vitest unit test for useModulos hook
- [ ] T038 Add component test for ThemeContext (system theme detection)

**Checkpoint**: 3 monolithic components split. 2 new test suites added.

---

## Task Metrics

| Phase | Tasks | Priority | Constitution Rules |
|-------|-------|----------|-------------------|
| 1: Type Safety | 9 | HIGH | CQ-1, CQ-2 |
| 2: Orphan/Duplicate | 13 | HIGH | EP-2 |
| 3: Barrel Files | 6 | MEDIUM | EP-1 |
| 4: Security/Arch | 5 | HIGH | Security 2.1, Arch 2.2 |
| 5: Splitting/Tests | 5 | MEDIUM | EP-4, CQ-1 |
| Total | 38 | | |

---

## Dependency Graph

Phase 1 can run independently.
Phase 2 depends on Phase 1.
Phase 3 depends on Phase 2.
Phase 4 can run in parallel with Phases 2-3.
Phase 5 depends on Phase 2.

---

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | Deleting component still imported dynamically | Medium | High | Search for import() before deletion |
| R2 | Type fix exposes cascading errors | Low | Medium | Run type-check after each batch |
| R3 | Auth migration breaks existing sessions | Medium | High | Gradual migration; test on staging |
| R4 | Component split breaks props interface | Low | Medium | Maintain original props; extract internals |

---

Generated by speckit-architecture-guard-governed-tasks
Based on: frontend-analysis-2026-05-23.md
