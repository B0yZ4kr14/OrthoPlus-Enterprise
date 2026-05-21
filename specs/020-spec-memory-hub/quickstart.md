# Quickstart: Spec Kit Memory Hub

## Prerequisites

- Node.js 20+ and pnpm 10+
- Ollama running locally with an embedding model (e.g., `nomic-embed-text`)
- SQLite (bundled with better-sqlite3, no separate install needed)

## Setup

```bash
# 1. Ensure Ollama is running and embedding model is available
curl http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":"test"}'

# 2. Install dependencies
cd backend && pnpm add better-sqlite3 chokidar markdown-it front-matter

# 3. Build the backend
cd backend && pnpm build

# 4. Run initial index (one-time)
cd backend && npx tsx src/modules/memory_hub/scripts/initIndex.ts
```

## Development Workflow

```bash
# Start the memory hub service (watch mode)
cd backend && pnpm dev

# In another terminal, trigger a manual reindex
curl -X POST http://localhost:3005/api/memory-hub/reindex

# Search for context
curl -X POST http://localhost:3005/api/memory-hub/search \
  -H "Content-Type: application/json" \
  -d '{"query": "LGPD consent", "limit": 5}'

# Get context brief for a feature
curl -X POST http://localhost:3005/api/memory-hub/context-brief \
  -H "Content-Type: application/json" \
  -d '{"topic": "019-ia-radiografia"}'
```

## Environment Variables

```bash
# .env
MEMORY_HUB_ENABLED=true
MEMORY_HUB_INDEX_PATH=.memory-hub/index.db
MEMORY_HUB_OLLAMA_MODEL=nomic-embed-text
MEMORY_HUB_WATCH_DIRS=specs/,docs/,categories/
MEMORY_HUB_POLLING_INTERVAL_MS=30000
MEMORY_HUB_DRIFT_SCAN_CRON=0 2 * * *
```

## CLI Usage

```bash
# Search from command line
cd backend && npx tsx src/modules/memory_hub/cli/search.ts "rate limiting"

# Generate context brief
cd backend && npx tsx src/modules/memory_hub/cli/brief.ts 019-ia-radiografia

# Run drift scan
cd backend && npx tsx src/modules/memory_hub/cli/drift.ts

# Check health
cd backend && npx tsx src/modules/memory_hub/cli/health.ts
```

## Integration with AI Agents

Agents can request context via the API:

```typescript
const brief = await apiClient.post('/memory-hub/context-brief', {
  topic: '020-spec-memory-hub',
  max_tokens: 80000
});
// brief.markdown contains the formatted context
```
