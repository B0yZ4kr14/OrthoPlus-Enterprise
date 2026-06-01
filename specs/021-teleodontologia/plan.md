# Implementation Plan: Teleodontologia

**Branch**: `feat/021-teleodontologia` | **Date**: 2026-05-24 | **Spec**: `specs/021-teleodontologia/spec.md`

**Input**: Feature specification from `/specs/021-teleodontologia/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase. This document reverse-engineers the implementation approach.

---

## Summary

Teleodontologia module provides remote dental consultation capabilities including teleconsultation scheduling, video session management, clinical notes, and digital prescriptions. The implementation spans backend (Express + Prisma), frontend (React + Tailwind), and database (3 teleodonto tables).

---

## Architecture

### Frontend
- `TeleodontoDashboard` — overview with teleconsultation statistics (sessions today, average duration, completion rate)
- `TeleodontoSessionList` — list of teleconsultations with status filters
- `TeleodontoScheduler` — schedule teleconsultation between dentist and patient
- `TeleconsultaForm` — create/edit teleconsultation (title, reason, type, scheduled date, patient, dentist)
- `TriagemForm` — pre-session triage data capture
- `PrescricaoRemotaForm` — digital prescription with medications (name, dosage, frequency, duration, instructions)
- `VideoRoom` — external video service link generation (not embedded WebRTC)
- Hooks: `useTeleconsultas.ts`, `useTeleodontologia.ts`
- Types: `teleodontologia.types.ts`

### Backend
- Base path: `/api/teleodonto/*` with `authMiddleware` → `clinicGuard`
- `GET /api/teleodonto/teleconsultas` — list with filters (status, dentist_id)
- `GET /api/teleodonto/teleconsultas/:id` — get single teleconsultation
- `POST /api/teleodonto/teleconsultas` — create teleconsultation
- `PATCH /api/teleodonto/teleconsultas/:id` — update teleconsultation
- `DELETE /api/teleodonto/teleconsultas/:id` — delete/cancel teleconsultation
- `POST /api/teleodonto/sessions/start` — start session (status → EM_ANDAMENTO)
- `POST /api/teleodonto/sessions/end` — end session with notes (status → CONCLUIDA, duration recorded)
- `POST /api/teleodonto/notes` — add clinical notes (diagnosis, recommendations)
- `POST /api/teleodonto/prescriptions` — create digital prescription

### Database
- `teleconsultas`: id, clinic_id, patient_id, dentist_id, title, reason, type, scheduled_date, status (AGENDADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA)
- `teleodonto_sessions`: id, teleconsulta_id, start_time, end_time, duration_seconds, status, notes
- `teleodonto_chat`: id, session_id, sender_id, message, timestamp
- `teleodonto_files`: id, session_id, file_name, storage_path, uploaded_by, uploaded_at

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
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **TEL-FR-001** | CRUD operations for teleconsultations (title, reas... | ✅ Covered |
| **TEL-FR-002** | Session lifecycle management (start, end, duration... | ✅ Covered |
| **TEL-FR-003** | Clinical notes capture (notes, diagnosis, recommen... | ✅ Covered |
| **TEL-FR-004** | Digital prescription with medication list (name, d... | ✅ Covered |
| **TEL-FR-005** | Dashboard with teleconsultation statistics (sessio... | ✅ Covered |
| **TEL-FR-006** | Video room integration (link generation for extern... | ✅ Covered |
| **TEL-FR-007** | Clinic-scoped data access — all queries filter by ... | ✅ Covered |

## Phases

### Phase 1: Foundation
- [ ] Task 1: Extract controller business logic into service layer (fix architecture drift — controller uses Prisma directly)
- [ ] Task 2: Remove `as any` casts from controller and enforce strict TypeScript compliance
- [ ] Task 3: Replace raw `res.status(500)` with `ApiError` + RFC 7807 Problem Details

### Phase 2: Implementation
- [ ] Task 4: Add backend unit tests for `TeleodontoController` covering CRUD, session lifecycle, and prescriptions
- [ ] Task 5: Implement real statistics in `TeleodontoDashboard` (replace static/mock data with aggregated queries)
- [ ] Task 6: Add clinical notes and prescription retrieval endpoints (`GET /api/teleodonto/notes/:teleconsultaId`, `GET /api/teleodonto/prescriptions/:teleconsultaId`)
- [ ] Task 7: Verify LGPD compliance: all clinical data encrypted at rest, audit trail for session access

### Phase 3: Polish
- [ ] Task 8: Add rate limiting to teleconsultation endpoints
- [ ] Task 9: Write E2E tests for video session flow (start → notes → prescription → end)
- [ ] Task 10: Document external video service integration and link generation logic
