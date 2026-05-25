# Feature Specification: Spec Kit Memory Hub

**Feature Branch**: `020-spec-memory-hub`

**Created**: 2026-05-18

**Status**: In Progress

**Input**: User description: "spec-kit-memory-hub"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Centralized Memory Search and Retrieval (Priority: P1)

A developer or AI agent working on the OrthoPlus project needs to quickly find relevant context from past specifications, architecture decisions, API contracts, and implementation notes. Instead of manually browsing multiple directories (.specify/memory/, docs/, specs/), they use a unified search interface that queries all project memory sources and returns ranked, relevant results with source attribution.

**Why this priority**: Without centralized memory retrieval, AI agents waste tokens on irrelevant context, developers duplicate decisions, and institutional knowledge is scattered across dozens of files. This is the core value proposition of the memory hub.

**Independent Test**: A developer can search for "rate limiting" and receive results from architecture decisions, API contracts, implementation notes, and spec documents — all in one place.

**Acceptance Scenarios**:

1. **Given** project memory contains 15 spec documents, 8 architecture decisions, and 20 API contracts, **When** a user searches for "LGPD consent", **Then** the system returns all relevant documents ranked by relevance within 2 seconds.
2. **Given** a user is viewing a feature specification, **When** they click "Find Related Context", **Then** the system suggests related specs, architecture decisions, and implementation notes based on semantic similarity.
3. **Given** an AI agent is generating implementation code, **When** it queries the memory hub for "how do we handle clinic isolation?", **Then** it receives the architecture constitution section, relevant middleware examples, and past implementation patterns.

---

### User Story 2 — Automatic Memory Indexing and Updates (Priority: P2)

Whenever a new specification is created, a plan is approved, or architecture decisions are updated, the memory hub automatically indexes the new content. The system maintains an up-to-date vector index (or equivalent semantic index) without requiring manual re-indexing steps. Deleted or deprecated documents are marked or removed from search results.

**Why this priority**: Manual indexing is error-prone and quickly becomes stale. Automatic indexing ensures the memory hub remains trustworthy and current, which is essential for AI agents relying on it for context.

**Independent Test**: A developer creates a new spec document and can search for its content within 60 seconds without running any manual index commands.

**Acceptance Scenarios**:

1. **Given** a developer commits a new spec file to `specs/021-new-feature/spec.md`, **When** the commit is pushed, **Then** the memory hub detects the change and indexes the new content within 60 seconds.
2. **Given** an existing spec is updated with new requirements, **When** the updated file is saved, **Then** the memory hub updates its index to reflect the new content and version.
3. **Given** a spec document is moved to an archive folder, **When** a user searches for terms from that document, **Then** archived results appear with an "archived" badge and lower ranking, or are excluded based on user preference.

---

### User Story 3 — Memory-Aware AI Agent Context Window (Priority: P2)

When an AI agent (like the Speckit implement agent) starts working on a feature, the memory hub automatically assembles a context brief containing the most relevant documents for that feature. This includes the feature spec, related specs, architecture constraints, API contracts, and known gaps. The context is injected into the agent's prompt, reducing hallucination and improving decision quality.

**Why this priority**: AI agents currently rely on static context or manual file reading. A memory-aware context window reduces token waste, prevents architecture violations, and ensures agents follow established patterns.

**Independent Test**: An AI agent can request context for "feature 019-ia-radiografia" and receive a structured brief with the spec, plan, architecture constraints, and related API contracts.

**Acceptance Scenarios**:

1. **Given** an AI agent starts implementing feature 019, **When** it requests context from the memory hub, **Then** it receives a context brief in Markdown with YAML frontmatter containing the spec, plan, API contracts, architecture constitution, and any related specs (e.g., LGPD compliance).
2. **Given** the context brief exceeds the agent's token budget, **When** the memory hub assembles the brief, **Then** it prioritizes critical documents (spec + plan) and summarizes secondary documents.
3. **Given** a developer asks the AI agent "Have we implemented rate limiting before?", **When** the agent queries the memory hub, **Then** it finds relevant implementations, patterns, and architecture decisions about rate limiting.

---

### User Story 4 — Memory Health and Drift Detection (Priority: P3)

The memory hub periodically scans all memory sources to detect issues: broken links between specs and implementations, outdated architecture decisions that conflict with new code, specs without corresponding implementations, and implementations without specs. A health dashboard shows memory coverage, drift metrics, and suggested actions.

**Why this priority**: As the project grows, memory drift (specs diverging from code, orphaned documents) becomes a significant problem. Proactive detection prevents technical debt and documentation rot.

