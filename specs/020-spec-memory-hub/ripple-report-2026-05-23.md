---
document_type: ripple-report
feature: 020-spec-memory-hub
scanned: 2026-05-23
baseline: main (memory-hub implemented directly on main)
change_count: 42 files added/modified
---

# Ripple Scan Report — 020-spec-memory-hub

**Scan Date**: 2026-05-23  
**Baseline**: main branch (feature implemented directly on main)  
**Change Set**: 42 files (backend, frontend, tests, specs)  
**Analyzer**: Inline ripple scan (sub-agent timed out on large codebase)

---

## 1. Data Flow

### New API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/memory-hub/search` | POST | Semantic search with filters |
| `/api/memory-hub/reindex` | POST | Manual full reindex |
| `/api/memory-hub/context-brief` | POST | AI agent context brief |
| `/api/memory-hub/health` | GET | Health metrics |
| `/api/memory-hub/versions` | GET | Document version history |
| `/api/memory-hub/graph` | GET | Cross-reference graph |

**Ripple**: These endpoints are registered in `backend/src/index.ts:318`. They share the Express app with 42 other modules. No isolation issues detected.

### Background Processes
- `FileWatcher` auto-starts in `controller.ts` module load, watching `specs/`, `docs/`, `categories/`
- `reindexWorker` and `driftScanWorker` run on cron schedules

**Risk**: FileWatcher starts at module import time (not app startup), creating a side-effect during tests and `require()` chains. This can cause:
- Test flakiness if watcher isn't stopped between tests
- Port/file handle leaks in long-running test suites
- Unexpected file system I/O during unrelated backend operations

**Severity**: warning

---

## 2. API Contracts

### New Contract Surface
- Standard OrthoPlus response envelope used ✅
- Search response: `{ results, total }` — consistent with existing search patterns ✅
- Health response: camelCase keys — aligned with frontend expectations ✅

**Ripple**: No breaking changes to existing contracts. All new contracts follow existing patterns.

---

## 3. Database Schema

### SQLite (Memory Hub Index)
- New SQLite database at `.memory-hub/index.db` (path configurable via `MEMORY_HUB_INDEX_PATH`)
- Schema in `backend/src/modules/memory_hub/infrastructure/initSchema.sql`
- Tables: `documents`, `chunks`, `embeddings`, `document_versions`, `search_queries`, `drift_reports`

**Ripple**: This is a SEPARATE database from PostgreSQL. It does NOT affect:
- Prisma schema
- Existing migrations
- Multi-tenancy (clinic_id is still present in SQLite tables)

**Risk**: Backup scripts may not include `.memory-hub/index.db` since they only back up PostgreSQL. If the SQLite file is lost, the index can be rebuilt from source documents, but it requires a full reindex.

**Severity**: info

---

## 4. Event Flows

**No new events detected**. Memory hub does not emit or consume CQRS events. It operates as a standalone indexing/querying service.

**Ripple**: None. Isolated from event-driven workflows.

---

## 5. Authentication/Authorization

### clinicGuard
- `router.ts` applies `clinicGuard` to all routes ✅
- All SQLite queries filter by `clinic_id` ✅

**Ripple**: Consistent with existing auth patterns. No new auth mechanisms introduced.

### Rate Limiting
- `/search`: 30 req/min (shared limit — may be too permissive for Ollama calls)
- `/context-brief`: 10 req/min
- `/reindex`: 5 req/min

**Risk**: The 30 req/min shared limit could allow expensive Ollama embedding calls to overwhelm the local Ollama instance.

**Severity**: info

---

## 6. Configuration

### New Environment Variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `MEMORY_HUB_ENABLED` | `true` | Feature toggle |
| `MEMORY_HUB_INDEX_PATH` | `.memory-hub/index.db` | SQLite file path |
| `MEMORY_HUB_OLLAMA_MODEL` | `nomic-embed-text` | Embedding model |
| `MEMORY_HUB_WATCH_DIRS` | `specs/,docs/,categories/` | Watched directories |
| `MEMORY_HUB_POLLING_INTERVAL_MS` | `30000` | FileWatcher polling fallback |
| `MEMORY_HUB_DRIFT_SCAN_CRON` | `0 2 * * *` | Daily drift scan schedule |
| `MEMORY_HUB_USE_POLLING` | `false` | Force polling mode |

**Ripple**: `.env.example` updated. Production `.env` files need these vars. `validate-production.sh` may need to check them.

**Risk**: `MEMORY_HUB_ENABLED=false` not tested — the FileWatcher may still start even when disabled.

**Severity**: warning

---

## 7. Dependencies

