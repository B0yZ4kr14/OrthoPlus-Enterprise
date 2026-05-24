# Speckit Governance Analysis — OrthoPlus Enterprise

**Date**: 2026-05-24
**Analyst**: Kimi Code CLI (Subagent)
**Scope**: Constitution, AGENTS.md ecosystem, GitHub governance, OMK governance, gap analysis

---

## 1. Executive Summary

The OrthoPlus Enterprise governance layer is **comprehensive and well-structured** but suffers from **localized drift** — several subordinate documents contradict the root constitution or contain stale data. The overall architecture (hierarchical constitution → AGENTS.md per workspace → OMK squads → GitHub workflows) is sound, but enforcement is inconsistent.

| Dimension | Score | Notes |
|-----------|-------|-------|
| Constitution completeness | A | 15 principle families, amendment procedure, derived docs |
| AGENTS.md consistency | C | Multiple contradictions and stale dates |
| GitHub governance | B | Good workflow coverage; prompts are empty shells |
| OMK governance | B+ | Well-defined squads, quality gates, playbooks |
| Gap remediation | D | Several modules lack AGENTS.md; outdated files unmaintained |

---

## 2. Constitution Analysis

**File**: `.specify/memory/constitution.md`  
**Version**: 1.3.1  
**Ratification**: 2026-05-20  
**Last Amended**: 2026-05-23

### 2.1 Principle Inventory

| ID | Family | Principle | Clarity | Actionable |
|----|--------|-----------|---------|------------|
| EP-1 | Engineering Philosophy | Clarity Over Cleverness | ✅ High | ✅ Yes |
| EP-2 | Engineering Philosophy | Pragmatic Architecture | ✅ High | ✅ Yes |
| EP-3 | Engineering Philosophy | Security by Default | ✅ High | ✅ Yes |
| EP-4 | Engineering Philosophy | Observability as Feature | ✅ High | ✅ Yes |
| GP-1 | Governance | Multi-Tenancy via Clinic Isolation | ✅ High | ✅ Yes |
| GP-2 | Governance | Audit for Sensitive Operations | ✅ High | ✅ Yes |
| GP-3 | Governance | Human-in-the-Loop for AI | ✅ High | ✅ Yes |
| GP-4 | Governance | Immutable Financial Records | ✅ High | ✅ Yes |
| CQ-1 | Code Quality | TypeScript Strictness | ✅ High | ✅ Yes |
| CQ-2 | Code Quality | No New Technical Debt Patterns | ✅ High | ✅ Yes |
| CQ-3 | Code Quality | Error Handling (ApiError, RFC 7807) | ✅ High | ✅ Yes |
| DB-1 | Database | Prisma as Primary ORM | ✅ High | ✅ Yes |
| DB-2 | Database | Schema as Source of Truth | ✅ High | ✅ Yes |
| DB-3 | Database | Federated Categories (6 schemas) | ✅ High | ✅ Yes |
| FE-1 | Frontend | Design System (`@orthoplus/core-ui`) | ✅ High | ✅ Yes |
| FE-2 | Frontend | Date Handling (via `date.utils.ts`) | ✅ High | ✅ Yes |
| FE-3 | Frontend | Auth Pattern (`useAuth()`) | ✅ High | ✅ Yes |
| FE-4 | Frontend | State Management (React Query + Zustand) | ✅ High | ✅ Yes |
| FE-5 | Frontend | Component Placement | ✅ High | ✅ Yes |
| FE-6 | Frontend | Barrel Files (≥2 consumers) | ✅ High | ✅ Yes |
| FE-7 | Frontend | Directory Map | ✅ High | ✅ Yes |
| TP-1 | Testing | Test Coverage (636 tests, 39 suites) | ⚠️ Stale | ✅ Yes |
| TP-2 | Testing | Quality Gates | ✅ High | ✅ Yes |
| TP-3 | Testing | Test Attributes (`data-testid`) | ✅ High | ✅ Yes |
| DP-1 | Deployment | Environment Safety | ✅ High | ✅ Yes |
| DP-2 | Deployment | Observability (HEALTHCHECK, /metrics) | ✅ High | ✅ Yes |
| DP-3 | Deployment | Backup & Recovery (pg_dump, 10 recent) | ✅ High | ✅ Yes |
| DOC-1 | Documentation | AGENTS.md Authority | ✅ High | ✅ Yes |
| DOC-2 | Documentation | Spec-Kit Traceability | ✅ High | ✅ Yes |
| DOC-2a | Documentation | Hotfix Exception | ✅ High | ✅ Yes |
| AS-1 | Agent Service | Python Boundary | ✅ High | ✅ Yes |
| AS-2 | Agent Service | Agno Framework | ✅ High | ✅ Yes |
| AS-3 | Agent Service | Environment Isolation | ✅ High | ✅ Yes |
| AS-4 | Agent Service | Logging (structured JSON) | ✅ High | ✅ Yes |
| MP-1 | Monorepo | Workspace Boundaries | ✅ High | ✅ Yes |
| MP-2 | Monorepo | Dependency Direction | ✅ High | ✅ Yes |
| MP-3 | Monorepo | Turbo Pipeline | ✅ High | ✅ Yes |
| MP-4 | Monorepo | No Cross-Package Imports | ✅ High | ✅ Yes |
| BR-1 | Branch & Commit | Branch Naming | ✅ High | ✅ Yes |
| BR-2 | Branch & Commit | Conventional Commits (Portuguese) | ✅ High | ✅ Yes |
| BR-3 | Branch & Commit | Pre-Commit Gates | ✅ High | ✅ Yes |
| BR-4 | Branch & Commit | Merge Requirements | ✅ High | ✅ Yes |
| WP-1 | Workers | BullMQ for Background Jobs | ✅ High | ✅ Yes |
| WP-2 | Workers | Job Status Tracking | ✅ High | ✅ Yes |
| WP-3 | Workers | Frontend Polling (10s) | ✅ High | ✅ Yes |
| WP-4 | Workers | Worker Error Handling | ✅ High | ✅ Yes |
| TN-1 | Test Naming | New Tests in English | ✅ High | ✅ Yes |
| TN-2 | Test Naming | Test File Location | ✅ High | ✅ Yes |
| TN-3 | Test Naming | Test Attributes | ✅ High | ✅ Yes |
| PS-1 | Prisma Schema | Migration Checklist | ✅ High | ✅ Yes |
| PS-2 | Prisma Schema | Schema-First Design | ✅ High | ✅ Yes |
| PS-3 | Prisma Schema | Enum Changes Protocol | ✅ High | ✅ Yes |