**Independent Test**: A developer can view a dashboard showing that 3 specs have no corresponding implementation files and 2 architecture decisions are referenced by code that no longer follows them.

**Acceptance Scenarios**:

1. **Given** a spec references an API endpoint that no longer exists in the codebase, **When** the daily memory health scan runs (default 02:00 local time, configurable via environment), **Then** the drift is detected and reported in the health dashboard.
2. **Given** an architecture decision mandates "always use clinicGuard on new routes", **When** a new route is added without clinicGuard, **Then** the memory hub flags the violation in the health report.
3. **Given** the health dashboard shows 85% memory coverage, **When** a developer clicks on a missing coverage item, **Then** they see which feature lacks documentation and can create a spec from a template.

---

### Edge Cases

- **What happens when two specs contradict each other?** The memory hub flags the contradiction in search results and the health dashboard, prioritizing the more recent document.
- **What happens when the index becomes corrupted?** The system maintains a backup index and can rebuild from source documents. A health check endpoint reports index status.
- **How does the system handle very large documents (10k+ lines)?** Large documents are chunked for indexing, with cross-chunk references preserved. Search results point to specific sections.
- **What about sensitive information in memory?** The memory hub respects `.gitignore` and sensitive-file filters. Documents marked as confidential are excluded from AI agent context.
- **How does this interact with existing .omk/memory/ and .specify/memory/?** The memory hub unifies both sources, treating `.specify/memory/` as canonical project memory and `.omk/memory/` as operational/orchestration memory.
- **API key exhaustion**: When monthly quota is reached, the system MUST queue requests and notify administrators, falling back to cached embeddings or local Ollama if available.
- **Provider outage**: When the primary API provider is unreachable, the system MUST retry with exponential backoff and failover to secondary provider.
- **LGPD compliance for cloud embeddings**: Before sending document content to external APIs, the system MUST verify no PII/sensitive data is present (via PIIDetector.ts) and log all outbound requests for audit.

---

## Requirements *(mandatory)*

### Functional Requirements

- **MEM-FR-001**: The system MUST index all markdown documents in `specs/`, `docs/`, `.specify/memory/`, and `.omk/memory/` directories.
- **MEM-FR-002**: The system MUST provide a semantic search interface that returns ranked results with source file paths, relevance scores, and content excerpts.
- **MEM-FR-003**: The system MUST automatically detect file changes (create, update, delete) in indexed directories and update the search index within 60 seconds.
- **MEM-FR-004**: The system MUST generate structured context briefs for AI agents given a feature identifier or query topic.
- **MEM-FR-005**: The system MUST detect and report memory drift: specs without implementations, broken cross-references, outdated architecture decisions.
- **MEM-FR-006**: The system MUST provide a health dashboard showing memory coverage, drift metrics, and index status.
- **MEM-FR-007**: The system MUST support filtering search results by source type (spec, plan, architecture, API contract, implementation note).
- **MEM-FR-008**: The system MUST respect document confidentiality markers and exclude sensitive content from AI agent context.
- **MEM-FR-009**: The system MUST maintain version history for indexed documents, allowing retrieval of previous versions.
- **MEM-FR-010**: The system MUST expose both a CLI interface (for developers) and an API interface (for AI agents and integrations).
- **MEM-FR-011**: The system MUST validate API key permissions (read/test call) on startup and fail fast with descriptive error if invalid.
- **MEM-FR-012**: The system MUST support hot-swapping of API keys without restart (via file watcher on `.env` or SIGHUP).

### Non-Functional Requirements

- **MEM-NFR-001**: Search queries MUST return results within 2 seconds for datasets up to 1000 documents.
- **MEM-NFR-002**: The index update latency MUST be under 60 seconds for file changes. Inotify/fswatch provides near-real-time updates; polling fallback checks every 30 seconds.
- **MEM-NFR-003**: Context briefs for AI agents MUST fit within a 128k token budget, with intelligent summarization for overflow.
- **MEM-NFR-004**: The system SHOULD be operable without external cloud dependencies (local-first architecture). Ollama fallback ensures local operation; API-key providers are optional enhancements for production environments.
- **MEM-NFR-006**: API keys MUST be stored encrypted at rest (AES-256-GCM) and never logged or exposed in error messages.
- **MEM-NFR-007**: The system MUST support provider failover: if the primary API fails (timeout, rate limit, invalid key), fallback to secondary provider or queue for retry.
- **MEM-NFR-008**: API usage costs MUST be trackable per clinic/workspace with monthly budget alerts configurable via environment.
- **MEM-NFR-009**: Embedding requests MUST include request ID for provider-side tracing and cost attribution.
- **MEM-NFR-005**: Health scan MUST complete within 5 minutes for the current project size (~300 documents).

