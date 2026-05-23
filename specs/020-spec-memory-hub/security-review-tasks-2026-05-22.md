---
document_type: security-review
review_type: tasks
assessment_date: 2026-05-22
codebase_analyzed: OrthoPlus Enterprise / specs/020-spec-memory-hub
total_files_analyzed: 3
total_findings: 14
overall_risk: HIGH
critical_count: 0
high_count: 5
medium_count: 7
low_count: 2
informational_count: 0
owasp_categories: [A01, A03, A05, A07]
cwe_ids: [CWE-20, CWE-22, CWE-89, CWE-200, CWE-284, CWE-285, CWE-306, CWE-352, CWE-502, CWE-639, CWE-863]
field_summaries:
  document_type: "Always security-review. Allows indexers to skip non-review documents."
  review_type: "Which command generated this document: audit, branch, staged, plan, tasks, or followup."
  assessment_date: "ISO 8601 date the review was performed (YYYY-MM-DD)."
  overall_risk: "Highest severity tier with active findings (CRITICAL, HIGH, MODERATE, LOW, INFORMATIONAL)."
  critical_count: "Number of Critical findings (CVSS 9.0-10.0)."
  high_count: "Number of High findings (CVSS 7.0-8.9)."
  medium_count: "Number of Medium findings (CVSS 4.0-6.9)."
  low_count: "Number of Low findings (CVSS 0.1-3.9)."
  informational_count: "Number of Informational findings."
  owasp_categories: "OWASP Top 10 2025 categories (A01-A10) that have at least one finding."
  cwe_ids: "CWE identifiers referenced in this document."
  finding_id: "Unique finding identifier (SEC-NNN) for cross-referencing and task linkage."
  location: "File path and line number of the vulnerable code (path/to/file.ext:line)."
  owasp_category: "OWASP Top 10 2025 category for this finding (AXX:2025-Name)."
  cwe: "Common Weakness Enumeration identifier with short name (CWE-NNN: Name)."
  cvss_score: "CVSS v3.1 base score (0.0-10.0). 9.0+=Critical, 7.0-8.9=High, 4.0-6.9=Medium, 0.1-3.9=Low."
  spec_kit_task: "Spec-Kit task ID for backlog tracking and remediation follow-up (TASK-SEC-NNN)."
---

# Security Review Report — Task Sequencing Review

**Feature**: 020-spec-memory-hub — Spec Kit Memory Hub  
**Review Date**: 2026-05-22  
**Reviewer**: /speckit-security-review-tasks  
**Scope**: tasks.md task sequencing, security coverage, and dependency ordering vs. red-team findings and security constitution  
**Status**: Post-implementation review (all 65 tasks marked complete)  

---

## Executive Summary

The 020-spec-memory-hub task list contains 65 tasks (52 regular, 10 tech-debt, 3 deferred) organized across 8 phases. While the implementation has been completed and red-team findings have been largely remediated, this review reveals that the original task sequencing had fundamental security gaps that allowed 3 CRITICAL and 7 HIGH severity vulnerabilities to be introduced into the codebase. Security was not shifted left — no security-specific tasks existed in the foundational phases (Phases 1–2), and high-risk features (AI context briefs, multi-tenant search) were implemented without security prerequisites.

**Key systemic finding**: All security hardening was either discovered as post-implementation tech debt (TD001–TD010) or caught by the red-team exercise. The task plan itself was not secure-by-design.

| Metric | Value |
|--------|-------|
| Tasks reviewed | 65 |
| Security tasks in original plan | 0 |
| Security tasks added as tech debt | 10 (TD001–TD010) |
| Red-team findings that trace to missing tasks | 17 of 20 |
| Unresolved red-team findings | 11 |
| Overall task-sequencing risk | HIGH |

---

## Tasks Reviewed

### Phase 1: Setup (T001–T006)
- Dependency installation, Ollama verification, module scaffolding, schema creation, env vars
- **Security gap**: No task to design schema with clinic_id (Constitution section 3.1). No task for SQLite file permission hardening.

### Phase 2: Foundational (T007–T013)
- Markdown parser, document chunker, Ollama embedding client, SQLite repositories, file watcher
- **Security gap**: No input sanitization task for markdown parsing. No transaction-safety task for SQLite. No symlink-protection task for file watcher. No .gitignore parsing task.

