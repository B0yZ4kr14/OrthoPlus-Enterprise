# Speckit Master Audit — OrthoPlus Enterprise

**Date:** 2026-05-24
**Auditor:** Kimi Code CLI (Multi-Agent Orchestration)
**Scope:** Scripts, Governance, Squads, Specs, Cross-Artifact Consistency
**Specs Analyzed:** 29
**Reports Consolidated:** 4 partial → 1 master

---

## Executive Dashboard

| Dimension | Grade | Status | Key Finding |
|-----------|-------|--------|-------------|
| **Scripts & Automation** | A- | Healthy | 6 core scripts functional, 93 extensions, 14 workflows |
| **Governance** | B- | Drift | Strong constitution, stale AGENTS.md, metric contradictions |
| **Squads** | C+ | Under-configured | 4 generic agents for 29 specs; missing AI/DevOps/Data specialists |
| **Spec Completeness** | A | Complete | 29/29 have spec+plan+tasks |
| **Spec Integrity** | D+ | Critical | 7 phantom completions, 22 specs with broken traceability |
| **Overall** | C+ | Action Required | Foundation solid; integrity and specialization gaps |

---

## 1. Scripts & Automation

### Core Scripts (.specify/scripts/bash/)

| Script | Lines | Purpose | Status |
|--------|-------|---------|--------|
| `common.sh` | 645 | Backbone: repo discovery, branch resolution, template stack | Healthy |
| `check-prerequisites.sh` | 190 | Validates feature dir, outputs JSON | Healthy |
| `create-new-feature.sh` | 413 | Branch naming, template copying | Healthy |
| `doctor.sh` | 159 | Health diagnostic | Healthy |
| `setup-plan.sh` | 75 | Plan template resolution | Healthy |
| `setup-tasks.sh` | 96 | Tasks template with prerequisite validation | Healthy |

### Extensions

- **93** valid extension.yml manifests
- **92** registered in extensions.yml
- **382** Kimi skills mapped
- **~100+** extension scripts (bash/ps/python/ts)

**Issues:**
- `team-assign` on disk but not registered in extensions.yml
- `v-model` has nested `.specify/` directory (packaging residue)

### Workflows

- **2** Spec-Kit workflows: "Full SDD Cycle"
- **14** GitHub Actions (only 1 speckit-specific: `speckit-compliance.yml`)

### Command Surface

| Category | Status |
|----------|--------|
| Core (specify, plan, tasks, implement, verify) | Healthy |
| GitHub Issues (gh CLI) | At-risk — requires gh CLI |
| Azure DevOps (az CLI) | At-risk — requires az CLI |
| Squad CLI (squad-cli) | Missing — not installed |
| Schedule (Python CP-SAT) | At-risk — requires Python venv |

---

## 2. Governance Analysis

### Constitution (.specify/memory/constitution.md)

- **Version:** 1.3.1 (ratified 2026-05-20, amended 2026-05-23)
- **15 principle families:** EP, GP, CQ, DB, FE, TP, DP, DOC, AS, MP, BR, WP, TN, PS
- **Grade: A** — Clear, actionable, with amendment procedure

**Derived Documents:**
- `architecture_constitution.md` v1.0.0 — references outdated parent v1.1.0
- `security_constitution.md` v1.1.0 — references outdated parent v1.3.0

### AGENTS.md Ecosystem

| Metric | Value |
|--------|-------|
| Total files | 23 |
| Current (<=7 days) | 2 |
| Stale (>29 days) | 5 |

**Stale files:** agent-service/, financeiro/, core-ui/, e2e/, spec-kit-source/

**Critical Contradictions:**
| Topic | Root AGENTS.md | Backend AGENTS.md |
|-------|---------------|-------------------|
| Backend build | "Strict tsc" | "tsc \|\| true" |
| Test suites | 26 | 17 |
| Prisma models | 171 | 178 |

### GitHub Governance

- `speckit-compliance.yml`: Active, validates spec dirs on PRs
- `.github/copilot-instructions.md`: Stub — no actual instructions
- `.github/prompts/`: 258 empty files (only frontmatter)

### OMK Governance

- Fix Squad (FIX-SQUADRAO-CANONICO.md): Excellent — Popperian fix cycle
- `.omk/open-design/`: Embedded foreign repo polluting namespace

### Governance Gaps

- Missing AGENTS.md in shared-types/, categories packages
- No CI gate for stale AGENTS.md or constitution drift

---

## 3. Squad Analysis

### Agent Inventory

| # | Agent | Tier | Capabilities |
|---|-------|------|-------------|
| 1 | planner | premium | 6 |
| 2 | implementer | premium | 8 |
| 3 | reviewer | standard | 6 |
| 4 | verifier | standard | 6 |

### Coverage Gaps (6/29 specs under-covered)

| Spec | Missing Agent |
|------|--------------|
| `019-ia-radiografia` | ai-engineer |
| `017-omk-governance-integration` | devops-engineer |
| `bi`, `analytics`, `023-dashboard` | data-engineer |
| `020-spec-memory-hub` | security-engineer |
| `021-teleodontologia` | webrtc-engineer |

### Skills Integration

- **290+** speckit skills available
- **ZERO** mapped to Squad agents
- Kimi subagents (deploy, backend, qa) — completely decoupled from Squad