### 2.2 Derived Documents

| Document | Version | Derived From | Status |
|----------|---------|--------------|--------|
| `architecture_constitution.md` | 1.0.0 | constitution.md v1.1.0 | ⚠️ Outdated parent ref (actual is v1.3.1) |
| `security_constitution.md` | 1.1.0 | constitution.md v1.3.0 | ⚠️ Slightly outdated parent ref (actual is v1.3.1) |

### 2.3 Conflicts & Redundancies in Constitution

- **TP-1 test count**: Claims "636 tests, 39 suites" for backend. Backend AGENTS.md says "17 suites" (an earlier count). Root AGENTS.md says "26 suites". **Inconsistent metrics** — no single source of truth for test inventory.
- **FE-5 vs FE-7 overlap**: Both discuss directory structure. FE-5 focuses on component placement; FE-7 is the exhaustive directory map. Not a conflict, but FE-5's deprecation note (`components/` root is legacy) is repeated in root AGENTS.md.
- **DOC-2a (Hotfix)**: Exception is well-defined, but there is no cross-reference in `BR-1` branch naming section to remind that hotfix branches bypass normal spec requirements.

---

## 3. AGENTS.md Ecosystem Analysis

### 3.1 Files Found (22 total)

| Path | Last Updated | Status | Notes |
|------|--------------|--------|-------|
| `./AGENTS.md` | 2026-05-19 | ✅ Current | Root canonical file |
| `./apps/web/AGENTS.md` | 2026-05-13 | ⚠️ 11 days old | Frontend context |
| `./backend/AGENTS.md` | 2026-05-24 | ✅ Current | Backend context |
| `./agent-service/AGENTS.md` | 2026-04-25 | ❌ **Stale** (29 days) | Missing Python 3.14 details, Agno 2.5+ changes |
| `./backend/src/modules/financeiro/AGENTS.md` | 2026-04-25 | ❌ **Stale** | Still references 1277-line controller; outdated metrics |
| `./categories/@orthoplus/core/packages/ui/AGENTS.md` | 2026-04-25 | ❌ **Stale** | No updates since tokens v3 migration |
| `./tests/e2e/AGENTS.md` | 2026-04-25 | ❌ **Stale** | May not reflect latest Playwright config |
| `./docs/spec-kit-source/AGENTS.md` | — | ⚠️ Foreign | Describes Spec Kit *integration development*, not OrthoPlus project |
| `./.omk/open-design/AGENTS.md` | — | ⚠️ Foreign | Part of external `open-design` repo |
| 13× `.omk/open-design/**/AGENTS.md` | — | ⚠️ Foreign | External repo artifacts |
| `.specify/extensions/memory-md/templates/AGENTS.md` | — | ⚠️ Template | Spec Kit template, not project-specific |