### Phase 3: User Story 1 — Search (T014–T021)
- Search service, controller, router, CLI, Prometheus metric
- **Security gap**: No confidentiality-filtering task. No clinic-scoped query task. No input-validation task for limit/offset. No rate-limit tuning task.

### Phase 4: User Story 2 — Indexing (T022–T029)
- File watcher tests, indexing service, reindex worker, manual reindex endpoint, bootstrap script
- **Security gap**: No .gitignore/PII-scanning task. No file-permission validation task. No sensitive-data detection task.

### Phase 5: User Story 3 — Context Briefs (T030–T036)
- Context brief service, endpoint, CLI, token counter, metric
- **Security gap**: No prompt-injection sanitization task. No default-deny confidentiality task. Token budget task (T032) described soft summarization, not a hard cap. No topic-sanitization task.

### Phase 6: User Story 4 — Drift/Health (T037–T045)
- Drift detector, health aggregator, endpoints, workers, CLI, metrics
- **Security gap**: No worker-sandboxing task. No version-history integrity task. No drift-report tamper-detection task.

### Phase 7: Polish (T046–T052)
- Error handling, quality gates, documentation, quickstart validation, frontend UI
- **Security gap**: No API-contract validation task between frontend and backend. No security checkpoint before declaring MVP complete.

### Phase 8: Future / Deferred (T053–T055)
- Advanced filtering, index compression, graph visualization
- **Note**: These were actually implemented post-MVP but were not originally security-relevant.

### Tech Debt (TD001–TD010) — Added Post-Implementation
- TD001: clinicGuard middleware (Constitution GP-1 violation)
- TD002–TD003: Winston logging replacement (Constitution CQ-3 violation)
- TD004: Column name mapping fix (data integrity)
- TD005: Module documentation
- TD006: docType filtering in search
- TD007: Confidentiality marker checks (FR-008)
- TD008: Version history retrieval endpoint (FR-009)
- TD009: Prometheus metrics wiring
- TD010: Polling fallback for FileWatcher

---

## Vulnerability Findings

### HIGH Findings

#### SEC-001 — Security Foundation Missing from Phase 1 and 2
**Risk**: HIGH  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-20: Improper Input Validation  
**CVSS**: 7.5  
**Location**: tasks.md Phase 1 (T001–T006), Phase 2 (T007–T013)  
**Red-Team Mapping**: F-RT-020-006, F-RT-020-007, F-RT-020-016, F-RT-020-018, F-RT-020-020  
**Spec-Kit Task**: TASK-SEC-001  

**Description**: The setup and foundational phases contain zero security-specific tasks. Schema creation (T005) did not include clinic_id, file permissions, or encryption. The file watcher (T013) had no symlink-protection task. Repository implementations (T010–T012) had no transaction-safety task. This violates the principle of shifting security left.

**Remediation**: Insert mandatory security foundation tasks before any user story work:
- T-SEC-001a: Design schema with clinic_id column on every table (Constitution section 3.1)
- T-SEC-001b: Configure SQLite file permissions (owner-only read/write) and backup strategy
- T-SEC-001c: Implement transaction wrapper for multi-statement SQLite operations
- T-SEC-001d: Harden file watcher against symlink attacks (followSymlinks: false)
- T-SEC-001e: Parse .gitignore and implement sensitive-file exclusion before indexing

---

#### SEC-002 — AI Context Poisoning Defenses Missing from US3 Tasks
**Risk**: HIGH  
**OWASP**: A01:2025-Broken Access Control / A03:2025-Injection  
**CWE**: CWE-94: Improper Control of Generation of Code, CWE-502: Deserialization of Untrusted Data  
**CVSS**: 8.1  
**Location**: tasks.md Phase 5 (T032–T036)  
**Red-Team Mapping**: F-RT-020-001 (CRITICAL), F-RT-020-002, F-RT-020-003, F-RT-020-005  
**Spec-Kit Task**: TASK-SEC-002  

**Description**: The context brief user story (US3) had no tasks for prompt-injection defense, default-deny confidentiality, hard token budget enforcement, or topic sanitization. T032 described token budget as summarize secondary docs if budget exceeded — a soft limit that allowed bypass. The red team discovered a CRITICAL prompt-injection vulnerability (F-RT-020-001) because no sanitization task existed.

