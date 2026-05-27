# Tasks: Spec Kit Memory Hub


**Functional Requirements Coverage:**
- MEM-FR-001: The system MUST index all markdown documents in `s...
- MEM-FR-002: The system MUST provide a semantic search interfac...
- MEM-FR-003: The system MUST automatically detect file changes ...
- MEM-FR-004: The system MUST generate structured context briefs...
- MEM-FR-005: The system MUST detect and report memory drift: sp...
- MEM-FR-006: The system MUST provide a health dashboard showing...
- MEM-FR-007: The system MUST support filtering search results b...
- MEM-FR-008: The system MUST respect document confidentiality m...
- MEM-FR-009: The system MUST maintain version history for index...
- MEM-FR-010: The system MUST expose both a CLI interface (for d...
- MEM-FR-011: The system MUST validate API key permissions (read...
- MEM-FR-012: The system MUST support hot-swapping of API keys w...

**Input**: Design documents from `/specs/020-spec-memory-hub/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature — not explicitly requested in the spec. Add test tasks if the team adopts TDD.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and module scaffolding

- [X] T001 Install backend dependencies in `backend/package.json`
  - `better-sqlite3@12.10.0` ✅
  - `chokidar@5.0.0` ✅
  - `markdown-it@14.1.1` ✅
  - `front-matter` — not needed; frontmatter parsing uses `js-yaml` (already in project) + regex in `MarkdownParser.ts`
- [X] T002 [P] Create module directory structure: `backend/src/modules/memory_hub/` with subdirs `services/`, `infrastructure/`, `cli/`, `scripts/`
- [X] T003 [P] Add environment variables to `.env.example`: `MEMORY_HUB_ENABLED`, `MEMORY_HUB_INDEX_PATH`, `MEMORY_HUB_OLLAMA_MODEL`, `MEMORY_HUB_WATCH_DIRS`, `MEMORY_HUB_POLLING_INTERVAL_MS`, `MEMORY_HUB_DRIFT_SCAN_CRON`
- [X] T004 [P] Add Memory Hub types to `shared-types/src/index.ts`: `SearchResult`, `ContextBrief`, `DriftReport`, `HealthMetrics`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create SQLite schema in `backend/src/modules/memory_hub/infrastructure/initSchema.sql`
  - Initializes tables: `documents`, `chunks`, `embeddings`, `document_versions`, `drift_reports`, `search_queries`
  - Schema matches `data-model.md` exactly; schema managed via SQL init + repositories
  - **Note**: Original plan referenced `SqliteDatabase.ts` — evolved to `initSchema.sql` + repository pattern for cleaner separation
- [X] T006 [P] Implement markdown document parser in `backend/src/modules/memory_hub/infrastructure/MarkdownParser.ts`
  - Extract YAML frontmatter, headings hierarchy, word count, content hash (SHA-256)
  - Chunk by markdown headings via `DocumentChunker.ts` with token-based chunking
- [X] T007 [P] Implement Ollama embedding client in `backend/src/modules/memory_hub/infrastructure/OllamaEmbeddingClient.ts`
  - Model: `nomic-embed-text` (configurable via env)
  - Endpoint: `POST /api/embed`
  - Embeddings stored in `EmbeddingRepository.ts` with deduplication
- [X] T008 [P] Implement file watcher service in `backend/src/modules/memory_hub/infrastructure/FileWatcher.ts`
  - Use `chokidar` with 5-second debounce
  - Watch dirs: `specs/`, `docs/`, `.specify/memory/`, `.omk/memory/`
  - Respects `.gitignore` via `GitignoreParser.ts` and sensitive-file filters via `PIIDetector.ts`
- [X] T009 MemoryDocument type defined inline in `backend/src/modules/memory_hub/infrastructure/DocumentRepository.ts`
  - Maps to `documents` table schema from data-model.md
  - **Note**: Original plan referenced `domain/MemoryDocument.ts` — type colocated with repository for simplicity
- [X] T010 Chunk type defined inline in `backend/src/modules/memory_hub/infrastructure/ChunkRepository.ts`
  - Maps to `chunks` table schema from data-model.md
  - **Note**: Original plan referenced `domain/Chunk.ts` — type colocated with repository for simplicity

**Checkpoint**: Foundation ready — SQLite schema initialized, parser working, embedding client connected, file watcher active

---