### 3.2 Cross-File Contradictions

| Topic | Root AGENTS.md | Backend AGENTS.md | Severity |
|-------|---------------|-------------------|----------|
| **Backend build strictness** | "Build failures are blocking" (`tsc` strict) | "Build usa `tsc \|\| true` — passa mesmo com erros" | 🔴 **Critical** |
| **Backend test suites** | 26 suites | 17 suites | 🔴 **Critical** |
| **Backend tests total** | ~450+ tests | Not stated; contradicts root's 636 tests | 🟡 **High** |
| **Prisma models** | 171 models | 178 models ("~7 modelos recentes") | 🟡 **High** |
| **Frontend modules** | 39 modules (37 business + 2 infra) | 37 modules | 🟡 **High** |
| **`$queryRaw` usage** | Allowed for complex aggregations (documented) | "$queryRaw removido: zero ocorrências" | 🟢 **Aligned** (backend is stricter) |
| **Pre-commit hook** | `pnpm lint` + `pnpm type-check` | Same (implicit via root) | 🟢 **Aligned** |

### 3.3 Stale Information

- **agent-service/AGENTS.md**: Last updated 2026-04-25. The root constitution already covers AS-1 through AS-4, but the local file does not reference these principles. It also claims "Python 3.14 + FastAPI + Agno 2.5" which aligns with root, but lacks any mention of environment isolation rules (AS-3).
- **financeiro/AGENTS.md**: Controller line count may have changed since 2026-04-25. The file documents 38 `as any` occurrences as a ceiling, but there is no mechanism to verify this count has not grown.
- **core-ui/AGENTS.md**: Does not mention the tokens v3 system or `ThemeContext` integration described in `apps/web/AGENTS.md`.

---

## 4. GitHub Governance Analysis

### 4.1 Copilot Instructions

**File**: `.github/copilot-instructions.md`

- Content is a **minimal stub** — only a SPECKIT START/END block pointing to "read the current plan".
- Does not contain project-specific coding standards, security rules, or architectural boundaries.
- **Gap**: Should reference `constitution.md` and `AGENTS.md` explicitly, or inline critical rules (e.g., clinicGuard, no `as any`).

### 4.2 Prompts Directory

**Directory**: `.github/prompts/` (258 files)

- Every file follows the pattern `speckit.<command>.prompt.md`.
- **All inspected files contain only frontmatter** — e.g.:
  ```markdown
  ---
  agent: speckit.implement
  ---
  ```
- **No actual prompt content** is present in any file.
- These are likely scaffolded by Spec Kit integration but never populated.
- **Impact**: Copilot Chat mode has zero project-specific prompt context.

### 4.3 Workflows

**Speckit-specific workflows**:

| Workflow | Purpose | Status |
|----------|---------|--------|
| `speckit-compliance.yml` | PR gate: checks `specs/NNN-*/` exists for feature branches | ✅ Active |
| `gitnexus-index.yml` | Reindex GitNexus on push to `main` | ✅ Active (related) |

**Non-speckit but governance-relevant workflows**:

| Workflow | Purpose |
|----------|---------|
| `build.yml` | Type-check + build + bundle size gate |
| `ci.yml` | Build sequence (shared-types → frontend → backend) |
| `quality-check.yml` | Lint, format-check, build, test, validate |
| `test.yml` | Vitest unit tests + coverage upload |
| `e2e-tests.yml` | Playwright E2E (Chromium, Firefox, WebKit) |
| `security.yml` | Dependency audit + ESLint security scan |
| `production-validation.yml` | Dry-run production + security audit |

