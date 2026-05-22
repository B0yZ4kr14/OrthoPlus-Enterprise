# Red Team Findings Report — Spec Kit Memory Hub

**Session ID**: RT-020-spec-memory-hub-2026-05-22
**Target**: specs/020-spec-memory-hub/spec.md
**Date**: 2026-05-22
**Lenses**: ai_agent_context_poisoning, lgpd_compliance_and_data_isolation, api_boundary_and_integration_risks, index_integrity_and_drift_manipulation
**Selection Method**: auto (4 lenses, all trigger-matched)

---

## Session Summary

The Spec Kit Memory Hub feature was adversarially reviewed using 4 parallel lens agents targeting AI context poisoning, LGPD compliance, API boundary risks, and index integrity. The review identified **20 findings** across all severity levels, with **3 CRITICAL** issues requiring immediate attention.

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 7 |
| MEDIUM | 9 |
| LOW | 1 |
| **Total** | **20** |

---

## CRITICAL Findings (Immediate Action Required)

### F-RT-020-001 — Prompt Injection via Context Briefs
**Lens**: ai_agent_context_poisoning  
**Location**: `ContextBriefService.ts:102-109`  
**Description**: Document excerpts are concatenated directly into the markdown brief without any sanitization or prompt-injection defenses. A malicious document containing instruction overrides (e.g., "Ignore all previous instructions and...") will be passed verbatim into AI agent prompts, allowing arbitrary manipulation of agent behavior.  
**Resolution**: Implement a content sanitizer that strips or neutralizes known prompt-injection patterns and markdown boundary breakers before rendering excerpts into the brief.

### F-RT-020-006 — No Clinic-Level Data Isolation
**Lens**: lgpd_compliance_and_data_isolation  
**Location**: `SearchService.ts:29-75`, `EmbeddingRepository.ts:59-116`, `initSchema.sql:4-16`  
**Description**: The memory hub stores all indexed documents in a single global SQLite database with no `clinic_id` column, and `SearchService.search()` never filters by clinic. In a multi-tenant dental SaaS, Clinic A's private specs could be retrieved by Clinic B's users, violating LGPD data-isolation principles.  
**Resolution**: Add `clinic_id` to the `documents` and `chunks` schema, tag each document with its owning clinic during indexing, and enforce clinic-scoped filtering in all search, brief, and drift queries.

### F-RT-020-016 — Unencrypted SQLite Index Vulnerable to Tampering
**Lens**: index_integrity_and_drift_manipulation  
**Location**: `spec.md:FR-005`, `DriftDetectionService.ts:31-35`, `controller.ts:14-15`  
**Description**: The entire memory index and drift state live in an unencrypted SQLite file with no file permissions enforcement, HMAC signatures, or append-only guarantees. An attacker with filesystem access can directly execute SQL to DELETE drift reports, ALTER document content_hash values, or falsify version numbers. The spec's Edge Case promises a backup index, but no backup or tamper-detection mechanism is implemented.  
**Resolution**: Restrict SQLite file permissions to the backend user only, implement a backup index, and sign drift reports with an HMAC or store them in an append-only log outside the mutable database.

---

## HIGH Findings (Address Before Next Release)

### F-RT-020-002 — Confidentiality Guard Short-Circuit Leak
**Lens**: ai_agent_context_poisoning  
**Location**: `ContextBriefService.ts:46-51`  
**Description**: The confidentiality guard uses `if (doc && this.documents.isConfidential(doc))`, which short-circuits to include the document when `findByPath` returns `undefined`. During reindexing race conditions or DB inconsistencies, excerpts from confidential documents can leak into AI agent context.  
**Resolution**: Apply default-deny logic: exclude any search result whose document record cannot be retrieved, and emit a security audit log for the anomaly.

### F-RT-020-003 — Token Budget Bypass via Conditional Enforcement
**Lens**: ai_agent_context_poisoning  
**Location**: `ContextBriefService.ts:59-63`, `spec.md:NFR-003`  
**Description**: Token budget enforcement is conditional on `selected.length >= 3`, meaning the limit is ignored until 3 documents are included. This allows briefs to violate the 128k token budget.  
**Resolution**: Change to a hard cap `if (tokenCount + docTokens > maxTokens)` with a mandatory safety margin; never allow budget overrun regardless of document count.

### F-RT-020-007 — No .gitignore or PII Scanning
**Lens**: lgpd_compliance_and_data_isolation  
**Location**: `spec.md:82` (Edge Cases), `IndexingService.ts:29-83`, `FileWatcher.ts:33-41`  
**Description**: The spec claims the memory hub respects .gitignore and sensitive-file filters, but the implementation only ignores dotfiles via regex. There is no parsing of .gitignore patterns, no automated PII/PHI scanning, and no prevent-indexing logic for LGPD-sensitive data.  
**Resolution**: Implement .gitignore-aware file filtering before indexing, and add an automated sensitive-data scanner that blocks indexing of documents containing patient identifiers unless explicitly marked with a lawful-basis declaration.