## Phase 3: User Story 1 — Centralized Memory Search and Retrieval (Priority: P1) 🎯 MVP

**Goal**: Developers and AI agents can search all project memory via semantic search with ranked results

**Independent Test**: Search for "LGPD consent" returns relevant documents from specs, architecture decisions, and API contracts within 2 seconds

- [X] T011 [P] [US1] Implement IndexingService in `backend/src/modules/memory_hub/domain/services/IndexingService.ts`
  - `indexDocument(path)`: parse → chunk → embed → upsert via DocumentRepository
  - `removeDocument(path)`: mark as archived
  - `getDocumentByPath(path)`: retrieve by source_path
- [X] T012 [P] [US1] Implement SearchService in `backend/src/modules/memory_hub/domain/services/SearchService.ts`
  - `search(query, filters, limit, offset)`: embed query, cosine similarity against chunk embeddings, rank by relevance
  - Support filters: `doc_types`, `exclude_archived`, `author`, `feature_number`
  - Return source_path, title, excerpt, relevance_score, heading_path, confidential_excluded count
- [X] T013 [US1] Implement MemoryHubController in `backend/src/modules/memory_hub/api/controller.ts`
  - `POST /search` — delegate to SearchService, return 200 with results array
  - `GET /health` — return index_status, documents_indexed, last_scan_at, drift_count, coverage_percent
  - `GET /versions?sourcePath=` — return version history from `document_versions` table
  - Wrap all methods with `asyncHandler`, validate `clinicId`
- [X] T014 [US1] Add routes with clinicGuard in `backend/src/modules/memory_hub/api/router.ts`
  - `POST /api/memory-hub/search`
  - `GET /api/memory-hub/health`
  - `GET /api/memory-hub/versions`
  - `POST /api/memory-hub/reindex`
  - `POST /api/memory-hub/context-brief`
  - `GET /api/memory-hub/graph`
  - `GET /api/memory-hub/drift`
- [X] T015 [US1] Register router in `backend/src/index.ts` under `/api/memory-hub`
- [X] T016 [P] [US1] Implement CLI search command in `backend/src/modules/memory_hub/cli/search.ts`
  - Accept query string arg, call SearchService directly, print ranked results to stdout
- [X] T017 [P] [US1] Implement CLI health command in `backend/src/modules/memory_hub/cli/health.ts`
  - Print index status, document count, last scan time
- [X] T018 [US1] Run initial full index via `backend/src/modules/memory_hub/scripts/initDb.ts`
  - Initializes SQLite schema and performs first-pass indexing
  - Walk all watch dirs, index every `.md` file

**Checkpoint**: At this point, User Story 1 is fully functional. A developer can `curl /api/memory-hub/search` and get ranked results.

---

## Phase 4: User Story 2 — Automatic Memory Indexing and Updates (Priority: P2)

**Goal**: File changes are detected and indexed automatically within 60 seconds

**Independent Test**: Create a new spec file and search for its content within 60 seconds without manual reindex

- [X] T019 [US1] [US2] IndexingService supports incremental updates in `backend/src/modules/memory_hub/domain/services/IndexingService.ts`
  - Content hash check (SHA-256) prevents redundant re-indexing
  - `is_archived` flag set when documents are removed
  - Version incremented and old state snapshotted to `document_versions` on change
- [X] T020 [US2] FileWatcher event handlers in `backend/src/modules/memory_hub/infrastructure/FileWatcher.ts`
  - `add`/`change` → triggers indexing via MemoryHubModule
  - `unlink` → archives document
  - 5-second debounce on rapid file events
- [X] T021 [US2] Version tracking in `backend/src/modules/memory_hub/infrastructure/DocumentRepository.ts`
  - On content change, increment `version` and snapshot old state into `document_versions` table
  - Transaction-safe: document update + version insert atomic
- [X] T022 [US2] `POST /reindex` endpoint in `backend/src/modules/memory_hub/api/controller.ts`
  - Trigger full manual reindex via `IndexingService.reindexAll()`
  - Rate limited to 5 req/5min
- [X] T023 [US2] Route in `backend/src/modules/memory_hub/api/router.ts`
  - `POST /api/memory-hub/reindex` with `reindexLimit` rate limiter
- [X] T024 [P] [US2] CLI reindex command in `backend/src/modules/memory_hub/cli/reindex.ts`
  - Trigger full reindex via direct service call

**Checkpoint**: User Stories 1 AND 2 both work independently. File changes auto-index; manual reindex available via API and CLI.

