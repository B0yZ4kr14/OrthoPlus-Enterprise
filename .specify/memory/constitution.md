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

### DB-2: Schema as Source of Truth
`backend/prisma/schema.prisma` is authoritative. Regenerate types after changes. Never edit `database.ts` manually.

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

No duplication across files. Architecture details live in architecture_constitution.md. Security details live in security_constitution.md.