### Configuration Issues

- No `squad-config.yml` created from template
- `auto_generate: false` — squad won't auto-update
- `@bradygaster/squad-cli` not installed

---

## 4. Spec Validation (Cross-Artifact)

### Artifact Completeness

| Metric | Value |
|--------|-------|
| Specs with spec.md + plan.md + tasks.md | 29/29 (100%) |
| Specs with 100% tasks complete | 28/29 (97%) |

### Critical Integrity Issues

#### Phantom Completions (7 specs)

Tasks marked [x] reference files that DO NOT EXIST:

| Spec | Phantom Files |
|------|--------------|
| `001-pacientes` | pacientesService.ts, pacientesController.ts |
| `002-agenda` | agendaService.ts |
| `005-auth-usuarios` | authService.ts, authController.ts |
| `015-files` | filesService.ts |
| `019-ia-radiografia` | backend/tests/unit/ia-radiografia/*.test.ts (5 files) |
| `020-spec-memory-hub` | SqliteDatabase.ts, domain/MemoryDocument.ts, domain/Chunk.ts |
| `pacientes` (unnumbered) | PatientEntity.ts |

#### FR ID Duplication (24 specs)

FR-001 through FR-005 and SC-001 through SC-003 are reused across 24 specs, making global traceability impossible.

#### Traceability Breakdown (22 specs)

FRs defined in spec.md are NOT referenced in plan.md or tasks.md.

#### Bulk-Marking Suspicion (13 specs)

| Spec | Tasks | Level |
|------|-------|-------|
| `agenda` | 87 | High |
| `pacientes` | 88 | High |
| `015-files` | 73 | High |
| `020-spec-memory-hub` | 49 | High |
| `019-ia-radiografia` | 45 | High |

#### ID Format Inconsistency

- `FR-001` (3-digit): specs 001-025
- `FR-1` (no padding): 016, analytics, bi
- No FR IDs: agenda, pacientes (unnumbered)

#### Empty Spec

- `016-theme-premium-fix`: Has spec.md and plan.md, but 0 tasks

---

## 5. Findings Summary

### Critical

| # | Finding |
|---|---------|
| C1 | 7 specs have phantom task completions |
| C2 | FR IDs duplicated across 24 specs |
| C3 | 22 specs have broken spec->plan->tasks traceability |
| C4 | Backend build contradiction in AGENTS.md |
| C5 | 258 empty GitHub prompts |

### High

| # | Finding |
|---|---------|
| H1 | Squad missing AI, DevOps, Data agents |
| H2 | Zero skill mapping to Squad agents |
| H3 | 5 AGENTS.md files stale (29+ days) |
| H4 | team-assign extension not registered |
| H5 | Speckit-compliance only checks existence, not content |

### Medium

| # | Finding |
|---|---------|
| M1 | Squad CLI not installed |
| M2 | auto_generate: false in squad config |
| M3 | No CI gate for stale AGENTS.md |
| M4 | 4 near-empty spec stubs |
| M5 | Derived constitutions reference outdated parent versions |

---

## 6. Action Plan

### Phase 1: Integrity (Week 1)

| Action | Effort |
|--------|--------|
| Fix phantom completions in 7 specs | 2 days |
| Add spec-prefixed FR IDs to all specs | 3 days |
| Fix traceability chains | 5 days |
| Update stale AGENTS.md files | 1 day |
| Fix backend build contradiction | 0.5 day |

### Phase 2: Capability (Week 2)

| Action | Effort |
|--------|--------|
| Add ai-engineer, devops-engineer, data-engineer agents | 2 days |
| Map 290+ skills to Squad agents | 3 days |
| Install squad-cli | 0.5 day |
| Create squad-config.yml | 0.5 day |
| Enable auto_generate | 0.5 day |

### Phase 3: Automation (Week 3)

| Action | Effort |
|--------|--------|
| Add CI gate for stale AGENTS.md | 1 day |
| Add CI gate for constitution drift | 2 days |
| Enhance speckit-compliance for content depth | 1 day |
| Populate or delete empty prompt files | 2 days |
| Register team-assign extension | 0.5 day |

### Phase 4: Consolidation (Week 4)

| Action | Effort |
|--------|--------|
| Merge duplicate specs | 2 days |
| Remove or flesh out empty stubs | 1 day |
| Standardize FR ID format | 1 day |
| Clean packaging residue | 0.5 day |
| Full verify-run on all 29 specs | 3 days |

---

## 7. Related Reports

| Report | File |
|--------|------|
| Scripts Analysis | docs/session-memory/speckit-scripts-analysis.md |
| Governance Analysis | docs/session-memory/speckit-governance-analysis.md |
| Squad Analysis | docs/session-memory/speckit-squad-analysis.md |
| Specs Validation | docs/session-memory/speckit-specs-validation.md |
| Agent Discovery | docs/session-memory/agent-orchestrator-discovery-report.md |
| Sync-Analyze | docs/session-memory/speckit-sync-analyze-report.md |
| Verify-Run 020 | docs/session-memory/speckit-verify-run-020.md |

---

*Master audit generated by 4 parallel subagents + consolidation.*
*Methodology: discover -> sync-analyze -> verify-run -> cross-reference*
