# Feature Specification: Marketing Automático

**Feature Branch**: `feat/022-marketing`

**Created**: 2026-05-24

**Status**: migrated

**Input**: Existing marketing module in backend and frontend

---

## Overview

Marketing Automático enables dental clinics to create, manage, and execute marketing campaigns. It includes campaign management (CRUD), send tracking, patient recall automation, trigger-based marketing, and a loyalty program (fidelidade) with badges, rewards, and referrals.

---

## User Scenarios & Testing

### User Story 1 — Gerenciar Campanhas (Priority: P1)

A administradora da clínica cria campanhas de marketing (email, SMS, WhatsApp), define público-alvo, agenda envios e acompanha métricas.

**Why this priority**: Core functionality — campaign management is the foundation of all marketing features.

**Independent Test**: Create a campaign via API and verify it appears in the list with correct clinic scoping.

**Acceptance Scenarios**:

1. **Given** clinic staff accesses marketing module, **When** they create a campaign with name, type, channel, and dates, **Then** the campaign is saved with status `RASCUNHO`
2. **Given** a campaign exists, **When** staff updates its description or dates, **Then** changes are persisted
3. **Given** a campaign is no longer needed, **When** staff deletes it, **Then** it is removed and associated sends are handled

---

### User Story 2 — Rastrear Envios e Recalls (Priority: P2)

O sistema envia comunicações para pacientes e rastreia entregas. Recalls automáticos lembram pacientes de retornos e checkups.

**Why this priority**: Execution layer — turns campaigns into actual patient communication.

**Independent Test**: Create an envio, verify status tracking; create a recall, verify scheduled notification.

**Acceptance Scenarios**:

1. **Given** a campaign exists, **When** the system creates an envio for a patient, **Then** the send record tracks status (pending, sent, delivered, failed)
2. **Given** a patient is due for a recall, **When** the recall date arrives, **Then** a notification is queued via the configured method (email/SMS/WhatsApp)
3. **Given** recalls are processed, **When** admin triggers batch processing, **Then** all pending recalls are evaluated and notifications sent

---

### User Story 3 — Programa de Fidelidade (Priority: P2)

A clínica recompensa pacientes fiéis com pontos, badges e benefícios. Indicações de novos pacientes geram recompensas.

**Why this priority**: Patient retention and word-of-mouth growth.

**Independent Test**: Add points to a patient, verify badge unlock, process a referral.

**Acceptance Scenarios**:

1. **Given** a patient has accumulated points, **When** they reach a threshold, **Then** a badge is unlocked and displayed
2. **Given** a patient refers a friend, **When** the friend completes first appointment, **Then** both receive referral rewards
3. **Given** admin views fidelidade dashboard, **When** KPIs are loaded, **Then** stats show active patients, top referrers, and redemption rate

---

## Requirements

### Functional Requirements

- **MKT-FR-001**: CRUD operations for marketing campaigns (name, type, channel, dates, audience, status)
- **MKT-FR-002**: Send tracking (envios) with status lifecycle (pending → sent → delivered → failed)
- **MKT-FR-003**: Recall automation with scheduled notifications and batch processing
- **MKT-FR-004**: Trigger-based marketing (process triggers automatically)
- **MKT-FR-005**: Loyalty program with points, badges, rewards, and referrals
- **MKT-FR-006**: Campaign metrics dashboard (sends, opens, conversions)
- **MKT-FR-007**: Clinic-scoped data access — all queries filter by `clinic_id`

### Non-Functional Requirements

- **MKT-NFR-001**: Batch recall processing supports 1000+ recalls per run
- **MKT-NFR-002**: Campaign creation < 300ms response time
- **MKT-NFR-003**: Send tracking is asynchronous (non-blocking)

---

## Multi-Tenancy Requirements

- **MT-001**: All database queries MUST filter by `clinic_id`
- **MT-002**: Backend routes use `clinicGuard` middleware
- **MT-003**: Cross-clinic campaign access is blocked at API level

---

## Database Requirements

- **DB-001**: `marketing_campaigns` — campaign records
- **DB-002**: `marketing_campaign_sends` (envios) — send tracking
- **DB-003**: `marketing_recalls` — recall scheduling
- **DB-004**: `marketing_triggers` — trigger definitions
- **DB-005**: `fidelidade_pacientes` — loyalty program data

---

## Frontend/Backend Split

- **API-001**: `GET /api/marketing/campanhas` — list campaigns
- **API-002**: `GET /api/marketing/campanhas/:id` — get campaign
- **API-003**: `POST /api/marketing/campanhas` — create campaign
- **API-004**: `PATCH /api/marketing/campanhas/:id` — update campaign
- **API-005**: `DELETE /api/marketing/campanhas/:id` — delete campaign
- **API-006**: `GET /api/marketing/envios` — list sends
- **API-007**: `POST /api/marketing/envios` — create send
- **API-008**: `GET /api/marketing/recalls` — list recalls
- **API-009**: `POST /api/marketing/recalls` — create recall
- **API-010**: `POST /api/marketing/triggers/process` — process triggers
- **API-011**: `POST /api/marketing/recalls/process` — process recalls batch
- **FE-001**: Campaign management UI, metrics dashboard, loyalty program tabs
- **FE-002**: Use cases: `ListCampaignsUseCase`, `CreateCampaignUseCase`, `GetCampaignMetricsUseCase`, etc.

---

## Success Criteria

### Measurable Outcomes

- **MKT-SC-001**: All 11 API endpoints respond with < 300ms p95
- **MKT-SC-002**: All routes protected by `clinicGuard`
- **MKT-SC-003**: Batch recall processing handles 1000 records without timeout
- **MKT-SC-004**: Campaign send tracking is asynchronous (non-blocking API)

### Post-Launch KPIs

- **KPI-001**: 30% of clinics create at least one campaign within 30 days
- **KPI-002**: Recall automation reduces no-show rate by 15%
- **KPI-003**: Loyalty program increases patient retention by 10%

---

## Assumptions

- Email/SMS/WhatsApp delivery is handled by external providers (not built-in)
- Campaign metrics (opens, clicks) depend on external provider webhooks
- Loyalty points are manually assigned or triggered by appointments
- Referral tracking requires patient identification at first visit
