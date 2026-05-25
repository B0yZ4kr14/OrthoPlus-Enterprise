# Implementation Plan: OMK Governance Integration

**Branch**: `[017-omk-governance-integration]` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/017-omk-governance-integration/spec.md`

## Summary

Integrate OrthoPlus Enterprise with GitNexus (code intelligence), SpecKit (specification-driven development), and OMK (multi-agent orchestration). This feature establishes governance automation over the monorepo, ensuring every code change is traceable to specifications, impact-analyzed before editing, and orchestrated through quality gates. The VPS TSiAPP production environment is fully documented and validated as part of this governance baseline.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (frontend), Node.js 20 (backend), Python 3.14 (agent-service)

**Primary Dependencies**: React 18.3 + Vite 8, Express 4 + Prisma 6, FastAPI + Agno 2.5, Docker + Docker Compose

**Storage**: PostgreSQL 16 (multi-schema), Redis 7 (session/cache)

**Testing**: Vitest 4.1.2 (frontend), Jest (backend), Playwright E2E

**Target Platform**: Ubuntu Server LTS VPS (Docker Compose stack), Cloudflare CDN/SSL proxy

**Project Type**: Full-stack web application (SPA + REST API + AI agent service)

**Performance Goals**: Backend API p95 < 200ms, frontend FCP < 1.5s, E2E suite < 10min

**Constraints**: Multi-tenancy via clinicId isolation, LGPD compliance, zero-downtime Docker deploys

**Scale/Scope**: ~33k symbols, 37 modules, 180 Prisma models, production VPS with Tailscale + Cloudflare

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing — no new routes added by this governance feature |
| **AP-2** Controllers → Services | No direct Prisma in controllers | ✅ Existing — governance tools are external to application code |
| **AP-3** React Query + apiClient | Server state via RQ, HTTP via apiClient only | ✅ Existing |
| **AP-4** Database Federation | Use MasterDatabaseManager for cross-category ops | ✅ Existing — no schema changes required |
| **CQ-1** TypeScript strict | Zero new `as any` / `@ts-ignore` | 🔍 Enforce |
| **CQ-2** Error Handling | Use ApiError + RFC 7807 Problem Details | 🔍 Enforce |
| **CQ-3** Security by Default | Rate limiting + CSRF + Helmet on all new endpoints | 🔍 Enforce — any new governance endpoints (e.g., health/status) must comply |
| **DB-1** Prisma for CRUD | `$queryRaw` only for aggregations | ✅ Existing — no DB changes |
| **DB-2** Schema Integrity | Regenerate `database.ts` after schema changes | ✅ Existing — no schema changes |
| **FE-1** core-ui components | Use `@orthoplus/core-ui` | ✅ Existing — no UI changes |
| **FE-2** Date Handling | Use `lib/utils/date.utils.ts` | ✅ Existing |
| **FE-3** Authentication | Use `useAuth()` from AuthContext | ✅ Existing |
| **TP-2** Quality gates | build, type-check, lint, test pass | 🔍 Enforce — GitNexus index must stay fresh, SpecKit gates must pass |
| **DP-2** Observability & Health | Container HEALTHCHECK + Prometheus metrics | ✅ Existing |
| **INF-1** Infrastructure Resilience | CategoryCircuitBreaker protection | ✅ Existing |
| **INF-2** Observability Metrics | Emit `orthoplus_*` metrics with category label | 🔍 Enforce — add `gitnexus_index_freshness`, `speckit_feature_count` metrics |
| **INF-3** Backup & DR | Per-category pg_dump via BackupSchedulerService | ✅ Existing |

**Gate Result**: ✅ PASS — No constitution violations. This feature is primarily infrastructure/tooling integration with minimal application code changes.

## Project Structure

### Documentation (this feature)

```text
specs/017-omk-governance-integration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit-tasks)
```

### Source Code (repository root)

```text
# Governance tooling (external to app code)
.github/
├── workflows/
│   └── gitnexus-index.yml    # CI trigger for GitNexus re-index on push

.kimi/
└── skills/                   # Kimi/OMK skill definitions

.specify/
├── templates/                # Spec templates
├── memory/                   # Project constitution + context
└── feature.json              # Active feature pointer

.omk/
├── memory/                   # OMK graph memory
└── orchestration/            # OMK workflow definitions

# Application code (unchanged structure)
apps/web/                     # React SPA
backend/                      # Express API
agent-service/                # Python FastAPI
shared-types/                 # Cross-stack TypeScript
categories/@orthoplus/        # Internal packages
```

**Structure Decision**: Governance tools are layered ABOVE the existing monorepo structure. GitNexus indexes the existing code, SpecKit uses the existing `.specify/` structure, and OMK orchestrates via `.omk/`. No application code directories are modified.

## Complexity Tracking

> No constitution violations to justify.
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **OMG-FR-001** | System MUST index the entire OrthoPlus Enterprise ... | ✅ Covered |
| **OMG-FR-002** | System MUST provide queryable code intelligence vi... | ✅ Covered |
| **OMG-FR-003** | System MUST support the full SpecKit SDD workflow:... | ✅ Covered |
| **OMG-FR-004** | System MUST integrate SpecKit with the existing pr... | ✅ Covered |
| **OMG-FR-005** | System MUST orchestrate SpecKit workflows via OMK ... | ✅ Covered |
| **OMG-FR-006** | System MUST document the production VPS environmen... | ✅ Covered |
| **OMG-FR-007** | System MUST validate that production endpoints are... | ✅ Covered |
| **OMG-FR-008** | System MUST ensure all domain references in code, ... | ✅ Covered |
| **OMG-FR-009** | System MUST maintain a canonical source of truth f... | ✅ Covered |
