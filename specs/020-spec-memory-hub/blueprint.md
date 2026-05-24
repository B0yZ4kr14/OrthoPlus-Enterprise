# Blueprint: Spec Kit Memory Hub

**Branch**: `020-spec-memory-hub` | **Date**: 2026-05-18
**Mode**: doc-only
**Total Tasks**: 47 | **Files**: 5 new, 4 modified, 0 deleted

## Key Decisions

- **SQLite + better-sqlite3 for index storage** — ACID guarantees, no separate service needed → T005 (pre-completed)
- **Ollama embeddings (nomic-embed-text)** — local-first, no cloud deps → T007 (pre-completed)
- **chokidar with polling fallback** — cross-platform file watching → T008 (pre-completed)
- **Markdown heading-based chunking** — preserves semantic boundaries → T006 (pre-completed)
- **Controller uses constructor DI pattern** (not asyncHandler wrapper) — matches MemoryHubModule factory pattern → T013 (modify to add asyncHandler + ApiError)
- **Clinic context uses "default" fallback** in Memory Hub (not `clinicGuard` reject) — module operates on project-wide docs, not clinic-scoped data → T013

## Implementation Order

```
Phase 1 (Setup)        → T001–T004
Phase 2 (Foundational) → T005–T010
Phase 3 (US1 - MVP)    → T011–T018
Phase 4 (US2)          → T019–T024
Phase 5 (US3)          → T025–T029
Phase 6 (US4)          → T030–T036
Phase 7 (Polish)       → T037–T043
Phase 8 (Monitoring)   → T044–T047
```

---

## Phase 1: Setup

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T001: Install backend dependencies | `backend/package.json` | Already complete — `better-sqlite3`, `chokidar`, `markdown-it`, `js-yaml` already installed |
| T002: Create module directory structure | `backend/src/modules/memory_hub/` | Already complete — all subdirs exist |
| T003: Add environment variables | `.env.example` | Already complete — 7 MEMORY_HUB_* vars present |

---

### T004: Add Memory Hub types to shared-types

**File**: `shared-types/src/memoryHub.ts` (new)

**Requirements**: FR-002, FR-004

**Dependencies**: None

Create a new shared types file for Memory Hub interfaces, then re-export from `shared-types/src/index.ts`.

```typescript
export interface SearchResult {
  id: string
  sourcePath: string
  docType: string
  title: string
  excerpt: string
  relevanceScore: number
  headingPath: string[]
}

export interface SearchFilters {
  docTypes?: string[]
  excludeArchived?: boolean
  author?: string
  featureNumber?: string
  dateFrom?: number
  dateTo?: number
}

export interface ContextBriefDocument {
  sourcePath: string
  docType: string
  relevance: number
  summary: string
}

export interface ContextBrief {
  topic: string
  tokenCount: number
  documents: ContextBriefDocument[]
  markdown: string
  confidentialExcluded: number
}

export interface DriftIssue {
  type: "missing_impl" | "broken_ref" | "outdated_decision" | "orphan_doc"
  severity: "low" | "medium" | "high" | "critical"
  sourceDocument: string
  targetDocument?: string
  description: string
}

export interface HealthMetrics {
  indexStatus: "healthy" | "empty"
  totalDocuments: number
  compressionRatio: number
  compressedEmbeddings: number
  spaceSavedBytes: number
  lastScan: string | null
  driftCount: number
  coveragePercent: number
}
```

**Modify** `shared-types/src/index.ts` to add the re-export:

**Before** (line 20):
```typescript
export const SHARED_TYPES_VERSION = "1.0.0"
```

**After**:
```typescript
export * from "./memoryHub"

export const SHARED_TYPES_VERSION = "1.0.0"
```

**Verification**: `cd shared-types && pnpm build` passes without errors.

---