**Remediation**: Restructure US3 with security prerequisites:
- T-SEC-002a: Implement sanitizeExcerpt() and sanitizeTopic() before context-brief endpoint
- T-SEC-002b: Implement default-deny confidentiality guard (exclude document if lookup fails)
- T-SEC-002c: Enforce hard token budget cap with mandatory safety margin (never exceed maxTokens)
- T-SEC-002d: Add negative test cases for prompt-injection payloads in context-brief tests

---

#### SEC-003 — Multi-Tenancy Isolation Not Planned in Search Tasks
**Risk**: HIGH  
**OWASP**: A01:2025-Broken Access Control  
**CWE**: CWE-284: Improper Access Control, CWE-639: Authorization Bypass Through User-Controlled Key  
**CVSS**: 8.2  
**Location**: tasks.md Phase 3 (T016–T021)  
**Red-Team Mapping**: F-RT-020-006 (CRITICAL), F-RT-020-008, F-RT-020-010  
**Spec-Kit Task**: TASK-SEC-003  

**Description**: The search user story (US1) tasks never mentioned clinic_id filtering. T016 (SearchService) and T017 (controller) were implemented without clinic-scoped queries. TD001 (clinicGuard) was added as tech debt after implementation, proving the original plan missed multi-tenancy entirely. The red team found that Clinic A documents were retrievable by Clinic B (CRITICAL F-RT-020-006).

**Remediation**: Add multi-tenancy tasks to Phase 3:
- T-SEC-003a: Add clinic_id filter to SearchService.search() before endpoint is exposed
- T-SEC-003b: Add user_id and clinic_id attribution to search_queries audit table
- T-SEC-003c: Add negative test: user from clinic A cannot see clinic B documents

---

#### SEC-004 — Input Validation Missing from API Endpoint Tasks
**Risk**: HIGH  
**OWASP**: A03:2025-Injection  
**CWE**: CWE-20: Improper Input Validation  
**CVSS**: 7.8  
**Location**: tasks.md Phase 3 (T017), Phase 5 (T033), Phase 6 (T041)  
**Red-Team Mapping**: F-RT-020-012, F-RT-020-014, F-RT-020-015  
**Spec-Kit Task**: TASK-SEC-004  

**Description**: No tasks required input validation on search parameters (limit, offset), token budget (max_tokens), or version queries (sourcePath). The red team found that max_tokens accepted NaN, limit had no upper bound, and sourcePath allowed filesystem probing.

**Remediation**: Add validation tasks to every endpoint implementation task:
- T-SEC-004a: Validate limit <= 100, offset >= 0, coerce to integers
- T-SEC-004b: Validate max_tokens is positive finite integer, clamp to 128000
- T-SEC-004c: Validate sourcePath against allowlist (prevent path traversal)

---

#### SEC-005 — No Security Checkpoint Before MVP Declaration
**Risk**: HIGH  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-306: Missing Authentication for Critical Function  
**CVSS**: 7.5  
**Location**: tasks.md Phase 7 (T047–T052)  
**Red-Team Mapping**: F-RT-020-011, F-RT-020-013, F-RT-020-017, F-RT-020-019  
**Spec-Kit Task**: TASK-SEC-005  

**Description**: The STOP and VALIDATE checkpoint after US1–US2 (line 295–298) did not include a security checkpoint. Phase 7 polish tasks focused on error handling and docs, not security hardening. As a result, API contract drift (F-RT-020-011), permissive rate limits (F-RT-020-013), CASCADE deletes (F-RT-020-017), and unsandboxed workers (F-RT-020-019) all made it into the codebase.

**Remediation**: Insert a mandatory security gate task:
- T-SEC-005a: Run /speckit-security-review-plan before declaring any phase complete
- T-SEC-005b: Validate API contracts between frontend hooks and backend endpoints
- T-SEC-005c: Review rate limits against Constitution section 6.1 table
- T-SEC-005d: Verify version history integrity (no CASCADE, append-only)
- T-SEC-005e: Sandbox drift worker (restricted filesystem access)

---

### MEDIUM Findings

#### SEC-006 — Confidentiality Filtering Omitted from Search Task Plan
**Risk**: MEDIUM  
**OWASP**: A01:2025-Broken Access Control  
**CWE**: CWE-200: Exposure of Sensitive Information to an Unauthorized Actor  
**CVSS**: 5.3  
**Location**: tasks.md Phase 3 (T016)  
**Red-Team Mapping**: F-RT-020-008  
**Spec-Kit Task**: TASK-SEC-006  

