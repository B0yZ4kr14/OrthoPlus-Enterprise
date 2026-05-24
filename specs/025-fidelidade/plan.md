# Implementation Plan: Fidelidade

**Branch**: `feat/025-fidelidade` | **Date**: 2026-05-24 | **Spec**: `specs/025-fidelidade/spec.md`

**Note**: This is a **migrated** plan — the feature already exists in the codebase.

---

## Summary

Fidelidade module manages patient loyalty programs with points, badges, rewards, and referrals. It spans backend API and frontend UI with tabbed interface.

---

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
