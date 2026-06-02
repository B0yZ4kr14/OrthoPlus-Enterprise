# Project Plan — OrthoPlus Enterprise

**Version**: 1.1.0
**Last Updated**: 2026-06-02

---

## Technical Context

**Language/Version**: TypeScript 5.8.3 (frontend), Node.js 20 (backend), Python 3.14 (agent-service)

**Primary Dependencies**: React 18.3 + Vite 8, Express 4 + Prisma 6, FastAPI + Agno 2.5, Docker + Docker Compose

**Storage**: PostgreSQL 16 (multi-schema), Redis 7 (session/cache)

**Testing**: Vitest 4.1.2 (frontend), Jest (backend), Playwright E2E

**Target Platform**: Ubuntu Server LTS VPS (Docker Compose stack), Cloudflare CDN/SSL proxy

**Performance Goals**: Backend API p95 < 200ms, frontend FCP < 1.5s, E2E suite < 10min

**Constraints**: Multi-tenancy via clinicId isolation, LGPD compliance, zero-downtime Docker deploys

**Scale/Scope**: ~32k symbols, 42 specs (100% complete), 37 modules, 180 Prisma models, production VPS with Tailscale + Cloudflare

---

## Governance Tooling Structure

```text
# Governance tooling (layered above application code)
.github/
├── workflows/
│   ├── gitnexus-index.yml      # CI trigger for GitNexus re-index on push
│   └── speckit-compliance.yml  # PR spec validation

.kimi/
└── skills/                     # Kimi/OMK skill definitions

.specify/
├── templates/                  # Spec templates
├── memory/                     # Project constitution + context
│   ├── constitution.md         # Non-negotiable principles
│   ├── spec.md                 # Merged feature specifications
│   ├── plan.md                 # Merged implementation plans
│   └── changelog.md            # Feature merge log
└── feature.json                # Active feature pointer

.omk/
├── memory/                     # OMK graph memory
└── orchestration/              # OMK workflow definitions
    ├── squad-agents.md         # Agent role definitions
    └── quality-gates.md        # Lint/type/test/build gates
```

*[Source: specs/017-omk-governance-integration]*

---

## Architecture Decisions

### GitNexus Integration Pattern

**Decision**: Use GitNexus as a read-only code intelligence layer. The index is refreshed via CI hook on every push to `main`.

**Rationale**: Symbol-level impact analysis is critical for safe refactoring in a 33k+ symbol monorepo. CI re-indexing ensures the index never becomes stale.

### SpecKit Workflow Enforcement

**Decision**: SpecKit SDD workflow is mandatory for all new features but optional for hotfixes and documentation-only changes.

### OMK Orchestration Scope

**Decision**: OMK orchestrates the SpecKit workflow phases (specify → plan → tasks → implement → verify) but does NOT write application code directly. Human approval is required at plan and implement gates.

### VPS Documentation Strategy

**Decision**: VPS configuration is documented in THREE places for redundancy: spec, `.env.production.example`, and VPS actual `.env`.

*[Source: specs/017-omk-governance-integration/research.md]*

---

## Quality Gates

| Gate | Command | Success Criteria |
|------|---------|-----------------|
| Lint | `pnpm lint` | 0 errors ESLint |
| Type Check | `pnpm type-check` | 0 errors TypeScript |
| Test | `pnpm test` | All suites pass |
| Build | `pnpm build` | Turbo build success |

*[Source: .omk/orchestration/quality-gates.md]*