**Gap**: There is no workflow that validates AGENTS.md freshness or checks for constitution drift (e.g., comparing root vs. subordinate AGENTS.md dates).

---

## 5. OMK Governance Analysis

### 5.1 Directory Structure

```
.omk/
├── arch-squad/          # Architecture squad (forensic orchestrator, playbooks, QA)
├── fix-squad/           # Fix squad (canonical fix protocol, playbooks, domain agents)
├── memory/              # Frontend analysis, cleanup tasks, state snapshots
├── open-design/         # External design system repo (submodule-like, foreign)
└── orchestration/       # Squad agents, quality gates, playbooks, canonical squad
```

### 5.2 Architecture Squad (`arch-squad/`)

- Contains `forensic_orchestrator.py` (15.8 KB) — a Python script for architectural forensics.
- Has `playbooks/`, `evidencias/`, `qa/` directories.
- **Assessment**: Well-structured but no `AGENTS.md` of its own (it inherits from `.omk/open-design/AGENTS.md` which is foreign).

### 5.3 Fix Squad (`fix-squad/`)

- **`FIX-SQUADRAO-CANONICO.md`**: Excellent canonical document. Defines:
  - Minimum fix principle
  - Popperian falsification cycle for fixes
  - 6-phase execution flow (Triagem → Análise → Execução → Verificação → Regressão → Documentação → Relatório)
  - Agent definitions: FIX-[DOMINIO], FIX-INTEGRADOR, FIX-VERIFICADOR
- **`PLANO-EXECUCAO-FIXES.md`**, **`PLAYBOOK-FIX.md`**, **`PLAYBOOK-VERIFICACAO.md`**: Complete playbook suite.
- **Assessment**: This is the strongest sub-governance artifact in the project.

### 5.4 Orchestration (`orchestration/`)

- **`squad-agents.md`**: Maps SpecKit phases to OMK squad agents (Planner, Implementer, Reviewer, Verifier). Defines human-in-the-loop gates.
- **`quality-gates.md`**: Defines lint → type-check → test → build execution order. Aligned with constitution TP-2.
- **`SQUADRAO-CANONICO.md`**: Canonical squad definitions.
- **`PLANO-ORQUESTRACAO.md`**: Orchestration plan.
- **Playbooks**: `PLAYBOOK-FORENSE.md`, `PLAYBOOK-INTEGRACAO.md`, `PLAYBOOK-POPPERIANO.md`, `PLAYBOOK-SOCRATICO.md`
- **Assessment**: Mature orchestration layer. Strong integration between SpecKit and OMK.

### 5.5 Memory (`omk/memory/`)

- `frontend-analysis-2026-05-23.md`, `frontend-cleanup-governed-summary.md`, `frontend-cleanup-tasks.md`
- Shows active governance memory usage.
- **Assessment**: Good evidence of operational governance.

### 5.6 open-design Subdirectory

- This is essentially an embedded copy of the `nexu-io/open-design` repository (has its own `CHANGELOG.md`, multi-language `README.*.md`, `pnpm-lock.yaml`, `flake.nix`).
- **Assessment**: It pollutes the OMK namespace with foreign artifacts. Its `AGENTS.md` files are not relevant to OrthoPlus.

---

## 6. Governance Gaps

### 6.1 Missing AGENTS.md

The following workspaces/modules **should have** AGENTS.md but do not:

| Missing Path | Why It Needs One |
|--------------|------------------|
| `shared-types/` | Cross-stack type contracts; dependency direction rules (MP-2) |
| `categories/@orthoplus/core/packages/hooks/` | `useToast` and other shared hooks have consumers across apps |
| `categories/@orthoplus/core/packages/types/` | Global frontend types package |
| `categories/@orthoplus/core/packages/utils/` | `formatDate`, `formatCurrency`, `cn` — widely used |
| `categories/@orthoplus/admin-devops/packages/database-config/` | Database configuration package |
| `agent-service/src/` subdirectories | Workflows, agents, models, tools each have conventions |

### 6.2 Outdated Instructions

