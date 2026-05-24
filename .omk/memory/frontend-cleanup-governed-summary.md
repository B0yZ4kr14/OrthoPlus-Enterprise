---
document_type: governed-tasks-summary
feature: frontend-cleanup-2026-05-23
workflow: speckit-architecture-guard-governed-tasks
---

# Governed Tasks Summary — Frontend Cleanup & Type Safety

**Feature**: Frontend Analysis & Cleanup (post-020-spec-memory-hub)  
**Status**: Tasks generated, 2 already complete  
**Governance Method**: Proactive — analysis findings converted to actionable tasks

---

## Memory Context

- **Status**: Synthesized inline from frontend-analysis-2026-05-23.md
- **Source**: Parallel agent analysis of ~1,957 .tsx files across components/ and modules/
- **Relevant Decisions**:
  - **EP-2 Pragmatic Architecture**: Clean Architecture partially adopted; agenda/ is exemplary
  - **CQ-1 Strictness**: Build passes 0 errors, but 702 @ts-expect-error suppressions indicate type safety debt
  - **CQ-2 No New Debt**: 207 as any casts exist — must not increase
  - **Security 2.1**: localStorage token storage violates token sensitivity rules
  - **Architecture 2.2**: Unclear boundary between components/ and modules/

---

## Security Task Review

### Security Tasks Present in Tasks

| Task ID | Security Concern | Constitution Rule | Status |
|:---|:---|:---|:---|
| T029 | Replace localStorage token storage with HttpOnly cookies | Security 2.1 (Auth tokens: High) | Planned |
| T030 | Fix userRoleRef render anti-pattern | Security 2.3 (Session integrity) | Planned |

### Missing Security Tasks (Gap Analysis)

| ID | Missing Task | Severity | Why Missing |
|:---|:---|:---|:---|
| SEC-005 | E2E test for XSS token extraction | MEDIUM | No Playwright test validates localStorage token theft |
| SEC-006 | Content Security Policy audit for frontend | LOW | CSP headers exist in nginx but no frontend test validates |

### Security Constraints Respected

- Existing JWT auth via clinicGuard on backend routes (unaffected by frontend cleanup)
- No patient PII in frontend component code (all PII handled server-side)
- File upload components use existing MIME whitelist (no change needed)

---

## Architecture Task Review

### Refactor Tasks

| ID | Refactor Task | Architecture Rule | Status |
|:---|:---|:---|:---|
| T031 | Document components/ vs modules/ boundary | Architecture 2.2 (Layer boundaries) | Planned |
| T032 | Create migration guide for component relocation | Architecture 3.2 (Anti-patterns) | Planned |
| T033 | Standardize barrel file policy | EP-1 (Clarity) | Planned |
| T020-T022 | Merge duplicate components (LeadCard, LeadForm, Tabs) | Architecture 3.2 (No duplication) | Planned |

### Architecture Risks Identified

| Risk | Level | Description |
|:---|:---|:---|
| Reactive Deletion Pattern | MEDIUM | Orphan components identified post-hoc. Future: add dead-code detection to CI. |
| components/ Deprecation | MEDIUM | 37 modules still reference components/. Gradual migration needed, not big-bang. |
| Zustand Underutilization | LOW | Only 6 stores for massive app. Context overuse in some modules. |

### Migration Tasks

- **components/ to modules/ migration**: Non-breaking, incremental
  - Rule: Touch a file? Move it to modules/ if feature-scoped.
  - Timeline: 2-3 sprints for full migration
  - No API contract changes
  - No database changes

---

## Task Governance Assessment

### What Worked Well

1. **Parallel analysis**: 2 agents analyzed ~1,957 files in <5 minutes
2. **Type-check driven**: All fixes verified with pnpm type-check before proceeding
3. **Constitution awareness**: Tasks explicitly reference CQ-1, CQ-2, EP-2
4. **Risk register included**: 4 risks identified with mitigations

### What Could Improve

1. **No automated dead-code detection in CI**: Should add `knip` or similar to detect orphans automatically
2. **Type safety not gated**: CI passes despite 702 @ts-expect-error — consider adding a threshold gate
3. **No component ownership**: Duplicate components exist because no module owns the canonical version

---

## Durable Memory Preservation

### Patterns to Capture for Future Features

**Pattern 1: Type Declaration Augmentation**
- When a package lacks types (react-joyride), create src/types/<package>.d.ts
- Include ALL runtime props used in codebase, not just documented API
- Document in AGENTS.md: "Missing types? Add to src/types/, not @ts-expect-error"

