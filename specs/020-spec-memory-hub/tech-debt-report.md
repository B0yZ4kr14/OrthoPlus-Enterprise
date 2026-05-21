# Tech Debt Report: Spec Kit Memory Hub

**Generated**: 2026-05-18
**Feature**: specs/020-spec-memory-hub
**Spec Reference**: [spec.md](spec.md)

---

## Executive Summary

| Severity | Count | Immediate Action Required |
|----------|-------|---------------------------|
| Critical | 0 | None |
| Large | 4 | Review and prioritize before next iteration |
| Medium | 6 | Tasks created in tasks.md |
| Small | 0 | None |

---

## Large Issues Requiring Analysis

### [L001] Missing clinicGuard on Memory Hub Router

**Category**: Security / Architecture
**Location**: `backend/src/modules/memory_hub/api/router.ts`
**Related Spec**: FR-010 (API interface), GP-1 (Constitution)
**Constitution Impact**: GP-1 — "Every data access MUST be scoped by clinicId. clinicGuard is mandatory on all protected routers."

#### Problem Description

The memory hub router mounts at `/api/memory-hub` without `clinicGuard` middleware. While `authMiddleware` is applied globally in `backend/src/index.ts` (line 242), `clinicGuard` is applied per-router in all other OrthoPlus modules (e.g., agenda, analytics, financeiro). The memory hub endpoints currently do not validate `req.user.clinicId`, meaning any authenticated user from any clinic could potentially access memory documents from other clinics if multi-tenancy were enforced at the data layer.

Currently this is low-risk because the memory hub stores project-wide documentation (not clinic-specific patient data), but as the module evolves, it may index clinic-specific specs or contracts. Establishing the guard now prevents future security regressions.

#### Impact if Not Addressed

- Future clinic-specific memory indexing would expose data across tenant boundaries
- Inconsistent with every other module in the backend
- Constitution violation that would fail Architecture Guard review

#### Options

**Option 1: Add clinicGuard to router (Recommended)**
- **Approach**: Import `clinicGuard` and add `router.use(clinicGuard)` at the top of `router.ts`
- **Pros**: Aligns with all other modules; future-proof; minimal code change
- **Cons**: Slightly increases complexity for project-wide memory access (no real clinic boundary exists yet for docs)
- **Effort**: S
- **Risk**: Low

**Option 2: Document exception with justification**
- **Approach**: Add comment explaining memory hub is project-wide and not clinic-scoped
- **Pros**: No code change; acknowledges current reality
- **Cons**: Creates precedent for skipping clinicGuard; risky if module evolves
- **Effort**: XS
- **Risk**: Medium

**Option 3: Defer until clinic-specific memory is needed**
- **Approach**: Leave as-is; add guard when clinic-scoped documents are introduced
- **Pros**: No immediate effort
- **Cons**: Easy to forget; technical debt accumulates
- **Recommended deferral period**: Next feature iteration

#### Recommendation

**Option 1** — Add `clinicGuard` now. The effort is trivial and prevents a security anti-pattern from becoming entrenched. If memory hub truly needs unscoped project-wide access in the future, a dedicated unscoped router prefix can be created with explicit justification.

---

### [L002] Missing ApiError + RFC 7807 Problem Details in Controller

**Category**: Code Quality / Architecture
**Location**: `backend/src/modules/memory_hub/api/controller.ts:51,67,82,91,103,130`
**Related Spec**: FR-010 (API interface)
**Constitution Impact**: CQ-3 — "Use ApiError from `@/middleware/errorHandler`. Return RFC 7807 Problem Details. Log with Winston."

#### Problem Description

The `MemoryHubController` returns raw JSON error responses (`{ error: "..." }`) and uses `console.error` for logging. It does not use the project's standard `ApiError` class or RFC 7807 Problem Details format. This creates inconsistent error responses for API consumers and bypasses the centralized error handling middleware.

Example current behavior:
```typescript
return res.status(400).json({ error: "Query is required" })
```

Expected behavior:
```typescript
throw new ApiError("MISSING_QUERY", 400, "Query is required")
// Handled by errorHandler middleware -> RFC 7807 response
```

#### Impact if Not Addressed

- Inconsistent API contract across OrthoPlus endpoints
- Error responses lack standard fields (`type`, `title`, `detail`, `instance`)
- Frontend error handling must special-case memory hub errors
- Operational logs go to console instead of structured Winston JSON

#### Options

**Option 1: Refactor controller to use ApiError (Recommended)**
- **Approach**: Replace all `return res.status(...).json({ error: ... })` with `throw new ApiError(...)`; replace `console.error` with `logger.error`
- **Pros**: Aligns with project standard; leverages existing middleware
- **Cons**: Requires verifying errorHandler catches async errors (it does — existing pattern)
- **Effort**: S
- **Risk**: Low

