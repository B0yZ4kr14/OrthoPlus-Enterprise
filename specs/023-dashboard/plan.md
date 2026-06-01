# Implementation Plan: Dashboard

**Branch**: `feat/023-dashboard` | **Date**: 2026-05-24 | **Spec**: `specs/023-dashboard/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

Dashboard module provides a consolidated clinic overview with Redis caching. It aggregates data from patients, appointments, and financial modules into a single cached endpoint.

---

## Architecture

### Frontend
- Dashboard page at `/dashboard` with KPI cards (pacientes ativos, consultas do dia, receita, tendências)
- Charts and trends using Recharts for visual analytics
- Clinic switcher that refreshes all widgets with selected clinic data
- Redis cache indicator showing data freshness

### Backend
- Base path: `/api/dashboard/*` with `authMiddleware` → `clinicGuard` → `cacheRoute`
- `GET /api/dashboard/` — root overview with basic clinic stats
- `GET /api/dashboard/overview` — consolidated data aggregation from patients, appointments, and financial modules with Redis caching (60s TTL)
- Cache keys include `clinicId` to prevent cross-clinic data leakage
- Fallback to direct DB query if Redis is unavailable

### Database
- No dedicated dashboard tables — data is aggregated at query time from:
  - `patients` (count, active status)
  - `appointments` (today's count, status breakdown)
  - Financial tables (receita, transactions)
- Redis cache stores serialized aggregation results per clinic

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

## Phases

### Phase 1: Foundation
- [ ] Task 1: Write backend unit tests for `DashboardController` (currently 0 test coverage)
- [ ] Task 2: Add graceful degradation when Redis is unavailable (fallback to direct DB query with circuit breaker)
- [ ] Task 3: Verify cache keys are scoped by `clinicId` to prevent cross-clinic data leakage

### Phase 2: Implementation
- [ ] Task 4: Add Prometheus metrics for cache hit/miss rates and dashboard endpoint latency
- [ ] Task 5: Optimize aggregation queries for clinics with 10k+ patients (add materialized view or query optimization)
- [ ] Task 6: Add trend comparison widgets (week-over-week, month-over-month)

### Phase 3: Polish
- [ ] Task 7: Add E2E tests for dashboard page with clinic switching
- [ ] Task 8: Verify response times: <500ms cached, <2s cache miss
- [ ] Task 9: Document dashboard data sources and cache invalidation strategy
