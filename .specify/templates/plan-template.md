# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

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
- **Backend**: Docker container `orthoplus-backend` on port 3005 (PM2 also present but Docker is primary)
- **Nginx**: Host nginx (not Docker) with Cloudflare origin SSL
- **Database**: PostgreSQL 16 (Docker container)

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