| File | Issue | Recommended Action |
|------|-------|-------------------|
| `agent-service/AGENTS.md` | 29 days old; no AS principle references | Update date, reference AS-1..AS-4, verify Agno version |
| `backend/src/modules/financeiro/AGENTS.md` | 29 days old; controller metrics likely stale | Update date, re-count `as any`, verify line counts |
| `categories/@orthoplus/core/packages/ui/AGENTS.md` | 29 days old; missing tokens v3 context | Update date, document tokens v3 integration |
| `tests/e2e/AGENTS.md` | 29 days old; spec list may have changed | Update date, verify spec file list |
| `apps/web/AGENTS.md` | 11 days old; acceptable but approaching stale | Update if any new UI corrections applied |

### 6.3 Inconsistent Coding Standards

| Inconsistency | Location | Resolution |
|---------------|----------|------------|
| Backend build strictness | Root says blocking; backend says `\|\| true` | **Pick one**. Recommend strict (root) and remove `\|\| true` |
| Test suite counts | Root: 26; backend: 17; constitution: 39 | Audit actual count, update all files to match |
| Prisma model count | Root: 171; backend: 178 | Audit schema, update root |
| Frontend module count | Root: 39; frontend: 37 | Reconcile (likely 37 business + 2 infra = 39) |
| `$queryRaw` policy | Root allows documented exceptions; backend claims zero | Clarify: backend is aspirational (zero); root is policy (allowed with justification) |

### 6.4 Structural Gaps

| Gap | Risk | Recommendation |
|-----|------|----------------|
| No AGENTS.md freshness checker in CI | Stale sub-docs diverge from constitution | Add a lint job that warns if AGENTS.md is >14 days old |
| Empty `.github/prompts/` | Copilot has zero project context | Populate prompts with constitution excerpts, or remove the directory to avoid false confidence |
| `agent-governance.md` has TODO placeholders | Sync Impact Report is non-functional | Fill in TODOs or remove the section |
| `open-design` embedded in `.omk/` | Foreign repo artifacts confuse agents | Move to `vendor/` or make a proper git submodule |
| No `shared-types/AGENTS.md` | Cross-stack contract changes ungoverned | Create one with MP-2 dependency rules and type versioning policy |

---

## 7. Recommendations (Prioritized)

### P0 — Fix Immediately

1. **Resolve backend build contradiction**: Either enforce strict `tsc` (recommended) or update the root constitution to match the `tsc || true` reality. **Security/quality risk** if developers believe builds are strict when they are not.
2. **Audit and sync test metrics**: Run `cd backend && pnpm test` and `cd apps/web && pnpm test`, then update all documents with the real counts.
3. **Populate or delete empty prompt files**: 258 empty prompt files create a false sense of Copilot governance. Either generate real prompts from the constitution or remove the directory.

### P1 — Fix This Sprint

4. **Update all stale AGENTS.md files** with current dates and verified content.
5. **Create `shared-types/AGENTS.md`** documenting cross-stack dependency rules and type change protocol.
6. **Fix `agent-governance.md` TODO placeholders** or remove the Sync Impact Report section.
7. **Add a CI gate** that checks AGENTS.md modification dates on PRs (warn if >14 days since last update on touched workspaces).

### P2 — Fix Next Cycle

8. **Move `.omk/open-design/` out of the OMK namespace** — it is a foreign repo.
9. **Add a constitution drift detection script** that scans subordinate AGENTS.md files for contradictions (e.g., build strictness, test counts, model counts).
10. **Create workspace-level AGENTS.md for all `categories/@orthoplus/*` packages**.

---

## 8. Appendix: Principle Quick Reference

```
EP-1..4   Engineering Philosophy
GP-1..4   Governance Principles
CQ-1..3   Code Quality Principles
DB-1..3   Database Principles
FE-1..7   Frontend Principles
TP-1..3   Testing Principles
DP-1..3   Deployment Principles
DOC-1..2  Documentation Principles (DOC-2a = Hotfix)
AS-1..4   Agent Service Principles
MP-1..4   Monorepo Principles
BR-1..4   Branch & Commit Conventions
WP-1..4   Worker & Async Processing Principles
TN-1..3   Test Naming Convention
PS-1..3   Prisma Schema Change Protocol
```

---

*End of Report*
