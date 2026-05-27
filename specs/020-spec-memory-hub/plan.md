# Implementation Plan: Spec Kit Memory Hub

**Branch**: `020-spec-memory-hub` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/020-spec-memory-hub/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a centralized project memory hub that indexes all markdown documentation (specs, plans, architecture decisions, API contracts) into a searchable SQLite-backed semantic index using Ollama embeddings. Provide CLI and API interfaces for developers and AI agents to query context, generate feature briefs, and detect memory drift between specs and implementations.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.8 (backend), React 18.3 (frontend)

**Primary Dependencies**: Ollama (embeddings API), chokidar (file watching), better-sqlite3 (SQLite driver), markdown-it (parsing), front-matter (YAML extraction)

**Storage**: SQLite (search index + document metadata), filesystem (source documents)

**Testing**: Jest (backend), Vitest (frontend), Playwright (E2E)

**Target Platform**: Linux server (VPS), Docker containers

**Project Type**: Full-stack web application (monorepo)

**Performance Goals**: Search < 2s for 1000 documents, index update < 60s, health scan < 5min

**Constraints**: Local-first (no cloud deps), 128k token budget for context briefs, offline-capable index

**Scale/Scope**: ~300 documents initially, up to 1000 documents; single-tenant per deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing |
| **AP-2** Controllers → Services | No direct Prisma in controllers | ✅ Existing |
| **AP-3** React Query + apiClient | Server state via RQ, HTTP via apiClient only | ✅ Existing |
| **AP-4** Database Federation | Use MasterDatabaseManager for cross-category ops; read-only SELECT across schemas | ✅ Existing |
| **CQ-1** TypeScript strict | Zero new `as any` / `@ts-ignore` | 🔍 Enforce |
| **CQ-2** Error Handling | Use ApiError + RFC 7807 Problem Details for operational errors | 🔍 Enforce |
| **CQ-3** Security by Default | Rate limiting + CSRF + Helmet on all new endpoints | 🔍 Enforce |
| **DB-1** Prisma for CRUD | `$queryRaw` only for aggregations | ✅ Existing |
| **DB-2** Schema Integrity | Regenerate `database.ts` after schema changes; never edit manually | ✅ Existing |
| **FE-1** core-ui components | Use `@orthoplus/core-ui` | 🔍 Enforce |
| **FE-2** Date Handling | Use `lib/utils/date.utils.ts`; never import date-fns directly | 🔍 Enforce |
| **FE-3** Authentication | Use `useAuth()` from AuthContext; never check localStorage manually | 🔍 Enforce |
| **TP-2** Quality gates | build, type-check, lint, test pass | 🔍 Enforce |
| **DP-2** Observability & Health | Container HEALTHCHECK + Prometheus metrics + Grafana dashboard | ✅ Existing |
| **INF-1** Infrastructure Resilience | CategoryCircuitBreaker protection for DB operations | ✅ Existing |
| **INF-2** Observability Metrics | Emit `orthoplus_*` metrics with category label for new modules | 🔍 Enforce |
| **INF-3** Backup & DR | Per-category pg_dump via BackupSchedulerService; 10-backup retention | ✅ Existing |
| **WP-1** BullMQ for jobs | Drift scan uses node-cron (lightweight, idempotent, no queue semantics) | ⚠️ Exception — justified: scan is read-only, self-contained, and runs on single scheduler instance |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

OrthoPlus is a **pnpm monorepo** with Turbo orchestration. Default structure:

```text
apps/web/                          # Frontend React SPA
├── src/
│   ├── components/               # Shared UI components (~1116)
│   ├── modules/                  # 37 UI modules
│   ├── domain/                   # Entities, repositories (Clean Arch)
│   ├── application/use-cases/    # 60 use-cases
│   ├── infrastructure/           # Concrete repos, DI, event bus
│   ├── hooks/                    # Global + API hooks
│   ├── contexts/                 # AuthContext, ModulesContext
│   ├── lib/                      # apiClient, utils, adapters
│   ├── stores/                   # Zustand stores
│   ├── routes/                   # React Router v6
│   └── types/database.ts         # AUTO-GENERATED from Prisma
├── vite.config.ts                # Base: /OrthoPlus-Enterprise/
└── vitest.config.ts              # Unit tests (jsdom)

backend/                           # Backend Node.js / Express
├── src/
│   ├── index.ts                  # Entry point
│   ├── middleware/               # auth, clinicGuard, errorHandler
│   ├── modules/                  # 37 domain modules
│   ├── workers/                  # Cron jobs + backup scheduler
│   ├── infrastructure/           # Prisma, Winston, Redis
│   └── shared/                   # CQRS bus, event registry
├── prisma/schema.prisma          # 186 models, 18 schemas
└── tests/unit/                   # Jest suites

shared-types/                      # Cross-stack TypeScript types
└── src/index.ts

categories/@orthoplus/core/packages/
├── ui/                           # Radix + CVA + Tailwind components
├── hooks/                        # useToast (sonner wrapper)
├── types/                        # Global frontend types
└── utils/                        # formatDate, formatCurrency, cn
```