## Phase 2: Foundational

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T005: SQLite database wrapper | `backend/src/modules/memory_hub/infrastructure/initSchema.sql` | Already complete — schema initializes all 6 tables + indexes |
| T006: Markdown document parser | `backend/src/modules/memory_hub/infrastructure/MarkdownParser.ts` | Already complete — frontmatter + heading extraction |
| T007: Ollama embedding client | `backend/src/modules/memory_hub/infrastructure/OllamaEmbeddingClient.ts` | Already complete — batch embed with caching |
| T008: File watcher service | `backend/src/modules/memory_hub/infrastructure/FileWatcher.ts` | Already complete — chokidar with debounce + polling fallback |
| T009: MemoryDocument entity | `backend/src/modules/memory_hub/infrastructure/DocumentRepository.ts` | Already complete — defined inline in repository |
| T010: Chunk entity | `backend/src/modules/memory_hub/infrastructure/ChunkRepository.ts` | Already complete — defined inline in repository |

---

## Phase 3: User Story 1 — Search & Retrieval (MVP)

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T011: IndexingService | `backend/src/modules/memory_hub/domain/services/IndexingService.ts` | Already complete — full upsert + chunk + embed pipeline |
| T012: SearchService | `backend/src/modules/memory_hub/domain/services/SearchService.ts` | Already complete — cosine similarity + confidentiality filter |
| T014: Routes with clinicGuard | `backend/src/modules/memory_hub/api/router.ts` | Already complete — rate-limited routes + clinicGuard |
| T015: Register router | `backend/src/index.ts` | Already complete — `/api/memory-hub` mounted |
| T016: CLI search | `backend/src/modules/memory_hub/cli/search.ts` | Already complete |
| T017: CLI health | `backend/src/modules/memory_hub/cli/health.ts` | Already complete |
| T018: Initial full index | `backend/src/modules/memory_hub/scripts/initDb.ts` | Already complete — schema init script |

---

### T013: Implement MemoryHubController with asyncHandler + ApiError

**File**: `backend/src/modules/memory_hub/api/controller.ts` (modify)

**Requirements**: FR-002, FR-004, FR-006, CQ-2, AP-1

**Dependencies**: T011, T012

The current controller uses manual try/catch and `(req as any).user?.clinicId`. It must be refactored to use `asyncHandler`, `Errors.unauthorized()`, and proper clinicId validation per project constitution.

**Before** (lines 1–109, search method):
```typescript
import { Request, Response } from "express"

import { logger } from "@/infrastructure/logger"
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector"
type MetricsCollector = ReturnType<typeof getMetricsCollector>
import { SearchService } from "../domain/services/SearchService"
// ... other imports

export class MemoryHubController {
  // ... constructor

  async search(req: Request, res: Response) {
    const startTime = Date.now()
    try {
      const { query, filters, limit = 10, offset = 0 } = req.body
      const clinicId = (req as any).user?.clinicId || "default"

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" })
      }
      // ... rest of method
    } catch (error) {
      logger.error("[MemoryHub] Search error", { error, query: req.body.query })
      return res.status(500).json({ error: "Search failed" })
    }
  }
}
```

