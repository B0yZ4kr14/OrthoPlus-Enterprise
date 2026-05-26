# Security Fix Log — 2026-05-26

## clinicGuard Coverage — COMPLETE

**Commit:** 29a0519f1  
**Files Changed:** 7 production files

### Changes

#### 1. `backend/src/routes/modules.ts`
- Added `import { clinicGuard } from "@/middleware/clinicGuard"`
- Added `modulesRouter.use(clinicGuard)` before all business routes
- Impact: All 8 endpoints in `/api/modules/*` now require valid clinic context

#### 2. `backend/src/modules/*/api/dbRouter.ts` (×6)
- Replaced 30 instances of `res.status(500).json({ error: e.message })` with `asyncHandler`
- Errors now flow through global `errorHandler` middleware (RFC 7807)
- Client no longer receives raw error messages or stack traces

| Module | File | Instances Fixed |
|--------|------|-----------------|
| pacientes | `api/dbRouter.ts` | 5 |
| crm | `api/dbRouter.ts` | 5 |
| financeiro | `api/dbRouter.ts` | 5 |
| configuracoes | `api/dbRouter.ts` | 5 |
| teleodonto | `api/dbRouter.ts` | 5 |
| inventario | `api/dbRouter.ts` | 5 |

### Verification
- `pnpm build` — 0 errors ✅
- `pnpm test` — 689/689 passed ✅

### Before vs After

**Before (vulnerability):**
```ts
catch (e: any) {
  res.status(500).json({ error: e.message }); // Leaks internals
}
```

**After (secure):**
```ts
import { asyncHandler } from "@/middleware/errorHandler";

dbRouter.get("/health", asyncHandler(async (_req, res) => {
  res.json(await manager.getHealth());
}));
// Errors caught by global errorHandler → sanitized Problem Details
```
