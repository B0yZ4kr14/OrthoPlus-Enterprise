# Plan: Analytics Dashboard

**Feature**: analytics
**Date**: 2026-05-24
**Spec**: [spec.md](spec.md)

---

## Architecture

### Backend
- **Controller**: `AnalyticsController` — endpoint `GET /api/analytics/overview`
- **Service**: Prisma aggregations via `$queryRaw` para metricas clinic-scoped
- **Router**: Express router com `clinicGuard` middleware

### Data Flow
```
GET /api/analytics/overview
  → clinicGuard (valida clinicId)
  → AnalyticsController.getDashboardOverview
  → Prisma aggregations (clinic_id filter)
  → JSON response { totalPatients, todayAppointments, monthlyRevenue, ... }
```

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Prisma `$queryRaw` | Aggregacoes complexas com multiplos COUNT/SUM |
| clinicGuard obrigatorio | GP-1: isolamento multi-tenant |
| Endpoint unico | MVP: overview consolidada; drill-down fora do escopo |

---

## Implementation Phases

### Phase 1: Core Endpoint
- [x] AnalyticsController com getDashboardOverview
- [x] Express router integration
- [x] Prisma queries clinic-scoped

### Phase 2: Validation
- [x] Testes unitarios (clinic isolation, query accuracy)
- [x] Integracao com router principal

---

## Files

| Path | Purpose |
|------|---------|
| `backend/src/modules/analytics/api/AnalyticsController.ts` | Controller |
| `backend/src/modules/analytics/api/router.ts` | Express router |
| `backend/src/modules/analytics/index.ts` | Module export |

---

## Status
✅ **Complete** — All tasks implemented and validated.