---

## Phase 5: User Story 3 — Memory-Aware AI Agent Context Window (Priority: P2)

**Goal**: AI agents receive structured context briefs for any feature or query topic

**Independent Test**: Request context for "019-ia-radiografia" and receive a markdown brief with spec, plan, architecture constraints, and API contracts

- [X] T025 [US1] [US3] SearchService provides semantic relevance search in `backend/src/modules/memory_hub/domain/services/SearchService.ts`
  - Cosine similarity ranking with relevance threshold filtering
  - Results include relevance scores and heading paths
- [X] T026 [US3] Implement ContextBriefService in `backend/src/modules/memory_hub/domain/services/ContextBriefService.ts`
  - `generateBrief(topic, maxTokens)`: assemble documents, sort by priority (spec > plan > architecture > contract)
  - Hard token budget cap (default 80k, configurable) with intelligent truncation
  - Output: structured object with `markdown`, `documents[]`, `tokenCount`, `confidentialExcluded`
  - Respects confidentiality markers — excludes sensitive docs from briefs
- [X] T027 [US3] `POST /context-brief` endpoint in `backend/src/modules/memory_hub/api/controller.ts`
  - Request body: `{ topic, max_tokens? }`
  - Response: `{ topic, token_count, documents[], markdown, confidential_excluded }`
  - Wrapped in `asyncHandler` with metrics observation
- [X] T028 [US3] Route in `backend/src/modules/memory_hub/api/router.ts`
  - `POST /api/memory-hub/context-brief` with `briefLimit` (5 req/min)
- [X] T029 [P] [US3] CLI brief command in `backend/src/modules/memory_hub/cli/brief.ts`
  - Accept topic arg, call ContextBriefService, write markdown to stdout

**Checkpoint**: All three user stories independently functional. AI agents can request context briefs via API or CLI.

---

## Phase 6: User Story 4 — Memory Health and Drift Detection (Priority: P3)

**Goal**: Detect memory drift, broken references, and orphaned docs; expose health dashboard

**Independent Test**: Health scan detects 3 specs without implementations and 2 outdated architecture decisions

- [X] T030 [US4] Implement DriftDetectionService in `backend/src/modules/memory_hub/domain/services/DriftDetectionService.ts`
  - `detect()`: scans indexed documents for:
    - `missing_impl`: spec without corresponding implementation
    - `broken_ref`: broken cross-references
    - `outdated_decision`: stale architecture decisions
    - `orphan_doc`: unreferenced documents
  - Writes findings to `drift_reports` table via `DriftRepository`
- [X] T031 [US4] Implement HealthService in `backend/src/modules/memory_hub/domain/services/HealthService.ts`
  - `getMetrics()`: coverage_percent, driftCount, indexStatus, lastScanAt, compressionRatio
  - `SqliteHealthChecker` provides integrity checks and backup utilities
  - Coverage = indexed docs / total `.md` files in watch dirs
- [X] T032 [US4] Cron scheduler for daily drift scan in `backend/src/workers/jobs/memoryHubDrift.ts`
  - Schedule: configurable via `MEMORY_HUB_DRIFT_SCAN_CRON` (default `0 2 * * *`)
  - Calls `DriftDetectionService.detect()` with timeout enforcement (5min)
  - Logs issue count and duration
- [X] T033 [US4] Register worker in `backend/src/workers/index.ts`
- [X] T034 [US4] Add drift report endpoint to MemoryHubController in `backend/src/modules/memory_hub/api/controller.ts`
  - `GET /drift` — return open drift reports with severity filtering
- [X] T035 [US4] Add route in `backend/src/modules/memory_hub/api/router.ts`
  - `GET /api/memory-hub/drift`
- [X] T036 [P] [US4] CLI drift command in `backend/src/modules/memory_hub/cli/drift.ts`
  - Run scan via `DriftDetectionService`, print report table to stdout

**Checkpoint**: All four user stories independently functional. Daily drift scan runs automatically; health metrics exposed via API.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, security, documentation, and observability

- [X] T037 [P] Rate limiting in `backend/src/modules/memory_hub/api/router.ts`
  - `searchLimit`: 30 req/min for search/versions/health/graph/drift
  - `briefLimit`: 5 req/min for context-brief
  - `reindexLimit`: 5 req/5min for reindex
