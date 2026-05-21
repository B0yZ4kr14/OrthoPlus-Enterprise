# Memory Hub — Documentacao do Modulo

**Modulo**: `backend/src/modules/memory_hub/`  
**Status**: MVP implementado (fases 1-7)  
**Dependencias**: `better-sqlite3`, `chokidar`, `js-yaml`, `markdown-it`

---

## Visao Geral

O **Memory Hub** e um sistema de memoria semantica projetado para indexar, pesquisar e gerenciar toda a documentacao do projeto OrthoPlus (specs, planos, decisoes de arquitetura, contratos de API). Ele fornece:

- **Busca semantica** via embeddings Ollama + similaridade cosseno
- **Indexacao automatica** de arquivos Markdown com watcher de filesystem
- **Context briefs** para agentes de IA — montagem automatica de contexto relevante
- **Deteccao de drift** — identifica specs sem implementacao, referencias quebradas e documentos orfaos
- **Metricas Prometheus** para observabilidade completa

---

## Arquitetura

```
backend/src/modules/memory_hub/
├── api/
│   ├── controller.ts       # Endpoints: /search, /reindex, /context-brief, /health
│   └── router.ts           # Mounta em /api/memory-hub
├── domain/services/
│   ├── SearchService.ts            # Busca semantica com embeddings
│   ├── ContextBriefService.ts      # Montagem de briefs para agentes IA
│   ├── IndexingService.ts          # Pipeline: parse -> chunk -> embed -> store
│   ├── DriftDetectionService.ts    # Deteccao de divergencias spec/impl
│   └── HealthService.ts            # Agregacao de metricas de saude
├── infrastructure/
│   ├── MarkdownParser.ts      # Extrai frontmatter YAML, headings, secoes
│   ├── DocumentChunker.ts     # Chunking por headings (512 tokens, 64 overlap)
│   ├── OllamaEmbeddingClient.ts  # Cliente Ollama /api/embed com cache
│   ├── DocumentRepository.ts  # CRUD SQLite para documentos
│   ├── ChunkRepository.ts     # CRUD SQLite para chunks
│   ├── EmbeddingRepository.ts # Armazenamento e busca de vetores
│   ├── FileWatcher.ts         # chokidar com debounce 5s
│   └── initSchema.sql         # Schema SQLite
├── cli/
│   ├── search.ts     # tsx search.ts "query"
│   ├── brief.ts      # tsx brief.ts "topic"
│   ├── reindex.ts    # tsx reindex.ts
│   ├── drift.ts      # tsx drift.ts
│   └── health.ts     # tsx health.ts
├── workers/
│   ├── reindexWorker.ts    # Reindexacao completa (cron/manual)
│   └── driftScanWorker.ts  # Scan diario de drift (default 02:00)
└── scripts/
    └── initDb.ts     # Bootstrap do banco SQLite
```

---

## Endpoints da API

### POST `/api/memory-hub/search`

Busca semantica na memoria do projeto.

**Request:**
```json
{
  "query": "rate limiting",
  "filters": { "docTypes": ["spec", "architecture"], "excludeArchived": true },
  "limit": 10,
  "offset": 0
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "chunk-uuid",
      "sourcePath": "specs/020-spec-memory-hub/spec.md",
      "docType": "spec",
      "title": "Spec Kit Memory Hub",
      "excerpt": "The system MUST provide a semantic search interface...",
      "relevanceScore": 0.92,
      "headingPath": ["Requirements", "Functional Requirements"]
    }
  ],
  "total": 42,
  "query_time_ms": 1716038400000
}
```

### POST `/api/memory-hub/reindex`

Dispara reindexacao manual de todos os diretorios observados.

**Response:**
```json
{ "message": "Reindex complete" }
```

### POST `/api/memory-hub/context-brief`

Gera um context brief para agentes de IA sobre um topico.

**Request:**
```json
{
  "topic": "019-ia-radiografia",
  "max_tokens": 80000,
  "include_related": true
}
```

