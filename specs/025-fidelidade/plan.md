# Implementation Plan: Fidelidade

**Branch**: `feat/025-fidelidade` | **Date**: 2026-05-24 | **Spec**: `specs/025-fidelidade/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

Fidelidade module manages patient loyalty programs with points, badges, rewards, and referrals. It spans backend API and frontend UI with tabbed interface.

---

## Architecture

### Frontend
- `ProgramaFidelidade` component with tabbed interface:
  - `PacientesTab` — patient loyalty profiles and point balances
  - `BadgesTab` — badge definitions and unlock conditions
  - `RecompensasTab` — reward catalog and redemption flow
  - `IndicacoesTab` — referral tracking and bonus allocation
  - `ConfigTab` — clinic-specific loyalty program settings (point rules, badge thresholds)
- `KPICards` showing active patients, top referrers, redemption rate
- Currently lives under `modules/marketing-auto/components/programa-fidelidade/` — may need dedicated `modules/fidelidade/` folder

### Backend
- Base path: `/api/fidelidade/*` with `authMiddleware` → `clinicGuard`
- `GET /api/fidelidade/` — module status
- `GET /api/fidelidade/pontos` — get patient point balance and history
- `POST /api/fidelidade/pontos` — add points (atomic transaction)
- `GET /api/fidelidade/badges` — list badges for clinic
- `POST /api/fidelidade/badges` — create badge definition
- `GET /api/fidelidade/recompensas` — list reward catalog
- `POST /api/fidelidade/recompensas` — create reward
- `POST /api/fidelidade/recompensas/:id/resgatar` — redeem reward (deduct points)
- `GET /api/fidelidade/indicacoes` — list referrals
- `POST /api/fidelidade/indicacoes` — register referral with bonus points

### Database
- `fidelidade_pacientes`: id, clinic_id, patient_id, points_balance, total_points_earned, total_redeemed, current_tier, created_at, updated_at
- `fidelidade_pontos`: id, clinic_id, patient_id, amount, type (EARNED, REDEEMED, BONUS, REFERRAL), source_id, description, created_at
- `fidelidade_badges`: id, clinic_id, name, description, icon, threshold_points, threshold_visits, is_active
- `fidelidade_recompensas`: id, clinic_id, name, description, points_cost, quantity_available, is_active
- `fidelidade_indicacoes`: id, clinic_id, referrer_patient_id, referred_patient_id, status, bonus_points_awarded, created_at, completed_at

## Technical Context

| Aspect | Value |
|--------|-------|
| **Language** | TypeScript 5.8 |
| **Dependencies** | Express 4, Prisma 6 |
| **Testing** | Jest (backend), Vitest (frontend) |

---

## Constitution Check

| Principle | Check | Status |
|-----------|-------|--------|
| **AP-1** clinicId + clinicGuard | All routes validate `req.user.clinicId` | ✅ Existing |
| **CQ-2** Error Handling | Uses ApiError pattern | ✅ Existing |

---

## Project Structure

```
backend/src/modules/fidelidade/
├── api/
│   ├── controller.ts      # FidelidadeController
│   └── router.ts          # Express routes with clinicGuard

apps/web/src/modules/marketing-auto/components/programa-fidelidade/
├── ProgramaFidelidade.tsx
├── BadgesTab.tsx
├── ConfigTab.tsx
├── IndicacoesTab.tsx
├── KPICards.tsx
├── PacientesTab.tsx
├── RecompensasTab.tsx
└── ...
```

---

## Gaps Identified

1. **⚠️ No backend tests** — Controller has 0 test coverage
2. **⚠️ Frontend scattered** — UI lives under `marketing-auto/` instead of dedicated `fidelidade/` module
3. **⚠️ Point atomicity** — Need to verify transaction safety for point operations
---

## Requirements Traceability

| Requirement | Plan Section | Coverage |
|-------------|--------------|----------|
| **FID-FR-001** | Points management (add, view balance, history) | ✅ Covered |
| **FID-FR-002** | Badge system (create, unlock, list) | ✅ Covered |
| **FID-FR-003** | Reward catalog and redemption | ✅ Covered |
| **FID-FR-004** | Referral tracking with bonus points | ✅ Covered |
| **FID-FR-005** | Clinic-scoped data access | ✅ Covered |

## Phases

### Phase 1: Foundation
- [ ] Task 1: Write backend unit tests for `FidelidadeController` (currently 0 test coverage)
- [ ] Task 2: Verify point transactions are atomic (use Prisma `$transaction` to prevent double-counting)
- [ ] Task 3: Ensure badge unlock calculations are idempotent (re-running calculation yields same result)

### Phase 2: Implementation
- [ ] Task 4: Migrate `ProgramaFidelidade` UI from `marketing-auto/` to dedicated `modules/fidelidade/` folder for proper separation
- [ ] Task 5: Add automatic point assignment triggers (e.g., on appointment completion)
- [ ] Task 6: Implement reward redemption flow with point deduction and inventory tracking
- [ ] Task 7: Add referral completion logic: when referred patient completes first appointment, award bonus to both parties

### Phase 3: Polish
- [ ] Task 8: Add E2E tests for points, badges, rewards, and referrals
- [ ] Task 9: Verify `clinicGuard` protects all fidelidade endpoints against cross-clinic access
- [ ] Task 10: Document badge threshold configuration and clinic-specific reward setup
