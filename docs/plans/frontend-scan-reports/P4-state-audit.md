# State Audit Report — Frontend Scan

**Generated**: 2026-05-19  
**Scope**: Contexts, React Query, Zustand  

---

## Summary

| Source | Estado | Issues |
|--------|--------|--------|
| AuthContext | 462 lines, 9 state vars | console.error, no loading skeleton |
| ModulesContext | Lazy loaded | OK |
| React Query hooks | ~60 hooks | Cache keys inconsistent in some modules |
| Zustand stores | ~5 stores | OK |

---

## AuthContext Analysis

**File**: `apps/web/src/contexts/AuthContext.tsx` (462 lines)  
**State variables**: `user`, `session`, `loading`, `userRole`, `userProfile`, `clinicId`, `availableClinics`, `selectedClinic`, `userPermissions`, `activeModules`

**Issues**:
- ⚠️ **Large context**: 462 lines — could be split into smaller contexts (Auth + Clinic + Modules)
- ⚠️ **console.error**: Lines 178, 190 — should use toast or silent handling
- ⚠️ **fetchUserMetadata 404**: Recently fixed with fallback (role from login response)
- ✅ **Role fallback**: Correctly implemented

**Fix**: Split into `AuthContext`, `ClinicContext`, `ModulesContext`  
**Effort**: M  

---

## React Query Cache Keys

**Pattern**: Most modules use consistent keys like `["modulos"]`, `["pacientes"]`, `["agenda"]`

**Issues**:
- ⚠️ **Some modules may have stale cache on mutations**: Verify `queryClient.invalidateQueries()` on all mutations

---

## Zustand Stores

**Found**: `useOdontogramaStore`, `useFocusMode`, `usePatientsStore` (via modules)

**Status**: OK — stores are module-scoped as per Constitution AP-3