**Description**: T016 (SearchService) did not include a task to filter confidential documents. Confidentiality markers (TD007) were added as tech debt after the red team found that search returned confidential docs. The spec mentioned FR-008 (confidentiality) but no task implemented it in US1.

**Remediation**: Merge TD007 into Phase 3 as a prerequisite task.

---

#### SEC-007 — .gitignore and PII Scanning Not Tasked
**Risk**: MEDIUM  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-200: Exposure of Sensitive Information  
**CVSS**: 5.0  
**Location**: tasks.md Phase 2 (T007, T013), Phase 4 (T024)  
**Red-Team Mapping**: F-RT-020-007  
**Spec-Kit Task**: TASK-SEC-007  

**Description**: The spec edge cases claimed .gitignore respect and sensitive-file filtering, but no task implemented these. T007 (MarkdownParser) parsed content without PII detection. T013 (FileWatcher) watched all files without exclusion. T024 (IndexingService) indexed everything without scanning.

**Remediation**: Add tasks to Phase 2/4:
- T-SEC-007a: Implement .gitignore-aware file filtering before indexing
- T-SEC-007b: Add automated PII/PHI scanner that blocks indexing of sensitive data

---

#### SEC-008 — Audit Logging Missing from All Endpoint Tasks
**Risk**: MEDIUM  
**OWASP**: A09:2025-Security Logging and Monitoring Failures  
**CWE**: CWE-778: Insufficient Logging  
**CVSS**: 5.0  
**Location**: tasks.md Phases 3–6 (all controller/endpoint tasks)  
**Red-Team Mapping**: F-RT-020-010  
**Spec-Kit Task**: TASK-SEC-008  

**Description**: No task required audit logging for search queries, context brief generation, or drift scans. Constitution section 7.1 requires logging every sensitive operation with actor, clinic, timestamp, and IP. The search_queries table lacked user_id and clinic_id until TD010 remediation.

**Remediation**: Add audit-logging task to every endpoint phase.

---

#### SEC-009 — API Contract Validation Missing Between Frontend and Backend
**Risk**: MEDIUM  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-20: Improper Input Validation  
**CVSS**: 4.5  
**Location**: tasks.md Phase 7 (T052)  
**Red-Team Mapping**: F-RT-020-011  
**Spec-Kit Task**: TASK-SEC-009  

**Description**: T052 (frontend UI) had no task to validate that frontend hooks consume the same JSON schema the backend produces. The health endpoint returned snake_case keys while the frontend expected camelCase, causing the dashboard to permanently display zeros.

**Remediation**: Add contract-validation task to Phase 7:
- T-SEC-009a: Generate or verify OpenAPI/TypeScript contract for memory-hub endpoints
- T-SEC-009b: Run contract tests (frontend hook vs. backend response schema)

---

#### SEC-010 — SQLite Transaction Safety Not Tasked
**Risk**: MEDIUM  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-89: SQL Injection (related — inconsistent state from partial failures)  
**CVSS**: 4.8  
**Location**: tasks.md Phase 2 (T010–T012)  
**Red-Team Mapping**: F-RT-020-020  
**Spec-Kit Task**: TASK-SEC-010  

**Description**: Repository tasks (T010–T012) did not require SQLite transactions for multi-statement operations. A failure during document+chunk+embedding insertion could leave the index in an inconsistent state.

**Remediation**: Add transaction requirement to T010–T012.

---

#### SEC-011 — Version History Integrity Not Tasked
**Risk**: MEDIUM  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-284: Improper Access Control  
**CVSS**: 5.0  
**Location**: tasks.md Phase 2 (T005), Phase 4 (T023–T024)  
**Red-Team Mapping**: F-RT-020-017  
**Spec-Kit Task**: TASK-SEC-011  

**Description**: Schema creation (T005) and versioning tests (T023) did not prevent ON DELETE CASCADE on the document_versions table. Deleting a document destroyed all version history, violating immutability principles.

**Remediation**: Add schema-review task to Phase 2:
- T-SEC-011a: Review all foreign keys — no CASCADE on audit/version tables
- T-SEC-011b: Implement append-only version log with hash chaining

---