### New npm Packages (backend)
| Package | Version | Purpose |
|---------|---------|---------|
| `better-sqlite3` | ^12.10.0 | SQLite driver |
| `chokidar` | ^5.0.0 | File watching |
| `markdown-it` | ^14.1.1 | Markdown parsing |
| `js-yaml` | ^4.1.1 | YAML frontmatter parsing |
| `gpt-tokenizer` | ^3.4.0 | Token counting (cl100k_base) |

**Ripple**: All packages have TypeScript types. `better-sqlite3` is a native module (requires build tools). `chokidar` adds ~200KB to bundle.

**Risk**: `better-sqlite3` requires Python and C++ build tools for compilation. Docker images already include `build-essential`, but local dev on Windows may need additional setup.

**Severity**: info

---

## 8. Performance

### Ollama Embedding Calls
- Every search query triggers an Ollama embedding call
- Every context brief triggers an Ollama embedding call
- Batch size: 10 chunks per embedding request
- Model: `nomic-embed-text` (384-dimensional vectors)

**Risk**: Ollama runs on localhost:11434. If Ollama is not running:
- Search fails with "Ollama embedding failed"
- Context brief generation fails
- Indexing fails
- No graceful fallback to cached embeddings

**Severity**: warning

### SQLite Operations
- Cosine similarity search via SQL on float32/int8 vectors
- No indexes on `embedding` BLOB column (full table scan for similarity)
- Performance tested: 28ms for drift scan of 1000 documents ✅

**Risk**: At 10,000+ documents, the lack of vector indexes may cause search slowdown. The current implementation does not use approximate nearest neighbor (ANN) indexing.

**Severity**: info

---

## 9. Testing

### New Test Infrastructure
| Test Suite | Count | Framework |
|------------|-------|-----------|
| Backend unit | 9 files | Jest + ts-jest |
| Backend integration | 2 files | Jest |
| Backend performance | 1 file | Jest |
| Frontend unit | 4 files | Vitest + jsdom |

**Ripple**: No changes to existing test infrastructure. New tests run independently.

**Risk**: `FileWatcher` tests use `/tmp/test` directory and real file system. These tests could fail if `/tmp` is full or if the OS cleans up files during test execution.

**Severity**: info

---

## 10. Frontend Integration

### Components Created
- `MemoryHubDashboard.tsx`
- `MemoryHubSearch.tsx`
- `MemoryHubHealth.tsx`
- `MemoryHubGraph.tsx`

### Hooks Created
- `useMemoryHubSearch.ts`
- `useMemoryHubHealth.ts`
- `useMemoryHubGraph.ts`

**Ripple**: These components and hooks are NOT wired into `AppRoutes.tsx`. They exist as orphan modules.

**Risk**: The frontend UI is built but inaccessible to users. Either:
1. A route was forgotten during implementation
2. The UI is meant to be imported into another page (e.g., admin dashboard)
3. The route was deferred to a future task

**Severity**: warning

---

## Summary

| Category | Critical | Warning | Info |
|----------|----------|---------|------|
| Data Flow | 0 | 1 | 0 |
| API Contracts | 0 | 0 | 0 |
| Database | 0 | 0 | 1 |
| Events | 0 | 0 | 0 |
| Auth | 0 | 0 | 1 |
| Config | 0 | 1 | 0 |
| Dependencies | 0 | 0 | 1 |
| Performance | 0 | 1 | 1 |
| Testing | 0 | 0 | 1 |
| Frontend | 0 | 1 | 0 |
| **Total** | **0** | **4** | **5** |

### Critical Findings
None.

### Warning Findings (4)
1. **FileWatcher auto-start**: Starts at module import time, causing side-effects during tests and unrelated operations
2. **MEMORY_HUB_ENABLED toggle untested**: FileWatcher may start even when feature is disabled
3. **Ollama dependency**: No graceful fallback when Ollama is unreachable
4. **Orphan frontend UI**: Memory hub components not wired into AppRoutes.tsx

### Info Findings (5)
1. SQLite backup not included in pg_dump backups
2. 30 req/min rate limit may be too permissive for expensive Ollama calls
3. better-sqlite3 requires native build tools
4. No vector indexes for large-scale embedding search
5. FileWatcher tests depend on /tmp filesystem

---

## Recommended Actions

1. **Move FileWatcher startup** from module-level to explicit app initialization in `backend/src/index.ts`
2. **Add Ollama health check** with graceful degradation (return cached results or empty results)
3. **Wire frontend routes** for memory-hub dashboard in `AppRoutes.tsx`
4. **Test MEMORY_HUB_ENABLED=false** to ensure feature toggle works correctly
5. **Add `.memory-hub/` to backup scripts** or document rebuild procedure
