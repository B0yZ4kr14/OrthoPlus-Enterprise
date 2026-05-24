# Backend `as any` Audit Report

**Date**: 2026-05-24
**Scope**: `backend/src/modules/**/*.ts`
**Total instances**: 323
**Constitution reference**: CQ-2 (No new `as any`)

---

## Summary by Module

| Module | Count | % of Total |
|--------|-------|------------|
| financeiro | 41 | 12.7% |
| pep | 34 | 10.5% |
| analytics | 20 | 6.2% |
| comm | 18 | 5.6% |
| tiss | 17 | 5.3% |
| bi | 17 | 5.3% |
| marketing | 16 | 5.0% |
| teleodonto | 15 | 4.6% |
| admin_tools | 14 | 4.3% |
| split_pagamento | 11 | 3.4% |
| notifications | 11 | 3.4% |
| files | 11 | 3.4% |
| faturamento | 11 | 3.4% |
| contratos | 10 | 3.1% |
| crm | 10 | 3.1% |
| inadimplencia | 8 | 2.5% |
| fidelidade | 8 | 2.5% |
| funcionarios | 7 | 2.2% |
| procedimentos | 6 | 1.9% |
| memory_hub | 6 | 1.9% |
| lgpd | 6 | 1.9% |
| crypto_config | 4 | 1.2% |
| configuracoes | 4 | 1.2% |
| pacientes | 3 | 0.9% |
| ia_radiografia | 3 | 0.9% |
| pdv | 2 | 0.6% |
| inventario | 2 | 0.6% |
| auth | 2 | 0.6% |
| ai | 1 | 0.3% |

---

## Pattern Analysis

### Primary Pattern: Request Body Casting

~85% of instances follow this pattern:

```typescript
const data = req.body as any
const filter = req.query.status as any
```

**Root cause**: Controllers cast request data to bypass TypeScript strictness instead of using proper Zod validation.

### Secondary Pattern: Prisma Result Casting

~10% of instances:

```typescript
const appointments = await prisma.appointments.findMany({...}) as any
```

**Root cause**: Prisma queries return complex types not properly typed in controllers.

---

## Top 10 Files

| Rank | File | Count | Module |
|------|------|-------|--------|
| 1 | FinanceiroController.ts | 40 | financeiro |
| 2 | router.ts (pep) | 34 | pep |
| 3 | analyticsController.ts | 20 | analytics |
| 4 | CommController.ts | 18 | comm |
| 5 | controller.ts (tiss) | 17 | tiss |
| 6 | controller.ts (bi) | 17 | bi |
| 7 | controller.ts (marketing) | 16 | marketing |
| 8 | controller.ts (teleodonto) | 14 | teleodonto |
| 9 | controller.ts (admin_tools) | 14 | admin_tools |
| 10 | gamificationWorker.ts | 10 | faturamento |

---

## Risk Assessment

| Severity | Count | Criteria |
|----------|-------|----------|
| High | ~200 | Controllers handling user input |
| Medium | ~80 | Service/worker logic |
| Low | ~43 | Internal utilities, mocks |

---

## Recommendations

1. **Immediate**: Pacientes (3) + Auth (2) — maintain as clean examples
2. **Sprint 1**: FinanceiroController.ts (40) + PEP router.ts (34) — add Zod schemas
3. **Sprint 2**: Top 10 files — systematic removal
4. **Medium-term**: Typed Request wrapper or consistent zod.parse()
5. **CI Gate**: Fail PR if `as any` count increases
6. **Target**: Reduce from 323 -> <100 over next quarter

---

## Constitution Compliance

| Principle | Status |
|-----------|--------|
| CQ-2 (No new `as any`) | Violated — 323 existing. No new ones added recently. |
| CQ-1 (TypeScript strictness) | Partial — compiles but relies heavily on `as any`. |
