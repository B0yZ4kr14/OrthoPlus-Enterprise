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
