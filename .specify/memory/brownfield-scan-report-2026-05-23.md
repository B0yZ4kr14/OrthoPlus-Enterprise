# OrthoPlus Enterprise — Brownfield Scan Report
**Date:** 2026-05-23T16:00:44-03:00
**Scanner:** speckit-brownfield-scan

## Tech Stack

| Category | Detected |
|----------|----------|
| **Primary language** | TypeScript (~N/A%), Python (~N/A%) |
| **Frontend** | React 18.3, Vite 8, TailwindCSS 3.4 |
| **Backend** | Express 4, Prisma 6, PostgreSQL 16 |
| **Agent Service** | Python 3.14, FastAPI, Agno 2.5 |
| **Testing** | Jest (backend), Vitest (frontend), Playwright (E2E) |
| **CI/CD** | GitHub Actions (15 workflows) |
| **Package manager** | pnpm 10.33.0 (monorepo) |
| **Orchestration** | Turbo |

## Architecture

- **Pattern**: Monorepo with pnpm workspaces + Turbo
- **Frontend**: `apps/web/` — React 18 SPA (Vite + Tailwind)
- **Backend**: `backend/` — Express 4 + Prisma + PostgreSQL
- **Agent Service**: `agent-service/` — Python/FastAPI
- **Shared Types**: `shared-types/` — Cross-stack TypeScript
- **Internal Packages**: `categories/@orthoplus/core/packages/` — UI, hooks, types, utils
- **Database**: PostgreSQL 16 (multi-schema) + SQLite (memory hub index)

## Module Map

| Module | Path | Purpose |
|--------|------|---------|
| Frontend | `apps/web/` | React SPA (~1116 components, 37 modules) |
| Backend | `backend/` | Express API (37 domain modules) |
| Agent Service | `agent-service/` | Python/FastAPI AI agents |
| Shared Types | `shared-types/` | Cross-stack TypeScript types |
| Core UI | `categories/@orthoplus/core/packages/ui/` | Radix + CVA + Tailwind |
| Memory Hub | `backend/src/modules/memory_hub/` | Spec-kit memory indexing |

## Conventions

- **File naming**: kebab-case (frontend), PascalCase (components), camelCase (backend services)
- **Branch pattern**: `main`, `develop`, feature branches (sequential numbering: 001-, 020-)
- **Commit style**: Conventional Commits (feature, fix, refactor, docs, test, chore)
- **Test location**: `backend/tests/unit/` (Jest), `apps/web/src/**/*.test.{ts,tsx}` (Vitest)
- **Language**: Portuguese (code + documentation)
- **Semicolons**: No trailing semicolons (Prettier config)

## Existing Governance

| File | Status |
|------|--------|
| `AGENTS.md` | ✅ Present (canonical agent instructions) |
| `.specify/memory/constitution.md` | ✅ Present (v1.2.0) |
| `.specify/memory/architecture_constitution.md` | ✅ Present |
| `.specify/memory/security_constitution.md` | ✅ Present |
| `.specify/` | ✅ Spec-kit project (v0.8.14.dev0) |
| `ARCHITECTURE.md` | ✅ Present |
| `.github/workflows/` | ✅ 15 workflows |
| `CONTRIBUTING.md` | ❌ Not detected |
| `.editorconfig` | ❌ Not detected |

## Recommendations

- Spec-kit is fully bootstrapped — no brownfield migration needed
- 20 features specified with spec+plan+tasks artifacts
- 92 Speckit extensions installed (89.3% catalog coverage)
- Consider adding CONTRIBUTING.md and .editorconfig for completeness
