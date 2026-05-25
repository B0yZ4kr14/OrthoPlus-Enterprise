# Squad Routing Rules — OrthoPlus Enterprise

**Project**: OrthoPlus Enterprise
**Version**: 1.1.0
**Generated**: 2026-05-24

---

## Agent Overview

| Agent | Role | Model Tier | Primary Phase |
|-------|------|------------|---------------|
| planner | Arquiteto de Especificacao | premium | specify → plan → tasks |
| implementer | Desenvolvedor Full-Stack | premium | implement |
| ai-engineer | Engenheiro de AI/ML | premium | implement (AI features) |
| devops-engineer | Engenheiro de DevOps | standard | deploy / infrastructure |
| data-engineer | Engenheiro de Dados/BI | standard | implement (analytics) |
| reviewer | Revisor de Codigo | premium | review |
| verifier | QA Engineer | standard | verify |

---

## Routing Rules

### Planner

Triggers:
- Keywords: `specify`, `plan`, `tasks`, `architecture`, `design`, `estimation`
- Files: `spec.md`, `plan.md`, `tasks.md`, `constitution.md`
- Concepts: `user story`, `acceptance criteria`, `requirement`, `ADR`, `decision record`

Example tasks:
> "Create spec.md for new fidelidade module"
> "Update constitution.md with new database principle"
> "Generate tasks.md from plan.md"

---

### Implementer

Triggers:
- Keywords: `implement`, `code`, `develop`, `build`, `create`
- File types: `.ts`, `.tsx`, `.py`
- Patterns: `controller`, `service`, `repository`, `component`, `hook`, `endpoint`, `route`, `middleware`
- Domains: `frontend`, `backend`, `agent-service`

Example tasks:
> "Implement PatientController with CRUD endpoints"
> "Create MemoryHubSearch React component"
> "Add clinicGuard to new router"

---

### AI Engineer

Triggers:
- Keywords: `ai`, `llm`, `model`, `embedding`, `vision`, `radiografia`, `genai`, `prompt`
- File types: `.py` (Agno), `.ts` (embedding clients)
- Patterns: `embedding`, `ollama`, `openai`, `anthropic`, `vector`, `rag`, `semantic search`
- Domains: `ia-radiografia`, `memory_hub`, `agent-service`

Example tasks:
> "Add Ollama embedding client with nomic-embed-text"
> "Implement AI radiografia analysis with vision model"
> "Create RAG pipeline for context briefs"

---

### DevOps Engineer

Triggers:
- Keywords: `deploy`, `release`, `ship`, `docker`, `nginx`, `pm2`, `ci/cd`, `backup`
- File types: `.sh`, `.yml`, `.conf`, `Dockerfile`
- Patterns: `deploy`, `docker-compose`, `nginx`, `workflow`, `pipeline`, `health check`
- Domains: `infrastructure`, `ops`, `monitoring`

Example tasks:
> "Deploy to VPS with zero downtime"
> "Update nginx.conf for new API routes"
> "Add GitHub Actions workflow for E2E tests"

---

### Data Engineer

Triggers:
- Keywords: `dashboard`, `analytics`, `bi`, `report`, `sql`, `query`, `etl`, `metric`, `kpi`
- File types: `.ts` (Recharts), `.sql`, `.prisma`
- Patterns: `aggregation`, `group by`, `chart`, `timeline`, `dre`, `conciliation`
- Domains: `dashboard`, `analytics`, `bi`, `financeiro`

Example tasks:
> "Create patient retention dashboard with Recharts"
> "Build financial DRE report with Prisma aggregations"
> "Implement OFX conciliation pipeline"

---

### Reviewer

Triggers:
- Keywords: `review`, `audit`, `inspect`, `analyze`
- Security: `security`, `vulnerability`, `CVE`, `injection`
- Refactoring: `refactor`, `extract`, `rename`, `split`
- Analysis: `impact analysis`, `blast radius`, `dependency`
- Governance: `constitution`, `principle`, `compliance`

Example tasks:
> "Review PR for memory hub module"
> "Run impact analysis on FileWatcher changes"
> "Audit auth middleware for security issues"

---

### Verifier

Triggers:
- Keywords: `test`, `spec`, `verify`, `validate`, `QA`
- Quality: `coverage`, `threshold`, `quality gate`
- Testing tools: `e2e`, `playwright`, `jest`, `vitest`
- Build: `build`, `lint`, `type-check`
- Observability: `health check`, `metrics`, `observability`

Example tasks:
> "Write unit tests for SearchService"
> "Run speckit-verify-run on 020-spec-memory-hub"
> "Check test coverage for new module"

---

## Phase-to-Agent Mapping

```
specify  → planner
clarify  → planner + reviewer
plan     → planner
tasks    → planner
implement→ implementer
review   → reviewer
verify   → verifier
ship     → planner + verifier
```

## Human-in-the-Loop Gates

| Gate | Trigger | Required Agent |
|------|---------|---------------|
| Plan Approval | After `speckit-plan` | planner |
| Implement Checkpoint | After core phase | implementer + reviewer |
| Pre-Merge Review | Before merge | reviewer + verifier |
| Release Sign-off | Before ship | planner + verifier |
