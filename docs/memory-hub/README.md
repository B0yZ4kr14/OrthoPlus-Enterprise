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