**Response:**
```json
{
  "topic": "019-ia-radiografia",
  "tokenCount": 15234,
  "documents": [
    { "sourcePath": "specs/019-ia-radiografia/spec.md", "docType": "spec", "relevance": 0.95, "summary": "..." }
  ],
  "markdown": "---\ntopic: 019-ia-radiografia\n..."
}
```

### GET `/api/memory-hub/health`

Retorna metricas de saude do indice.

**Response:**
```json
{
  "index_status": "healthy",
  "documents_indexed": 156,
  "last_scan_at": "2026-05-18T14:00:00.000Z",
  "drift_count": 3,
  "coverage_percent": 87
}
```

---

## CLI

Todos os comandos CLI sao executaveis via `tsx` a partir de `backend/src/modules/memory_hub/cli/`:

```bash
cd backend

# Busca
npx tsx src/modules/memory_hub/cli/search.ts "rate limiting"

# Context brief
npx tsx src/modules/memory_hub/cli/brief.ts "019-ia-radiografia"

# Reindexacao manual
npx tsx src/modules/memory_hub/cli/reindex.ts

# Scan de drift
npx tsx src/modules/memory_hub/cli/drift.ts

# Metricas de saude
npx tsx src/modules/memory_hub/cli/health.ts
```

---

## Variaveis de Ambiente

| Variavel | Padrao | Descricao |
|----------|--------|-----------|
| `MEMORY_HUB_ENABLED` | `true` | Ativa o file watcher automatico |
| `MEMORY_HUB_INDEX_PATH` | `.memory-hub/index.db` | Caminho do banco SQLite |
| `MEMORY_HUB_OLLAMA_MODEL` | `nomic-embed-text` | Modelo de embeddings |
| `MEMORY_HUB_WATCH_DIRS` | `specs/,docs/,categories/` | Diretorios a observar |
| `MEMORY_HUB_POLLING_INTERVAL_MS` | `30000` | Intervalo de polling fallback |
| `MEMORY_HUB_DRIFT_SCAN_CRON` | `0 2 * * *` | Cron do scan de drift |

---

## Metricas Prometheus

| Metrica | Tipo | Descricao |
|---------|------|-----------|
| `orthoplus_memory_hub_search_duration_seconds` | Histogram | Duracao das buscas |
| `orthoplus_memory_hub_index_duration_seconds` | Histogram | Duracao da indexacao |
| `orthoplus_memory_hub_brief_generation_seconds` | Histogram | Duracao da geracao de briefs |
| `orthoplus_memory_hub_drift_detected_total` | Counter | Total de issues de drift |
| `orthoplus_memory_hub_coverage_percent` | Gauge | Percentual de cobertura do indice |
| `orthoplus_memory_hub_documents_indexed_total` | Counter | Total de documentos indexados |

---

## Schema SQLite

**Tabelas:**
- `documents` — metadados dos documentos indexados
- `chunks` — trechos de texto com contexto de headings
- `embeddings` — vetores de embedding (BLOB float32)
- `drift_reports` — issues de drift detectados
- `search_queries` — log de queries (audit)

---

## Limitacoes Conhecidas (MVP)

1. **Ollama offline**: Se Ollama nao estiver disponivel, usa zero-vectors (fallback). Busca funciona mas sem relevancia semantica real.
2. **Busca vetorial em memoria**: Para <10k chunks e aceitavel. Escalara para pgvector ou vector DB dedicado.
3. **Drift detection basica**: Detecta apenas specs sem implementacao correspondente. Analise de conteudo (referencias quebradas de API) e placeholder.
4. **Filtro por docType**: Inferido do path, mas filtro explicito na busca ainda e placeholder.
5. **Sem UI frontend**: Apenas API e CLI. Dashboard web e T052 (pos-MVP).

---

## Proximos Passos

Ver `specs/020-spec-memory-hub/tasks.md` — Tech Debt Tasks TD001-TD010.
