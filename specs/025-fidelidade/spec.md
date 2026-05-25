# Feature Specification: Fidelidade (Programa de Fidelidade)

**Feature Branch**: `feat/025-fidelidade`

**Created**: 2026-05-24

**Status**: Migrated (reverse-engineered from existing implementation)

**Input**: Existing fidelidade module in backend and frontend

---

## Overview

Programa de Fidelidade rewards loyal patients with points, badges, and benefits. It tracks patient points, manages badge unlocks, handles reward redemptions, and processes referrals.

---

## User Scenarios & Testing

### User Story 1 — Gerenciar Pontos e Badges (Priority: P1)

A administradora atribui pontos a pacientes por consultas e verifica badges desbloqueados.

**Why this priority**: Core loyalty mechanics — points and badges drive patient engagement.

**Independent Test**: Add points to a patient and verify badge unlock.

**Acceptance Scenarios**:

1. **Given** a patient exists, **When** staff adds points, **Then** the points balance is updated
2. **Given** a patient reaches a badge threshold, **When** points are added, **Then** the badge is unlocked
3. **Given** badges exist, **When** staff lists them, **Then** all badges for the clinic are returned

---

### User Story 2 — Recompensas e Indicacoes (Priority: P2)

Pacientes resgatam recompensas com pontos acumulados e indicam amigos para ganhar bonus.

**Why this priority**: Reward redemption and referrals complete the loyalty loop.

**Independent Test**: Create a reward redemption and a referral, verify both are tracked.

**Acceptance Scenarios**:

1. **Given** a patient has sufficient points, **When** they redeem a reward, **Then** points are deducted and redemption is recorded
2. **Given** a patient refers a friend, **When** the referral is registered, **Then** both parties receive referral bonus points
3. **Given** referrals exist, **When** staff lists them, **Then** status and rewards are visible

---

## Requirements

### Functional Requirements

- **FID-FR-001**: Points management (add, view balance, history)
- **FID-FR-002**: Badge system (create, unlock, list)
- **FID-FR-003**: Reward catalog and redemption
- **FID-FR-004**: Referral tracking with bonus points
- **FID-FR-005**: Clinic-scoped data access

### Non-Functional Requirements

- **FID-NFR-001**: Point transactions are atomic (no double-counting)
- **FID-NFR-002**: Badge calculations are idempotent

---

## Multi-Tenancy Requirements

- **MT-001**: All database queries MUST filter by `clinic_id`
- **MT-002**: Backend routes use `clinicGuard` middleware

---

## Database Requirements

- **DB-001**: `fidelidade_pacientes` — patient loyalty data
- **DB-002**: `fidelidade_pontos` — point transactions
- **DB-003**: `fidelidade_badges` — badge definitions
- **DB-004**: `fidelidade_recompensas` — reward catalog
- **DB-005**: `fidelidade_indicacoes` — referral tracking

---

## Frontend/Backend Split

- **API-001**: `GET /api/fidelidade/` — module status
- **API-002**: `GET /api/fidelidade/pontos` — get points
- **API-003**: `POST /api/fidelidade/pontos` — add points
- **API-004**: `GET /api/fidelidade/badges` — list badges
- **API-005**: `POST /api/fidelidade/badges` — create badge
- **API-006**: `GET /api/fidelidade/recompensas` — list rewards
- **API-007**: `POST /api/fidelidade/recompensas` — create reward
- **API-008**: `GET /api/fidelidade/indicacoes` — list referrals
- **API-009**: `POST /api/fidelidade/indicacoes` — create referral
- **FE-001**: ProgramaFidelidade component with tabs (badges, rewards, referrals, patients, config)

---

## Success Criteria

### Measurable Outcomes

- **FID-SC-001**: Point addition is atomic (no race conditions)
- **FID-SC-002**: Badge unlocks are calculated correctly
- **FID-SC-003**: All routes protected by `clinicGuard`

---

## Assumptions

- Points are assigned manually or via appointment triggers
- Badge thresholds are configured per clinic
- Rewards are clinic-defined (not global catalog)