**After**:
```typescript
import { Request, Response } from "express"
import { asyncHandler, Errors } from "@/middleware/errorHandler"
import { logger } from "@/infrastructure/logger"
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector"
type MetricsCollector = ReturnType<typeof getMetricsCollector>
import { SearchService } from "../domain/services/SearchService"
import { ContextBriefService } from "../domain/services/ContextBriefService"
import { IndexingService } from "../domain/services/IndexingService"
import { GraphService } from "../domain/services/GraphService"
import { HealthService } from "../domain/services/HealthService"
import { DocumentRepository } from "../infrastructure/DocumentRepository"
import { SearchAuditRepository } from "../infrastructure/SearchAuditRepository"

export interface MemoryHubControllerDeps {
  searchService: SearchService
  contextBriefService: ContextBriefService
  indexingService: IndexingService
  graphService: GraphService
  documents: DocumentRepository
  auditRepository: SearchAuditRepository
  healthService: HealthService
  metrics: MetricsCollector
}

export class MemoryHubController {
  // ... existing private fields and constructor unchanged ...

  search = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now()
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { query, filters, limit = 10, offset = 0 } = req.body
    if (!query || typeof query !== "string") {
      throw Errors.validation("Query is required", [{ field: "query", message: "Query must be a non-empty string", code: "required" }])
    }

    const numLimit = Math.min(Math.max(Number(limit) || 10, 1), 100)
    const numOffset = Math.max(Number(offset) || 0, 0)

    const searchFilters: any = filters || {}
    if (filters?.author && typeof filters.author === "string") {
      searchFilters.author = filters.author
    }
    if (filters?.featureNumber && typeof filters.featureNumber === "string") {
      searchFilters.featureNumber = filters.featureNumber
    }
    if (filters?.dateFrom) {
      const d = Number(filters.dateFrom)
      if (!isNaN(d)) searchFilters.dateFrom = d
    }
    if (filters?.dateTo) {
      const d = Number(filters.dateTo)
      if (!isNaN(d)) searchFilters.dateTo = d
    }

    const { results: filteredResults, total, confidentialExcluded } =
      await this.searchService.searchWithConfidentialityFilter(
        query,
        searchFilters,
        numLimit,
        numOffset,
        clinicId,
      )

    const duration = (Date.now() - startTime) / 1000
    this.metrics.memoryHub.searchDuration.observe({ category: "memory_hub" }, duration)

    this.auditRepository.logQuery(
      clinicId,
      req.user?.id || null,
      query,
      filteredResults.length,
      Math.round(duration * 1000),
    )

    return res.json({
      results: filteredResults,
      total,
      confidential_excluded: confidentialExcluded,
      query_time_ms: Date.now(),
    })
  })

  // Apply same asyncHandler + Errors pattern to:
  // reindex, contextBrief, versions, health, graph methods
}
```

**Verification**: `cd backend && pnpm build` passes. Search endpoint returns 401 when clinicId missing, 400 when query missing.

---

## Phase 4: User Story 2 — Auto Indexing

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T019: Refactor IndexingService for incremental updates | `backend/src/modules/memory_hub/domain/services/IndexingService.ts` | Already complete — content hash check + version tracking + archive |
| T020: FileWatcher event handlers | `backend/src/modules/memory_hub/infrastructure/FileWatcher.ts` | Already complete — add/change/unlink + debounce |
| T021: Version tracking | `backend/src/modules/memory_hub/domain/services/IndexingService.ts` | Already complete — version increment + document_versions snapshot |
| T022: POST /reindex endpoint | `backend/src/modules/memory_hub/api/controller.ts` | Already complete |
| T023: POST /reindex route | `backend/src/modules/memory_hub/api/router.ts` | Already complete — rate limited to 5 req/5min |
| T024: CLI reindex | `backend/src/modules/memory_hub/cli/reindex.ts` | Already complete |

---

## Phase 5: User Story 3 — Context Briefs

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T025: Extend SearchService | `backend/src/modules/memory_hub/domain/services/SearchService.ts` | Already complete — findRelatedDocuments via search |
| T026: ContextBriefService | `backend/src/modules/memory_hub/domain/services/ContextBriefService.ts` | Already complete — token budget + priority ranking + sanitization |
| T027: POST /context-brief endpoint | `backend/src/modules/memory_hub/api/controller.ts` | Already complete |
| T028: POST /context-brief route | `backend/src/modules/memory_hub/api/router.ts` | Already complete — stricter rate limit (5/min) |
| T029: CLI brief | `backend/src/modules/memory_hub/cli/brief.ts` | Already complete |

---

## Phase 6: User Story 4 — Drift Detection

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T030: DriftDetectionService | `backend/src/modules/memory_hub/domain/services/DriftDetectionService.ts` | Already complete — missing_impl, broken_ref, orphan_doc detection |
| T031: HealthMetricsService | `backend/src/modules/memory_hub/domain/services/HealthService.ts` | Already complete — coverage + drift count + compression stats |
| T032: Cron scheduler for drift scan | `backend/src/modules/memory_hub/workers/driftScanWorker.ts` | Already complete — standalone script with timeout + sandbox |
| T036: CLI drift | `backend/src/modules/memory_hub/cli/drift.ts` | Already complete |

---

### T033: Register drift scan worker in workers/index.ts

**File**: `backend/src/workers/index.ts` (modify)

**Requirements**: FR-005, NFR-005

**Dependencies**: T032

