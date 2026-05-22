# Contract: Memory Search API

## Base Path
`/api/memory-hub`

## Endpoints

### POST `/search`

Semantic search across all indexed project memory.

**Request Body**:
```json
{
  "query": "string (required) — search query",
  "filters": {
    "doc_types": ["spec", "plan", "architecture"],
    "exclude_archived": true
  },
  "limit": 10,
  "offset": 0
}
```

**Response 200 OK**:
```json
{
  "results": [
    {
      "id": "uuid",
      "source_path": "specs/019-ia-radiografia/spec.md",
      "doc_type": "spec",
      "title": "IA Radiografia",
      "excerpt": "...relevant text snippet...",
      "relevance_score": 0.92,
      "heading_path": ["User Story 1", "Acceptance Scenarios"]
    }
  ],
  "total": 45,
  "query_time_ms": 145
}
```

### POST `/context-brief`

Generate a structured context brief for an AI agent.

**Request Body**:
```json
{
  "topic": "019-ia-radiografia",
  "max_tokens": 80000,
  "include_related": true
}
```

**Response 200 OK**:
```json
{
  "topic": "019-ia-radiografia",
  "token_count": 45230,
  "documents": [
    {
      "source_path": "specs/019-ia-radiografia/spec.md",
      "doc_type": "spec",
      "relevance": 1.0,
      "summary": "Feature spec for AI radiograph analysis..."
    }
  ],
  "markdown": "---\ntopic: 019-ia-radiografia\ntoken_count: 45230\n---\n\n# Context Brief: 019-ia-radiografia\n\n..."
}
```

### POST `/reindex`

Trigger a full manual reindex of all watched directories. Requires authentication.

**Request Body**: (optional)
```json
{
  "force": false
}
```

**Response 200 OK**:
```json
{
  "status": "started",
  "documentsProcessed": 0,
  "message": "Reindexing started"
}
```

**Response 202 Accepted**: If reindex is already in progress.

**Response 429 Too Many Requests**: If rate limit exceeded (5 req/5min).

---

### GET `/versions`

Retrieve version history for a specific document.

**Query Parameters**:
- `sourcePath` (string, required) — Relative path to the document

**Response 200 OK**:
```json
{
  "sourcePath": "specs/019-ia-radiografia/spec.md",
  "versions": [
    {
      "version": 3,
      "contentHash": "sha256:abc...",
      "title": "IA Radiografia",
      "wordCount": 1205,
      "createdAt": "2026-05-18T14:00:00Z"
    },
    {
      "version": 2,
      "contentHash": "sha256:def...",
      "title": "IA Radiografia",
      "wordCount": 980,
      "createdAt": "2026-05-17T10:00:00Z"
    }
  ]
}
```

**Response 404 Not Found**: If document not found.

---

### GET `/health`

Memory hub health metrics.

**Response 200 OK**:
```json
{
  "index_status": "healthy",
  "documents_indexed": 312,
  "last_scan_at": "2026-05-18T02:00:00Z",
  "drift_count": 5,
  "coverage_percent": 87.5
}
```
