<!--
SYNC IMPACT REPORT
- Version change: 1.1.0 → 1.2.0
- Added: Reference to architecture_constitution.md and security_constitution.md
- Refactored: Moved detailed architecture and security rules to dedicated files
- Unchanged: Governance principles, amendment procedure
-->

# Project Constitution — OrthoPlus Enterprise

**Version**: 1.2.0
**Ratification Date**: 2026-05-20
**Last Amended Date**: 2026-05-20
**Authority**: Non-negotiable within spec-kit analysis scope

---

## Related Documents

- **Architecture Constitution**: `.specify/memory/architecture_constitution.md` — Enforceable architecture standards, layer boundaries, module rules
- **Security Constitution**: `.specify/memory/security_constitution.md` — Security rules, trust boundaries, compliance requirements
- **Architecture Views**: `.specify/memory/architecture*.md` — 4+1 architecture artifacts

---

## 1. Engineering Philosophy

### EP-1: Clarity Over Cleverness
Prefer explicit, readable code over terse optimizations. Code is read more than written.

### EP-2: Pragmatic Architecture
Adopt Clean Architecture where it adds value. Do NOT force it where it creates friction in brownfield modules.

### EP-3: Security by Default
Every feature starts with "how could this be misused?" Security is not a separate phase.

### EP-4: Observability as Feature
Every new module must emit at least one custom metric. Blind systems cannot be operated.

---

## 2. Governance Principles

### GP-1: Multi-Tenancy via Clinic Isolation
Every data access MUST be scoped by clinicId. clinicGuard is mandatory on all protected routers.

### GP-2: Audit for Sensitive Operations
All CRUD on patient data, financial records, and file access MUST produce immutable audit logs.

### GP-3: Human-in-the-Loop for AI
AI-generated suggestions MUST NOT bypass approval. Clinical decisions remain human responsibility.

### GP-4: Immutable Financial Records
Invoices, once closed, cannot be modified. Corrections create new records.

---

## 3. Code Quality Principles

### CQ-1: TypeScript Strictness
Backend builds with tsc (strict mode). Build failures are blocking. ~98 ESLint warnings tolerated; 0 errors.

### CQ-2: No New Technical Debt Patterns
Do NOT add new `as any` or `@ts-ignore`. Existing ones are debt, not precedent.

### CQ-3: Error Handling
Use ApiError from `@/middleware/errorHandler`. Return RFC 7807 Problem Details. Log with Winston.

---

## 4. Database Principles

### DB-1: Prisma as Primary ORM
Use Prisma Client for CRUD. `$queryRaw` only for complex aggregations (documented).

> **Exception — Local-First Semantic Index**: The Spec Kit Memory Hub (`backend/src/modules/memory_hub/`) uses SQLite (`better-sqlite3`) directly for its local vector index. This is intentional: the index is a derived, ephemeral cache of project documentation (specs, architecture decisions, API contracts) — not business data. It must work offline without a running PostgreSQL instance and must be reconstructible from source documents. This exception applies **only** to the memory hub's `initSchema.sql` and `index.db`.

### DB-2: Schema as Source of Truth
`backend/prisma/schema.prisma` is authoritative. Regenerate types after changes. Never edit `database.ts` manually.

> **Exception — Memory Hub Index Schema**: The memory hub's SQLite schema (`backend/src/modules/memory_hub/infrastructure/initSchema.sql`) is maintained separately because it is not part of the PostgreSQL multi-schema architecture managed by Prisma. Changes to `initSchema.sql` require re-indexing but do not affect `schema.prisma`.

### DB-3: Federated Categories
6 categories (CORE, FINANCEIRO, OPERACIONAL, COMERCIAL, CLINICO, ADMINISTRATIVO). Cross-schema reads only. Writes via events or orchestration.

---

## 5. Frontend Principles

### FE-1: Design System
Use `@orthoplus/core-ui` and `lucide-react`. Use `cn()` for className composition.

### FE-2: Date Handling
Always use `lib/utils/date.utils.ts`. Never import date-fns directly.

### FE-3: Auth Pattern
Use `useAuth()` from AuthContext. Never check localStorage manually.

### FE-4: State Management
Server state: TanStack React Query. Client state: Zustand (module-level).

---

## 6. Testing Principles

### TP-1: Test Coverage
Backend: 522 tests, 24 suites — MUST pass before merge. Frontend: Vitest + jsdom. E2E: Playwright for critical flows.

### TP-2: Quality Gates
`pnpm build`, `pnpm type-check`, `pnpm lint`, `pnpm test` — all MUST pass.

---

## 7. Deployment Principles

### DP-1: Environment Safety
NEVER enable AUTH_ALLOW_MOCK or ENABLE_DANGEROUS_ADMIN_ENDPOINTS in production. Validate .env before deploy.

### DP-2: Observability
All containers expose HEALTHCHECK. Prometheus metrics at /metrics. Grafana dashboards versioned.

### DP-3: Backup & Recovery
Per-category backup via pg_dump. Retain 10 most recent. Observable status.

---