The drift scan worker script exists but is not registered in the main workers startup. Add a cron job that spawns the worker daily at 02:00.

**Before** (line 25):
```typescript
  logger.info("Background workers started.")
}
```

**After** (replace the entire file content):
```typescript
import { logger } from "@/infrastructure/logger"
import { startBackupJobsCron } from "./jobs/backupJobs"
import { startCryptoJobsCron } from "./jobs/cryptoJobs"
import { startEstoqueJobsCron } from "./jobs/estoqueJobs"
import { startFinanceiroJobsCron } from "./jobs/financeiroJobs"
import { startGamificationJobs } from "./jobs/gamificationJobs"
import { startAdminJobs } from "./jobs/adminJobs"
import { startMarketingJobsCron } from "./jobs/marketingJobs"
import { startScheduleAppointmentsCron } from "./jobs/scheduleAppointments"
import { startScheduleBiExportCron } from "./jobs/scheduleBiExport"
import { startMemoryHubDriftCron } from "./jobs/memoryHubDrift"

export const startAllWorkers = () => {
  logger.info("Starting all background workers (cron jobs)...")

  startScheduleAppointmentsCron()
  startScheduleBiExportCron()
  startBackupJobsCron()
  startEstoqueJobsCron()
  startCryptoJobsCron()
  startFinanceiroJobsCron()
  startGamificationJobs()
  startAdminJobs()
  startMarketingJobsCron()
  startMemoryHubDriftCron()

  logger.info("Background workers started.")
}
```

**New file**: `backend/src/workers/jobs/memoryHubDrift.ts`

```typescript
import { logger } from "@/infrastructure/logger"
import { spawn } from "child_process"
import path from "path"

const CRON_EXPRESSION = process.env.MEMORY_HUB_DRIFT_SCAN_CRON || "0 2 * * *"

function parseCronExpression(cron: string): { hour: number; minute: number } {
  const parts = cron.split(" ")
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${cron}`)
  }
  return {
    minute: parseInt(parts[0], 10),
    hour: parseInt(parts[1], 10),
  }
}

function getMsUntilNextRun(hour: number, minute: number): number {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
  if (next <= now) {
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - now.getTime()
}

function runDriftScan(): void {
  logger.info("[MemoryHubDrift] Starting scheduled drift scan")
  const workerPath = path.join(__dirname, "../../modules/memory_hub/workers/driftScanWorker.ts")
  const child = spawn("npx", ["tsx", workerPath], {
    stdio: "inherit",
    env: process.env,
  })

  child.on("exit", (code) => {
    if (code === 0) {
      logger.info("[MemoryHubDrift] Drift scan completed successfully")
    } else {
      logger.error(`[MemoryHubDrift] Drift scan exited with code ${code}`)
    }
  })
}

export function startMemoryHubDriftCron(): void {
  if (process.env.MEMORY_HUB_ENABLED === "false") {
    logger.info("[MemoryHubDrift] Disabled via MEMORY_HUB_ENABLED=false")
    return
  }

  const { hour, minute } = parseCronExpression(CRON_EXPRESSION)
  const msUntil = getMsUntilNextRun(hour, minute)

  logger.info(`[MemoryHubDrift] Scheduled drift scan at ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} (in ${Math.round(msUntil / 1000 / 60)} minutes)`)

  setTimeout(() => {
    runDriftScan()
    setInterval(runDriftScan, 24 * 60 * 60 * 1000)
  }, msUntil)
}
```

**Verification**: `cd backend && pnpm build` passes. Worker starts on app boot if enabled.

---

### T034: Add drift report endpoint to controller

**File**: `backend/src/modules/memory_hub/api/controller.ts` (modify)

**Requirements**: FR-005, FR-006

**Dependencies**: T030, T033

Add a `GET /drift` endpoint that returns open drift reports with optional severity filtering.

**Add after the `health` method** (before `graph`):

```typescript
  drift = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { severity, limit = 50, offset = 0 } = req.query
    const numLimit = Math.min(Math.max(Number(limit) || 50, 1), 200)
    const numOffset = Math.max(Number(offset) || 0, 0)

    const sql = severity && typeof severity === "string"
      ? `SELECT * FROM drift_reports WHERE resolved_at IS NULL AND severity = ? ORDER BY detected_at DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM drift_reports WHERE resolved_at IS NULL ORDER BY detected_at DESC LIMIT ? OFFSET ?`

    const stmt = this.db.prepare(sql)
    const rows = severity
      ? stmt.all(severity, numLimit, numOffset)
      : stmt.all(numLimit, numOffset)

    const totalStmt = severity
      ? this.db.prepare("SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL AND severity = ?")
      : this.db.prepare("SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL")
    const total = (severity ? totalStmt.get(severity) : totalStmt.get()) as { c: number }

    return res.json({
      issues: rows,
      total: total.c,
      limit: numLimit,
      offset: numOffset,
    })
  })
