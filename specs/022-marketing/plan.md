# Implementation Plan: Marketing Automático

**Branch**: `feat/022-marketing` | **Date**: 2026-05-24 | **Spec**: `specs/022-marketing/spec.md`

**Input**: Feature specification from `/specs/022-marketing/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

Marketing Automático module provides dental clinic marketing capabilities including campaign management, send tracking, recall automation, trigger processing, and a loyalty program. Implementation spans backend (Express + Prisma), frontend (React with Clean Architecture use cases), and database (5+ marketing tables).

---

## Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Version** | TypeScript 5.8 (backend + frontend) |
| **Primary Dependencies** | Express 4, Prisma 6, React 18, Zod |
| **Storage** | PostgreSQL 16 (Prisma ORM) |
| **Testing** | Jest (backend), Vitest + jsdom (frontend) |
| **Target Platform** | Web SPA (Vite) + Node.js API |
| **Performance Goals** | < 300ms p95 for campaign operations |
| **Constraints** | LGPD compliance for patient communication |
| **Scale/Scope** | 1000+ recalls per batch, unlimited campaigns |

---

## Constitution Check

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing |
| **AP-2** Controllers → Services | Controller uses Prisma directly (deviation) | ⚠️ Drift |
| **CQ-1** TypeScript strict | Uses `as any` casts in controller (legacy debt) | ⚠️ Drift |
| **CQ-2** Error Handling | Uses `asyncHandler` + `Errors` (better than teleodonto) | ✅ Existing |
| **FE-1** core-ui components | Uses `@orthoplus/core-ui` | ✅ Existing |
| **FE-5** Component Placement | Feature components in `modules/marketing-auto/` | ✅ Existing |
| **DB-1** Prisma for CRUD | Uses Prisma Client | ✅ Existing |

---

## Project Structure

### Backend

```
backend/src/modules/marketing/
├── api/
│   ├── controller.ts      # MarketingController — campanhas, envios, recalls, triggers
│   ├── router.ts          # Express routes with clinicGuard
│   └── schemas.ts         # Zod validation schemas
```

### Frontend

```
apps/web/src/modules/marketing-auto/
├── application/use-cases/
│   ├── ActivateCampaignUseCase.ts
│   ├── CreateCampaignUseCase.ts
│   ├── GetCampaignMetricsUseCase.ts
│   ├── ListCampaignSendsUseCase.ts
│   ├── ListCampaignsUseCase.ts
│   ├── SendCampaignMessageUseCase.ts
│   └── UpdateCampaignStatusUseCase.ts
├── components/
│   ├── programa-fidelidade/
│   │   ├── ProgramaFidelidade.tsx
│   │   ├── BadgesTab.tsx
│   │   ├── ConfigTab.tsx
│   │   ├── IndicacoesTab.tsx
│   │   ├── KPICards.tsx
│   │   ├── PacientesTab.tsx
│   │   └── RecompensasTab.tsx
│   └── __tests__/
└── ...
```

---

## Deployment Context

### Build Strategy
- **Frontend**: `cd apps/web && pnpm build`
- **Backend**: `cd backend && pnpm build`

### Quality Gates
1. `pnpm type-check` — 0 errors
2. `pnpm lint` — 0 errors (warnings tolerated)
3. `pnpm test` — all pass
4. `cd backend && pnpm build` — strict TypeScript, 0 errors

---

## Gaps Identified (Migration Findings)

1. **Architecture Drift**: Controller uses Prisma directly instead of service layer
2. **Type Safety**: Controller uses `as any` casts for Prisma queries
3. **Missing Backend Tests**: No backend unit tests for marketing controller
4. **Frontend/Backend Mismatch**: Frontend uses `marketing-auto` module name, backend uses `marketing` — naming inconsistency
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **MKT-FR-001** | CRUD operations for marketing campaigns (name, typ... | ✅ Covered |
| **MKT-FR-002** | Send tracking (envios) with status lifecycle (pend... | ✅ Covered |
| **MKT-FR-003** | Recall automation with scheduled notifications and... | ✅ Covered |
| **MKT-FR-004** | Trigger-based marketing (process triggers automati... | ✅ Covered |
| **MKT-FR-005** | Loyalty program with points, badges, rewards, and ... | ✅ Covered |
| **MKT-FR-006** | Campaign metrics dashboard (sends, opens, conversi... | ✅ Covered |
| **MKT-FR-007** | Clinic-scoped data access — all queries filter by ... | ✅ Covered |
