<!--
SYNC IMPACT REPORT
- Version change: 1.1.0 → 1.2.0
- Added: Reference to architecture_constitution.md and security_constitution.md
- Refactored: Moved detailed architecture and security rules to dedicated files
- Unchanged: Governance principles, amendment procedure
-->

# Project Constitution — OrthoPlus Enterprise

**Version**: 1.3.1
**Ratification Date**: 2026-05-20
**Last Amended Date**: 2026-05-23
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

### FE-5: Component Placement
- **Cross-cutting components** (shared UI, layout, generic hooks) → `components/` or `@orthoplus/core-ui`
- **Feature-scoped components** → `modules/<feature>/components/`
- **Rule**: If a component is used by only one feature, it belongs in that feature's module directory
- **Deprecation**: `components/` root level is legacy. New components MUST NOT be added there.

### FE-6: Barrel Files
- Create barrel files (`index.ts`) only when a directory has **≥ 2 external consumers**
- Otherwise: import directly from the component file
- Remove barrel files when all their exports become unused

### FE-7: Frontend Directory Map
Authorized top-level directories under `apps/web/src/`:
- `modules/` — Feature modules (primary location for feature code)
- `components/` — Cross-cutting shared components (legacy, deprecated for new code)
- `hooks/` — Global hooks
- `lib/` — Utilities, adapters, schemas, apiClient
- `contexts/` — Global React contexts
- `types/` — Global TypeScript types (including autogenerated `database.ts`)
- `routes/` — Route definitions
- `domain/` — Cross-cutting domain (legacy, prefer module-level domain)
- `application/` — Cross-cutting use cases (legacy, prefer module-level)
- `infrastructure/` — Cross-cutting infrastructure (legacy, prefer module-level)
- `core/` — Core infrastructure and providers
- `presentation/` — Cross-cutting presentation utilities
- `stores/` — Zustand global stores
- `theme/` — Theme configuration and tokens
- `test/` — Test utilities and setup
- `assets/` — Static assets
- `main.tsx`, `App.tsx`, `index.css`, `vite-env.d.ts` — Entry files

---

## 6. Testing Principles

### TP-1: Test Coverage
Backend: 636 tests, 39 suites — MUST pass before merge. Frontend: Vitest + jsdom. E2E: Playwright for critical flows.

### TP-2: Quality Gates
`pnpm build`, `pnpm type-check`, `pnpm lint`, `pnpm test` — all MUST pass.

### TP-3: Test Attributes for E2E Stability
Interactive elements in feature modules MUST include `data-testid` attributes for Playwright E2E selectors. Prefer `data-testid` over text-based or positional locators (`.first()`, `.nth()`).

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
- `copilot/[description]` — AI-assisted exploration branches (disposable, do not merge directly)
- `[0-9]{3}-[description]` — Legacy numeric-prefixed branches (deprecated, migrate to `feat/` or `fix/`)

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

---

## 13. Worker & Async Processing Principles

### WP-1: BullMQ for Background Jobs
Features requiring async processing MUST use BullMQ with Redis:
- Queue name format: `{module-name}-{action}` (e.g., `ia-radiografia-analysis`)
- Worker file: `backend/src/workers/{module}Worker.ts`
- Default retry: 3 attempts with exponential backoff (5s base)
- Concurrency: 2 per worker process (adjust per workload)

### WP-2: Job Status Tracking
Async jobs MUST update a persistent status field:
- `PENDENTE` → enqueued
- `PROCESSANDO` → worker picked up
- `CONCLUIDA` → success
- `ERRO` → failure (with `erro_processamento` logged)

### WP-3: Frontend Polling
When backend is async, frontend MUST poll via `useEffect` + `setInterval`:
- Poll interval: 10s (adjust per UX requirements)
- Cleanup interval on unmount
- Show progress indicator while `status === "PROCESSANDO"`

### WP-4: Worker Error Handling
Workers MUST:
- Catch all errors and update analysis status to `ERRO`
- Log to audit trail via the module's audit service or equivalent
- Never leave records in `PROCESSANDO` indefinitely

---

## 14. Test Naming Convention

### TN-1: New Tests in English
All NEW test descriptions MUST be in English (`should...`, `must...`).
Existing Portuguese tests (`deve...`) are legacy debt — do NOT refactor unless modifying the file for other reasons.

### TN-2: Test File Location
- Backend unit: `backend/tests/unit/{Module}Controller.test.ts`
- Frontend unit: `apps/web/src/modules/{feature}/**/*.test.{ts,tsx}`
- E2E: `tests/e2e/{feature}-{flow}.spec.ts`

### TN-3: Test Attributes
Interactive elements MUST include `data-testid` for E2E selectors. Prefer `data-testid="upload-button"` over text-based locators.

---

## 15. Prisma Schema Change Protocol

### PS-1: Migration Checklist
When modifying `backend/prisma/schema.prisma`:
1. Run `cd backend && npx prisma migrate dev --name {descriptive_name}`
2. Run `cd backend && npx prisma generate`
3. Verify Prisma Client is regenerated (`npx prisma generate` updates `@prisma/client`)
4. If the feature affects Supabase types, verify `apps/web/src/types/database.ts` is regenerated
5. Run `cd backend && pnpm build` — MUST pass
6. Run `cd apps/web && pnpm type-check` — MUST pass

### PS-2: Schema-First Design
New tables MUST be defined in Prisma schema before any code references them. Never write code that assumes a table exists before the migration is created.

### PS-3: Enum Changes
Adding/modifying enums requires:
- Prisma migration
- Type mapping functions in workers/services (for string→enum conversion)
- Frontend type updates if enum is exposed via API