## 8. Documentation Principles

### DOC-1: AGENTS.md Authority
Update AGENTS.md when modifying conventions, scripts, or workflows it describes.

### DOC-2: Spec-Kit Traceability
Every feature MUST have spec.md → plan.md → tasks.md → implementation.md with full traceability.

#### DOC-2a: Hotfix Exception
A **hotfix** é uma correção crítica em produção que não pode aguardar o ciclo completo de especificação. Critérios para classificação:
- **Segurança**: vulnerabilidade ativa com CVE ou exposição de dados
- **Indisponibilidade**: sistema inoperante para usuários finais
- **Integridade**: perda ou corrupção de dados financeiros/clínicos

**Processo abreviado**:
1. Aprovação explícita de um maintainer + registro em incidente
2. Implementação direta em branch `hotfix/*` a partir de `main`
3. Deploy com rollback plan documentado
4. **Pós-deploy (≤ 24h)**: retroactive spec update — criar/atualizar spec.md com descrição do hotfix e lições aprendidas
5. Merge em `develop` na próxima sincronização

**NÃO qualifica como hotfix**: novas features, refatorações, melhorias de UX, débitos técnicos não críticos.

---

## 9. Governance & Evolution

### Amendment Procedure
- **MINOR bump (x.Y.z)**: New principle/section added
- **PATCH bump (x.y.Z)**: Clarifications, wording fixes
- **MAJOR bump (X.y.z)**: Backward incompatible removals

### Compliance Review
- Re-review constitution before each major release (vX.0.0)
- Architecture Guard validates against architecture_constitution.md
- Security review validates against security_constitution.md

### Constitution Hierarchy
1. `constitution.md` — Governance philosophy (this file)
2. `architecture_constitution.md` — Architecture enforcement rules
3. `security_constitution.md` — Security standards
4. `architecture.md` — 4+1 architecture views

---

## 10. Agent Service Principles

### AS-1: Python Boundary
The Agent Service (`agent-service/`) is a Python 3.14 + FastAPI microservice. It MUST NOT import TypeScript code or share runtime with the Node.js backend. Cross-stack communication via HTTP only (`/api/agent/*` → port 8000).

### AS-2: Agno Framework
Agents are built with Agno 2.5. Use Pydantic v2 for all input/output schemas. Never bypass Agno's tool registry for file operations.

### AS-3: Environment Isolation
Agent Service reads `.env` independently. Never share `JWT_SECRET` or database credentials with the backend's env. Use `agent-service/src/config.py` as the single source of truth for Python env vars.

### AS-4: Logging
Use Python `logging` (not `print`). Log level controlled by `LOG_LEVEL` env var. Structured logs compatible with backend Winston JSON format.

---

## 11. Monorepo Principles

### MP-1: Workspace Boundaries
pnpm workspaces are defined in `pnpm-workspace.yaml`:
- `apps/*` — Deployable applications (currently: `apps/web`)
- `backend` — Node.js API server
- `shared-types` — Cross-stack TypeScript types
- `categories/@orthoplus/*` — Internal UI/hooks/utils packages

### MP-2: Dependency Direction
- Frontend MAY depend on `shared-types` and `@orthoplus/*` packages
- Backend MAY depend on `shared-types`
- `shared-types` MUST NOT depend on frontend or backend
- Internal packages MUST NOT depend on apps or backend

### MP-3: Turbo Pipeline
`turbo.json` defines build dependencies:
- `build` depends on `^build` (topological)
- `dev` and `clean` have `cache: false`
- Always run `pnpm build` at root before deploying any workspace

### MP-4: No Cross-Package Imports
Never import from `apps/web/src/` into `backend/src/` or vice versa. Shared code belongs in `shared-types/` or `categories/@orthoplus/*`.

---

## 12. Branch & Commit Conventions

### BR-1: Branch Naming
- `main` — Production-ready
- `develop` — Integration branch
- `feat/[description]` — New features
- `fix/[description]` — Bug fixes
- `chore/[description]` — Maintenance
- `hotfix/[description]` — Production hotfixes (see DOC-2a)
- `omk/flow-[name]-[YYYYMMDD-HHMMSS]` — OMK orchestration branches

### BR-2: Commit Style
Conventional Commits with Portuguese descriptions:
- `feat(scope): descrição`
- `fix(scope): descrição`
- `docs(scope): descrição`
- `security(scope): descrição`
- `refactor(scope): descrição`
- `test(scope): descrição`
- `chore(scope): descrição`

Scope should match module name (e.g., `feat(memory-hub):`, `fix(auth):`).

### BR-3: Pre-Commit Gates
`.husky/pre-commit` runs:
1. `pnpm lint`
2. `pnpm type-check`

If either fails, commit is aborted.

### BR-4: Merge Requirements
All PRs to `main` and `develop` MUST pass:
- CI build (type-check + build + test)
- Security audit (`security.yml`)
- E2E tests (`e2e-tests.yml`) for frontend changes

No duplication across files. Architecture details live in architecture_constitution.md. Security details live in security_constitution.md.
