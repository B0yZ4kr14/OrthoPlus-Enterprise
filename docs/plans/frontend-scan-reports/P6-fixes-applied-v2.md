# Fixes Applied Report v2 — 2026-05-20

## Scan Reassessment
The original P1 scan (2026-05-19) was partially stale. Many reported issues had already been resolved between the scan date and execution date.

## Verified Status of Original Tasks

| Original Task | Status | Notes |
|--------------|--------|-------|
| TD001: DataTable EmptyState | **ALREADY DONE** | EmptyState component already integrated in DataTable.tsx |
| TD005: 7 Circular Dependencies | **ALREADY DONE** | `madge` reports 0 circular dependencies |
| TD004: 18 fetch() -> apiClient | **PARTIALLY DONE** | Most already using apiClient or in infrastructure/ layer |
| Crypto abstractions | **ALREADY DONE** | cryptoMarketApi already exists |

## Fixes Applied in This Session

| ID | File | Change | Method |
|----|------|--------|--------|
| FIX-004 | CryptoPaymentConfirmedHandler.ts | Removed 6 console.log debug statements | Scout Rule |
| FIX-005 | CryptoPaymentConfirmedHandler.ts | Replaced log stubs with void event comments | Scout Rule |
| FIX-006 | EmailNotificationHandler.ts | Migrated 2 fetch() calls to apiClient.post | AP-3 Compliance |
| FIX-007 | hooks/api/useFiles.ts | Migrated download fetch() to apiClient.get<Blob> | AP-3 Compliance |
| FIX-008 | pep/PEPPage.tsx | Fixed empty arrow function warning | Scout Rule |

## Remaining Technical Debt (Documented)

| Issue | File | Reason for Deferral |
|-------|------|---------------------|
| fetch() fallback in Auth.tsx | modules/Auth.tsx | Intentional fallback pattern — requires analysis before removal |
| fetch() in useBackendStatus.ts | settings/backend-selector/ | Health check to arbitrary URLs — acceptable use case |
| fetch() in exchange adapters | infrastructure/external/exchanges/ | External API calls — in correct infrastructure layer |
| fetch() in BlockchainMonitor | infrastructure/external/ | External blockchain API — in correct layer |
| fetch() in useCEPLookup | hooks/useCEPLookup.ts | External ViaCEP API — acceptable |
| 10 components >400 lines | various | Requires careful extraction — deferred to next session |

## Quality Gates Post-Fixes
- Type-check: 0 errors ✅
- Lint: 0 errors, ~104 warnings (1 reduced) ✅
- No regressions introduced ✅