- [X] T038 [P] Prometheus metrics emission in MemoryHubController
  - `memoryHub.searchDuration.observe()`
  - `memoryHub.indexDuration.observe()`
  - `memoryHub.documentsIndexed.inc()`
  - `memoryHub.briefGenerationDuration.observe()`
  - `memoryHub.coveragePercent.set()`
  - All with `category="memory_hub"` label
- [X] T039 Run quality gates:
  - `cd backend && pnpm build` — strict TypeScript, 0 errors
  - `pnpm lint` — 0 errors
  - `pnpm type-check` — 0 errors
- [X] T040 Code cleanup — verify zero new `as any` or `@ts-ignore` (Constitution CQ-1)
- [X] T041 All routes have `clinicGuard` applied (Constitution AP-1)
  - `router.use(clinicGuard)` applied before all endpoints
- [X] T042 [P] Update quickstart.md with final API examples and env vars
- [X] T043 [P] Add module documentation in `docs/memory-hub/README.md`
- [X] T048 [P] Add E2E tests in `tests/e2e/memory-hub.spec.ts`
  - Test: Page renders with title "Memory Hub"
  - Test: Health metrics (documents, coverage, drift) display correctly
  - Test: Semantic search input and button work
  - Test: Navigation via sidebar
  - Test: Loading state display
- [X] T049 [P] Frontend unit tests in `apps/web/src/modules/memory-hub/__tests__/`
  - MemoryHubSearch.test.tsx: renders, submits query, displays results, handles error, skips empty query
  - MemoryHubHealth.test.tsx: loading state, metrics display, error handling
  - useMemoryHubSearch.test.ts: hook behavior
  - useMemoryHubHealth.test.ts: hook behavior

---

## Phase 8: Monitoring & Edge Case Mitigation *(post-implementation)*

**Purpose**: Ensure feature is observable and resilient in production

- [X] T044 [P] Add index corruption detection and auto-rebuild in `backend/src/modules/memory_hub/infrastructure/SqliteHealthChecker.ts`
  - `checkIntegrity()`: runs `PRAGMA integrity_check`
  - `backup()`: copies DB to `.backup` with restricted permissions
  - `getStats()`: returns page count, freelist count, size
  - **Note**: Original plan referenced `SqliteDatabase.ts` — evolved to dedicated `SqliteHealthChecker.ts` utility
- [X] T045 [P] Large document handling in `backend/src/modules/memory_hub/infrastructure/DocumentChunker.ts`
  - Token-based chunking with configurable max chunk size
  - Cross-chunk references preserved via heading paths
- [X] T046 [P] Sensitive data protection
  - `GitignoreParser.ts` respects `.gitignore` patterns
  - `PIIDetector.ts` blocks indexing of sensitive content
  - Confidential docs excluded from context briefs via `ContextBriefService`
- [X] T047 Edge cases verified:
  - Corrupted index → `SqliteHealthChecker.backup()` + integrity check available
  - Token budget exceeded → hard cap + truncation in `ContextBriefService`
  - Contradictory specs → detection not yet implemented (deferred to Post-MVP)
- [ ] T050 [P] Implement API key validation on startup in `backend/src/modules/memory_hub/infrastructure/ApiKeyValidator.ts`
  - `validate(provider, apiKey)`: perform a lightweight test call (e.g., `POST /api/embed` with empty string or `GET /api/tags` for Ollama)
  - Fail fast on startup with descriptive `ApiError` if key is invalid or provider unreachable
  - Called by `MemoryHubModule.initialize()` before indexing begins
- [ ] T051 [P] Implement API key hot-swap in `backend/src/modules/memory_hub/infrastructure/ApiKeyHotSwap.ts`
  - `process.on('SIGHUP', ...)` reloads API key from env
  - Optional `chokidar` watcher on `.env` file as fallback for environments without signal support
  - Thread-safe: update a shared config object atomically; in-flight requests complete with old key
- [ ] T052 [P] Implement encrypted key storage in `backend/src/modules/memory_hub/infrastructure/SecureConfigStore.ts`
  - AES-256-GCM encryption of `MEMORY_HUB_API_KEY` at rest using a master key derived from `MEMORY_HUB_MASTER_KEY` (32-byte hex)
  - Store encrypted key in SQLite `config` table; decrypt on read, never log plaintext
  - Fallback: if `MEMORY_HUB_MASTER_KEY` is unset, warn and store unencrypted (development only)