**Structure Decision**: This feature uses the monorepo layout above. Frontend changes go in `apps/web/src/`, backend in `backend/src/`, shared types in `shared-types/`.

## Deployment Context *(OrthoPlus-specific)*

### Build Strategy
- **Frontend**: `cd apps/web && pnpm build` → Vite build with base `/OrthoPlus-Enterprise/`
- **Backend**: `cd backend && pnpm build` → `tsc -p tsconfig.build.json` (strict, fails on errors)
- **Deploy**: Build locally, rsync `dist/` folders to VPS. Do NOT build on VPS.

### VPS Environment
- **Host**: `tsi@100.111.74.69` (Tailscale) / `179.190.15.116` (public)
- **URL**: `https://tsiapp.io/OrthoPlus-Enterprise/`
- **Backend**: PM2 process `orthoplus-backend` on port 3005 (Docker available for auxiliary services only)
- **Nginx**: Host nginx (not Docker) with Cloudflare origin SSL
- **Database**: PostgreSQL 16 (native host installation on port 5432)

### Quality Gates (MUST pass before deploy)
1. `pnpm type-check` — 0 errors
2. `pnpm lint` — 0 errors (warnings tolerated)
3. `pnpm test` — all pass
4. `cd backend && pnpm build` — strict TypeScript, 0 errors

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **MEM-FR-001** | The system MUST index all markdown documents in `s... | ✅ Covered |
| **MEM-FR-002** | The system MUST provide a semantic search interfac... | ✅ Covered |
| **MEM-FR-003** | The system MUST automatically detect file changes ... | ✅ Covered |
| **MEM-FR-004** | The system MUST generate structured context briefs... | ✅ Covered |
| **MEM-FR-005** | The system MUST detect and report memory drift: sp... | ✅ Covered |
| **MEM-FR-006** | The system MUST provide a health dashboard showing... | ✅ Covered |
| **MEM-FR-007** | The system MUST support filtering search results b... | ✅ Covered |
| **MEM-FR-008** | The system MUST respect document confidentiality m... | ✅ Covered |
| **MEM-FR-009** | The system MUST maintain version history for index... | ✅ Covered |
| **MEM-FR-010** | The system MUST expose both a CLI interface (for d... | ✅ Covered |
| **MEM-FR-011** | The system MUST validate API key permissions (read... | ⚠️ Partial — T050 adds validation; T039 gates build |
| **MEM-FR-012** | The system MUST support hot-swapping of API keys w... | ⚠️ Partial — T051 adds SIGHUP + watcher |
| **MEM-NFR-001** | Search queries MUST return results within 2 second... | ✅ Covered — T012 (SearchService) |
| **MEM-NFR-002** | The index update latency MUST be under 60 seconds... | ✅ Covered — T020 (FileWatcher) |
| **MEM-NFR-003** | Context briefs for AI agents MUST fit within a 128... | ⚠️ Partial — T026 (ContextBriefService); overflow behavior clarified in spec |
| **MEM-NFR-004** | The system SHOULD be operable without external clo... | ✅ Covered — T007 (Ollama fallback) |
| **MEM-NFR-005** | Health scan MUST complete within 5 minutes... | ✅ Covered — T032 (cron with timeout) |
| **MEM-NFR-006** | API keys MUST be stored encrypted at rest (AES-256... | ⚠️ Partial — T052 adds SecureConfigStore |
| **MEM-NFR-007** | The system MUST support provider failover... | ⚠️ Partial — T007 (Ollama client) + T038 (metrics) |
| **MEM-NFR-008** | API usage costs MUST be trackable per clinic/work... | ✅ Covered — T053 (CostTrackingService) |
| **MEM-NFR-009** | Embedding requests MUST include request ID... | ⚠️ Partial — T054 adds request ID injection |

---

## Migration Path to pgvector/HNSW

> **Trigger**: Apply when the semantic index exceeds ~10,000 chunks or when sub-2-second search latency can no longer be met with the current SQLite + in-memory cosine similarity approach. This section documents the migration from PostgreSQL full-text search (FTS) to `pgvector` with HNSW approximate nearest neighbor (ANN) indexing.

### Current State

The project currently relies on PostgreSQL full-text search using `tsvector` with a GIN index:

```sql
-- Existing FTS setup (core.search_index)
ALTER TABLE "core"."search_index"
ADD COLUMN IF NOT EXISTS "content_tsv" tsvector
GENERATED ALWAYS AS (to_tsvector('portuguese', "content")) STORED;

