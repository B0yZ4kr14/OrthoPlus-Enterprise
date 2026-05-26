# OrthoPlus Enterprise — AI Project Brief

## Project
- **Name**: OrthoPlus Enterprise
- **Domain**: Dental practice management (HIPAA/LGPD compliant)
- **Architecture**: Modular Monolith (DDD-lite)

## Tech Stack
- **Language**: TypeScript (88%), Python (12%)
- **Backend**: Express 4 + Prisma 6 + PostgreSQL 16
- **Frontend**: React 18.3 + Vite 8 + Tailwind CSS 3.4
- **Package Manager**: pnpm 10.33.0
- **Test**: Vitest (frontend), Jest (backend), Playwright (E2E)

## Key Paths
- Frontend source: `apps/web/src/`
- Backend source: `backend/src/`
- Prisma schema: `backend/prisma/schema.prisma`
- Agent service: `agent-service/src/`
- Shared types: `shared-types/src/`

## Development Workflow
- Install: `pnpm install`
- Dev: `pnpm dev` (Turbo parallel: frontend 3000 + backend 3005)
- Build: `pnpm build`
- Lint: `pnpm lint`
- Type-check: `pnpm type-check`
- Test: `pnpm test`
- Format: `pnpm format`

## Capability Index
11 locked L1 capabilities. See `evidence/discovery/l1-capabilities.md`.

## Entity Ownership
See `evidence/discovery/domain-model.md` §Entity Catalog.

## Conventions
- ES Modules only (`import/export`)
- No semicolons (Prettier config)
- `async/await` only — no callbacks
- Zod validation on all entry points
- clinicGuard on all routes
- Prisma ORM — no raw SQL

## Security Constraints
- Compliance: HIPAA, LGPD, OWASP-ASVS
- Auth: JWT + bcrypt + clinicGuard multi-tenant isolation
- Data sensitivity tags: PII, health, financial, authentication
- TLS in transit; SSE for storage