**Pattern 2: Component Boundary Convention**
- New rule: components/ = cross-cutting ONLY (shared UI, layout, generic hooks)
- New rule: modules/<feature>/ = all feature-scoped components
- Enforce via code review checklist

**Pattern 3: Dead Code Detection**
- Add `knip` or `ts-prune` to CI to detect unused exports
- Run monthly; fail build if new orphans introduced

**Pattern 4: Auth Token Storage**
- NEVER store tokens in localStorage (XSS risk)
- Use HttpOnly cookies + refresh rotation
- Document this as Security Constitution amendment

---

## Recommended Next Steps

1. **Immediate (this week)**:
   - Execute T006-T009 (high-impact type fixes)
   - Execute T010-T014 (orphan removal — quick wins)
   - Run pnpm type-check and pnpm build after each batch

2. **Short-term (next 2 sprints)**:
   - Execute T015-T022 (duplicate consolidation)
   - Execute T023-T028 (barrel cleanup)
   - Begin T029 (auth migration planning — do NOT execute yet; needs security review)

3. **Medium-term (next quarter)**:
   - Execute T034-T036 (component splitting)
   - Add T037-T038 (tests for cleaned areas)
   - Consider adding dead-code detection to CI

4. **Constitution update**:
   - Add to Security Constitution: "Frontend MUST NOT store auth tokens in localStorage"
   - Add to Architecture Constitution: "Component placement: components/ for cross-cutting, modules/ for feature-scoped"

---

## Summary Metrics

| Metric | Value |
|--------|-------|
| Total tasks | 38 |
| Already complete | 5 (T001-T005) |
| Security tasks | 2 explicit + 2 missing |
| Architecture tasks | 7 explicit |
| Test tasks | 2 |
| Constitution compliance | Target: 100% after Phase 4 |
| Critical gaps | 0 |
| High gaps | 1 (T029: auth migration) |
| Medium gaps | 4 (orphan removal, duplicate merge) |

---

Governed Tasks Summary generated by speckit-architecture-guard-governed-tasks
Extensions: architecture-guard, security-review, memory-loader

---

## Execution Update — 2026-05-23 (Post-Implementation)

### Tasks Completed in This Session

| Task | Description | Result |
|------|-------------|--------|
| T001-T003 | react-joyride type declarations | ✅ Created `src/types/react-joyride.d.ts`, removed 10 suppressions |
| T004-T005 | useModulos/ModulesContext type fixes | ✅ Fixed TS4025 and TS2322 |
| T006 | Audit top 20 @ts-expect-error | ✅ Identified top offenders (CryptoComparativeDashboard: 31, OrcamentoRepositoryApi: 25, etc.) |
| T007 | agendaController Prisma mismatches | ✅ Verified — file not found / already resolved |
| T008 | crypto-pagamentos alias mismatches | ✅ Verified — `@financeiro/*` alias correctly mapped in tsconfig |
| T009 | Remove useless @ts-expect-error | ✅ Removed 12 suppressions (10 joyride + 2 from deleted files) |
| T010-T014 | Orphan component removal | ✅ Deleted 25 orphan files (~2,592 lines) |
| T015-T019 | Root-level deduplication | ✅ Deleted 2 root duplicates (CryptoRatesWidget, ShowcaseComponents) |

### Files Deleted

| File | Lines | Category |
|------|-------|----------|
| components/CryptoRatesWidget.tsx | 149 | Root duplicate |
| components/ShowcaseComponents.tsx | 160 | Root duplicate |
| components/QuickActionsBar.tsx | 93 | Orphan |
| components/ThemePreview.tsx | 149 | Orphan |
| components/agenda/DraggableAppointment.tsx | 79 | Orphan |
| components/agenda/DroppableTimeSlot.tsx | 38 | Orphan |
| components/campaigns/.../OriginInput.tsx | 22 | Orphan |
| components/crm/KanbanBoard.tsx | 75 | Orphan |
| components/dashboard/ActionCard.tsx | 66 | Orphan |
| components/dashboard/ActionCardMemo.tsx | 49 | Orphan |
| components/dashboard/CategoryDashboard.tsx | 63 | Orphan |
| components/dashboard/DashboardQuickStats.tsx | 104 | Orphan |
| components/dashboard/DashboardWidgetsMemo.tsx | 18 | Orphan |
| components/dashboard/EmptyStatCard.tsx | 79 | Orphan |
| components/dashboard/PieChartCard.tsx | 195 | Orphan |
| components/dashboard/StatCardMemo.tsx | 151 | Orphan |
| components/patients/form-fields/PatientStatusField.tsx | 63 | Orphan |
| components/patients/tabs/PEPTab.tsx | 95 | Orphan |
| components/patients/tabs/financial-tab/BudgetList.tsx | 28 | Orphan |
| components/pdv/CryptoPaymentPDV.tsx | 360 | Orphan |
| components/shared/ConfirmDialog.tsx | 62 | Orphan |
| components/shared/ContextMenu.tsx | 188 | Orphan |
| components/shared/DateRangePicker.tsx | 80 | Orphan |
| components/shared/FormattedInput.tsx | 178 | Orphan |
| components/shared/OdontoTooltipSimple.tsx | 34 | Orphan |

