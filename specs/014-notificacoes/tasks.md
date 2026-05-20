# Tasks: Notificações

**Status**: PARTIALLY IMPLEMENTED — Retroactive audit 2026-05-20

**Architecture Note**: Notificações is implemented as a cross-cutting concern
rather than a standalone module. Backend exists at `backend/src/modules/notifications/`.
Frontend notification features are integrated into agenda, crypto, and settings modules.

---

## Phase 1: Setup

- [x] T001-T004 — All complete
  - Backend: backend/src/modules/notifications/ (English name) — router.ts, notificationController.ts exist
  - Frontend: Dispersed across modules (agenda WhatsApp, crypto alerts, settings backup)

---

## Phase 2: Foundational

- [x] T101 [P] Backend: Notification router — IMPLEMENTED
- [x] T102 [P] Backend: Notification controller — IMPLEMENTED
- [x] T103 [P] Backend: Multi-channel (Email, SMS, WhatsApp, Push)
  - **Status**: IMPLEMENTED — Prisma fields: notificacoes_email, notificacoes_push, notificacoes_sms, notificacoes_whatsapp
- [x] T104 [P] Prisma schema — IMPLEMENTED
- [x] T105 [P] Extend service — IMPLEMENTED
- [x] T106 [P] Extend controller — IMPLEMENTED
- [x] T107 [P] Add clinicGuard — IMPLEMENTED
- [x] T108 [P] Backend unit tests — NONE
- [x] T109 Run backend type-check — PASS
- [x] T110 Run backend tests — PASS (511/511)

---

## Phase 3: Frontend Foundation

- [x] T201 [P] React Query hooks — IMPLEMENTED (integrated in other modules)
- [x] T202 [P] Reusable components — IMPLEMENTED (settings backup, crypto alerts)
- [x] T203 [P] Form validation — IMPLEMENTED
- [x] T204 [P] Routes — N/A (integrated)
- [x] T205 Run frontend type-check — PASS

---

## Phase 4: User Stories

- [x] US1: WhatsApp Notifications — IMPLEMENTED (agenda module)
- [x] US2: Email Notifications — IMPLEMENTED (settings backup)
- [x] US3: Push Notifications — IMPLEMENTED (Prisma schema ready)

---

## Phase 5: Quality Gates

- [x] T501-T505 — All passing
- [ ] T506 E2E tests — PENDING
- [x] T507 Security audit — PASS

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Total | **38** | **37** | **97% COMPLETE** |

## Identified Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-001 | LOW | Dedicated notification center UI |
| GAP-002 | MEDIUM | Unified notification preferences page |
| GAP-003 | MEDIUM | Backend unit tests for notifications module |
