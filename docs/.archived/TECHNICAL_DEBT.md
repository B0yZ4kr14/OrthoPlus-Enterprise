# Technical Debt Report

**Generated:** 2026-03-16
**Status:** Production-Ready with identified technical debt
**Baseline Validation:** ✅ PASSING (lint --quiet, type-check, build, tests)

---

## Executive Summary

This document catalogues known technical debt in the Ortho+ codebase. All items listed here are **non-blocking** - the system is production-ready and all validations pass. This debt represents opportunities for incremental improvement.

## 1. ESLint Warnings (58 warnings)

### Status
- **Severity:** Low to Medium
- **Impact:** Code quality and potential stale closure bugs
- **Current State:** All warnings are in `react-hooks/exhaustive-deps` category

### Distribution
- React hooks missing dependencies: 58 files
- Fast refresh export warnings: 10 files
- Total: 58 warnings, 0 errors

### Risk Assessment
**Low Risk (46 files):** Functions are stable and don't cause issues
- Components in `src/components/crypto/` (6 files)
- Components in `src/modules/*/hooks/` (25 files)
- Settings components (5 files)
- Other utility components (10 files)

**Medium Risk (12 files):** Could cause stale closure bugs
- `src/modules/estoque/components/BarcodeScannerDialog.tsx` - scanner reference
- `src/modules/funcionarios/components/PermissoesManager.tsx` - onChange callback
- `src/modules/pep/components/Odontograma2D.tsx` - handleToothClick

### Recommended Action
**Phase 1 (Immediate):** Fix medium-risk files (12 files)
**Phase 2 (Backlog):** Systematically address low-risk files during feature work

### Example Fix Pattern
```typescript
// Before (warning)
useEffect(() => {
  loadData();
}, []);

const loadData = async () => { /* ... */ };

// After (fixed)
const loadData = useCallback(async () => {
  /* ... */
}, [dependencies]);

useEffect(() => {
  loadData();
}, [loadData]);
```

---

## 2. Security Vulnerabilities (6 remaining) ✅ IMPROVED

### Status
- **Initial State:** 25 vulnerabilities (1 critical, 13 high, 8 moderate, 3 low)
- **After npm audit fix:** 13 vulnerabilities
- **Current State:** 6 vulnerabilities (0 critical, 1 high, 5 moderate, 0 low)
- **Fixed:** 19 vulnerabilities (76% reduction)

### Critical Fixes Applied ✅
- **jspdf** 3.0.4 → 4.2.0 - Fixed 7 critical vulnerabilities:
  - ✅ Path Traversal/Local File Inclusion
  - ✅ PDF Injection allowing Arbitrary JavaScript Execution (2 variants)
  - ✅ PDF Object Injection via addJS
  - ✅ DoS via Unvalidated BMP Dimensions
  - ✅ DoS via Malicious GIF Dimensions
  - ✅ XSS via AcroFormChoiceField

- **fabric** 6.9.1 → 7.2.0 - Fixed:
  - ✅ Stored XSS via SVG Export

### High Severity (1)
- **xlsx** - Prototype Pollution and ReDoS
  - **No fix available** - Monitor for updates
  - Impact: Only affects Excel export features
  - Mitigation: Validate all Excel file inputs

### Moderate Severity (5)
- **esbuild** (≤0.24.2) - Dev server request vulnerability
  - Affects vite (dev environment only)
  - Breaking change required for fix (vite 8.0.0)
  - **Impact:** Development only, not production
- **yauzl** (<3.2.1) - Off-by-one error
  - Affects @capacitor/cli
  - Breaking change required for fix
  - **Impact:** Build tooling only

### Recommended Actions
1. ✅ **COMPLETED:** Updated jspdf to 4.2.0 and fabric to 7.2.0
2. ✅ **COMPLETED:** Verified all tests still pass after updates
3. **Next Sprint:** Monitor xlsx for security fix
4. **Optional:** Evaluate vite 8.0.0 upgrade for esbuild fix (dev-only impact)
5. **Ongoing:** Monitor security advisories weekly

---

## 3. TypeScript @ts-nocheck Directives

### Frontend (src/)
- **Count:** 0 files ✅
- **Status:** Clean

### Backend
- **Count:** 62 files with @ts-nocheck
- **Location:** `/backend/` directory
- **Reason:** Documented in merge commit `fde50ff` - strict TypeScript config incompatibility

### TypeScript Configuration
```json
{
  "strict": false,
  "strictNullChecks": false,
  "noImplicitAny": false,
  "noUnusedParameters": false,
  "noUnusedLocals": false
}
```

### Recommended Actions
**Phase 1:** Enable strict mode for new code
- Set `strict: true` for new files via path-based config
- Create `tsconfig.strict.json` extending main config

**Phase 2:** Gradually migrate backend files
- Target: 5-10 files per sprint
- Priority: Core business logic files first
- Use TypeScript 5.8 features for easier migration

**Phase 3:** Full strict mode
- Timeline: 6-12 months
- Gate: 90% of backend files migrated