**Option 2: Defer**
- **Approach**: Document as known limitation
- **Cons**: Inconsistency persists; harder to fix as module grows
- **Effort**: None
- **Risk**: Medium

#### Recommendation

**Option 1** — Refactor during next TD iteration. Pattern is well-established in other controllers (e.g., `IARadiografiaController`).

---

### [L003] Missing Winston Logger in Services

**Category**: Observability
**Location**: `backend/src/modules/memory_hub/domain/services/*.ts`, `infrastructure/FileWatcher.ts`
**Related Spec**: NFR-005 (Health scan observability)
**Constitution Impact**: CQ-3 — "Log with Winston." EP-4 — "Every new module must emit at least one custom metric."

#### Problem Description

All services and infrastructure classes use `console.log` and `console.error` for operational logging. The project standard is Winston JSON-structured logging via `backend/src/infrastructure/logger`. This means memory hub logs do not appear in production log files and lack standard metadata (timestamp, service name, environment).

Affected files/lines:
- `SearchService.ts:76` — query timing
- `IndexingService.ts:81,102` — indexing progress
- `FileWatcher.ts:43,53` — watcher lifecycle

#### Impact if Not Addressed

- Logs lost in production (only Console transport in dev; File transport in prod won't catch console.log)
- No structured query for memory hub operations in log aggregation
- Inconsistent observability posture

#### Options

**Option 1: Inject logger via constructor (Recommended)**
- **Approach**: Add `logger: winston.Logger` parameter to service constructors; pass `logger` from controller or DI container
- **Pros**: Testable; follows dependency injection pattern; consistent with project
- **Cons**: Requires updating all service constructors
- **Effort**: S
- **Risk**: Low

**Option 2: Direct import**
- **Approach**: `import { logger } from "@/infrastructure/logger"` in each file
- **Pros**: Simple; minimal changes
- **Cons**: Tight coupling; harder to test
- **Effort**: XS
- **Risk**: Low

#### Recommendation

**Option 2** for MVP simplicity, migrating to Option 1 if services become more complex. Direct import is acceptable given the project's current patterns.

---

### [L004] DocumentRepository Snake_Case vs CamelCase Type Mismatch

**Category**: Bug / Data Integrity
**Location**: `backend/src/modules/memory_hub/infrastructure/DocumentRepository.ts`
**Related Spec**: FR-006 (Health dashboard), FR-009 (Version history)
**Constitution Impact**: CQ-1 — "Backend builds with tsc (strict mode)."

#### Problem Description

`better-sqlite3` returns row objects with keys matching SQLite column names (`snake_case`). The `MemoryDocument` TypeScript interface uses `camelCase`. `DocumentRepository` casts raw rows directly via `as MemoryDocument`, which suppresses TypeScript errors but creates a runtime mismatch.

Specific impacts:
- `lastIndexed` is undefined at runtime (actual key is `last_indexed`)
- `contentHash` is undefined (actual key is `content_hash`)
- `isArchived` is undefined (actual key is `is_archived`)
- `docType` is undefined (actual key is `doc_type`)

This causes the health endpoint (`controller.ts:117`) to always compute `recentlyIndexed = 0` and `coverage_percent = 0%`, regardless of actual index state.

`ChunkRepository.findByDocument()` correctly maps columns manually — `DocumentRepository` should follow the same pattern.

#### Impact if Not Addressed

- Health dashboard reports incorrect metrics (always 0% coverage)
- Any future code relying on `MemoryDocument` interface properties will fail silently
- Type safety illusion — compiles but breaks at runtime

#### Options

**Option 1: Add mapping layer in DocumentRepository (Recommended)**
- **Approach**: Create private `mapRow(row): MemoryDocument` method; use in `findById`, `findByPath`, `listAll`
- **Pros**: Fixes runtime bug; consistent with ChunkRepository; type-safe
- **Cons**: ~15 lines of mapping code
- **Effort**: XS
- **Risk**: Low

**Option 2: Rename SQLite columns to camelCase**
- **Approach**: Alter table or recreate schema with camelCase columns
- **Pros**: No mapping needed
- **Cons**: SQLite convention is snake_case; diverges from standard SQL style
- **Effort**: S
- **Risk**: Medium (migration complexity)

#### Recommendation

**Option 1** — Add mapping. This is the project's established pattern (see `ChunkRepository`) and is the minimal safe fix.

---

## Cross-References

- **Specification**: specs/020-spec-memory-hub/spec.md
- **Implementation Plan**: specs/020-spec-memory-hub/plan.md
- **Tasks**: specs/020-spec-memory-hub/tasks.md (Tech Debt section — TD001-TD010)
- **Constitution**: .specify/memory/constitution.md

---

## Next Steps

1. Review this report with stakeholders
2. Address TD001-TD004 (Large issues) before next feature iteration
3. Address TD005-TD010 (Medium issues) in priority order
4. Run `/speckit.implement` to address TD tasks when ready
5. Re-run `/speckit.cleanup` to verify resolution