CREATE INDEX "search_index_content_tsv_gin" ON "core"."search_index" USING GIN ("content_tsv");
```

The Memory Hub currently stores embeddings in SQLite (`better-sqlite3`) and computes cosine similarity in-memory at query time. This is acceptable for <10k chunks but becomes a bottleneck as the document corpus grows.

### Limitations of Current Approach

| Limitation | Impact |
|------------|--------|
| **Exact term matching only** (`tsvector`) | Cannot find semantically related documents that do not share exact keywords (e.g., "LGPD" vs. "lei de protecao de dados") |
| **No semantic similarity** | Results are ranked by term frequency, not conceptual relevance |
| **No multi-language support** | `to_tsvector('portuguese', ...)` fails for English or mixed-language documents; requires one tsvector column per language |
| **Ranking limitations** | `ts_rank` does not capture semantic nuance; false positives on common terms, false negatives on paraphrases |
| **O(n) query complexity** (Memory Hub) | SQLite in-memory scan scales linearly with chunk count; latency degrades predictably beyond ~10k chunks |
| **No ANN indexing** | Every query must compare against all vectors; no approximate shortcuts for large datasets |

### Target State

Migrate the semantic search backend to PostgreSQL `pgvector` with an HNSW (Hierarchical Navigable Small World) index for approximate nearest neighbor search:

- **Storage**: Native `vector(1536)` columns in PostgreSQL (aligned with OpenAI `text-embedding-3-small` / Ollama `nomic-embed-text` dimensions)
- **Indexing**: HNSW index using `vector_cosine_ops` for sub-millisecond ANN retrieval
- **Query complexity**: O(log n) vs. current O(n) for large datasets
- **Fallback**: Retain `tsvector` + GIN for exact-match and hybrid search scenarios

### Prerequisites

| Requirement | Version / Detail |
|-------------|------------------|
| PostgreSQL | 14+ (project currently uses 16) |
| pgvector extension | 0.5.0+ (available via `apt install postgresql-16-pgvector` or Docker `pgvector/pgvector:pg16`) |
| Embedding provider | OpenAI API, Ollama local model, or compatible embedding service |
| Connection string | `DATABASE_URL` must have `CREATE EXTENSION` privileges |
| Disk space | ~6 KB additional storage per vector (1536 dimensions × 4 bytes + index overhead) |

### Schema Changes

#### 1. Enable pgvector extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 2. Add embedding column to `core.search_index`

```sql
ALTER TABLE "core"."search_index"
ADD COLUMN IF NOT EXISTS "embedding" vector(1536) NULL DEFAULT NULL;
```

> **Rationale**: `NULL` default allows zero-downtime migration; existing records remain searchable via `tsvector` while embeddings are backfilled.

#### 3. Create HNSW index

```sql
CREATE INDEX IF NOT EXISTS "search_index_embedding_hnsw"
ON "core"."search_index"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

> **Parameters**: `m = 16` (number of bi-directional links per layer), `ef_construction = 64` (build-time recall/speed trade-off). Tune `ef_construction` upward (e.g., 128) for higher recall at the cost of slower index builds.

#### 4. Add helper index for hybrid queries

```sql
-- Support filtering by clinic_id before vector search
CREATE INDEX "search_index_clinic_id_embedding_idx"
ON "core"."search_index" (clinic_id, embedding)
WHERE embedding IS NOT NULL;
```

### Migration Steps