```

**Note**: The controller needs access to the SQLite `db` instance. Add it to `MemoryHubControllerDeps` and constructor:

**Modify** `MemoryHubControllerDeps`:
```typescript
export interface MemoryHubControllerDeps {
  // ... existing fields
  db: Database.Database
}
```

**Modify** constructor to accept `db`:
```typescript
  private db: Database.Database

  constructor(deps: MemoryHubControllerDeps) {
    // ... existing assignments
    this.db = deps.db
  }
```

**Modify** `createMemoryHubModule` in `MemoryHubModule.ts` to pass `db`:

**Before**:
```typescript
  const controller = new MemoryHubController({
    searchService,
    // ... other deps
  })
```

**After**:
```typescript
  const controller = new MemoryHubController({
    searchService,
    contextBriefService,
    indexingService,
    graphService,
    documents,
    auditRepository,
    healthService,
    metrics,
    db,
  })
```

---

### T035: Add drift report route

**File**: `backend/src/modules/memory_hub/api/router.ts` (modify)

**Requirements**: FR-005

**Dependencies**: T034

Add the `GET /drift` route to the router.

**Before** (line 42):
```typescript
  router.get("/graph", searchLimit, (req, res) => controller.graph(req, res))
```

**After**:
```typescript
  router.get("/drift", searchLimit, (req, res) => controller.drift(req, res))
  router.get("/graph", searchLimit, (req, res) => controller.graph(req, res))
```

---

## Phase 7: Polish & Cross-Cutting Concerns

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T037: Rate limiting on POST /reindex | `backend/src/modules/memory_hub/api/router.ts` | Already complete — 5 req/5min |
| T038: Prometheus metrics emission | `backend/src/modules/memory_hub/api/controller.ts` | Already complete — searchDuration, indexDuration, documentsIndexed, briefGenerationDuration, coveragePercent |

---

### T039: Run quality gates

**Requirements**: TP-2

**Dependencies**: All implementation tasks

Execute the quality gate checklist:

```bash
# 1. Backend build (strict — fails on any TS error)
cd backend && pnpm build

# 2. Frontend type-check
cd apps/web && pnpm type-check

# 3. Lint (warnings tolerated, 0 errors)
cd backend && pnpm lint

# 4. Unit tests — memory hub module
cd backend && npx jest --testPathPattern="memory_hub"
```

**Expected result**: All commands exit with code 0.

---

### T040: Code cleanup — zero new `as any` or `@ts-ignore`

**File**: `backend/src/modules/memory_hub/api/controller.ts` (modify)

**Requirements**: CQ-1

**Dependencies**: T013

The controller currently uses `(req as any).user?.clinicId`. After applying T013 (asyncHandler refactor), verify no `as any` or `@ts-ignore` remains in any memory_hub file.

```bash
cd backend && grep -r "as any\|@ts-ignore\|@ts-expect-error" src/modules/memory_hub/ || echo "Clean — no casts found"
```

**Expected result**: No matches (or only pre-existing ones outside memory_hub).

---

### T041: Verify clinicGuard on all routes

**File**: `backend/src/modules/memory_hub/api/router.ts`

**Requirements**: AP-1

**Dependencies**: T014

Verify that `router.use(clinicGuard)` is present before all route definitions. Already complete — line 35 has `router.use(clinicGuard)`.

---

### T042: Update quickstart.md

**File**: `specs/020-spec-memory-hub/quickstart.md` (modify)

**Requirements**: Documentation

**Dependencies**: All user stories

Add the new `GET /drift` endpoint and CLI drift command to the quickstart:

**Add after the "Run drift scan" CLI section**:

```markdown
## API Reference

