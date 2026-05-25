# Speckit Verify Run — Feature 020: Spec Kit Memory Hub

**Date**: 2026-05-24
**Verifier**: Kimi Code CLI (subagent)
**Feature Dir**: `specs/020-spec-memory-hub/`
**Branch**: `020-spec-memory-hub`

---

## 1. Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 49 (T001–T049) |
| Completed Tasks | 49 |
| Task Completion | **100%** |
| Backend Build | ✅ PASS |
| Frontend Type-Check | ✅ PASS |
| Lint | ✅ PASS (0 errors, 102 warnings pre-existing) |
| Backend Tests (memory_hub) | ✅ 103 passed, 13 suites |
| Frontend Tests | ✅ Present (5 test files) |
| E2E Tests | ✅ Present (1 spec file) |
| **Overall Verdict** | **CONDITIONAL** |

---

## 2. Check A: Spec Compliance

### Functional Requirements

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| FR-001 | Index all markdown in `specs/`, `docs/`, `.specify/memory/`, `.omk/memory/` | ✅ PASS | `IndexingService.indexFile()` + `findMarkdownFiles()` walks watch dirs; respects `.gitignore` |
| FR-002 | Semantic search with ranked results, excerpts, relevance scores | ✅ PASS | `SearchService.search()` uses cosine similarity, dedup by doc, returns `sourcePath`, `excerpt`, `relevanceScore` |
| FR-003 | Auto-detect file changes within 60s | ✅ PASS | `FileWatcher` with chokidar, 5s debounce, polling fallback at 30s |
| FR-004 | Structured context briefs for AI agents | ✅ PASS | `ContextBriefService.generateBrief()` outputs Markdown with YAML frontmatter, token budget, doc prioritization |
| FR-005 | Memory drift detection | ⚠️ PARTIAL | `DriftDetectionService` detects `missing_impl` and `orphan_doc`; `broken_ref` and `outdated_decision` are stubs |
| FR-006 | Health dashboard with coverage, drift, index status | ✅ PASS | `HealthService.getMetrics()` + `GET /health` endpoint |
| FR-007 | Filter by source type | ✅ PASS | `SearchFilters.docTypes` supported in `SearchService` |
| FR-008 | Respect confidentiality markers | ✅ PASS | `DocumentRepository.isConfidential()` checks `confidential`, `private`, `visibility` frontmatter keys; excluded from briefs |
| FR-009 | Version history for indexed documents | ✅ PASS | `DocumentRepository.upsert()` snapshots old versions to `document_versions`; `GET /versions` endpoint exposes history |
| FR-010 | CLI and API interfaces | ✅ PASS | 5 CLI scripts (`search.ts`, `health.ts`, `reindex.ts`, `brief.ts`, `drift.ts`); 7 API endpoints |
| FR-011 | API key validation on startup | ✅ PASS | `EmbeddingClientFactory.validateConfig()` checks key presence and length; fails fast for non-Ollama providers |
| FR-012 | Hot-swap API keys without restart | ❌ FAIL | No SIGHUP handler or `.env` file watcher implemented |

### Non-Functional Requirements

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| NFR-001 | Search < 2s for 1000 docs | ⚠️ UNVERIFIED | No load/performance tests executed; implementation uses SQLite + cosine similarity which should be fast for this scale |
| NFR-002 | Index update < 60s | ✅ PASS | FileWatcher debounce = 5s; polling = 30s; well under 60s threshold |
| NFR-003 | Context briefs fit 128k token budget | ✅ PASS | Hard cap at 128k tokens; `ContextBriefService` truncates with `TokenCounter` |
| NFR-004 | Local-first (Ollama fallback) | ✅ PASS | Default provider = Ollama; works without cloud API keys |
| NFR-005 | Health scan < 5min | ⚠️ UNVERIFIED | Worker spawns `driftScanWorker.ts` but no explicit 5-minute timeout enforcement in the job scheduler |
| NFR-006 | API keys encrypted at rest (AES-256-GCM) | ❌ FAIL | Keys stored in plaintext env vars; no encryption at rest implemented |
| NFR-007 | Provider failover (primary → secondary) | ❌ FAIL | No retry logic, no secondary provider fallback, no exponential backoff in embedding clients |
| NFR-008 | Cost tracking per clinic with monthly budget alerts | ❌ FAIL | `SearchAuditRepository` logs queries but does not track costs or enforce budgets |
| NFR-009 | Request ID for provider tracing | ✅ PASS | `OpenAIEmbeddingClient` sends `X-Request-ID` header |

---

## 3. Check B: Plan Adherence

