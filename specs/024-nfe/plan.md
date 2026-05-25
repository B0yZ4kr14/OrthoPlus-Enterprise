# Implementation Plan: NF-e

**Branch**: `feat/024-nfe` | **Date**: 2026-05-24 | **Spec**: `specs/024-nfe/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

NF-e module manages electronic invoices for Brazilian dental clinics. It provides CRUD operations, cancellation with audit trail, and status tracking.

---

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
