# Frontend Analysis Report — 2026-05-23

> Consolidated findings from parallel deep-dive analysis of `apps/web/src/`

## Quality Gates Status

| Gate | Status | Details |
|------|--------|---------|
| Type-check | ✅ PASS | 0 errors (fixed TS4025 in useModulos.ts) |
| Lint | ✅ PASS | 0 errors, 104 warnings |
| Build | ✅ PASS | 0 errors |

---

## 1. Type Safety Debt

### Metrics
- **712** `@ts-expect-error` suppressions
- **207** `as any` casts
- **419** `any` type annotations

### Critical Issues
1. **react-joyride missing types** — Package `react-joyride@^3.0.2` installed but type definitions missing. 40 `@ts-expect-error` instances (TS2305, TS2613) across 6 files:
   - `CryptoTour.tsx`, `useCryptoTour.ts`, `types.ts`, `TourContent.tsx`
   - **Fix:** Install `@types/react-joyride` or add `declarations.d.ts` module augmentation

2. **useModulos hook** — `ModuleDependencies` interface was defined inside function scope, causing TS4025 (exported variable using private name). **FIXED** — moved interface to module scope.

3. **ModulesContext dependencies** — TS2322 mismatch on dependencies prop. **FIXED** — properly typed via `Record<string, string[]>`.

---

## 2. Component Architecture Debt

### Orphan Components (zero imports)

| Component | Path | Category |
|-----------|------|----------|
| DraggableAppointment | `components/agenda/DraggableAppointment.tsx` | Agenda DnD (legacy?) |
| DroppableTimeSlot | `components/agenda/DroppableTimeSlot.tsx` | Agenda DnD (legacy?) |
| KanbanBoard | `components/crm/KanbanBoard.tsx` | CRM (modules/crm/ is active) |
| OriginInput | `components/campaigns/.../OriginInput.tsx` | Campaigns |
| ActionCard | `components/dashboard/ActionCard.tsx` | Dashboard (modules/dashboard/ active) |
| CategoryDashboard | `components/dashboard/CategoryDashboard.tsx` | Dashboard |
| DashboardQuickStats | `components/dashboard/DashboardQuickStats.tsx` | Dashboard |
| PieChartCard | `components/dashboard/PieChartCard.tsx` | Dashboard |
| CryptoPaymentPDV | `components/pdv/CryptoPaymentPDV.tsx` | PDV |
| IntegracaoContabilConfig | `components/pdv/IntegracaoContabilConfig.tsx` | PDV |
| QuickActionsBar | `components/QuickActionsBar.tsx` | Shared |
| ThemePreview | `components/ThemePreview.tsx` | Shared |
| + 20+ more in subdirectories | | |

### Duplicate Components (components/ vs modules/)

| Component | components/ | modules/ | Risk |
|-----------|-------------|----------|------|
| LeadCard | `components/crm/LeadCard.tsx` | `modules/crm/presentation/components/LeadCard.tsx` | Different props |
| LeadForm | `components/crm/LeadForm.tsx` | `modules/crm/presentation/components/LeadForm.tsx` | Different schemas |
| EmptyState | 6 files | 3 files | Generic name collision |
| ActionButtons | 9 files | 1 file | Generic name collision |
| LoadingState | 6 files | 2 files | Generic name collision |
| KPICards | 2 files | 4 files | Case-insensitive match |
| StatsCard | 1 file | 1 file | Feature overlap |
| PatientSelector | 1 file | 1 file | Feature overlap |
| HistoricoTab | 1 file | 1 file | Patient/PEP overlap |
| OdontogramaTab | 1 file | 1 file | Patient/PEP overlap |
| TratamentosTab | 1 file | 1 file | Patient/PEP overlap |
| SummaryCards | 1 file | 1 file | PDV/Estoque overlap |

### Root-level + Nested Duplicates

| Component | Root | Nested |
|-----------|------|--------|
| BarcodeScanner | `components/BarcodeScanner.tsx` | `components/barcode-scanner/BarcodeScanner.tsx` |
| CryptoRatesWidget | `components/CryptoRatesWidget.tsx` | `components/crypto-rates-widget/CryptoRatesWidget.tsx` |
| GlobalSearch | `components/GlobalSearch.tsx` | `components/global-search/GlobalSearch.tsx` + `components/layout/GlobalSearch.tsx` |
| ModuleCard | `components/ModuleCard.tsx` | `components/settings/ModuleCard.tsx` + ... |
| PerformanceMonitor | `components/PerformanceMonitor.tsx` | `components/performance-monitor/PerformanceMonitor.tsx` |
| ShowcaseComponents | `components/ShowcaseComponents.tsx` | `components/showcase-components/ShowcaseComponents.tsx` |

---

## 3. Barrel File Bloat

