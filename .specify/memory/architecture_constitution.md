# Architecture Constitution — OrthoPlus Enterprise

**Version**: 1.0.0
**Derived from**: constitution.md v1.3.1
**Scope**: Enforceable architecture standards and system boundaries

---

## 1. Architecture Style

**Style**: Modular Monolith with Clean Architecture boundaries (where adopted)
**Runtime**: Multi-tenant SaaS with Docker containerization
**Communication**: Synchronous HTTP for user-facing operations; async events for cross-module workflows
**Data**: Federated PostgreSQL (6 categories) with Prisma ORM

---

## 2. Layer Boundaries

### 2.1 Backend Layers

| Layer | Responsibility | May Depend On | Must NOT Depend On |
|-------|----------------|---------------|-------------------|
| Router/Controller | HTTP entry, request validation, auth check | Service, Middleware | Prisma, Domain logic |
| Middleware | Cross-cutting (auth, rate limit, clinic guard) | — | Business logic |
| Service | Business logic orchestration | Repository, Domain Utils | Prisma directly |
| Repository | Data access abstraction | Prisma Client | HTTP, Service |
| Domain | Business rules, invariants | — | Infrastructure |
| Infrastructure | External services, logging, metrics | — | Business logic |

### 2.2 Frontend Layers

| Layer | Responsibility | May Depend On | Must NOT Depend On |
|-------|----------------|---------------|-------------------|
| Pages | Route-level composition | Components, Hooks | API logic directly |
| Components | UI rendering, local state | Core UI, Utils | Business logic |
| Hooks | Data fetching, mutations | API Client, Auth | Component state |
| API Client | HTTP abstraction | — | Components |
| Utils | Helpers, formatters | — | Business logic |

---

## 3. Business Logic Placement

### 3.1 Rules
- **Controllers MUST be thin**: validate input, extract auth context, delegate to Service
- **Services own business logic**: orchestrate repositories, enforce rules, emit events
- **Repositories own data access**: Prisma queries, raw SQL only for complex aggregations
- **Domain objects** (where they exist) encapsulate invariants

### 3.2 Anti-patterns
- ❌ Controller calling Prisma directly
- ❌ Business logic in React components
- ❌ API calls inside utility functions
- ❌ Database queries in middleware

---

## 4. Contracts & Validation

### 4.1 Backend Validation
- **MUST**: Zod schemas for all request bodies and query parameters
- **MUST**: Return RFC 7807 Problem Details for validation errors
- **SHOULD**: Centralized error handler middleware

### 4.2 Frontend Validation
- **MUST**: React Hook Form + Zod resolver for forms
- **MUST**: Client-side validation before submission
- **SHOULD**: Server error messages displayed inline

### 4.3 API Contracts
- **MUST**: Standard response envelope: `{ success: boolean, data?: T, error?: ProblemDetail }`
- **SHOULD**: Versioned API paths (`/api/v1/...` when breaking changes)
- **NOTE**: No published OpenAPI schema yet (architecture gap)

---

## 5. Data Access Rules

### 5.1 Prisma Usage
- **MUST**: Prisma Client as primary ORM
- **MAY**: `$queryRaw` for complex aggregations (documented occurrences only)
- **MUST NOT**: Edit migration files manually
- **MUST**: `prisma migrate dev` for schema changes

### 5.2 Cross-Schema Rules
- **MUST**: 6 categories (CORE, FINANCEIRO, OPERACIONAL, COMERCIAL, CLINICO, ADMINISTRATIVO)
- **MUST**: Cross-schema queries are read-only (SELECT)
- **MUST NOT**: Direct cross-schema writes — use domain events or service orchestration
- **MUST**: MasterDatabaseManager as single entry point for cross-category ops

### 5.3 Repository Pattern
- **SHOULD**: Abstract Prisma behind repository interfaces in new modules
- **MAY**: Direct Prisma usage in existing modules (brownfield tolerance)

---

## 6. Async & Integration Rules

### 6.1 Event Bus
- **MUST**: CQRS event bus for cross-module communication
- **MUST**: Event registry for discoverability
- **SHOULD**: At-least-once delivery semantics
- **NOTE**: Event schema registry does not exist yet (gap)

### 6.2 Background Jobs
- **MUST**: Cron jobs via node-cron, scheduled in workers/
- **MUST**: Observable job status (success/failure logging)
- **SHOULD**: Job retry with exponential backoff
- **MUST NOT**: Background jobs bypass auth/audit

