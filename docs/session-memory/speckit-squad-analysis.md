# Squad System Analysis — OrthoPlus Enterprise

**Date**: 2026-05-24
**Analyst**: AI Agent (Kimi Code CLI)
**Scope**: `.squad/`, `squad.config.ts`, `.specify/extensions/squad/`, specs coverage, skill mapping

---

## 1. Executive Summary

The OrthoPlus Enterprise project has a **Squad system initialized but under-configured** for its 29 active feature specifications. Only **4 generic agents** are defined, covering the basic SDD phases (specify → implement → review → verify). However, **critical domain gaps exist** for AI/ML, DevOps/Deploy, Security, and Data Engineering workloads. The Squad system is also **decoupled from the 290+ available Speckit skills** and from the 3 native Kimi subagents (`deploy`, `backend`, `qa`), creating parallel agent silos.

**Overall Grade: C+** — Functional baseline, but specialization and integration gaps create routing bottlenecks.

---

## 2. Squad Configuration Readout

### 2.1 Files Found

| File | Status | Notes |
|------|--------|-------|
| `.squad/agents/planner.agent.md` | ✅ Present | 40 lines, well-structured |
| `.squad/agents/implementer.agent.md` | ✅ Present | 44 lines, well-structured |
| `.squad/agents/reviewer.agent.md` | ✅ Present | 41 lines, well-structured |
| `.squad/agents/verifier.agent.md` | ✅ Present | 41 lines, well-structured |
| `.squad/routing.md` | ✅ Present | 103 lines, v1.0.0 |
| `squad.config.ts` | ✅ Present | 98 lines, `@bradygaster/squad-sdk` |
| `.specify/extensions/squad/extension.yml` | ✅ Present | v1.1.0, 4 commands, 2 hooks |
| `.specify/extensions/squad/squad-config.template.yml` | ⚠️ Template only | **No `squad-config.yml` created** |

### 2.2 Missing Files

- ❌ `.specify/extensions/squad/squad-config.yml` — Bridge config never instantiated from template
- ❌ `.squad/squad.config.ts` redundant with root `squad.config.ts` (minor)
- ❌ No evidence that `@bradygaster/squad-cli` is installed globally or locally

---

## 3. Agent Analysis

### 3.1 Agent Inventory

| # | Name | Role | Tier | Status | Capabilities Count |
|---|------|------|------|--------|-------------------|
| 1 | `planner` | Arquiteto de Especificacao e Planejamento | premium | active | 6 |
| 2 | `implementer` | Desenvolvedor Full-Stack | premium | active | 8 |
| 3 | `reviewer` | Revisor de Codigo e Seguranca | standard | active | 6 |
| 4 | `verifier` | QA Engineer e Quality Gate Keeper | standard | active | 6 |

**Total: 4 active agents. Zero inactive.**

### 3.2 Capability Breakdown

#### Planner
- Expert: Requirements Analysis, Architecture Design, Technical Writing, Multi-Tenancy Design
- Proficient: Estimation & Sizing, Security Planning
- **Missing**: DevOps/CI planning, AI/ML architecture, Data engineering, Database schema optimization

#### Implementer
- Expert: React / TypeScript, Node.js / Express
- Proficient: Prisma / PostgreSQL, Python / FastAPI, Testing, API Design, State Management
- Basic: DevOps (Docker, PM2, nginx, GitHub Actions)
- **Missing**: AI/ML integration (Agno, LLM APIs, vision models), advanced DevOps (VPS, rsync, TLS), mobile, embedded systems

#### Reviewer
- Expert: Code Review, Constitution Enforcement
- Proficient: Security Review, Architecture Review, TypeScript Analysis, Performance Review
- **Missing**: AI model review (bias, prompt injection), infrastructure review (Docker, k8s), database query optimization review

#### Verifier
- Expert: Test Design, Quality Gates
- Proficient: Test Automation, Verification, Regression Testing, Observability
- **Missing**: Security penetration testing, load testing, chaos engineering, AI model validation