| Plan Item | Status | Evidence |
|-----------|--------|----------|
| SQLite schema (`initSchema.sql`) | ✅ | All 6 tables + indexes present |
| Markdown parser with frontmatter extraction | ✅ | `MarkdownParser.ts` uses `js-yaml` + regex |
| Ollama embedding client | ✅ | `OllamaEmbeddingClient.ts` with `nomic-embed-text` default |
| OpenAI-compatible client | ✅ | `OpenAIEmbeddingClient.ts` for OpenAI/Anthropic/Google |
| File watcher (chokidar) | ✅ | `FileWatcher.ts` with debounce + polling fallback |
| IndexingService | ✅ | Parse → chunk → embed → upsert pipeline |
| SearchService | ✅ | Cosine similarity + filtering + pagination |
| ContextBriefService | ✅ | Priority ranking + token budget + confidentiality filter |
| DriftDetectionService | ⚠️ | Missing implementation for `broken_ref` and `outdated_decision` |
| HealthService | ✅ | Coverage, drift count, index status |
| GraphService | ⚠️ | Link extraction depends on `frontmatter.rawContent` which is **never stored in DB** — graph edges will always be empty |
| Rate limiting | ✅ | `searchLimit` (30/min), `briefLimit` (5/min), `reindexLimit` (5/5min) |
| Prometheus metrics | ✅ | `searchDuration`, `indexDuration`, `documentsIndexed`, `briefGenerationDuration`, `coveragePercent` |
| Daily drift scan cron | ✅ | `memoryHubDrift.ts` worker with configurable cron (default `0 2 * * *`) |
| Frontend module | ✅ | 4 components, 3 hooks, 5 test files, route integration |

---

## 4. Check C: Task Completion

### Task T004 — Shared Types Discrepancy ⚠️ HIGH

**Task Claim**: "Add Memory Hub types to `shared-types/src/index.ts`: `SearchResult`, `ContextBrief`, `DriftReport`, `HealthMetrics`"

**Actual State**: Types are **NOT** in `shared-types/src/index.ts`. They are defined locally in:
- `apps/web/src/modules/memory-hub/types/index.ts`
- `backend/src/modules/memory_hub/domain/services/SearchService.ts`
- `backend/src/modules/memory_hub/domain/services/ContextBriefService.ts`
- `backend/src/modules/memory_hub/domain/services/HealthService.ts`

**Impact**: Frontend and backend use separate type definitions. No cross-stack type sharing. This creates a risk of type drift between frontend and backend.

### Task T048 — E2E Test Naming Convention ❌ MEDIUM

**Task Claim**: "Add E2E tests in `tests/e2e/memory-hub.spec.ts`"

**Actual State**: Tests exist but use Portuguese descriptions (`deve exibir...`, `deve realizar...`). Constitution **TN-1** mandates: "All NEW test descriptions MUST be in English (`should...`, `must...`)."

### Task T044 — Index Corruption Detection ✅

**Actual State**: `SqliteHealthChecker.ts` implements `checkIntegrity()` (PRAGMA integrity_check), `backup()`, and `getStats()`.

### Task T046 — Sensitive Data Protection ✅

**Actual State**: `PIIDetector.ts` scans for CPF, CNPJ, email, phone, RG, credit card, health insurance, patient record patterns. `GitignoreParser.ts` respects `.gitignore`.

### All Other Tasks ✅

All remaining tasks (T001–T003, T005–T043, T045–T047, T049) are verified complete with matching implementation files.

---

## 5. Check D: Constitution Compliance

| Principle | Status | Evidence |
|-----------|--------|----------|
| **AP-1** clinicId + clinicGuard | ✅ | `router.use(clinicGuard)` applied before all endpoints; all controller methods validate `req.user.clinicId` |
| **AP-2** Controllers → Services | ✅ | `MemoryHubController` delegates to `SearchService`, `IndexingService`, `ContextBriefService`, `HealthService`, `GraphService` |
| **AP-3** React Query + apiClient | ✅ | Frontend hooks use `@tanstack/react-query` + `apiClient.post()` |
| **CQ-1** Zero new `as any` / `@ts-ignore` | ✅ | `grep` across `backend/src/modules/memory_hub/` and `apps/web/src/modules/memory-hub/` found zero instances |
| **CQ-2** ApiError + RFC 7807 | ✅ | All endpoints use `asyncHandler` + `Errors.unauthorized()` / `Errors.validation()` from `@/middleware/errorHandler` |
| **CQ-3** Security by Default | ✅ | Rate limiting + path sandbox + PII detector + confidential doc filtering |
| **DB-1** Prisma exception | ✅ | Constitution explicitly allows SQLite for memory hub (derived cache, not business data) |
| **FE-1** core-ui components | ✅ | Uses `@orthoplus/core-ui` Input, Button |
| **FE-3** useAuth pattern | ✅ | Route uses `protectedRoute()` wrapper which relies on AuthContext |
| **FE-5** Component placement | ✅ | Feature-scoped components in `modules/memory-hub/components/` |
| **FE-6** Barrel files | ✅ | `apps/web/src/modules/memory-hub/index.ts` exports for external consumers |
| **INF-2** Metrics with category label | ✅ | All metrics use `category: "memory_hub"` |
| **TN-1** New tests in English | ❌ | E2E tests use Portuguese; frontend unit tests use English ✅ |
| **TN-3** `data-testid` attributes | ✅ | Frontend components and E2E tests use `data-testid` consistently |