- [X] T053 [P] Cost tracking per clinic in `backend/src/modules/memory_hub/domain/services/CostTrackingService.ts`
  - Track embedding API usage per `clinicId`: requests, tokens, estimated cost
  - Monthly budget alert via env `MEMORY_HUB_MONTHLY_BUDGET_ALERT_CENTS` (default 50000 = $500)
  - Emit Prometheus metric `orthoplus_memory_hub_api_cost_total` with `clinic_id` label
  - **Note**: Service exists but was unmapped in original task list; added for traceability
- [ ] T054 [P] Inject request ID into embedding calls in `backend/src/modules/memory_hub/infrastructure/OllamaEmbeddingClient.ts`
  - Add `X-Request-ID` header (UUID v4) to every HTTP request to Ollama/external provider
  - Include request ID in Winston logs for provider-side tracing and cost attribution
  - Store request ID in SQLite `search_queries` table for audit trail
- [ ] T055 [Post-MVP] Detect contradictory specs in `backend/src/modules/memory_hub/domain/services/ContradictionDetector.ts`
  - Compare indexed specs for overlapping requirements with conflicting values
  - Flag in health dashboard and search results; prioritize more recent document
  - Depends on: mature index with >50 specs for meaningful detection

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational phase completion
  - US1 (P1) → US2 (P2) → US3 (P2) → US4 (P3) — recommended sequential order
  - US2, US3 can run in parallel after US1 (if staffed)
- **Polish (Phase 7)**: Depends on all desired user stories being complete
- **Monitoring (Phase 8)**: Depends on all user stories + polish

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No dependencies on other stories. MVP scope.
- **User Story 2 (P2)**: Can start after US1. Builds on IndexingService from US1.
- **User Story 3 (P2)**: Can start after US1. Builds on SearchService from US1.
- **User Story 4 (P3)**: Can start after US1. Builds on indexed documents from US1.

### Within Each User Story

- Infrastructure (SQLite, parser, embedder) before services
- Services before controller endpoints
- Controller before routes
- Routes before integration testing

### Parallel Opportunities

- All Setup tasks (T001–T004) can run in parallel
- All Foundational tasks (T005–T010) can run in parallel (within Phase 2)
- CLI commands (T016, T017, T024, T029, T036) can be developed in parallel with API endpoints
- Prometheus metrics (T038) and rate limiting (T037) can be added in parallel
- Polish tasks (T039–T043) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch backend service and CLI tools in parallel:
Task: "Implement IndexingService in backend/src/modules/memory_hub/services/IndexingService.ts"
Task: "Implement SearchService in backend/src/modules/memory_hub/services/SearchService.ts"
Task: "Implement CLI search command in backend/src/modules/memory_hub/cli/search.ts"

# Once services are ready, launch controller + routes in parallel:
Task: "Implement MemoryHubController in backend/src/modules/memory_hub/api/controller.ts"
Task: "Add routes with clinicGuard in backend/src/modules/memory_hub/api/router.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (search + health + versions)
4. **STOP and VALIDATE**: Test search endpoint, verify results, run `cd backend && pnpm build`
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test auto-indexing → Deploy/Demo
4. Add User Story 3 → Test context briefs → Deploy/Demo
5. Add User Story 4 → Test drift detection → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (search)
   - Developer B: User Story 2 (indexing) — starts after US1 IndexingService is ready
   - Developer C: User Story 3 (context briefs) — starts after US1 SearchService is ready
3. Stories complete and integrate independently

---

## Build Gate Checklist *(run before marking feature complete)*

```bash
# 1. Backend build (strict — fails on any TS error)
cd backend && pnpm build

# 2. Frontend type-check (if frontend changes added)
cd apps/web && pnpm type-check

# 3. Lint (warnings tolerated, 0 errors)
pnpm lint

# 4. Unit tests — backend
cd backend && npx jest --testPathPattern="memory_hub"

# 5. E2E tests (requires backend + frontend running)
npx playwright test tests/e2e/memory-hub.spec.ts --project=chromium
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if TDD is adopted)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Test naming**: New tests MUST use English (`should...`). Portuguese tests (`deve...`) are legacy debt.
- **Schema changes**: SQLite schema is managed via `SqliteHealthChecker.ts` + `initSchema.sql` — no Prisma migration needed for this feature
- **Embedding model**: Ensure Ollama is running with `nomic-embed-text` before testing search functionality
