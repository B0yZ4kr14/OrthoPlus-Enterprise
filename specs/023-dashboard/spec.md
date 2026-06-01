# Feature Specification: Dashboard

**Feature Branch**: `feat/023-dashboard`

**Created**: 2026-05-24

**Status**: migrated

**Input**: Existing dashboard module in backend and frontend

---

## Overview

Dashboard provides consolidated clinic overview with KPIs, metrics, and visual analytics. It aggregates data from multiple modules (patients, appointments, finances) into a single cached view for quick access.

---

## User Scenarios & Testing

### User Story 1 — Visualizar Overview da Clinica (Priority: P1)

O dentista ou administrador acessa o dashboard e visualiza metricas consolidadas da clinica: pacientes ativos, consultas do dia, receita, e tendencias.

**Why this priority**: Primary entry point for clinic staff — provides at-a-glance operational visibility.

**Independent Test**: Access dashboard endpoint and verify data aggregation from multiple sources.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they access the dashboard, **Then** they see clinic-scoped overview data
2. **Given** dashboard data is loaded, **When** viewed again within 60 seconds, **Then** data is served from Redis cache
3. **Given** multiple clinics exist, **When** a user switches clinics, **Then** dashboard shows data for the selected clinic only

---

## Requirements

### Functional Requirements

- **DSH-FR-001**: Consolidated overview endpoint aggregating patients, appointments, and financial data
- **DSH-FR-002**: Redis caching (60s TTL) per clinic to reduce database load
- **DSH-FR-003**: Clinic-scoped data access — all queries filter by `clinic_id`

### Non-Functional Requirements

- **DSH-NFR-001**: Response time < 500ms for cached data, < 2s for cache miss
- **DSH-NFR-002**: Dashboard supports clinics with 10k+ patients

---

## Multi-Tenancy Requirements

- **MT-001**: All database queries MUST filter by `clinic_id`
- **MT-002**: Backend routes use `clinicGuard` middleware
- **MT-003**: Cache keys include clinicId to prevent cross-clinic data leakage

---

## Frontend/Backend Split

- **API-001**: `GET /api/dashboard/` — root overview (cached)
- **API-002**: `GET /api/dashboard/overview` — consolidated data (cached)
- **FE-001**: Dashboard page with KPI cards, charts, and trends

---

## Success Criteria

### Measurable Outcomes

- **DSH-SC-001**: Overview endpoint responds < 500ms when cached
- **DSH-SC-002**: Cache miss responds < 2s
- **DSH-SC-003**: All routes protected by `clinicGuard`

---

## Assumptions

- Dashboard aggregates data from existing modules (does not store its own data)
- Redis is available for caching; fallback to direct DB query if Redis unavailable