### 6.3 Agent Service Integration
- **MUST**: Agent Service communicates via HTTP API (async callbacks)
- **MUST**: Circuit breaker protecting Agent Service calls
- **MUST NOT**: Agent Service accessing database directly

---

## 7. Module Boundaries

### 7.1 Backend Modules (37 total)
- **MUST**: Each module in `backend/src/modules/{name}/`
- **SHOULD**: Module structure: `api/`, `application/`, `domain/`, `infrastructure/`
- **MAY**: Simpler structure for small modules (controller + service)
- **MUST**: clinicGuard on all module routers

### 7.2 Frontend Modules
- **MUST**: Feature modules in `apps/web/src/modules/{name}/`
- **SHOULD**: Module structure: `ui/`, `hooks/`, `types/`, `lib/`
- **MUST**: Lazy-loaded routes in AppRoutes.tsx
- **MUST**: moduleKey for route protection

### 7.3 Shared Packages
- **MUST**: `@orthoplus/shared-types` for cross-stack types
- **MUST**: `@orthoplus/core-ui` for shared UI components
- **MUST NOT**: Business logic in shared packages

---

## 8. Framework-Specific Architecture Rules

### 8.1 Express (Backend)
- **MUST**: Router per module, mounted in index.ts
- **MUST**: Error handler middleware at end of chain
- **SHOULD**: Request validation middleware per route

### 8.2 React + Vite (Frontend)
- **MUST**: Functional components with hooks
- **MUST**: React Query for server state
- **SHOULD**: Zustand for client state (module-level)
- **MUST NOT**: Class components (legacy only)

### 8.3 Prisma
- **MUST**: Schema as single source of truth
- **MUST**: Regenerate types after schema changes
- **SHOULD**: Indexes for query performance
- **MUST NOT**: Raw SQL bypassing Prisma without justification

---

## 9. Blocking Architecture Violations (P0)

| Violation | Detection | Consequence |
|-----------|-----------|-------------|
| Controller accessing Prisma directly | Code review, lint | Reject PR |
| Cross-schema write without event | Runtime audit, DB triggers | Revert, add event |
| Missing clinicGuard on router | Code review, test | Reject PR |
| Business logic in React component | Code review | Refactor to hook/service |
| Hardcoded secrets in code | Secret scanning, CI | Block merge |
| Missing audit log for sensitive op | Security review | Reject PR |
| Circular dependency between modules | Build failure, lint | Reject PR |
| Direct module DB access (not via API/event) | Architecture review | Reject PR |

---

## 10. Architecture Evolution Policy

### 10.1 Change Process
1. **Proposal**: Document proposed change with affected views and consequences
2. **Review**: Architecture Guard review against existing boundaries
3. **Approval**: Explicit approval from maintainers
4. **Implementation**: Update affected specs, plans, and code
5. **Validation**: Verify no P0 violations introduced

### 10.2 Drift Handling
- **Detect**: Via architecture-guard workflow or manual review
- **Report**: Document drift, affected boundaries, and migration path
- **Resolve**: Either align code to architecture OR propose architecture update
- **NEVER**: Silently accept drift

### 10.3 Refactor Triggers
- New module with >5 domain entities → Consider Clean Architecture
- Cross-module query >3 tables → Consider materialized view or event sourcing
- Service method >100 lines → Extract helper or sub-service
- Component >300 lines → Split or extract hooks

---

## 11. Refactor & Drift Handling

### 11.1 When to Refactor
- **Brownfield tolerance**: Existing modules need not migrate to Clean Architecture immediately
- **New modules**: SHOULD follow Clean Architecture boundaries
- **Feature changes**: Touching >30% of a module → consider refactor

### 11.2 Drift Categories
| Category | Example | Handling |
|----------|---------|----------|
| Minor drift | Utility function in wrong folder | Move in next PR |
| Moderate drift | Business logic leaking into controller | Create refactor task |
| Major drift | Module bypassing event bus for cross-module writes | Architecture review required |

---

## Gaps

| Gap | Impact | Resolution |
|-----|--------|------------|
| No OpenAPI schema | Type drift frontend/backend | Adopt OpenAPI or GraphQL |
| No event schema registry | Consumer breakage | Add Avro/JSON Schema |
| No component-level test isolation | Slow tests | Add test doubles |