### Quality Gates After Changes

| Gate | Before | After | Status |
|------|--------|-------|--------|
| type-check | 0 errors | 0 errors | ✅ PASS |
| lint | 0 errors, 104 warnings | 0 errors, 104 warnings | ✅ PASS |
| build | 0 errors | 0 errors | ✅ PASS |
| @ts-expect-error count | 712 | 700 | ⬇️ -12 |
| Orphan components | 25+ | ~0 in checked dirs | ⬇️ -25 |

### Remaining Tasks (Require Decision/Deep Analysis)

| Task | Blocker | Recommendation |
|------|---------|----------------|
| T020-T022 | Need to compare props/interfaces of duplicates | Schedule pair-review for LeadCard, LeadForm, Tabs |
| T023-T028 | Need to verify each export's external consumers | Run automated dead-export scanner (knip/ts-prune) |
| T029 | Security-sensitive auth migration | Requires dedicated security review BEFORE execution |
| T030 | userRoleRef anti-pattern | Low risk, can be done with AuthContext refactor |

### Git Status

```
33 files changed, 7 insertions(+), 2592 deletions(-)
```

### Risk Assessment

- **Deletion risk**: LOW — all deleted files verified to have 0 external imports
- **Type-check risk**: NONE — passes with 0 errors
- **Build risk**: NONE — passes with 0 errors
- **Regression risk**: LOW — no runtime code changed, only dead code removed

---

*Execution update appended after implementation session*

---

## Final Execution Update — 2026-05-23

### Tasks Completed in Final Session

| Task | Description | Result |
|------|-------------|--------|
| T020-T022 | Duplicate component merge evaluation | Evaluated LeadCard, LeadForm, HistoricoTab, OdontogramaTab, TratamentosTab. Tabs are legitimate specializations (different props/contexts). LeadCard/LeadForm orphans deleted. lead-card/ and lead-form/ directories removed. |
| T023-T028 | Barrel file cleanup | Deleted 7 dead barrel files + 1 orphaned directory (bitcoin-qr-dialog/) |

### Additional Files Deleted in Final Session

| File/Directory | Lines | Category |
|---------------|-------|----------|
| components/crm/lead-card/ (full dir) | ~150 | Orphan directory |
| components/crm/lead-form/ (full dir) | ~300 | Orphan directory |
| components/crypto/bitcoin-qr-dialog/ (full dir) | ~400 | Nested duplicate of root BitcoinQRCodeDialog |
| components/crypto-rates-widget/index.ts | 2 | Dead barrel |
| components/crypto/crypto-tour/index.ts | 3 | Dead barrel |
| components/crypto/bitcoin-info-card/index.ts | 7 | Dead barrel |
| components/crypto/bitcoin-qr-dialog/index.ts | 2 | Dead barrel |
| components/crypto/bitcoin-qr-dialog/index.tsx | 83 | Dead barrel |
| components/crypto/crypto-performance-report/index.ts | 3 | Dead barrel |
| components/admin/repository-manager/index.ts | 3 | Dead barrel |
| components/admin/webhook-manager/index.ts | 2 | Dead barrel |

### Final Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| type-check errors | 0 | 0 | — |
| lint errors | 0 | 0 | — |
| lint warnings | 104 | 98 | -6 |
| @ts-expect-error | 712 | 698 | -14 |
| Files deleted | 0 | 40+ | — |
| Lines deleted | 0 | 3,883 | — |
| Dead barrel files | 35+ | 28+ | -7 |

### Quality Gates — Final Verification

| Gate | Status |
|------|--------|
| pnpm type-check | ✅ 0 errors |
| pnpm lint | ✅ 0 errors, 98 warnings |
| pnpm build | ✅ 0 errors |

### Remaining Work

- **T029**: Auth token migration (BLOCKED — security review required)
- **T030**: userRoleRef anti-pattern (LOW priority — can be bundled with AuthContext refactor)
- **Barrel files**: 28+ barrel files still need audit — recommend automated tool (knip)
- **@ts-expect-error**: 698 remaining — top offenders identified for next sprint

### Git Summary

```
68 files changed, 7 insertions(+), 3883 deletions(-)
```

---

*Final execution update appended*