### 3.3 Configuration Quality

| Aspect | Rating | Rationale |
|--------|--------|-----------|
| Agent structure | ✅ Good | Consistent markdown format with capabilities table |
| Constraints | ✅ Good | Each agent has relevant MUST/MUST NOT rules |
| Model tier assignment | ⚠️ Mixed | 2 premium, 2 standard; security reviewer on standard may be underpowered |
| Domain coverage | ❌ Poor | Only 4 generic domains; no specialization |
| Evidence linking | ⚠️ Weak | Capability "evidence" column is descriptive, not linked to actual artifacts |

---

## 4. Routing Rules Analysis

### 4.1 Routing Coverage

The `routing.md` defines **19 regex patterns** across 4 agents, plus a phase-to-agent map.

| Agent | Patterns | Coverage Assessment |
|-------|----------|---------------------|
| planner | 4 patterns | ✅ Covers specify/plan/architecture adequately |
| implementer | 5 patterns | ⚠️ Covers generic code tasks; misses AI, data, DevOps |
| reviewer | 5 patterns | ⚠️ Covers review/refactor/security; misses infra review |
| verifier | 5 patterns | ✅ Covers test/QA/build adequately |

### 4.2 Routing Gaps

**No routing rules exist for:**

| Domain | Example Keywords | Affected Specs |
|--------|-----------------|---------------|
| **AI / Machine Learning** | `radiografia`, `vision model`, `LLM`, `Agno`, `embedding`, `ICP AI` | `019-ia-radiografia` |
| **DevOps / Deploy** | `VPS`, `rsync`, `Dockerfile`, `nginx`, `PM2`, `container`, `compose` | `017-omk-governance-integration`, deploy scripts |
| **Data Engineering / Analytics** | `dashboard`, `BI`, `analytics`, `metric`, `Prometheus`, `Grafana` | `023-dashboard`, `analytics`, `bi` |
| **Security (specialized)** | `red-team`, `pentest`, `threat model`, `STRIDE`, `LGPD audit` | `005-auth-usuarios`, `015-files` |
| **Infrastructure / SRE** | `observability`, `health check`, `backup`, `cron`, `monitoring` | `014-notificacoes`, workers |
| **Mobile / React Native** | `mobile`, `app`, `iOS`, `Android` | None currently (acceptable gap) |

### 4.3 Default Agent Risk

The `squad.config.ts` sets `defaultAgent: "implementer"`. This means any unmatched task (e.g., "Deploy to VPS", "Optimize AI model prompt") falls to the generic implementer, who only has **DevOps: basic**. This creates a **capability-to-complexity mismatch** for infrastructure and AI tasks.

---

## 5. Spec Coverage Analysis

### 5.1 Spec Inventory

**29 total specs identified:**

- **25 numbered specs** (`001`–`025`)
- **4 non-numbered specs** (`agenda`, `analytics`, `bi`, `pacientes`)

### 5.2 Spec-to-Agent Mapping

