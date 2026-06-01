# Implementation Plan: Marketing Automático

**Branch**: `feat/022-marketing` | **Date**: 2026-05-24 | **Spec**: `specs/022-marketing/spec.md`

**Input**: Feature specification from `/specs/022-marketing/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

Marketing Automático module provides dental clinic marketing capabilities including campaign management, send tracking, recall automation, trigger processing, and a loyalty program. Implementation spans backend (Express + Prisma), frontend (React with Clean Architecture use cases), and database (5+ marketing tables).

---

## Architecture

### Frontend
- Campaign management UI: list, create, edit, and delete marketing campaigns (email, SMS, WhatsApp)
- Campaign metrics dashboard: sends, opens, conversions with KPI cards and charts
- `ProgramaFidelidade` component with tabs: `BadgesTab`, `RecompensasTab`, `IndicacoesTab`, `PacientesTab`, `ConfigTab`
- `KPICards` for loyalty program statistics (active patients, top referrers, redemption rate)
- Recall management interface: list pending recalls, trigger batch processing
- Use cases: `ListCampaignsUseCase`, `CreateCampaignUseCase`, `GetCampaignMetricsUseCase`, `SendCampaignMessageUseCase`, `UpdateCampaignStatusUseCase`, `ActivateCampaignUseCase`

### Backend
- Base path: `/api/marketing/*` with `authMiddleware` → `clinicGuard`
- `GET /api/marketing/campanhas` — list campaigns with filters
- `GET /api/marketing/campanhas/:id` — get campaign details
- `POST /api/marketing/campanhas` — create campaign (status: RASCUNHO)
- `PATCH /api/marketing/campanhas/:id` — update campaign
- `DELETE /api/marketing/campanhas/:id` — delete campaign
- `GET /api/marketing/envios` — list send tracking records
- `POST /api/marketing/envios` — create send (status: pending → sent → delivered → failed)
- `GET /api/marketing/recalls` — list recall scheduling records
- `POST /api/marketing/recalls` — create recall
- `POST /api/marketing/triggers/process` — process trigger-based marketing rules
- `POST /api/marketing/recalls/process` — batch process pending recalls (1000+ per run)

### Database
- `marketing_campaigns`: id, clinic_id, name, type, channel, start_date, end_date, audience, status (RASCUNHO, ATIVA, PAUSADA, CONCLUIDA)
- `marketing_campaign_sends` (envios): id, campaign_id, patient_id, status, sent_at, delivered_at, failed_reason
- `marketing_recalls`: id, clinic_id, patient_id, recall_type, scheduled_date, status, notification_method
- `marketing_triggers`: id, clinic_id, name, condition, action, is_active
- `fidelidade_pacientes`: id, clinic_id, patient_id, points_balance, total_points_earned, total_redeemed, tier

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

## Phases

### Phase 1: Foundation
- [ ] Task 1: Extract controller business logic into service layer (fix architecture drift — controller uses Prisma directly)
- [ ] Task 2: Remove `as any` casts from controller and enforce strict TypeScript compliance
- [ ] Task 3: Add backend unit tests for `MarketingController` covering campaigns, sends, recalls, and triggers

### Phase 2: Implementation
- [ ] Task 4: Implement asynchronous send tracking pipeline (non-blocking API with background queue)
- [ ] Task 5: Build batch recall processor supporting 1000+ recalls per run with timeout protection
- [ ] Task 6: Create loyalty program API endpoints under `/api/fidelidade/` (points, badges, rewards, referrals) if not already present
- [ ] Task 7: Align frontend module naming: decide between `marketing-auto` (frontend) and `marketing` (backend) or create unified naming

### Phase 3: Polish
- [ ] Task 8: Add campaign metrics dashboard with real data from `marketing_campaign_sends`
- [ ] Task 9: Verify recall automation reduces no-show rate by measuring before/after metrics
- [ ] Task 10: Document webhook integration points for external email/SMS/WhatsApp providers
