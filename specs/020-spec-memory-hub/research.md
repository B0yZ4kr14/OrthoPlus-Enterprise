# Research: Spec Kit Memory Hub

## Decisions

### Embedding Model: Ollama Embeddings

**Decision**: Use Ollama's embedding API (`/api/embed`) with model `nomic-embed-text` or `all-minilm`.

**Rationale**: 
- Project already runs Ollama for ia-radiografia (llava model)
- Local-first, no cloud API keys or network dependencies
- 384-768 dimensional embeddings are sufficient for semantic search on technical documents
- nomic-embed-text has strong performance on code/documentation domains

**Alternatives considered**:
- sentence-transformers (Python): Would require Python service, adds complexity
- OpenAI embeddings: Violates local-first constraint (NFR-004)
- Native Node.js embedding libraries: Immature, poor documentation

### Index Storage: SQLite

**Decision**: Use `better-sqlite3` for the search index with a simple schema for documents, chunks, and embeddings.

**Rationale**:
- ACID guarantees for index consistency
- Structured queries for filtering by docType, source, date
- Lightweight, no separate service needed
- Project team already familiar with SQL (PostgreSQL/Prisma)

**Alternatives considered**:
- JSON flat files: Simple but poor query performance, no ACID
- pgvector (PostgreSQL): Overkill for this use case, adds schema complexity
- LanceDB: Good for vectors but adds new dependency, less familiar

### File Watcher: chokidar

**Decision**: Use `chokidar` npm package with 30-second polling fallback.

**Rationale**:
- Industry standard for Node.js file watching
- Cross-platform (Linux, macOS, Windows)
- Handles edge cases like atomic writes, symlink following
- Polling fallback for Docker/network filesystems

**Alternatives considered**:
- Node.js native `fs.watch`: Unreliable across platforms, no polling
- inotify directly (Linux only): Not cross-platform

### Context Brief Format: Markdown + YAML Frontmatter

**Decision**: Generate context briefs as Markdown files with YAML frontmatter headers.

**Rationale**:
- Consistent with existing project documentation format
- Human-readable and machine-parseable
- Frontmatter allows structured metadata (topic, relevance scores, token counts)
- Easy to preview and debug

**Alternatives considered**:
- Pure JSON: Harder to read for humans, no inline formatting
- XML: Verbose, not used elsewhere in project

### Chunking Strategy: Markdown Section-Based

**Decision**: Chunk documents by Markdown headings (h1, h2, h3) with overlap.

**Rationale**:
- Preserves semantic boundaries better than fixed-size chunks
- Search results can point to specific sections
- Natural for documentation structure
- 512-token chunks with 64-token overlap balances granularity and coherence

**Alternatives considered**:
- Fixed-size chunks (e.g., 512 tokens): Simpler but may split coherent sections
- Sentence-based: Too granular, increases index size
- Paragraph-based: May create oversized chunks for long paragraphs
