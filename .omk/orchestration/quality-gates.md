# OMK Quality Gates — OrthoPlus Enterprise

**Feature**: 017-omk-governance-integration
**Last Updated**: 2026-05-19

## Gate Definitions

| Gate | Command | Success Criteria | On Failure |
|------|---------|-----------------|------------|
| **Lint** | `pnpm lint` | 0 erros ESLint | Reviewer fixes, re-run |
| **Type Check** | `pnpm type-check` | 0 erros TypeScript | Implementer fixes, re-run |
| **Test** | `pnpm test` | All suites pass | Verifier investigates |
| **Build** | `pnpm build` | Turbo build success | Implementer fixes |

## Backend-Specific Gates

| Gate | Command | Success Criteria |
|------|---------|-----------------|
| **Backend Build** | `cd backend && pnpm build` | tsc compiles without errors |
| **Backend Test** | `cd backend && pnpm test` | Jest suites pass (17 suites) |
| **Prisma Validate** | `cd backend && npx prisma validate` | Schema valid |

## Frontend-Specific Gates

| Gate | Command | Success Criteria |
|------|---------|-----------------|
| **Frontend Build** | `cd apps/web && pnpm build` | Vite build success |
| **Frontend Type Check** | `cd apps/web && pnpm type-check` | tsc --noEmit passes |
| **E2E** | `pnpm test:e2e` | Playwright passes |

## Gate Execution Order

```
1. Lint (fastest, catches syntax/style)
2. Type Check (catches type errors)
3. Test (catches logic errors)
4. Build (catches bundling issues)
```

All gates must pass before proceeding to the next SpecKit phase.
