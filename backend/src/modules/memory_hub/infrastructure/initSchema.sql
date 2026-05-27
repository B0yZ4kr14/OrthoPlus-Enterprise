-- Spec Kit Memory Hub — SQLite Schema
-- Generated from data-model.md

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  clinic_id TEXT NOT NULL DEFAULT 'default',
  source_path TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  title TEXT,
  content_hash TEXT NOT NULL,
  last_indexed INTEGER,
  last_modified INTEGER,
  author TEXT,
  feature_number TEXT,
  version INTEGER DEFAULT 1,
  word_count INTEGER,
  is_archived INTEGER DEFAULT 0,
  frontmatter TEXT,
  UNIQUE(clinic_id, source_path)
);

CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  heading_path TEXT,
  start_line INTEGER,
  end_line INTEGER,
  token_count INTEGER
);

CREATE TABLE IF NOT EXISTS embeddings (
  chunk_id TEXT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  embedding BLOB NOT NULL,
  model TEXT NOT NULL,
  is_compressed INTEGER DEFAULT 0,
  quant_min REAL,
  quant_max REAL,
  created_at INTEGER,
  PRIMARY KEY (chunk_id, model)
);

CREATE TABLE IF NOT EXISTS drift_reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  source_document TEXT,
  target_document TEXT,
  description TEXT NOT NULL,
  detected_at INTEGER,
  resolved_at INTEGER
);

CREATE TABLE IF NOT EXISTS search_queries (
  id TEXT PRIMARY KEY,
  clinic_id TEXT NOT NULL DEFAULT 'default',
  user_id TEXT,
  query_text TEXT NOT NULL,
  results_count INTEGER,
  duration_ms INTEGER,
  timestamp INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_clinic ON documents(clinic_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_archived ON documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_documents_clinic_source ON documents(clinic_id, source_path);
CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author);
CREATE INDEX IF NOT EXISTS idx_documents_feature ON documents(feature_number);
CREATE INDEX IF NOT EXISTS idx_documents_last_modified ON documents(last_modified);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_chunk ON embeddings(chunk_id);
CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id),
  version INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  title TEXT,
  word_count INTEGER,
  frontmatter TEXT,
  created_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_versions_document ON document_versions(document_id, version);

CREATE INDEX IF NOT EXISTS idx_drift_severity ON drift_reports(severity, resolved_at);

-- Secure configuration storage (T052: AES-256-GCM encrypted keys)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  encrypted_value BLOB NOT NULL,
  iv BLOB NOT NULL,
  auth_tag BLOB NOT NULL,
  updated_at INTEGER
);

-- Embedding request audit trail (T054: request ID tracing)
ALTER TABLE search_queries ADD COLUMN request_id TEXT;
CREATE INDEX IF NOT EXISTS idx_search_queries_request_id ON search_queries(request_id);