#### SEC-012 — Drift Worker Sandboxing Not Tasked
**Risk**: MEDIUM  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-284: Improper Access Control  
**CVSS**: 4.5  
**Location**: tasks.md Phase 6 (T042)  
**Red-Team Mapping**: F-RT-020-019  
**Spec-Kit Task**: TASK-SEC-012  

**Description**: The drift scan worker task (T042) did not specify sandboxing or filesystem restrictions. The worker runs with full filesystem privileges, creating a lateral-movement risk if compromised.

**Remediation**: Add sandboxing requirement to T042.

---

### LOW Findings

#### SEC-013 — Rate Limit Specification Missing from Router Task
**Risk**: LOW  
**OWASP**: A05:2025-Security Misconfiguration  
**CWE**: CWE-770: Allocation of Resources Without Limits or Throttling  
**CVSS**: 3.5  
**Location**: tasks.md Phase 3 (T018)  
**Red-Team Mapping**: F-RT-020-013  
**Spec-Kit Task**: TASK-SEC-013  

**Description**: T018 (router setup) mentioned mounting the router but did not specify per-endpoint rate limits. The shared 30 req/min limit was too permissive for expensive Ollama embedding calls.

**Remediation**: Add rate-limit specification to T018 referencing Constitution section 6.1.

---

#### SEC-014 — LGPD Lawful Basis Mapping Not Tasked
**Risk**: LOW  
**OWASP**: A07:2025-Identification and Authentication Failures (regulatory compliance)  
**CWE**: CWE-284: Improper Access Control  
**CVSS**: 3.2  
**Location**: tasks.md all phases  
**Red-Team Mapping**: F-RT-020-009  
**Spec-Kit Task**: TASK-SEC-014  

**Description**: No task addressed LGPD lawful basis mapping, consent management, or data-subject rights for indexed documents that may contain patient-related specifications.

**Remediation**: Add LGPD-compliance task for memory hub data classification.

---

## Confirmed Secure Patterns

Despite the sequencing gaps, the following security patterns were correctly implemented (either reactively or as tech debt):

| Pattern | Implementation | Source |
|---------|---------------|--------|
| clinicGuard middleware | TD001 — Applied to all memory-hub routes | Tech debt (post-impl) |
| Winston logging | TD002–TD003 — Replaced all console.* | Tech debt (post-impl) |
| Confidentiality exclusion | TD007 — Parse confidential/private frontmatter | Tech debt (post-impl) |
| Prompt injection sanitization | F-RT-020-001 remediation — sanitizeExcerpt() / sanitizeTopic() | Red team (post-impl) |
| Hard token budget | F-RT-020-003 remediation — Removed selected.length >= 3 bypass | Red team (post-impl) |
| Default-deny confidentiality | F-RT-020-002 remediation — Exclude if findByPath returns undefined | Red team (post-impl) |
| SQLite permissions | F-RT-020-016 remediation — Owner-only read/write + backup index | Red team (post-impl) |
| Input validation | F-RT-020-012, F-RT-020-014, F-RT-020-015 remediation | Red team (post-impl) |
| user_id/clinic_id in audit | F-RT-020-010 remediation | Red team (post-impl) |

**Observation**: Every confirmed secure pattern was added after the original task list was executed. The original 52 tasks contained zero security-specific work items.

---

## Red-Team to Missing Task Mapping

| Red-Team Finding | Severity | Root Cause in Task Plan | Would Have Been Prevented By |
|------------------|----------|------------------------|------------------------------|
| F-RT-020-001 | CRITICAL | No prompt-injection task in US3 | T-SEC-002a |
| F-RT-020-002 | HIGH | No default-deny confidentiality task | T-SEC-002b |
| F-RT-020-003 | HIGH | Soft token budget in T032, no hard cap | T-SEC-002c |
| F-RT-020-006 | CRITICAL | No clinic_id in schema (T005) or queries (T016) | T-SEC-001a, T-SEC-003a |
| F-RT-020-007 | HIGH | No .gitignore/PII task in T007/T013/T024 | T-SEC-007a, T-SEC-007b |
| F-RT-020-008 | HIGH | No confidentiality filtering in T016 | T-SEC-006 |
| F-RT-020-010 | MEDIUM | No audit logging in any endpoint task | T-SEC-008 |
| F-RT-020-011 | HIGH | No API contract validation in T052 | T-SEC-009 |
| F-RT-020-012 | MEDIUM | No max_tokens validation in T033 | T-SEC-004b |
| F-RT-020-013 | MEDIUM | No rate-limit tuning in T018 | T-SEC-013 |
| F-RT-020-014 | MEDIUM | No limit/offset validation in T017 | T-SEC-004a |
| F-RT-020-015 | LOW | No sourcePath validation in T041 | T-SEC-004c |
| F-RT-020-016 | CRITICAL | No SQLite permission/backup task in T005 | T-SEC-001b |
| F-RT-020-017 | HIGH | No CASCADE review in T005/T023 | T-SEC-011 |
| F-RT-020-018 | HIGH | No symlink task in T013 | T-SEC-001d |
| F-RT-020-019 | MEDIUM | No sandboxing task in T042 | T-SEC-012 |
| F-RT-020-020 | MEDIUM | No transaction task in T010–T012 | T-SEC-010 |

