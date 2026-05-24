# Feature Specification: Teleodontologia

**Feature Branch**: `feat/021-teleodontologia`

**Created**: 2026-05-24

**Status**: Migrated (reverse-engineered from existing implementation)

**Input**: Existing teleodontologia module in backend and frontend

---

## Overview

Teleodontologia (Teledentistry) enables remote dental consultations through video sessions, chat, file sharing, and digital prescriptions. Dentists can schedule teleconsultations, conduct video sessions with patients, take clinical notes, and generate prescriptions remotely.

---

## User Scenarios & Testing

### User Story 1 — Agendar Teleconsulta (Priority: P1)

A recepcionista agenda uma teleconsulta entre um dentista e um paciente, definindo data, motivo e tipo de consulta.

**Why this priority**: Core functionality — without scheduling, no teleconsultation can occur.

**Independent Test**: Create a teleconsultation via API and verify it appears in the list.

**Acceptance Scenarios**:

1. **Given** a patient and dentist exist in the clinic, **When** staff schedules a teleconsultation with title, reason, type, and date, **Then** the teleconsultation is created with status `AGENDADA`
2. **Given** a teleconsultation exists, **When** staff updates the date or reason, **Then** the changes are persisted and returned
3. **Given** a teleconsultation is cancelled, **When** staff deletes it, **Then** it is removed from active lists

---

### User Story 2 — Conduzir Sessão de Vídeo (Priority: P2)

O dentista inicia uma sessão de vídeo com o paciente no horário agendado, conduz a consulta e encerra a sessão ao final.

**Why this priority**: The actual teleconsultation experience — builds on US1.

**Independent Test**: Start and end a session, verify duration and notes are recorded.

**Acceptance Scenarios**:

1. **Given** a teleconsultation is scheduled, **When** the dentist starts the session, **Then** a session record is created with status `EM_ANDAMENTO`
2. **Given** a session is active, **When** the dentist ends the session with notes, **Then** the session status becomes `CONCLUIDA` and duration is recorded
3. **Given** a session ended, **When** viewing the teleconsultation history, **Then** the session details (duration, notes) are visible

---

### User Story 3 — Emitir Prescrição e Anotações Clínicas (Priority: P2)

Durante ou após a teleconsulta, o dentista registra anotações clínicas e emite uma prescrição de medicamentos digital.

**Why this priority**: Clinical documentation is required for legal and medical record keeping.

**Independent Test**: Add notes and prescription to a teleconsultation, verify retrieval.

**Acceptance Scenarios**:

1. **Given** a teleconsultation exists, **When** the dentist adds clinical notes with diagnosis, **Then** the notes are stored and linked to the teleconsultation
2. **Given** a teleconsultation exists, **When** the dentist issues a prescription with medications (name, dosage, frequency, duration), **Then** the prescription is stored and can be retrieved
3. **Given** a prescription was issued, **When** viewing the patient record, **Then** the prescription appears in the patient's history

---

## Requirements

### Functional Requirements

- **FR-001**: CRUD operations for teleconsultations (title, reason, type, scheduled date, patient, dentist)
- **FR-002**: Session lifecycle management (start, end, duration tracking)
- **FR-003**: Clinical notes capture (notes, diagnosis, recommendations)
- **FR-004**: Digital prescription with medication list (name, dosage, frequency, duration, instructions)
- **FR-005**: Dashboard with teleconsultation statistics (sessions today, average duration, completion rate, satisfaction)
- **FR-006**: Video room integration (link generation for external video service)
- **FR-007**: Clinic-scoped data access — all queries filter by `clinic_id`

### Non-Functional Requirements

- **NFR-001**: Response time < 200ms for list operations
- **NFR-002**: Support up to 1000 teleconsultations per clinic
- **NFR-003**: All clinical data encrypted at rest (follows LGPD)

---

## Multi-Tenancy Requirements

- **MT-001**: All database queries MUST filter by `clinic_id`
- **MT-002**: Backend routes use `clinicGuard` middleware
- **MT-003**: Cross-clinic teleconsultation access is blocked at API level

---

## Database Requirements

- **DB-001**: `teleodonto_sessions` — session records (start, end, duration, status)
- **DB-002**: `teleodonto_chat` — chat messages during sessions
- **DB-003**: `teleodonto_files` — shared files during sessions
- **DB-004**: `teleconsultas` table (via Prisma, schema managed in `backend/prisma/schema.prisma`)

---

## Frontend/Backend Split

- **API-001**: `GET /api/teleodonto/teleconsultas` — list with filters (status, dentist_id)
- **API-002**: `GET /api/teleodonto/teleconsultas/:id` — get by ID
- **API-003**: `POST /api/teleodonto/teleconsultas` — create
- **API-004**: `PATCH /api/teleodonto/teleconsultas/:id` — update
- **API-005**: `DELETE /api/teleodonto/teleconsultas/:id` — delete
- **API-006**: `POST /api/teleodonto/sessions/start` — start session
- **API-007**: `POST /api/teleodonto/sessions/end` — end session
- **API-008**: `POST /api/teleodonto/notes` — add clinical notes
- **API-009**: `POST /api/teleodonto/prescriptions` — add prescription
- **FE-001**: Dashboard, session list, forms (teleconsulta, triagem, prescrição), video room
- **FE-002**: Hooks: `useTeleconsultas`, `useTeleodontologia`

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 9 API endpoints respond with < 200ms p95
- **SC-002**: All routes protected by `clinicGuard`
- **SC-003**: Zero new `as any` or `@ts-ignore` added
- **SC-004**: Prescription schema validates medication array (1-20 items)

### Post-Launch KPIs

- **KPI-001**: 80% of scheduled teleconsultations are completed within 30 days
- **KPI-002**: Average session duration tracked for dentist productivity insights

---

## Assumptions

- Video service integration is external (link-based, not embedded WebRTC)
- Patient and dentist must exist in the clinic before scheduling
- Prescriptions are digital records, not legally binding signed documents (v1 scope)
