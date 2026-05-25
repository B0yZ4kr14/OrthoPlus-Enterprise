# Plan: BI Dashboards

**Feature**: bi
**Date**: 2026-05-24
**Spec**: [spec.md](spec.md)

---

## Architecture

### Backend
- **Controller**: `BIController` — CRUD endpoints para dashboards e widgets
- **Schemas**: Zod validation para dashboard e widget payloads
- **Router**: Express router com `clinicGuard` middleware

### Data Model
```
Dashboard: { id, name, description, config, clinic_id, created_at, updated_at }
Widget: { id, dashboard_id, type, config, position, clinic_id, created_at, updated_at }
```

### Endpoints
- `GET /api/bi/dashboards` — listar dashboards da clinica
- `GET /api/bi/dashboards/:id` — obter dashboard com widgets
- `POST /api/bi/dashboards` — criar dashboard
- `PUT /api/bi/dashboards/:id` — atualizar dashboard
- `DELETE /api/bi/dashboards/:id` — remover dashboard
- `GET /api/bi/dashboards/:id/widgets` — listar widgets
- `POST /api/bi/dashboards/:id/widgets` — criar widget
- `PUT /api/bi/widgets/:id` — atualizar widget
- `DELETE /api/bi/widgets/:id` — remover widget

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Nested resources | Widgets pertencem a um dashboard; rotas aninhadas |
| Zod schemas | CQ-1: validacao estrita de payloads |
| clinicGuard em todas as rotas | GP-1: isolamento multi-tenant |
| Config JSON | Flexibilidade para tipos de widget futuros |

---

## Implementation Phases

### Phase 1: Dashboard CRUD
- [x] BIController com endpoints de dashboard
- [x] Zod schemas para validacao
- [x] Express router integration

### Phase 2: Widget CRUD
- [x] Endpoints de widget (nested e flat)
- [x] Validacao de posicao e tipo

### Phase 3: Validation
- [x] Testes unitarios (clinic isolation, CRUD operations)
- [x] Integracao com router principal

---

## Files

| Path | Purpose |
|------|---------|
| `backend/src/modules/bi/api/BIController.ts` | Controller |
| `backend/src/modules/bi/api/router.ts` | Express router |
| `backend/src/modules/bi/schemas.ts` | Zod schemas |
| `backend/src/modules/bi/index.ts` | Module export |

---

## Status
✅ **Complete** — All tasks implemented and validated.
---

## Requirements Traceability

| Requirement | Description | Coverage |
|-------------|-------------|----------|
| **BID-FR-1** | CRUD de Dashboards | ✅ Covered |
| **BID-FR-2** | CRUD de Widgets | ✅ Covered |
| **BID-FR-3** | Clinic Context Isolation | ✅ Covered |