### F-RT-020-008 — Search Returns Confidential Documents
**Lens**: lgpd_compliance_and_data_isolation  
**Location**: `SearchService.ts:61-69`, `ContextBriefService.ts:26-83`, `DocumentRepository.ts:177-189`  
**Description**: `SearchService` returns raw content excerpts without verifying authorization. Confidential documents are excluded from AI context briefs but are still fully searchable via `/search` because `SearchService` does not check `DocumentRepository.isConfidential()`. No audit log exists.  
**Resolution**: Apply confidentiality filtering in `SearchService.search()` before returning results, and implement per-request access logging.

### F-RT-020-011 — API Contract Drift (Health Endpoint)
**Lens**: api_boundary_and_integration_risks  
**Location**: `controller.ts:155-163` vs `apps/web/src/modules/memory-hub/hooks/useMemoryHubHealth.ts:16-22`  
**Description**: The backend `health` endpoint returns snake_case keys while the frontend hook expects camelCase keys. Every destructured field is `undefined`, so the health dashboard permanently displays zeros.  
**Resolution**: Align the backend JSON keys with the frontend contract, or update the frontend hook to consume the backend's actual response field names.

### F-RT-020-017 — ON DELETE CASCADE Destroys Version History
**Lens**: index_integrity_and_drift_manipulation  
**Location**: `initSchema.sql:60-62`, `DocumentRepository.ts:88-96`, `spec.md:FR-009`  
**Description**: The `document_versions` table declares `ON DELETE CASCADE`, meaning any deletion from `documents` automatically destroys all version history. Version rows are mutable SQLite records with no cryptographic linkage.  
**Resolution**: Remove `ON DELETE CASCADE`, retain version history when current document is deleted, and implement an append-only version log with hash chaining.

### F-RT-020-018 — Symlink Attack on FileWatcher
**Lens**: index_integrity_and_drift_manipulation  
**Location**: `FileWatcher.ts:33-44`, `spec.md:FR-003`  
**Description**: Chokidar defaults to `followSymlinks: true`, allowing symlink swaps that suppress change detection. The case-sensitive `.md` filter misses `.MD`/`.Md` files, and the 5-second debounce window is susceptible to event-loss races.  
**Resolution**: Set `followSymlinks: false`, normalize extensions with `.toLowerCase()`, and add file-stat verification after the debounce window.

---

## MEDIUM Findings (Address in Next Sprint)

| ID | Lens | Location | Summary |
|----|------|----------|---------|
| F-RT-020-004 | ai_agent_context_poisoning | `ContextBriefService.ts:33-40` | No mandatory inclusion for security-critical sources in context briefs |
| F-RT-020-005 | ai_agent_context_poisoning | `controller.ts:105-112` | Topic parameter allows YAML/markdown injection into brief template |
| F-RT-020-009 | lgpd_compliance | `spec.md:FR-008` | No LGPD lawful basis mapping, consent management, or data-subject rights |
| F-RT-020-010 | lgpd_compliance | `initSchema.sql:47-53` | search_queries table lacks user_id and clinic_id attribution |
| F-RT-020-012 | api_boundary | `controller.ts:103` | max_tokens accepts NaN, bypassing token budget entirely |
| F-RT-020-013 | api_boundary | `router.ts:10-16` | Shared 30 req/min rate limit too permissive for expensive Ollama calls |
| F-RT-020-014 | api_boundary | `controller.ts:54` | No upper-bound validation on search limit/offset parameters |
| F-RT-020-019 | index_integrity | `driftScanWorker.ts:1-19` | Drift worker runs unsandboxed with full filesystem privileges |
| F-RT-020-020 | index_integrity | `DocumentRepository.ts:55-115` | Multi-statement operations lack SQLite transactions |

---

## LOW Findings (Nice-to-have)

| ID | Lens | Location | Summary |
|----|------|----------|---------|
| F-RT-020-015 | api_boundary | `controller.ts:125-133` | versions endpoint allows filesystem probing via arbitrary sourcePath |

---

## Session Metadata

```yaml
session_id: RT-020-spec-memory-hub-2026-05-22
target_spec: specs/020-spec-memory-hub/spec.md
date: 2026-05-22
lenses:
  - ai_agent_context_poisoning
  - lgpd_compliance_and_data_isolation
  - api_boundary_and_integration_risks
  - index_integrity_and_drift_manipulation
selection_method: auto
triggers_matched: [ai_llm, regulatory_path, contracts]
findings:
  total: 20
  critical: 3
  high: 7
  medium: 9
  low: 1
resolutions:
  spec_fix: 0
  new_oq: 0
  accepted_risk: 0
  out_of_scope: 0
  unresolved: 20
dropped_findings: 0
lens_failures: 0
wall_clock_minutes: ~7
```