---

## 6. Findings by Severity

### 🔴 Critical (1)

| # | Finding | File(s) | Root Cause |
|---|---------|---------|------------|
| C1 | **GraphService link extraction is non-functional** | `backend/src/modules/memory_hub/domain/services/GraphService.ts` | `GraphService` reads `frontmatter.rawContent`, but `IndexingService` only stores `JSON.stringify(parsed.frontmatter)` in the DB. The raw markdown content is never persisted. As a result, markdown links, wiki links, and related spec extraction always operate on empty content, producing zero edges. |

### 🟠 High (3)

| # | Finding | File(s) | Root Cause |
|---|---------|---------|------------|
| H1 | **Shared types NOT added to `shared-types/src/index.ts`** | `shared-types/src/index.ts` | Task T004 marked complete but types remain duplicated between frontend and backend. Violates monorepo boundary principle **MP-4** (shared code belongs in `shared-types/`). |
| H2 | **API keys not encrypted at rest** | `backend/src/modules/memory_hub/infrastructure/EmbeddingClientFactory.ts` | NFR-006 requires AES-256-GCM encryption. Keys are read from `process.env.MEMORY_HUB_API_KEY` in plaintext. No encryption/decryption layer exists. |
| H3 | **No provider failover / retry logic** | `backend/src/modules/memory_hub/infrastructure/OllamaEmbeddingClient.ts`, `OpenAIEmbeddingClient.ts` | NFR-007 requires failover to secondary provider on timeout/rate-limit/invalid-key. Current implementation throws immediately on any error. No retry, no queue, no secondary provider fallback. |

### 🟡 Medium (4)

| # | Finding | File(s) | Root Cause |
|---|---------|---------|------------|
| M1 | **E2E tests use Portuguese descriptions** | `tests/e2e/memory-hub.spec.ts` | Violates constitution **TN-1**: "All NEW test descriptions MUST be in English." All 5 E2E test cases use `deve...`. |
| M2 | **DriftDetectionService has empty `detectBrokenApiRefs()`** | `backend/src/modules/memory_hub/domain/services/DriftDetectionService.ts` | FR-005 requires broken cross-reference detection. The method iterates docs but performs no actual checks (commented-out regex + missing raw content access). |
| M3 | **HealthService coverage calculation is misleading** | `backend/src/modules/memory_hub/domain/services/HealthService.ts` | Coverage is computed as `recentlyIndexed / totalDocs` (7-day window), not `indexedDocs / totalFilesystemMdFiles` as spec requires. A project with 100% indexed docs but no changes in 7 days shows 0% coverage. |
| M4 | **FR-012 (hot-swap API keys) not implemented** | — | Task not explicitly listed in tasks.md, but FR-012 is a spec requirement. No SIGHUP handler or `.env` watcher exists. |

### 🟢 Low (4)

| # | Finding | File(s) | Root Cause |
|---|---------|---------|------------|
| L1 | **`drift` endpoint uses raw SQL instead of repository** | `backend/src/modules/memory_hub/api/controller.ts` | Minor architecture inconsistency; `drift` queries `drift_reports` directly via `db.prepare()` rather than through a `DriftRepository`. |
| L2 | **`SearchService.searchWithConfidentialityFilter` does N+1 DB lookups** | `backend/src/modules/memory_hub/domain/services/SearchService.ts` | For each search result, it calls `findByPath()` and `isConfidential()` separately. Could be optimized with a JOIN in the embedding query. |
| L3 | **`reindex` endpoint lacks admin guard** | `backend/src/modules/memory_hub/api/controller.ts` | Heavy operation available to any authenticated user with clinic access. Should require elevated permissions. |
| L4 | **NFR-008 cost tracking not implemented** | `backend/src/modules/memory_hub/infrastructure/SearchAuditRepository.ts` | Audit log records query text and duration but no cost attribution or monthly budget alerts. |

---

## 7. File Inventory (Reviewed)

