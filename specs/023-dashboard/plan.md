# Implementation Plan: Dashboard

**Branch**: `feat/023-dashboard` | **Date**: 2026-05-24 | **Spec**: `specs/023-dashboard/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

Dashboard module provides a consolidated clinic overview with Redis caching. It aggregates data from patients, appointments, and financial modules into a single cached endpoint.

---

## Technical Context

| Aspect | Value |
|--------|-------|
| **Language** | TypeScript 5.8 |
| **Dependencies** | Express 4, Redis (cacheRoute) |
| **Testing** | Jest (backend), Vitest (frontend) |
| **Cache** | Redis with 60s TTL |

---

## Constitution Check

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing |
| **CQ-2** Error Handling | Uses ApiError pattern | ✅ Existing |
| **INF-2** Observability | Cache metrics emitted | 🔍 Enforce |

---

## Project Structure

```
backend/src/modules/dashboard/
├── api/
│   └── router.ts          # Express routes with clinicGuard + cacheRoute
└── controllers/
    └── DashboardController.ts

apps/web/src/modules/dashboard/
└── [dashboard UI components]
```

---

## Gaps Identified

1. **⚠️ No backend tests** — DashboardController has 0 test coverage
2. **⚠️ Graceful degradation** — Router returns 503 when DB is unavailable; no retry logic
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **DSH-FR-001** | Consolidated overview endpoint aggregating patient... | ✅ Covered |
| **DSH-FR-002** | Redis caching (60s TTL) per clinic to reduce datab... | ✅ Covered |
| **DSH-FR-003** | Clinic-scoped data access — all queries filter by ... | ✅ Covered |