35+ barrel files (`index.ts`) export symbols never imported externally. Notable:
- `components/crypto/*/index.ts` — 4+ unused exports
- `components/dashboard/*/index.ts` — 2+ unused exports  
- `components/pdv/*/index.ts` — 7+ unused exports
- `components/settings/*/index.ts` — 6+ unused exports
- `components/onboarding/*/index.ts` — 2+ unused exports

---

## 4. Large Components (>350 lines, candidates for splitting)

### In components/
| File | Lines | Exports |
|------|-------|---------|
| BackupRestoreDialog | 519 | 1 |
| IntegracaoContabilConfig | 500 | 1 |
| ExchangeConfigForm | 484 | 3 |
| AIModelConfig | 478 | 2 |
| ConversionSimulator | 443 | 1 |
| DCABacktesting | 418 | 1 |
| MedicalHistoryTab | 414 | 1 |
| AnamneseTab | 410 | 1 |
| CryptoCalculator | 395 | 1 |
| VolatilityAlerts | 390 | 1 |

### In modules/
| File | Lines | Exports |
|------|-------|---------|
| EstoqueIntegracoes | 543 | 1 |
| EstoqueAnalisePedidos | 537 | 2 |
| CryptoAnalysisDashboard | 531 | 2 |
| AssinaturaICP | 527 | 1 |
| EstoqueInventarioDashboard | 524 | 1 |
| ReportTemplates | 510 | 1 |
| PEPPage | 500 | 1 |
| ModulesSimple | 495 | 3 |
| RadiografiaComparison | 489 | 1 |
| DashboardVendasPDV | 480 | 2 |
| ProgramaFidelidade | 461 | 1 |
| Landpage | 430 | 6 |
| NotasFiscais | 428 | 1 |
| AuditLogs | 427 | 1 |

---

## 5. Architectural Patterns Assessment

| Category | Grade | Notes |
|----------|-------|-------|
| Architecture | B+ | Clean Architecture partially implemented. `agenda/` is exemplary; many modules are flat |
| Component Organization | C+ | Unclear boundary between `components/` and `modules/*/components/` |
| State Management | B | React Query well used. Zustand underutilized (only 6 stores for massive app) |
| API / Data Fetching | A- | `apiClient.ts` is clean. Repository pattern inconsistently applied |
| Routing | B+ | Good lazy loading, inconsistent import patterns |
| Type Safety | B+ | tsc passes with 0 errors, but suppression debt is high |
| Testing | C | Only ~5% of files tested. Agenda module is gold standard |
| Lint / Code Quality | B | 104 warnings, no errors |

### Anti-Patterns Found
1. **LocalStorage token storage** — `accessToken` stored in localStorage despite HttpOnly cookies (XSS risk)
2. **`userRoleRef` anti-pattern** — Ref updated during render to avoid stale closures
3. **Context overuse in some modules** — Many modules use prop drilling where Zustand would be cleaner

---

## 6. Corrections Applied in This Run

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | useModulos TS4025 | `hooks/api/useModulos.ts` | Moved `ModuleDependencies` interface to module scope |
| 2 | ModulesContext TS2322 | `contexts/ModulesContext.tsx` | Added `Record<string, string[]>` type annotation |
| 3 | react-joyride missing types | `types/react-joyride.d.ts` | Created full module declaration covering all usage |
| 4 | react-joyride @ts-expect-error | `components/crypto/CryptoTour.tsx` | Removed 6 unused suppressions |
| 5 | react-joyride @ts-expect-error | `components/crypto/crypto-tour/*.ts` | Removed 3 unused suppressions |
| 6 | react-joyride @ts-expect-error | `components/tour/product-tour/ProductTour.tsx` | Removed 1 unused suppression |

**Net result:** 10 `@ts-expect-error` suppressions removed. Remaining count: **702** (was 712).

---

## 7. Recommended Action Plan

### Phase 1: Immediate (this sprint)
- [ ] Fix react-joyride types (add @types/react-joyride or declarations.d.ts)
- [ ] Remove confirmed orphan components (dashboard/, crm/ legacy)
- [ ] Consolidate root-level + nested duplicates (BarcodeScanner, etc.)

### Phase 2: Short-term (next 2 sprints)
- [ ] Merge duplicate components/ and modules/ hierarchies for CRM, patients, PDV
- [ ] Remove dead barrel exports or delete orphaned barrel files
- [ ] Split components >500 lines into sub-components
- [ ] Address localStorage token security issue

### Phase 3: Medium-term (next quarter)
- [ ] Reduce @ts-expect-error count by 50% (target: <350)
- [ ] Reduce `as any` count by 50% (target: <100)
- [ ] Standardize on modules/ architecture for all new features
- [ ] Deprecate components/ directory gradually
- [ ] Increase test coverage from ~5% to 20%

---

*Report generated by parallel analysis agents on 2026-05-23*
