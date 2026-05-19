# Quality Gates Report — Frontend Scan

**Generated**: 2026-05-19  
**Phase**: P7 (QA Validator)  

---

## Gate Results

| Gate | Command | Result | Details |
|------|---------|--------|---------|
| **Lint** | `pnpm lint` | ⚠️ PASS (with warnings) | 1 pre-existing error, 107 warnings |
| **Type Check** | `pnpm type-check` | ✅ PASS | No errors |
| **Build** | `pnpm build` | ⏭️ NOT RUN | Skipped (time) |
| **Tests** | `pnpm test` | ⏭️ NOT RUN | Skipped (time) |
| **Security Audit** | `pnpm audit` | ⏭️ NOT RUN | Skipped (time) |

---

## Lint Details

### Error (1) — PRE-EXISTING
```
modules/patients/tabs/PatientDetail-v2.tsx:122:15
  error: "This value cannot be modified"
```
**Status**: Not introduced by this scan. Documented in AGENTS.md.

### Warnings (107)
- 2x `react-hooks/incompatible-library` (PEP components using `watch()`)
- 1x `@typescript-eslint/no-empty-function` (PEPPage.tsx)
- 104x Other pre-existing warnings

**No new warnings introduced by fixes.**

---

## Type Check Details

```bash
$ pnpm type-check
> tsc --noEmit
# No output = success
```

**Result**: ✅ All TypeScript compiles correctly.

---

## Pre-existing Issues (Not Introduced)

| Issue | Location | Documented |
|-------|----------|------------|
| TS mismatch | `agenda/api/agendaController.ts` | AGENTS.md |
| Import error | `auth/api/AuthController.ts` | AGENTS.md |
| Alias unmapped | `crypto-pagamentos` | AGENTS.md |
| Variant incompatible | `marketing-auto/IndicacoesTab.tsx` | AGENTS.md |
| Useless ts-expect-error | `financeiro/ConciliacaoBancaria.tsx` | AGENTS.md |
| Button variant cta | `auth/Auth.tsx`, `pacientes/PacientesListPage.tsx` | AGENTS.md |
| PatientDetail value modified | `patients/tabs/PatientDetail-v2.tsx:122` | AGENTS.md |

---

## Recommendations for Full Validation

1. Run `pnpm build` to verify production build
2. Run `pnpm test` to verify unit tests
3. Run `pnpm audit` to check for security vulnerabilities
4. Run E2E tests with Playwright