### GET `/drift`

Retrieve open drift reports.

**Query Parameters**:
- `severity` (optional): Filter by `low`, `medium`, `high`, or `critical`
- `limit` (optional): Max results, default 50, max 200
- `offset` (optional): Pagination offset, default 0

**Response 200 OK**:
```json
{
  "issues": [
    {
      "id": "uuid",
      "type": "missing_impl",
      "severity": "medium",
      "source_document": "specs/021-teleodontologia/spec.md",
      "description": "Spec has no corresponding implementation"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```
```

---

### T043: Add module documentation

**File**: `docs/memory-hub/README.md` (new)

**Requirements**: Documentation

**Dependencies**: All user stories

Create the module documentation:

```markdown
# Memory Hub

Centralized project memory indexing and retrieval for OrthoPlus.

## Overview

The Memory Hub indexes all markdown documentation into a SQLite-backed semantic index using Ollama embeddings. It provides:

- Semantic search across specs, plans, architecture decisions, and API contracts
- Automatic file change detection and re-indexing
- AI agent context briefs with token budget management
- Drift detection for specs without implementations

## Architecture

```
backend/src/modules/memory_hub/
├── api/
│   ├── controller.ts      # Express routes handler
│   └── router.ts          # Route definitions + rate limiting
├── domain/services/
│   ├── SearchService.ts       # Semantic search + filtering
│   ├── IndexingService.ts     # Document parse/chunk/embed/upsert
│   ├── ContextBriefService.ts # AI agent brief generation
│   ├── DriftDetectionService.ts # Health/drift scanning
│   ├── HealthService.ts       # Metrics computation
│   └── GraphService.ts        # Cross-reference graph
├── infrastructure/
│   ├── OllamaEmbeddingClient.ts  # Embedding API client
│   ├── FileWatcher.ts            # chokidar file watcher
│   ├── MarkdownParser.ts         # Frontmatter + heading parser
│   ├── DocumentChunker.ts        # Section-based chunking
│   ├── DocumentRepository.ts     # SQLite document CRUD
│   ├── ChunkRepository.ts        # SQLite chunk CRUD
│   ├── EmbeddingRepository.ts    # SQLite embedding CRUD
│   ├── SearchAuditRepository.ts  # Query audit log
│   ├── initSchema.sql            # Database schema
│   └── PathSandbox.ts            # Filesystem sandbox
├── cli/
│   ├── search.ts    # CLI search
│   ├── health.ts    # CLI health check
│   ├── reindex.ts   # CLI full reindex
│   ├── brief.ts     # CLI context brief
│   └── drift.ts     # CLI drift scan
├── workers/
│   ├── driftScanWorker.ts  # Standalone drift scan script
│   └── reindexWorker.ts    # Standalone reindex script
└── MemoryHubModule.ts      # Dependency injection factory
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MEMORY_HUB_ENABLED` | `true` | Enable/disable the module |
| `MEMORY_HUB_INDEX_PATH` | `.memory-hub/index.db` | SQLite database path |
| `MEMORY_HUB_OLLAMA_MODEL` | `nomic-embed-text` | Embedding model name |
| `MEMORY_HUB_WATCH_DIRS` | `specs/,docs/,categories/` | Comma-separated watch directories |
| `MEMORY_HUB_POLLING_INTERVAL_MS` | `30000` | Polling fallback interval |
| `MEMORY_HUB_DRIFT_SCAN_CRON` | `0 2 * * *` | Daily drift scan schedule |
| `MEMORY_HUB_USE_POLLING` | `false` | Force polling mode |

## API Endpoints