| Spec | Domain | Primary Agent | Gap? |
|------|--------|---------------|------|
| 001-pacientes | CRUD, patient mgmt | implementer | ✅ Covered |
| 002-agenda | Scheduling, calendar | implementer | ✅ Covered |
| 003-pep | Medical records, odontograma | implementer | ✅ Covered |
| 004-financeiro | Financial management | implementer | ✅ Covered |
| 005-auth-usuarios | Auth, JWT, LGPD | implementer + reviewer | ⚠️ No security specialist |
| 006-orcamentos | Budget, quotes | implementer | ✅ Covered |
| 007-procedimentos | Procedure catalog | implementer | ✅ Covered |
| 008-pdv | Point of sale | implementer | ✅ Covered |
| 009-faturamento | Invoicing, NF-e | implementer | ✅ Covered |
| 010-funcionarios | HR, employee mgmt | implementer | ✅ Covered |
| 011-inventario | Inventory, stock | implementer | ✅ Covered |
| 012-tiss | Healthcare compliance (TISS) | implementer | ✅ Covered |
| 013-crm | CRM, campaigns | implementer | ✅ Covered |
| 014-notificacoes | Notifications (WhatsApp/SMS/email) | implementer | ✅ Covered |
| 015-files | File management, security audit | implementer + reviewer | ⚠️ No security specialist |
| 016-theme-premium-fix | CSS, Tailwind, theming | implementer | ✅ Covered |
| 017-omk-governance-integration | GitNexus, SpecKit, OMK, VPS docs | planner + implementer | ❌ **No DevOps agent** |
| 018-sidebar-collapsed-default | React UI component | implementer | ✅ Covered |
| 019-ia-radiografia | **AI vision, LLM, radiograph analysis** | implementer | ❌ **No AI/ML agent** |
| 020-spec-memory-hub | Search, indexing, memory | implementer | ✅ Covered |
| 021-teleodontologia | Video, chat, telehealth | implementer | ⚠️ WebRTC not in capabilities |
| 022-marketing | Marketing automation | implementer | ✅ Covered |
| 023-dashboard | Dashboard widgets | implementer | ⚠️ No data/analytics agent |
| 024-nfe | Electronic invoicing | implementer | ✅ Covered |
| 025-fidelidade | Loyalty program | implementer | ✅ Covered |
| agenda | Scheduling (duplicate) | implementer | ✅ Covered |
| analytics | Metrics, aggregation | implementer | ⚠️ No data/analytics agent |
| bi | Business Intelligence | implementer | ❌ **No BI/data agent** |
| pacientes | Patients (duplicate) | implementer | ✅ Covered |

### 5.3 Coverage Summary

| Category | Count | Coverage |
|----------|-------|----------|
| Fully covered (generic full-stack) | 23 | ✅ |
| Partially covered (security tasks) | 2 | ⚠️ |
| Under-covered (DevOps/infra) | 1 | ❌ |
| Under-covered (AI/ML) | 1 | ❌ |
| Under-covered (data/BI/analytics) | 2 | ❌ |

**Critical Gaps:**
1. **019-ia-radiografia** — Requires AI vision model integration, LLM prompt engineering, and medical AI compliance. The implementer only has "Python / FastAPI: proficient", with no AI/ML capability.
2. **017-omk-governance-integration** — Involves VPS topology, GitNexus indexing, SpecKit extension orchestration, and CI/CD workflow management. The implementer's "DevOps: basic" is insufficient.
3. **bi + analytics + 023-dashboard** — Business Intelligence requires data modeling, metric design, and visualization architecture. No agent has data engineering or analytics expertise.

---

## 6. Skills vs. Squad Alignment

### 6.1 Available Skills Inventory

| Source | Skill Count |
|--------|-------------|
| `.agents/skills/` | ~290 speckit skills |
| `.kimi/skills/` | ~290 speckit skills (mirror) |
| `.claude/skills/` | GitNexus skills (exploring, impact, debugging, refactoring, PR review) |

### 6.2 Squad-to-Skill Mapping

**Current state: ZERO explicit mapping.** Squad agent definitions do not reference any skills. The routing rules are purely keyword-based regex, not skill-aware.

### 6.3 Relevant Unmapped Skills

| Skill | Domain | Why It Should Map |
|-------|--------|-------------------|
| `speckit-security-review-audit` | Security | Specs 005, 015 have security audits |
| `speckit-security-review-plan` | Security | Auth spec requires security planning |
| `speckit-deploy` | DevOps | VPS deployment is a recurring task |
| `speckit-product-forge-*` (20+ skills) | Product/Research | Feature 019, 020 require product research |
| `speckit-architecture-guard-*` (8 skills) | Architecture | Constitution enforcement, violation detection |
| `speckit-red-team-run` | Security | Principle VIII red-team gate |
| `speckit-memory-md-*` (10 skills) | Memory/Context | Feature 020 is literally the memory hub |
| `speckit-wireframe-*` (8 skills) | UI/UX | Theme fix (016) and dashboard (023) need wireframes |
| `speckit-diagram-*` (3 skills) | Documentation | Planning and architecture phases |
| `speckit-maqa-*` (15 skills) | QA/Multi-agent | Could orchestrate the verifier better |
| `gitnexus-exploring` | Code understanding | All agents need codebase navigation |
| `gitnexus-impact-analysis` | Safety | Reviewer requirement: run impact analysis before edits |

