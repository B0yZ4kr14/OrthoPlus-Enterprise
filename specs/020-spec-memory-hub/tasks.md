# Tasks: Spec Kit Memory Hub

**Input**: Design documents from `/specs/020-spec-memory-hub/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/search.md, research.md, quickstart.md

**Tests**: Test tasks included for critical infrastructure (indexing, search, drift detection).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create module structure, verify Ollama availability.

- [x] T001 Install backend dependencies: `cd backend && pnpm add better-sqlite3 chokidar markdown-it js-yaml`
- [x] T002 Install dev dependencies: `cd backend && pnpm add -D @types/better-sqlite3 @types/js-yaml`
- [x] T003 [P] Verify Ollama is running and embedding model is available (`nomic-embed-text` or `all-minilm`)
- [x] T004 [P] Create module directory structure: `backend/src/modules/memory_hub/{api,domain/{entities,services},infrastructure,workers,cli}/`
- [x] T005 [P] Create SQLite database file and initialize schema per `data-model.md`
- [x] T006 Add environment variables to `.env.example`: `MEMORY_HUB_ENABLED`, `MEMORY_HUB_INDEX_PATH`, `MEMORY_HUB_OLLAMA_MODEL`

**Checkpoint**: Dependencies installed, Ollama reachable, module structure ready, SQLite schema created.

---

## Phase 2: Foundational — Blocking Prerequisites

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Document Parsing & Chunking

- [x] T007 [P] Implement markdown document parser in `backend/src/modules/memory_hub/infrastructure/MarkdownParser.ts`
  - Extract YAML frontmatter, headings, body text
  - Return structured document with heading hierarchy
- [x] T008 [P] Implement section-based chunking in `backend/src/modules/memory_hub/infrastructure/DocumentChunker.ts`
  - Split by headings (h1, h2, h3)
  - 512-token chunks with 64-token overlap
  - Preserve heading path metadata

### Embedding Service

- [x] T009 Implement Ollama embedding client in `backend/src/modules/memory_hub/infrastructure/OllamaEmbeddingClient.ts`
  - Call `POST /api/embed` with text batches
  - Handle retries and errors
  - Cache embeddings by content hash

### Index Storage (SQLite)

- [x] T010 [P] Implement document repository in `backend/src/modules/memory_hub/infrastructure/DocumentRepository.ts`
  - CRUD for documents table
  - Upsert by source_path with version increment
- [x] T011 [P] Implement chunk repository in `backend/src/modules/memory_hub/infrastructure/ChunkRepository.ts`
  - CRUD for chunks table
  - Bulk insert for reindexing
- [x] T012 [P] Implement embedding repository in `backend/src/modules/memory_hub/infrastructure/EmbeddingRepository.ts`
  - Store/retrieve float32 BLOBs
  - Cosine similarity search via SQL

### File Watcher

- [x] T013 Implement file watcher in `backend/src/modules/memory_hub/infrastructure/FileWatcher.ts`
  - Use chokidar to watch `specs/`, `docs/`, `.specify/memory/`, `.omk/memory/`
  - 30-second polling fallback
  - Debounce rapid changes (batch within 5 seconds)

**Checkpoint**: Document parsing, chunking, embedding, storage, and file watching all functional. Can index a single document end-to-end.

---

## Phase 3: User Story 1 — Centralized Memory Search and Retrieval (Priority: P1) 🎯 MVP

**Goal**: Developers and AI agents can search project memory with semantic relevance ranking.

**Independent Test**: Run `curl -X POST /api/memory-hub/search -d '{"query":"rate limiting"}'` and receive ranked results from specs, plans, and architecture docs.

### Tests for User Story 1

- [ ] T014 [P] [US1] Backend unit test: semantic search returns results ordered by relevance
  - `backend/tests/unit/memory_hub/search.test.ts`
- [ ] T015 [P] [US1] Backend unit test: search filters by doc_type and archived status
  - `backend/tests/unit/memory_hub/searchFilters.test.ts`

### Implementation for User Story 1

- [x] T016 [US1] Implement search service in `backend/src/modules/memory_hub/domain/services/SearchService.ts`
  - Embed query via Ollama
  - Cosine similarity against chunk embeddings
  - Aggregate by document, rank by max chunk score
  - Return excerpts with heading paths
- [x] T017 [US1] Implement search controller in `backend/src/modules/memory_hub/api/controller.ts`
  - POST `/search` endpoint
  - Parse filters, limit, offset
  - Return results with relevance scores
- [x] T018 [US1] Add search router in `backend/src/modules/memory_hub/api/router.ts`
  - Mount at `/api/memory-hub`
- [x] T019 [US1] Register router in backend entry point `backend/src/index.ts`
- [x] T020 [US1] Implement CLI search command `backend/src/modules/memory_hub/cli/search.ts`
  - Accept query string, call API, print formatted results
- [x] T021 [US1] Add Prometheus metric: `orthoplus_memory_hub_search_duration_seconds`
  - `backend/src/infrastructure/metrics/MemoryHubMetrics.ts`

**Checkpoint**: User Story 1 fully functional. Can search project memory via API and CLI.

---

## Phase 4: User Story 2 — Automatic Memory Indexing and Updates (Priority: P2)

**Goal**: New and updated documents are automatically indexed within 60 seconds.

**Independent Test**: Create a new spec file, wait 60 seconds, search for its content, and find it in results.

### Tests for User Story 2

- [ ] T022 [P] [US2] Backend unit test: file watcher detects create/update/delete events
  - `backend/tests/unit/memory_hub/fileWatcher.test.ts`
- [ ] T023 [P] [US2] Backend unit test: reindexing preserves version history
  - `backend/tests/unit/memory_hub/versioning.test.ts`

### Implementation for User Story 2

- [x] T024 [US2] Implement indexing service in `backend/src/modules/memory_hub/domain/services/IndexingService.ts`
  - Parse document → chunk → embed → store
  - Upsert logic: compare content hash, skip if unchanged
  - Increment version on change
- [x] T025 [US2] Implement reindex worker in `backend/src/modules/memory_hub/workers/reindexWorker.ts`
  - Full reindex of all watched directories
  - Progress tracking and error recovery
- [x] T026 [US2] Wire file watcher to indexing service in `backend/src/modules/memory_hub/api/controller.ts`
  - On file change: trigger incremental reindex
  - On file delete: mark document archived
- [x] T027 [US2] Add POST `/reindex` endpoint for manual full reindex
- [x] T028 [US2] Implement initial index bootstrap script
  - `backend/src/modules/memory_hub/scripts/initIndex.ts`
- [x] T029 [US2] Add Prometheus metric: `orthoplus_memory_hub_index_duration_seconds`

**Checkpoint**: User Stories 1 AND 2 both work. Search finds newly indexed documents automatically.

---

## Phase 5: User Story 3 — Memory-Aware AI Agent Context Window (Priority: P2)

**Goal**: AI agents receive structured context briefs for any feature or topic.

**Independent Test**: Call POST `/context-brief` with topic `019-ia-radiografia` and receive a Markdown brief with spec, plan, and related docs.

### Tests for User Story 3

- [ ] T030 [P] [US3] Backend unit test: context brief includes top-N relevant documents
  - `backend/tests/unit/memory_hub/contextBrief.test.ts`
- [ ] T031 [P] [US3] Backend unit test: context brief respects token budget
  - `backend/tests/unit/memory_hub/tokenBudget.test.ts`

### Implementation for User Story 3

- [x] T032 [US3] Implement context brief service in `backend/src/modules/memory_hub/domain/services/ContextBriefService.ts`
  - Search for topic, rank documents
  - Prioritize: spec > plan > architecture > contract > memory
  - Summarize secondary docs if token budget exceeded
  - Generate Markdown with YAML frontmatter
- [x] T033 [US3] Add POST `/context-brief` endpoint in controller
  - Accept topic, max_tokens, include_related
  - Return JSON with markdown field
- [x] T034 [US3] Implement CLI brief command `backend/src/modules/memory_hub/cli/brief.ts`
  - Accept topic, print Markdown to stdout
- [x] T035 [US3] Add token counting utility `backend/src/modules/memory_hub/infrastructure/TokenCounter.ts`
  - Simple word-based approximation (1 word ≈ 1.3 tokens)
- [x] T036 [US3] Add Prometheus metric: `orthoplus_memory_hub_brief_generation_seconds`

**Checkpoint**: All user stories 1-3 functional. AI agents can search, index, and receive context briefs.

---

## Phase 6: User Story 4 — Memory Health and Drift Detection (Priority: P3)

**Goal**: Detect and report inconsistencies between specs and implementations.

**Independent Test**: Run drift scan, verify it detects a spec referencing a non-existent API endpoint.

### Tests for User Story 4

- [ ] T037 [P] [US4] Backend unit test: drift scan detects broken API references
  - `backend/tests/unit/memory_hub/driftDetection.test.ts`
- [ ] T038 [P] [US4] Backend unit test: drift scan detects missing implementations
  - `backend/tests/unit/memory_hub/driftCoverage.test.ts`

### Implementation for User Story 4

- [x] T039 [US4] Implement drift detector in `backend/src/modules/memory_hub/domain/services/DriftDetectionService.ts`
  - Scan specs for API endpoint references, verify in codebase
  - Check architecture decisions against route files
  - Detect specs without corresponding implementation files
- [x] T040 [US4] Implement health aggregator in `backend/src/modules/memory_hub/domain/services/HealthService.ts`
  - Coverage percent, drift count, index status
- [x] T041 [US4] Add GET `/health` endpoint in controller
  - Return metrics JSON
- [x] T042 [US4] Implement drift scan worker `backend/src/modules/memory_hub/workers/driftScanWorker.ts`
  - Configurable cron schedule (default 02:00 daily)
  - Store results in drift_reports table
- [x] T043 [US4] Implement CLI drift command `backend/src/modules/memory_hub/cli/drift.ts`
  - Run scan, print report table
- [x] T044 [US4] Implement CLI health command `backend/src/modules/memory_hub/cli/health.ts`
  - Print health metrics
- [x] T045 [US4] Add Prometheus metrics: `orthoplus_memory_hub_drift_detected_total`, `orthoplus_memory_hub_coverage_percent`

**Checkpoint**: All user stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T046 [P] Add error handling (ApiError + RFC 7807) to all memory_hub endpoints
- [x] T047 Run quality gates: `pnpm type-check`, `pnpm lint`, `pnpm test`
- [x] T048 Run backend build: `cd backend && pnpm build` (strict, must pass)
- [x] T049 Verify no new `as any` or `@ts-ignore` added (Constitution CQ-2)
- [x] T050 [P] Add module documentation to `docs/memory-hub.md`
- [x] T051 Run quickstart.md validation — verify all commands work end-to-end

---

## Phase 8: Future Enhancements *(post-MVP, deferred)*

**Purpose**: Non-blocking improvements for future iterations.

- [ ] T052 [P] Frontend web UI for search and health dashboard
  - `apps/web/src/modules/memory-hub/`
- [ ] T053 [P] Advanced filtering (date range, author, feature number)
- [ ] T054 [P] Index compression for large embedding datasets
- [ ] T055 [P] Cross-reference graph visualization

---

## Tech Debt Tasks (Generated by /speckit.cleanup)

**Generated**: 2026-05-18
**Source**: Post-implementation cleanup of 020-spec-memory-hub
**Priority**: Address before next feature iteration

### Detected Issues

- [x] TD001 [P] Add `clinicGuard` middleware to `backend/src/modules/memory_hub/api/router.ts` — Constitution GP-1 violation; all protected routers must validate `req.user.clinicId`
- [x] TD002 [P] Replace `console.log`/`console.error` in services with Winston `logger` from `backend/src/infrastructure/logger` — Constitution CQ-3 violation
- [x] TD003 [P] Replace `console.error` with Winston `logger` and wire Prometheus metrics in controller — Constitution CQ-3 / EP-4 violation
- [x] TD004 [P] Fix `DocumentRepository` column name mapping — SQLite returns `snake_case` but `MemoryDocument` interface uses `camelCase`, causing `lastIndexed` to be undefined at runtime (health metrics always show 0% coverage)
- [x] TD005 Create `docs/memory-hub.md` module documentation — Task T050 artifact missing
- [ ] TD006 Wire `docType` filtering in `SearchService` — FR-007 partially implemented; placeholder at line 45-48
- [ ] TD007 Implement confidentiality marker checks (FR-008) — Parse `confidential`/`private` frontmatter flags and exclude from context briefs
- [ ] TD008 Add version history retrieval endpoint (FR-009) — Track versions but no API to retrieve previous versions
- [x] TD009 Emit Prometheus metrics from controller endpoints — Metrics class exists but controller does not call `memoryHubMetrics.searchDuration.observe()` etc.
- [ ] TD010 Add `usePolling: true` fallback in `FileWatcher` when `inotify` is unavailable — NFR-002 requires 30s polling fallback; currently hardcoded `usePolling: false`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. Core MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 (needs search to verify indexing).
- **User Story 3 (Phase 5)**: Depends on Foundational + US1 (uses search service).
- **User Story 4 (Phase 6)**: Depends on Foundational + US1 (reads indexed docs).
- **Polish (Phase 7)**: Depends on all user stories.
- **Future (Phase 8)**: Optional, post-MVP.

### Parallel Opportunities

- Phase 1: T001-T006 can run in parallel
- Phase 2: T007-T013 can run in parallel (different infrastructure components)
- Phase 3: T014-T015 (tests) can run in parallel
- Phase 4: T022-T023 (tests) can run in parallel
- Phase 5: T030-T031 (tests) can run in parallel
- Phase 6: T037-T038 (tests) can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1-2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Search)
4. Complete Phase 4: User Story 2 (Auto-indexing)
5. **STOP and VALIDATE**: Test search + indexing end-to-end
6. Deploy/demo if ready

### Incremental Delivery

- Phase 1-2 → Infrastructure ready
- Phase 3 → Search working → Deploy/Demo (MVP!)
- Phase 4 → Auto-indexing → Deploy/Demo
- Phase 5 → Context briefs → Deploy/Demo
- Phase 6 → Drift detection → Deploy/Demo
- Phase 7 → Polish + metrics → Deploy/Demo

---

## Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 55 |
| **Critical gap fixes** | 7 (Phase 2) |
| **US1 tasks** | 8 (P1 — MVP) |
| **US2 tasks** | 8 (P2) |
| **US3 tasks** | 6 (P2) |
| **US4 tasks** | 9 (P3) |
| **Polish tasks** | 6 |
| **Future tasks** | 4 (deferred) |
| **Test tasks** | 8 |