All endpoints require authentication and clinic context (`clinicGuard`).

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/memory-hub/search` | Semantic search | 30/min |
| POST | `/api/memory-hub/reindex` | Full reindex | 5/5min |
| POST | `/api/memory-hub/context-brief` | AI context brief | 5/min |
| GET | `/api/memory-hub/versions` | Document version history | 30/min |
| GET | `/api/memory-hub/health` | Health metrics | 30/min |
| GET | `/api/memory-hub/drift` | Open drift reports | 30/min |
| GET | `/api/memory-hub/graph` | Cross-reference graph | 30/min |

## CLI Usage

```bash
# Search
cd backend && npx tsx src/modules/memory_hub/cli/search.ts "rate limiting"

# Health check
cd backend && npx tsx src/modules/memory_hub/cli/health.ts

# Reindex
cd backend && npx tsx src/modules/memory_hub/cli/reindex.ts

# Context brief
cd backend && npx tsx src/modules/memory_hub/cli/brief.ts 019-ia-radiografia

# Drift scan
cd backend && npx tsx src/modules/memory_hub/cli/drift.ts
```
```

---

## Phase 8: Monitoring & Edge Case Mitigation

### T044: Index corruption detection and auto-rebuild

**File**: `backend/src/modules/memory_hub/infrastructure/SqliteDatabase.ts` (new)

**Requirements**: Edge case — corrupted index

**Dependencies**: T005

Create a SQLite health check utility:

```typescript
import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import { logger } from "@/infrastructure/logger"

export class SqliteHealthChecker {
  private dbPath: string

  constructor(dbPath: string) {
    this.dbPath = dbPath
  }

  checkIntegrity(): { ok: boolean; errors: string[] } {
    const errors: string[] = []
    try {
      const db = new Database(this.dbPath, { readonly: true })
      const result = db.pragma("integrity_check") as Array<{ integrity_check: string }>
      db.close()

      const status = result[0]?.integrity_check || "unknown"
      if (status !== "ok") {
        errors.push(`Integrity check failed: ${status}`)
      }
      return { ok: status === "ok", errors }
    } catch (err) {
      errors.push(`Failed to open database: ${err instanceof Error ? err.message : String(err)}`)
      return { ok: false, errors }
    }
  }

  rebuildFromBackup(backupPath: string): void {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`)
    }
    fs.copyFileSync(backupPath, this.dbPath)
    logger.info("[SqliteHealthChecker] Rebuilt index from backup", { dbPath: this.dbPath, backupPath })
  }

  createBackup(backupPath: string): void {
    fs.copyFileSync(this.dbPath, backupPath)
    logger.info("[SqliteHealthChecker] Created backup", { dbPath: this.dbPath, backupPath })
  }
}
```

**Modify** `backend/src/modules/memory_hub/api/controller.ts` health method to include integrity status:

**Before** (health method body):
```typescript
    const metrics = this.healthService.getMetrics(clinicId)
    this.metrics.memoryHub.coveragePercent.set({ category: "memory_hub" }, metrics.coveragePercent)
    return res.json(metrics)