| Step | Action | Owner | Est. Effort |
|------|--------|-------|-------------|
| 1 | **Install pgvector** on PostgreSQL host or update Docker image to `pgvector/pgvector:pg16` | DevOps | 30 min |
| 2 | **Add embedding column** (nullable) to `core.search_index` via Prisma migration or raw SQL | Backend | 1h |
| 3 | **Backfill embeddings** for existing records via batch job | Backend | 4–8h |
| 4 | **Update indexers** to generate embeddings on `INSERT` / `UPDATE` | Backend | 4h |
| 5 | **Update search endpoint** to support vector search (`<=>` cosine distance operator) | Backend | 4h |
| 6 | **A/B test** — compare FTS vs. vector search result quality (precision@k, user relevance ratings) | QA / Product | 4h |
| 7 | **Deprecate tsvector** (optional) — remove `content_tsv` column and GIN index once vector search is validated; or keep as fallback for exact-match queries | Backend | 2h |

#### Step 3 — Backfill Job (Detailed)

```typescript
// Pseudocode for backfill batch job
const BATCH_SIZE = 100
let cursor = 0

while (true) {
  const rows = await prisma.$queryRaw`
    SELECT id, content FROM core.search_index
    WHERE embedding IS NULL
    ORDER BY id
    LIMIT ${BATCH_SIZE} OFFSET ${cursor}
  `

  if (rows.length === 0) break

  const embeddings = await embeddingClient.embedBatch(rows.map(r => r.content))

  for (let i = 0; i < rows.length; i++) {
    await prisma.$executeRaw`
      UPDATE core.search_index
      SET embedding = ${embeddings[i]}::vector
      WHERE id = ${rows[i].id}
    `
  }

  cursor += BATCH_SIZE
  await sleep(100) // Rate-limit embedding API calls
}
```

> **Note**: Run backfill during low-traffic hours. For ~10k records, expect 2–4 hours depending on embedding provider latency. Use `pgvector`'s bulk load (`COPY`) if provider allows pre-generation of embeddings offline.

#### Step 5 — Updated Search Query

```sql
-- Vector search with cosine similarity (pgvector <=> operator)
SELECT
  id,
  title,
  content,
  1 - (embedding <=> $1::vector) AS cosine_similarity
FROM core.search_index
WHERE clinic_id = $2
  AND embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT $3;
```

> **Hybrid search** (optional): Combine `ts_rank` and cosine similarity with weighted ranking for best-of-both-worlds retrieval.

### Rollback Plan

1. **Keep `tsvector` column and GIN index** (`search_index_content_tsv_gin`) untouched during migration.
2. **Keep SQLite memory hub** operational in parallel until pgvector search is validated.
3. **Reversion procedure**:
   ```sql
   -- Disable vector search; revert to FTS
   DROP INDEX IF EXISTS "search_index_embedding_hnsw";
   ALTER TABLE "core"."search_index" DROP COLUMN IF EXISTS "embedding";
   ```
4. **Application-level fallback**: Search service should detect missing `pgvector` extension or empty embedding column and automatically fall back to `tsvector` + SQLite cosine similarity.

### Performance Expectations

| Metric | Current (SQLite + In-Memory) | Target (pgvector + HNSW) |
|--------|------------------------------|--------------------------|
| Query complexity | O(n) — scans all chunks | O(log n) — ANN graph traversal |
| Latency @ 1k chunks | ~50 ms | ~5 ms |
| Latency @ 10k chunks | ~500 ms | ~10 ms |
| Latency @ 100k chunks | ~5,000 ms (unacceptable) | ~20 ms |
| Index build time | N/A (no ANN index) | ~2 min per 10k vectors (ef_construction=64) |
| Recall@10 | 100% (exact) | ~95–99% (HNSW approximate) |

### Cost Considerations

| Cost Category | Estimate | Notes |
|---------------|----------|-------|
| **Embedding API** | ~$0.10 per 1M tokens (OpenAI `text-embedding-3-small`) | One-time backfill + incremental updates |
| **Storage increase** | ~6 KB per vector | 10k vectors ≈ 60 MB; 100k vectors ≈ 600 MB |
| **Index overhead** | ~2× vector size | HNSW graph links add ~50–100% overhead |
| **Compute** | Negligible | ANN queries are CPU-light; index build is one-time or batched |
| **Operational** | Low | `pgvector` is a standard PostgreSQL extension; backup via `pg_dump` includes vectors |

### References

- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [pgvector HNSW indexing](https://github.com/pgvector/pgvector?tab=readme-ov-file#hnsw)
- [OpenAI Embeddings API pricing](https://openai.com/pricing)
- [PostgreSQL 16 Full-Text Search documentation](https://www.postgresql.org/docs/16/textsearch.html)

