# Implementation Plan: Teleodontologia

**Branch**: `feat/021-teleodontologia` | **Date**: 2026-05-24 | **Spec**: `specs/021-teleodontologia/spec.md`

**Input**: Feature specification from `/specs/021-teleodontologia/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase. This document reverse-engineers the implementation approach.

---

## Summary

Teleodontologia module provides remote dental consultation capabilities including teleconsultation scheduling, video session management, clinical notes, and digital prescriptions. The implementation spans backend (Express + Prisma), frontend (React + Tailwind), and database (3 teleodonto tables).

---

## Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Version** | TypeScript 5.8 (backend + frontend) |
| **Primary Dependencies** | Express 4, Prisma 6, React 18, Zod |
| **Storage** | PostgreSQL 16 (Prisma ORM) |
| **Testing** | Jest (backend), Vitest + jsdom (frontend) |
| **Target Platform** | Web SPA (Vite) + Node.js API |
| **Performance Goals** | < 200ms p95 for list operations |
| **Constraints** | LGPD compliance for clinical data |
| **Scale/Scope** | Up to 1000 teleconsultations per clinic |

---

## Constitution Check

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing |
| **AP-2** Controllers → Services | Controller uses Prisma directly (deviation — see Gaps) | ⚠️ Drift |
| **AP-3** React Query + apiClient | Frontend hooks use apiClient pattern | ✅ Existing |
| **CQ-1** TypeScript strict | Uses `as any` casts in controller (legacy debt) | ⚠️ Drift |
| **CQ-2** Error Handling | Uses raw `res.status(500)` instead of ApiError | ⚠️ Drift |
| **FE-1** core-ui components | Uses `@orthoplus/core-ui/card`, `lucide-react` | ✅ Existing |
| **DB-1** Prisma for CRUD | Uses Prisma Client | ✅ Existing |
| **DB-2** Schema Integrity | 3 teleodonto tables in schema | ✅ Existing |

---

## Project Structure

### Backend

```
backend/src/modules/teleodonto/
├── api/
│   ├── controller.ts      # TeleodontoController — CRUD + sessions + notes + prescriptions
│   ├── router.ts          # Express routes with clinicGuard
│   ├── dbRouter.ts        # Database admin routes (backup/manager)
│   └── schemas.ts         # Zod validation schemas
└── infrastructure/
    ├── ClinicoBackupService.ts
    └── ClinicoDatabaseManager.ts
```

### Frontend

```
apps/web/src/modules/teleodonto/
├── application/hooks/
│   ├── useTeleconsultas.ts
│   ├── useTeleodontologia.ts
│   └── __tests__/
├── domain/types/
│   └── teleodontologia.types.ts
├── presentation/components/
│   ├── TeleodontoDashboard.tsx
│   ├── TeleodontoSessionList.tsx
│   ├── TeleodontoScheduler.tsx
│   ├── TeleconsultaForm.tsx
│   ├── TriagemForm.tsx
│   ├── PrescricaoRemotaForm.tsx
│   ├── VideoRoom.tsx
│   └── __tests__/
├── ui/pages/
│   └── teleodonto.tsx
└── index.ts
```

---

## Deployment Context

### Build Strategy
- **Frontend**: `cd apps/web && pnpm build`
- **Backend**: `cd backend && pnpm build`
- **Deploy**: Rsync `dist/` to VPS

### Quality Gates
1. `pnpm type-check` — 0 errors
2. `pnpm lint` — 0 errors (warnings tolerated)
3. `pnpm test` — all pass
4. `cd backend && pnpm build` — strict TypeScript, 0 errors

---

## Gaps Identified (Migration Findings)

1. **Architecture Drift**: Controller uses Prisma directly instead of service layer (violates AP-2)
2. **Type Safety**: Controller uses `as any` casts (violates CQ-1)
3. **Error Handling**: Uses raw `res.status(500)` instead of `ApiError` + RFC 7807 (violates CQ-2)
4. **Missing Backend Tests**: No backend unit tests for teleodonto controller
5. **Hardcoded Stats**: Dashboard shows static/mock statistics instead of real data