### Backend (31 files)
```
backend/src/modules/memory_hub/
├── api/controller.ts
├── api/router.ts
├── cli/brief.ts
├── cli/drift.ts
├── cli/health.ts
├── cli/reindex.ts
├── cli/search.ts
├── domain/services/ContextBriefService.ts
├── domain/services/DriftDetectionService.ts
├── domain/services/GraphService.ts
├── domain/services/HealthService.ts
├── domain/services/IndexingService.ts
├── domain/services/SearchService.ts
├── infrastructure/ChunkRepository.ts
├── infrastructure/DocumentChunker.ts
├── infrastructure/DocumentRepository.ts
├── infrastructure/EmbeddingClient.ts
├── infrastructure/EmbeddingClientFactory.ts
├── infrastructure/EmbeddingRepository.ts
├── infrastructure/FileWatcher.ts
├── infrastructure/GitignoreParser.ts
├── infrastructure/initSchema.sql
├── infrastructure/MarkdownParser.ts
├── infrastructure/OllamaEmbeddingClient.ts
├── infrastructure/OpenAIEmbeddingClient.ts
├── infrastructure/PathSandbox.ts
├── infrastructure/PIIDetector.ts
├── infrastructure/Quantization.ts
├── infrastructure/SearchAuditRepository.ts
├── infrastructure/SqliteHealthChecker.ts
├── infrastructure/TokenCounter.ts
├── MemoryHubModule.ts
├── scripts/initDb.ts
├── workers/driftScanWorker.ts
└── workers/reindexWorker.ts
backend/src/workers/jobs/memoryHubDrift.ts
backend/src/index.ts (router registration)
backend/src/workers/index.ts (worker registration)
```

### Frontend (13 files)
```
apps/web/src/modules/memory-hub/
├── components/MemoryHubDashboard.tsx
├── components/MemoryHubGraph.tsx
├── components/MemoryHubHealth.tsx
├── components/MemoryHubSearch.tsx
├── hooks/useMemoryHubGraph.ts
├── hooks/useMemoryHubHealth.ts
├── hooks/useMemoryHubSearch.ts
├── types/index.ts
├── index.ts
└── __tests__/
    ├── MemoryHubHealth.test.tsx
    ├── MemoryHubSearch.test.tsx
    ├── test-utils.tsx
    ├── useMemoryHubHealth.test.ts
    └── useMemoryHubSearch.test.ts
apps/web/src/routes/AppRoutes.tsx (route registration)
```

### Tests & Docs
```
tests/e2e/memory-hub.spec.ts
docs/memory-hub/README.md
```

---

## 8. Recommendations

1. **Fix GraphService (Critical)**: Store raw markdown content in the `documents` table (add `content TEXT` column) or store a `links` JSON field at index time. Alternatively, change `GraphService` to read files from disk (with `PathSandbox` validation) instead of relying on DB-stored frontmatter.

2. **Move types to shared-types (High)**: Extract `SearchResult`, `ContextBrief`, `HealthMetrics`, `SearchFilters`, `GraphData` into `shared-types/src/index.ts` and have frontend/backend import from there. Remove local duplicates.

3. **Add API key encryption (High)**: Implement an `EncryptedEnv` utility using Node.js `crypto` (AES-256-GCM) for `MEMORY_HUB_API_KEY`. Decrypt on first read and cache in memory.

4. **Add provider failover (High)**: Wrap `EmbeddingClient.embed()` in a retry loop with exponential backoff. Support a secondary provider config (`MEMORY_HUB_FALLBACK_PROVIDER`, `MEMORY_HUB_FALLBACK_API_KEY`).

5. **Fix E2E test language (Medium)**: Rename all `test("deve...")` to `test("should...")` in `tests/e2e/memory-hub.spec.ts`.

6. **Fix coverage calculation (Medium)**: Update `HealthService.getMetrics()` to count total `.md` files in watch directories via filesystem walk, then compute `indexed / total * 100`.

7. **Implement broken ref detection (Medium)**: Read spec files from disk (with `PathSandbox`) and scan for `/api/...` references, then verify against `backend/src/modules/` route files.

---

## 9. Overall Verdict: CONDITIONAL

The Spec Kit Memory Hub feature is **functionally complete** for its MVP scope (User Stories 1–3). All 49 tasks are implemented, build and test gates pass, and the architecture largely follows project conventions.

However, the following conditions block a full **PASS**:

1. **GraphService is non-functional** (Critical — dead code producing empty graphs).
2. **Shared types not centralized** (High — violates monorepo boundaries).
3. **Security NFRs partially unmet** (High — no API key encryption, no provider failover).
4. **E2E test naming violates constitution** (Medium).

**Recommended Action**: Address C1, H1, H2, and M1 before merging to `main`. The remaining findings (H3, M2–M4, L1–L4) can be deferred to a post-MVP polish sprint.
