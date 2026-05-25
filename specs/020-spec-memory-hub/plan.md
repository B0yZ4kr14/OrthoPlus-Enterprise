# Implementation Plan: Spec Kit Memory Hub

**Branch**: `020-spec-memory-hub` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/020-spec-memory-hub/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a centralized project memory hub that indexes all markdown documentation (specs, plans, architecture decisions, API contracts) into a searchable SQLite-backed semantic index using Ollama embeddings. Provide CLI and API interfaces for developers and AI agents to query context, generate feature briefs, and detect memory drift between specs and implementations.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.8 (backend), React 18.3 (frontend)

**Primary Dependencies**: Ollama (embeddings API), chokidar (file watching), better-sqlite3 (SQLite driver), markdown-it (parsing), front-matter (YAML extraction)

**Storage**: SQLite (search index + document metadata), filesystem (source documents)

**Testing**: Jest (backend), Vitest (frontend), Playwright (E2E)

**Target Platform**: Linux server (VPS), Docker containers

**Project Type**: Full-stack web application (monorepo)

**Performance Goals**: Search < 2s for 1000 documents, index update < 60s, health scan < 5min

**Constraints**: Local-first (no cloud deps), 128k token budget for context briefs, offline-capable index

**Scale/Scope**: ~300 documents initially, up to 1000 documents; single-tenant per deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing |
| **AP-2** Controllers → Services | No direct Prisma in controllers | ✅ Existing |
| **AP-3** React Query + apiClient | Server state via RQ, HTTP via apiClient only | ✅ Existing |
| **AP-4** Database Federation | Use MasterDatabaseManager for cross-category ops; read-only SELECT across schemas | ✅ Existing |
| **CQ-1** TypeScript strict | Zero new `as any` / `@ts-ignore` | 🔍 Enforce |
| **CQ-2** Error Handling | Use ApiError + RFC 7807 Problem Details for operational errors | 🔍 Enforce |
| **CQ-3** Security by Default | Rate limiting + CSRF + Helmet on all new endpoints | 🔍 Enforce |
| **DB-1** Prisma for CRUD | `$queryRaw` only for aggregations | ✅ Existing |
| **DB-2** Schema Integrity | Regenerate `database.ts` after schema changes; never edit manually | ✅ Existing |
| **FE-1** core-ui components | Use `@orthoplus/core-ui` | 🔍 Enforce |
| **FE-2** Date Handling | Use `lib/utils/date.utils.ts`; never import date-fns directly | 🔍 Enforce |
| **FE-3** Authentication | Use `useAuth()` from AuthContext; never check localStorage manually | 🔍 Enforce |
| **TP-2** Quality gates | build, type-check, lint, test pass | 🔍 Enforce |
| **DP-2** Observability & Health | Container HEALTHCHECK + Prometheus metrics + Grafana dashboard | ✅ Existing |
| **INF-1** Infrastructure Resilience | CategoryCircuitBreaker protection for DB operations | ✅ Existing |
| **INF-2** Observability Metrics | Emit `orthoplus_*` metrics with category label for new modules | 🔍 Enforce |
| **INF-3** Backup & DR | Per-category pg_dump via BackupSchedulerService; 10-backup retention | ✅ Existing |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

OrthoPlus is a **pnpm monorepo** with Turbo orchestration. Default structure:

```text
apps/web/                          # Frontend React SPA
├── src/
│   ├── components/               # Shared UI components (~1116)
│   ├── modules/                  # 37 UI modules
│   ├── domain/                   # Entities, repositories (Clean Arch)
│   ├── application/use-cases/    # 60 use-cases
│   ├── infrastructure/           # Concrete repos, DI, event bus
│   ├── hooks/                    # Global + API hooks
│   ├── contexts/                 # AuthContext, ModulesContext
│   ├── lib/                      # apiClient, utils, adapters
│   ├── stores/                   # Zustand stores
│   ├── routes/                   # React Router v6
│   └── types/database.ts         # AUTO-GENERATED from Prisma
├── vite.config.ts                # Base: /OrthoPlus-Enterprise/
└── vitest.config.ts              # Unit tests (jsdom)

backend/                           # Backend Node.js / Express
├── src/
│   ├── index.ts                  # Entry point
│   ├── middleware/               # auth, clinicGuard, errorHandler
│   ├── modules/                  # 37 domain modules
│   ├── workers/                  # Cron jobs + backup scheduler
│   ├── infrastructure/           # Prisma, Winston, Redis
│   └── shared/                   # CQRS bus, event registry
├── prisma/schema.prisma          # 186 models, 18 schemas
└── tests/unit/                   # Jest suites

shared-types/                      # Cross-stack TypeScript types
└── src/index.ts

categories/@orthoplus/core/packages/
├── ui/                           # Radix + CVA + Tailwind components
├── hooks/                        # useToast (sonner wrapper)
├── types/                        # Global frontend types
└── utils/                        # formatDate, formatCurrency, cn
```

**Structure Decision**: This feature uses the monorepo layout above. Frontend changes go in `apps/web/src/`, backend in `backend/src/`, shared types in `shared-types/`.

## Deployment Context *(OrthoPlus-specific)*

### Build Strategy
- **Frontend**: `cd apps/web && pnpm build` → Vite build with base `/OrthoPlus-Enterprise/`
- **Backend**: `cd backend && pnpm build` → `tsc -p tsconfig.build.json` (strict, fails on errors)
- **Deploy**: Build locally, rsync `dist/` folders to VPS. Do NOT build on VPS.

### VPS Environment
- **Host**: `tsi@100.111.74.69` (Tailscale) / `179.190.15.116` (public)
- **URL**: `https://tsiapp.io/OrthoPlus-Enterprise/`
- **Backend**: PM2 process `orthoplus-backend` on port 3005 (Docker available for auxiliary services only)
- **Nginx**: Host nginx (not Docker) with Cloudflare origin SSL
- **Database**: PostgreSQL 16 (native host installation on port 5432)

### Quality Gates (MUST pass before deploy)
1. `pnpm type-check` — 0 errors
2. `pnpm lint` — 0 errors (warnings tolerated)
3. `pnpm test` — all pass
4. `cd backend && pnpm build` — strict TypeScript, 0 errors

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **MEM-FR-001** | The system MUST index all markdown documents in `s... | ✅ Covered |
| **MEM-FR-002** | The system MUST provide a semantic search interfac... | ✅ Covered |
| **MEM-FR-003** | The system MUST automatically detect file changes ... | ✅ Covered |
| **MEM-FR-004** | The system MUST generate structured context briefs... | ✅ Covered |
| **MEM-FR-005** | The system MUST detect and report memory drift: sp... | ✅ Covered |
| **MEM-FR-006** | The system MUST provide a health dashboard showing... | ✅ Covered |
| **MEM-FR-007** | The system MUST support filtering search results b... | ✅ Covered |
| **MEM-FR-008** | The system MUST respect document confidentiality m... | ✅ Covered |
| **MEM-FR-009** | The system MUST maintain version history for index... | ✅ Covered |
| **MEM-FR-010** | The system MUST expose both a CLI interface (for d... | ✅ Covered |
| **MEM-FR-011** | The system MUST validate API key permissions (read... | ✅ Covered |
| **MEM-FR-012** | The system MUST support hot-swapping of API keys w... | ✅ Covered |
