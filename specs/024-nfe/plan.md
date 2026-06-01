# Implementation Plan: NF-e

**Branch**: `feat/024-nfe` | **Date**: 2026-05-24 | **Spec**: `specs/024-nfe/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

NF-e module manages electronic invoices for Brazilian dental clinics. It provides CRUD operations, cancellation with audit trail, and status tracking.

---

## Architecture

### Frontend
- NF-e list page with filters by status (RASCUNHO, EMITIDA, CANCELADA, REJEITADA)
- NF-e creation form with patient selection, procedure, value, and fiscal data
- NF-e cancellation UI with reason input and confirmation
- Status badges and audit trail viewer

### Backend
- Base path: `/api/nfe/*` with `authMiddleware` → `clinicGuard`
- `GET /api/nfe/status` — module status and health check
- `GET /api/nfe/` — list NF-e records with filters
- `GET /api/nfe/:id` — get NF-e by ID with full fiscal data
- `POST /api/nfe/` — create NF-e (status: RASCUNHO)
- `PATCH /api/nfe/:id` — update NF-e (only while status is RASCUNHO)
- `POST /api/nfe/:id/cancelar` — cancel NF-e with reason and timestamp (creates immutable audit record)

### Database
- `nfe_notas_fiscais`: id, clinic_id, patient_id, procedure_id, valor, status (RASCUNHO, EMITIDA, CANCELADA, REJEITADA), fiscal_data JSON, created_at, updated_at, cancelled_at, cancellation_reason
- Audit trail for cancellations stored as separate records or JSON log

## Technical Context

| Aspect | Value |
|--------|-------|
| **Language** | TypeScript 5.8 |
| **Dependencies** | Express 4, Prisma 6 |
| **Testing** | Jest (backend) |

---

## Constitution Check

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing |
| **CQ-2** Error Handling | Uses ApiError pattern | ✅ Existing |
| **GP-4** Immutable Financial Records | Cancellations create audit records | ✅ Existing |

---

## Project Structure

```
backend/src/modules/nfe/
├── api/
│   ├── controller.ts      # NFeController
│   ├── router.ts          # Express routes with clinicGuard
│   └── schemas.ts         # Zod validation schemas
└── [repositories/services if present]
```

---

## Gaps Identified

1. **⚠️ No backend tests** — Controller has 0 test coverage
2. **⚠️ No frontend** — Backend-only module; no frontend UI detected
3. **⚠️ Architecture drift** — Controller may use Prisma directly
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **NFE-FR-001** | CRUD operations for NF-e records | ✅ Covered |
| **NFE-FR-002** | NF-e cancellation with reason and audit trail | ✅ Covered |
| **NFE-FR-003** | Status tracking (RASCUNHO, EMITIDA, CANCELADA, REJ... | ✅ Covered |
| **NFE-FR-004** | Clinic-scoped data access | ✅ Covered |

## Phases

### Phase 1: Foundation
- [ ] Task 1: Write backend unit tests for `NFeController` (currently 0 test coverage)
- [ ] Task 2: Extract controller business logic into service layer (fix architecture drift — controller may use Prisma directly)
- [ ] Task 3: Verify NF-e cancellation creates immutable audit record and prevents modification after issuance

### Phase 2: Implementation
- [ ] Task 4: Build frontend NF-e list, creation form, and cancellation UI if not present
- [ ] Task 5: Add Zod validation schemas for fiscal data payload
- [ ] Task 6: Integrate with external SEFAZ service for NF-e XML generation and transmission (v2 scope)

### Phase 3: Polish
- [ ] Task 7: Verify all CRUD endpoints respond <300ms p95
- [ ] Task 8: Add E2E tests for NF-e creation and cancellation flow
- [ ] Task 9: Document SEFAZ integration assumptions and external service dependencies