---

## Success Criteria

### Buildable Success Criteria (Validatable During Implementation)

1. **A developer can find relevant project context in under 2 seconds** via semantic search, compared to 2+ minutes of manual browsing. (Aligned with MEM-NFR-001: search < 2s for 1000 documents)
3. **Memory drift is detected within 24 hours** of a spec-implementation divergence occurring.
4. **95% of project documents are indexed and searchable** within 60 seconds of being created or modified.

### Post-Launch Business KPIs (Outcome Metrics)

> These metrics require production telemetry and user feedback loops. They are tracked via analytics, not build tasks.

2. **AI agents produce 50% fewer architecture violations** when using memory hub context briefs versus static prompts. *(Requires: baseline measurement of architecture violations pre- and post-deployment; tracked quarterly)*
5. **Context briefs maintain 90%+ relevance score** as measured by developer feedback on usefulness. *(Requires: in-app feedback mechanism; tracked monthly)*
6. **Zero sensitive data leaks** into AI agent context (verified by automated scan of context briefs). *(Requires: automated sensitive-data detection pipeline; tracked per release)*

---

## Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| **MemoryDocument** | A single indexed document | id, sourcePath, content, docType, version, lastIndexed, checksum, confidentiality |
| **SearchIndex** | The semantic/vector index | documents[], embeddingModel, lastUpdated, indexVersion |
| **ContextBrief** | Assembled context for AI agents | topic, documents[], summaries[], tokenCount, relevanceScore |
| **DriftReport** | Detected inconsistencies | type, severity, sourceDocument, targetDocument, description, detectedAt |
| **HealthMetrics** | Overall memory health | coveragePercent, driftCount, indexStatus, lastScanAt |

---

## Dependencies and Assumptions

### Dependencies

- Access to project filesystem for reading docs, specs, and memory files
- File watcher capability (inotify/fswatch primary, 30-second polling fallback)
- Embedding providers: OpenAI (text-embedding-3-small, text-embedding-3-large, ada-002), Anthropic, Google, or any OpenAI-compatible provider via custom base URL
- Configuration via environment variables: `MEMORY_HUB_EMBEDDING_PROVIDER`, `MEMORY_HUB_API_KEY`, `MEMORY_HUB_API_BASE_URL` (optional, for proxies/custom endpoints)
- Fallback to Ollama local maintained as development option via `MEMORY_HUB_EMBEDDING_PROVIDER=ollama`
- Storage for search index: SQLite primary (ACID, structured queries), JSON/flat file fallback for read-only deployments

### Assumptions

- Project uses markdown for documentation and specs
- Documents follow predictable directory structure (specs/NNN-*/, docs/, .specify/memory/)
- AI agents can consume structured context briefs (JSON/markdown)
- Developers will periodically review and act on drift reports
- API provider accounts have sufficient quota for embedding operations
- Network connectivity to API provider endpoints is available in production
- API provider SLAs meet the project's latency requirements (<2s per search query)

---

## Clarifications

### Session 2026-05-18

- **Q**: Which embedding model should be used for semantic search? → **A**: Ollama embeddings (project already uses Ollama for ia-radiografia; consistent local-first architecture).
- **Q**: What storage backend should the search index use? → **A**: SQLite (provides structured query capability, ACID guarantees, and is lightweight; JSON/flat file fallback for read-only deployments).
- **Q**: What is the primary file change detection strategy? → **A**: inotify/fswatch as primary with 30-second polling fallback for environments where native watchers are unavailable (e.g., Docker, network mounts).
- **Q**: What format should AI agent context briefs use? → **A**: Markdown with YAML frontmatter (consistent with existing project documentation; human-readable and parseable by both humans and agents).
- **Q**: When should the daily drift detection scan run? → **A**: Configurable via environment variable, defaulting to 02:00 local time daily (low-traffic window; aligns with existing backup/worker schedules in the project).
- **Q**: Which embedding provider should be used in production? → **A**: API-key based providers (OpenAI, Anthropic, Google) for production; Ollama for local development and air-gapped environments.
- **Q**: How are API keys managed across clinics? → **A**: API keys are configured per deployment (not per clinic) via environment variables. Multi-tenancy uses separate deployments or provider API sub-accounts.

---

## Out of Scope

- Real-time collaborative editing of documents
- Integration with external wiki systems (Confluence, Notion)
- Natural language generation of new specs from memory
- Automated code generation based on memory context
- User authentication/authorization for memory access (relies on existing project auth)
