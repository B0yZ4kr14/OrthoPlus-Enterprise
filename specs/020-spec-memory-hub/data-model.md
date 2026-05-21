# Data Model: Spec Kit Memory Hub

## SQLite Schema

### Table: `documents`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `source_path` | TEXT | NOT NULL, UNIQUE | Relative path from repo root |
| `doc_type` | TEXT | NOT NULL | `spec`, `plan`, `architecture`, `contract`, `memory`, `doc` |
| `title` | TEXT | | Extracted from h1 or frontmatter |
| `content_hash` | TEXT | NOT NULL | SHA-256 of raw content |
| `last_indexed` | INTEGER | | Unix timestamp |
| `last_modified` | INTEGER | | File mtime |
| `version` | INTEGER | DEFAULT 1 | Incremented on each re-index |
| `word_count` | INTEGER | | Approximate word count |
| `is_archived` | INTEGER | DEFAULT 0 | 1 if in archive/deprecated |
| `frontmatter` | TEXT | | JSON string of YAML frontmatter |

### Table: `chunks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `document_id` | TEXT | NOT NULL, FK → documents.id | Parent document |
| `content` | TEXT | NOT NULL | Chunk text content |
| `heading_path` | TEXT | | JSON array of heading hierarchy |
| `start_line` | INTEGER | | Start line in source file |
| `end_line` | INTEGER | | End line in source file |
| `token_count` | INTEGER | | Approximate token count |

### Table: `embeddings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `chunk_id` | TEXT | NOT NULL, FK → chunks.id | Parent chunk |
| `embedding` | BLOB | NOT NULL | Binary float32 array |
| `model` | TEXT | NOT NULL | Embedding model name |
| `created_at` | INTEGER | | Unix timestamp |

### Table: `drift_reports`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `type` | TEXT | NOT NULL | `missing_impl`, `broken_ref`, `outdated_decision`, `orphan_doc` |
| `severity` | TEXT | NOT NULL | `low`, `medium`, `high`, `critical` |
| `source_document` | TEXT | | Path to source doc |
| `target_document` | TEXT | | Path to target doc/code |
| `description` | TEXT | NOT NULL | Human-readable explanation |
| `detected_at` | INTEGER | | Unix timestamp |
| `resolved_at` | INTEGER | | Unix timestamp (null if open) |

### Table: `search_queries`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `query_text` | TEXT | NOT NULL | Raw query |
| `results_count` | INTEGER | | Number of results returned |
| `duration_ms` | INTEGER | | Query execution time |
| `timestamp` | INTEGER | | Unix timestamp |

## Entity Relationships

```
documents ||--o{ chunks : "contains"
chunks ||--o{ embeddings : "has"
documents ||--o{ drift_reports : "referenced_by"
```

## Index Design

- `idx_documents_doc_type` on `documents(doc_type)`
- `idx_documents_archived` on `documents(is_archived)`
- `idx_chunks_document` on `chunks(document_id)`
- `idx_embeddings_chunk` on `embeddings(chunk_id)`
- `idx_drift_severity` on `drift_reports(severity, resolved_at)`