**Coverage**: 17 of 20 red-team findings (85%) trace directly to missing tasks in the original plan. The remaining 3 (F-RT-020-004, F-RT-020-005 partial, F-RT-020-009) are design-level gaps not addressable by task sequencing alone.

---

## Action Plan and Next Steps

### Immediate Actions

1. **Adopt Security Phase 0 for all future features**  
   Before Phase 1 (Setup), add a Security Foundation phase with tasks for:
   - Threat modeling (STRIDE or equivalent)
   - Schema design with clinic_id and audit columns
   - Input validation framework
   - Authentication/authorization middleware verification
   - Rate limit specification per endpoint

2. **Update /speckit-tasks template**  
   Modify the task generation template to automatically inject security tasks based on:
   - Feature risk level (AI context = HIGH, search = MEDIUM)
   - Constitution violations detected in plan.md
   - Red-team lens triggers matched

3. **Mandatory Security Gate**  
   Add T-SEC-GATE to every Phase 7 (Polish):
   - Run /speckit-security-review-plan before merge
   - Validate all Constitution principles are satisfied
   - Confirm no console.* remains, all routes have clinicGuard

### Remediation Follow-Up

Execute /speckit-security-review-followup to create remediation tasks for the 11 unresolved red-team findings that remain in the codebase:

| Finding | Status | Recommended Action |
|---------|--------|-------------------|
| F-RT-020-004 | Unresolved | Add mandatory security-source inclusion to context briefs |
| F-RT-020-005 | Partial | Strengthen sanitizeTopic against YAML injection |
| F-RT-020-007 | Unresolved | Implement .gitignore parsing and PII scanner |
| F-RT-020-008 | Unresolved | Add confidentiality filtering to SearchService.search() |
| F-RT-020-009 | Unresolved | LGPD lawful basis mapping for indexed documents |
| F-RT-020-011 | Unresolved | Align health endpoint JSON keys with frontend contract |
| F-RT-020-013 | Unresolved | Tune rate limits per endpoint (Ollama calls need stricter limits) |
| F-RT-020-017 | Unresolved | Remove CASCADE, implement append-only version log |
| F-RT-020-018 | Unresolved | Set followSymlinks: false, normalize extensions |
| F-RT-020-019 | Unresolved | Sandbox drift worker filesystem access |
| F-RT-020-020 | Unresolved | Wrap multi-statement operations in SQLite transactions |

### Memory Preservation

The systemic finding — security tasks must be in Phase 0/1, not tech debt — should be captured in project memory via /speckit.memory-md.capture as a reusable pattern for future features.

---

## Appendix: Task Count Analysis

| Category | Original Plan | Tech Debt | Deferred | Total |
|----------|--------------|-----------|----------|-------|
| Security-specific | 0 | 3 (TD001, TD007, partial TD002–TD003) | 0 | 3 |
| Feature implementation | 52 | 0 | 3 | 55 |
| Quality/docs | 0 | 7 (TD004–TD006, TD008–TD010) | 0 | 7 |
| **Total** | **52** | **10** | **3** | **65** |

**Security task ratio**: 3/65 = 4.6% of all tasks were security-related, and all were added reactively.

---

## Memory Hub INDEX.md Row

| specs/020-spec-memory-hub/security-review-tasks-2026-05-22.md | tasks | 2026-05-22 | HIGH | C:0 H:5 M:7 L:2 | A01,A03,A05,A07 |