---

## 4. Bundle Size Optimization

### Current State
- **vendor-3d.js:** 940.59 kB (266.78 kB gzipped) ⚠️
- **vendor-charts.js:** 410.14 kB (110.30 kB gzipped)
- **jspdf.es.min.js:** 388.06 kB (127.41 kB gzipped)

### Impact
- Initial page load affected by large vendor bundles
- 3D library (three.js, @react-three/fiber) is largest chunk

### Recommended Actions
1. **Dynamic Imports:** Load 3D components only when needed
   ```typescript
   const Odontograma3D = lazy(() => import('./Odontograma3D'));
   ```

2. **Route-based Code Splitting:** Split by module
   ```typescript
   // Already implemented in some modules
   const PEPPage = lazy(() => import('./PEPPage'));
   ```

3. **Tree Shaking:** Review three.js imports
   ```typescript
   // Instead of
   import * as THREE from 'three';
   // Use
   import { Scene, PerspectiveCamera } from 'three';
   ```

4. **Build Config:** Manual chunk optimization
   ```javascript
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'vendor-3d-core': ['three'],
           'vendor-3d-react': ['@react-three/fiber', '@react-three/drei']
         }
       }
     }
   }
   ```

---

## 5. Testing Coverage

### Current State
- **Unit Tests:** 85 tests passing
- **E2E Tests:** 46 tests (documented in E2E_TESTS_SUMMARY.md)
- **Test Files:** 10 files

### Coverage Gaps
- **Module Hooks:** Limited coverage for custom hooks
- **Complex Components:** Large components lack unit tests
- **Business Logic:** Domain aggregates have good coverage ✅
- **UI Components:** Minimal component testing

### Recommended Actions
1. **Add React Testing Library tests** for critical user flows
2. **Increase hook testing** coverage to 80%
3. **Add integration tests** for module interactions

---

## 6. Deprecated Dependencies

### Identified
- `rimraf@3.0.2` - Package no longer supported
- `npmlog@5.0.1` - Package no longer supported
- `@types/uuid@11.0.0` - Stub types (uuid has built-in types)
- `@types/react-window@2.0.0` - Stub types
- `glob@7.2.3` - Old version with known issues
- `three-mesh-bvh@0.7.8` - Deprecated due to three.js incompatibility

### Recommended Actions
- Update to `rimraf@6.x`
- Remove `@types/uuid` and `@types/react-window`
- Update `glob` to latest stable
- Update `three-mesh-bvh` to v0.8.0+

---

## 7. Code Quality Patterns

### Anti-patterns Found
1. **Large Component Files:** Some components exceed 500 lines
2. **Mixed Concerns:** Business logic in UI components
3. **Prop Drilling:** Some deep component hierarchies
4. **Any Types:** Usage of `unknown` as type escape hatch

### Recommended Refactors
1. **Extract Custom Hooks:** Move business logic to hooks
2. **Component Composition:** Break large components into smaller ones
3. **Context API:** Replace prop drilling with context
4. **Gradual Typing:** Replace `unknown` with proper types

---

## 8. Priority Matrix

| Category | Priority | Effort | Impact | Timeline | Status |
|----------|----------|--------|--------|----------|--------|
| Critical Security (jspdf, fabric) | 🔴 High | Medium | High | This Sprint | ✅ DONE |
| Medium-Risk ESLint | 🟡 Medium | Low | Medium | This Sprint | Pending |
| High Security (xlsx) | 🟡 Medium | N/A | Medium | Monitor | No fix available |
| Low-Risk ESLint | 🟢 Low | Medium | Low | Backlog | Documented |
| Bundle Size | 🟢 Low | Medium | Medium | Next Quarter | Documented |
| TypeScript Strict | 🟢 Low | High | Medium | 6-12 months | Documented |
| Test Coverage | 🟢 Low | High | Low | Ongoing | Documented |
| Dev-only Security (esbuild) | 🟢 Low | Low | Very Low | Optional | Dev-only |

---

## 9. Measurement & Tracking

### Success Metrics
- **Security:** ✅ Reduced to 6 vulnerabilities (0 critical, 1 high) - TARGET MET
- **Code Quality:** Reduce ESLint warnings to <20 - In Progress
- **TypeScript:** Increase strict mode coverage to >50% - Planned
- **Bundle Size:** Reduce vendor-3d to <700kB - Planned
- **Test Coverage:** Achieve >60% line coverage - In Progress

### Review Cadence
- **Weekly:** Security vulnerability scan
- **Monthly:** Technical debt review and prioritization
- **Quarterly:** Major technical debt initiatives

---

## 10. Notes

**Document Ownership:** Engineering Team
**Last Updated:** 2026-03-16
**Next Review:** 2026-04-16

This document should be updated whenever:
- New technical debt is identified
- Existing debt is resolved
- Priorities change based on business needs

---

*This is a living document. Technical debt is normal and expected. The goal is to manage it deliberately, not eliminate it entirely.*
