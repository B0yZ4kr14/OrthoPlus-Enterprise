# Feature Specification: NF-e (Nota Fiscal Eletronica)

**Feature Branch**: `feat/024-nfe`

**Created**: 2026-05-24

**Status**: migrated

**Input**: Existing nfe module in backend

---

## Overview

NF-e (Nota Fiscal Eletronica) manages electronic invoices for dental services. It handles invoice creation, status tracking, cancellation, and integration with Brazilian tax authorities (SEFAZ).

---

## User Scenarios & Testing

### User Story 1 — Emitir NF-e (Priority: P1)

A administradora da clinica emite uma nota fiscal eletronica para um procedimento odontologico, informando paciente, valor, e dados fiscais.

**Why this priority**: Legal requirement for invoicing dental services in Brazil.

**Independent Test**: Create an NF-e and verify it is stored with correct fiscal data.

**Acceptance Scenarios**:

1. **Given** a patient and procedure exist, **When** staff creates an NF-e with required fiscal data, **Then** the invoice is stored with status `RASCUNHO`
2. **Given** an NF-e has errors, **When** staff updates it, **Then** changes are validated and persisted
3. **Given** an NF-e was issued incorrectly, **When** staff cancels it, **Then** cancellation is recorded with reason and timestamp

---

## Requirements

### Functional Requirements

- **NFE-FR-001**: CRUD operations for NF-e records
- **NFE-FR-002**: NF-e cancellation with reason and audit trail
- **NFE-FR-003**: Status tracking (RASCUNHO, EMITIDA, CANCELADA, REJEITADA)
- **NFE-FR-004**: Clinic-scoped data access

### Non-Functional Requirements

- **NFE-NFR-001**: NF-e data must be immutable after issuance (cancellations create new records)
- **NFE-NFR-002**: Response time < 300ms for CRUD operations

---

## Multi-Tenancy Requirements

- **MT-001**: All database queries MUST filter by `clinic_id`
- **MT-002**: Backend routes use `clinicGuard` middleware

---

## Database Requirements

- **DB-001**: `nfe_notas_fiscais` — NF-e records with fiscal data

---

## Frontend/Backend Split

- **API-001**: `GET /api/nfe/status` — module status
- **API-002**: `GET /api/nfe/` — list NF-e records
- **API-003**: `GET /api/nfe/:id` — get NF-e by ID
- **API-004**: `POST /api/nfe/` — create NF-e
- **API-005**: `PATCH /api/nfe/:id` — update NF-e
- **API-006**: `POST /api/nfe/:id/cancelar` — cancel NF-e
- **FE-001**: NF-e list, creation form, cancellation UI (if applicable)

---

## Success Criteria

### Measurable Outcomes

- **NFE-SC-001**: All 6 API endpoints respond with < 300ms p95
- **NFE-SC-002**: All routes protected by `clinicGuard`
- **NFE-SC-003**: Cancellation creates immutable audit record

---

## Assumptions

- SEFAZ integration is handled by external service (not built-in)
- NF-e XML generation is out of scope for this module
- Digital certificate management is handled externally