### 6.4 Parallel Agent Systems

The project has **two disconnected agent ecosystems**:

1. **Squad System** (`.squad/`, `squad.config.ts`) — 4 agents, Speckit-bridge oriented
2. **Kimi Subagents** (`.kimi/subagents/`) — 3 agents:
   - `deploy` — VPS deployment specialist
   - `backend` — Backend API specialist (audit 156 404 endpoints)
   - `qa` — Quality gate specialist

**Problem**: The Kimi subagents (`deploy`, `backend`, `qa`) have **more specialized roles** than the Squad agents, but they are completely decoupled. There is no routing rule that delegates to `.kimi/subagents/`. The Squad `implementer` is trying to be a backend engineer, DevOps engineer, frontend engineer, and AI engineer all at once.

---

## 7. Detailed Findings

### 🔴 Critical (Blockers / High Risk)

| ID | Finding | Impact |
|----|---------|--------|
| C-1 | **No AI/ML agent** for `019-ia-radiografia`. Implementer lacks AI vision, LLM prompt engineering, and medical AI compliance capabilities. | AI tasks will be misrouted to a generalist with no relevant expertise. Quality and compliance risk. |
| C-2 | **No DevOps/Deploy agent** for VPS deployment, Docker, nginx, CI/CD. Implementer has only "DevOps: basic". | Infrastructure changes may be implemented incorrectly, risking production stability. |
| C-3 | **No `squad-config.yml`** instantiated from template. Bridge config missing means `auto_generate`, `routing_strategy`, and `model_tiers` use unconfirmed defaults. | Squad extension may behave unpredictably; auto-regeneration on spec change is disabled. |
| C-4 | **Security reviewer on standard tier**. The `reviewer` handles security audits and red-team gates but runs on `standard` (64k context) instead of `premium` (128k). | Large security audits (e.g., `015-files` security-audit.md) may exceed context window. |

### 🟡 Warning (Medium Risk / Inefficiency)

| ID | Finding | Impact |
|----|---------|--------|
| W-1 | **290+ skills unmapped** to Squad agents. Routing is keyword-based, not skill-aware. | Agents may reinvent workflows that already have dedicated skills. Wasted tokens. |
| W-2 | **Parallel agent silos**: Squad (4 agents) vs Kimi subagents (deploy, backend, qa). No integration. | Conflicting responsibilities. `deploy` subagent exists but Squad has no route to it. |
| W-3 | **Reviewer capability overlap with planner**: Both handle architecture and security planning. | During `clarify` phase (planner + reviewer), redundant work possible. |
| W-4 | **Implementer overlaps verifier on Testing**: Implementer has "Testing: proficient", verifier is the QA expert. | Testing tasks may be ambiguously routed. |
| W-5 | **No data/BI/analytics agent** for `bi`, `analytics`, `023-dashboard`. | Dashboard and BI tasks lack domain expertise for metric design and visualization architecture. |
| W-6 | **Default agent is implementer**. Any unrecognized task (e.g., "Set up Prometheus monitoring") goes to the generic coder. | Risk of wrong-tool-for-the-job syndrome. |

### 🟢 Info (Observations / Recommendations)