```

**After**:
```typescript
    const metrics = this.healthService.getMetrics(clinicId)
    this.metrics.memoryHub.coveragePercent.set({ category: "memory_hub" }, metrics.coveragePercent)

    const checker = new SqliteHealthChecker(process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db")
    const integrity = checker.checkIntegrity()

    return res.json({
      ...metrics,
      integrity: integrity.ok ? "ok" : "corrupted",
      integrity_errors: integrity.errors,
    })
```

---

### T045: Handle large documents (10k+ lines)

**File**: `backend/src/modules/memory_hub/infrastructure/DocumentChunker.ts`

**Requirements**: Edge case — large documents

**Dependencies**: T006

The current chunker already handles large texts via character-based fallback when token count exceeds `maxTokens`. Verify the chunking preserves cross-chunk heading references.

**Verification**: Index a file with 10,000+ lines (e.g., `apps/web/src/types/database.ts` is not markdown, so use a synthetic test):

```bash
cd backend && npx tsx -e "
import { IndexingService } from './src/modules/memory_hub/domain/services/IndexingService'
import Database from 'better-sqlite3'
const db = new Database('.memory-hub/index.db')
const indexer = new IndexingService(db)
indexer.indexFile('specs/020-spec-memory-hub/spec.md')
  .then(() => { console.log('OK'); db.close() })
  .catch((e) => { console.error(e); db.close() })
"
```

**Expected**: No errors, chunks created with valid headingPath arrays.

---

### T046: Sensitive data scan

**File**: `backend/src/modules/memory_hub/infrastructure/PIIDetector.ts`

**Requirements**: FR-008, Edge case — sensitive data

**Dependencies**: T006

Verify `.gitignore` is respected and confidential docs are excluded. The `PIIDetector` already scans for sensitive patterns. The `FileWatcher` already ignores dotfiles. The `IndexingService` calls `piiDetector.shouldBlockIndexing()` before indexing.

**Verification**:

```bash
cd backend && npx tsx -e "
import { piiDetector } from './src/modules/memory_hub/infrastructure/PIIDetector'
console.log(piiDetector.shouldBlockIndexing('password: secret123', {}))
console.log(piiDetector.shouldBlockIndexing('normal doc content', {}))
"
```

**Expected**: First call returns `{ blocked: true }`, second returns `{ blocked: false }`.

---

### T047: Verify edge cases from spec.md

**Requirements**: All edge cases from spec.md

**Dependencies**: All tasks

Run a comprehensive edge-case verification:

| Edge Case | Mitigation | Verification |
|-----------|-----------|------------|
| Contradictory specs | Prioritize newer document by `lastModified` | Search returns docs sorted by relevance; no contradiction flag yet |
| Corrupted index | Backup + rebuild via `SqliteHealthChecker` | T044 implements backup on startup + integrity check |
| Token budget exceeded | `ContextBriefService` breaks when budget exceeded | T026 already implements hard token cap |
| Large documents | Heading-based chunking with fallback | T045 verifies chunking works for large docs |
| Sensitive information | PII detector + `.gitignore` respect | T046 verifies PII detection |

**Action items**:

1. **Contradiction detection**: NOT YET IMPLEMENTED. Add to backlog as a future enhancement.
2. **All other edge cases**: Mitigated by existing implementation.

---

## Checklist

- [X] T001: Install backend dependencies
- [X] T002: Create module directory structure
- [X] T003: Add environment variables
- [ ] T004: Add Memory Hub types to shared-types
- [X] T005: SQLite database wrapper
- [X] T006: Markdown document parser
- [X] T007: Ollama embedding client
- [X] T008: File watcher service
- [X] T009: MemoryDocument entity type
- [X] T010: Chunk entity type
- [X] T011: IndexingService
- [X] T012: SearchService
- [ ] T013: MemoryHubController with asyncHandler + ApiError
- [X] T014: Routes with clinicGuard
- [X] T015: Register router
- [X] T016: CLI search command
- [X] T017: CLI health command
- [X] T018: Run initial full index
- [X] T019: Refactor IndexingService for incremental updates
- [X] T020: FileWatcher event handlers
- [X] T021: Version tracking
- [X] T022: POST /reindex endpoint
- [X] T023: POST /reindex route
- [X] T024: CLI reindex command
- [X] T025: Extend SearchService
- [X] T026: ContextBriefService
- [X] T027: POST /context-brief endpoint
- [X] T028: POST /context-brief route
- [X] T029: CLI brief command
- [X] T030: DriftDetectionService
- [X] T031: HealthMetricsService
- [X] T032: Cron scheduler for drift scan (script exists)
- [ ] T033: Register drift worker in workers/index.ts
- [ ] T034: Add GET /drift endpoint to controller
- [ ] T035: Add GET /drift route
- [X] T036: CLI drift command
- [X] T037: Rate limiting on POST /reindex
- [X] T038: Prometheus metrics emission
- [ ] T039: Run quality gates
- [ ] T040: Code cleanup — zero new `as any`
- [X] T041: Verify clinicGuard on all routes
- [ ] T042: Update quickstart.md
- [ ] T043: Add module documentation
- [ ] T044: Index corruption detection
- [ ] T045: Handle large documents
- [ ] T046: Sensitive data scan
- [ ] T047: Verify edge cases

**Remaining work**: 15 tasks (T004, T013, T033, T034, T035, T039–T040, T042–T047)
**Pre-completed**: 32 tasks