| ID | Finding |
|----|---------|
| I-1 | Squad extension is well-installed (`v1.1.0`) with hooks for `after_specify` and `after_tasks`. |
| I-2 | Agent definitions follow consistent format and reference constitution constraints (CQ-1, GP-1, etc.). |
| I-3 | `squad.config.ts` uses TypeScript with `@bradygaster/squad-sdk`, suggesting a modern setup. |
| I-4 | All 4 agents are `active`; no stale or inactive agents to clean up. |
| I-5 | `planner` correctly enforces Portuguese documentation and red-team gates. |
| I-6 | `verifier` correctly enforces `data-testid` attributes for E2E and English test descriptions. |

---

## 8. Recommendations

### Immediate (Do Now)

1. **Create `squad-config.yml`** from template at `.specify/extensions/squad/squad-config.yml`
2. **Add 3 new agents**:
   - `ai-engineer` — Expert in Agno, LLM APIs, vision models, prompt engineering, LGPD for AI
   - `devops-engineer` — Expert in Docker, VPS, nginx, CI/CD, PM2, backup/restore
   - `data-engineer` — Expert in analytics, BI dashboards, Prometheus/Grafana, metric design
3. **Upgrade `reviewer` to premium tier** for security and architecture reviews that require large context windows.
4. **Integrate Kimi subagents into Squad routing**:
   - Map `deploy` tasks → `.kimi/subagents/deploy.yaml`
   - Map `backend` CRUD/404 audit tasks → `.kimi/subagents/backend.yaml`
   - Map `qa` test-fix tasks → `.kimi/subagents/qa.yaml`

### Short-Term (Next Sprint)

5. **Create skill-to-agent mapping** in `squad.config.ts`:
   ```ts
   skills: {
     planner: ["speckit-specify", "speckit-plan", "speckit-arch-generate", "speckit-red-team-gate"],
     implementer: ["speckit-implement", "speckit-blueprint-generate", "speckit-fixit-run"],
     reviewer: ["speckit-review-run", "speckit-security-review-branch", "gitnexus-impact-analysis"],
     verifier: ["speckit-verify-run", "speckit-verify-tasks", "speckit-qa-run"],
     aiEngineer: ["speckit-product-forge-research", "speckit-threatmodel-analyze"],
     devopsEngineer: ["speckit-deploy", "speckit-spec2cloud-verify"],
     dataEngineer: ["speckit-product-forge-monitoring-setup", "speckit-token-analyzer-report"]
   }
   ```
6. **Expand routing rules** for the new domains (AI, DevOps, data).
7. **Enable `auto_generate: true`** in `squad-config.yml` so agents stay in sync with spec evolution.

### Long-Term (Architecture)

8. **Unify agent ecosystems**: Either deprecate Kimi subagents in favor of Squad, or create a meta-router that delegates between Squad and Kimi subagents based on task domain.
9. **Add capability evidence links**: Link each capability to actual implemented artifacts (e.g., "React / TypeScript: expert → `apps/web/src/modules/ia-radiografia/`").
10. **Consider a `security-specialist` agent** separate from `reviewer` for red-team, pentest, and LGPD audit work.

---

## 9. Appendix: Raw Data

### A.1 Spec Count by Domain

| Domain | Specs |
|--------|-------|
| Core business (patients, agenda, PEP, finance) | 001–004, 003, 006–008, 010–014, 021–025 |
| Auth/Security | 005, 015 |
| DevOps/Infra/Governance | 017 |
| AI/ML | 019 |
| Meta/Memory/Tooling | 016, 018, 020 |
| Analytics/BI/Dashboard | 023, analytics, bi |

### A.2 Squad File Tree

```
.squad/
├── agents/
│   ├── implementer.agent.md
│   ├── planner.agent.md
│   ├── reviewer.agent.md
│   └── verifier.agent.md
└── routing.md

squad.config.ts (root)
```

### A.3 Kimi Subagent Tree

```
.kimi/
├── agents.yaml (orthoplus-agent + 3 subagents)
├── subagents/
│   ├── backend.yaml
│   ├── deploy.yaml
│   └── qa.yaml
└── system.md
```

---

*Report generated by automated analysis of `.squad/`, `squad.config.ts`, `specs/`, `.agents/skills/`, and `.kimi/` directories.*
