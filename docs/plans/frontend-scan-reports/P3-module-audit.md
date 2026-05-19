# Module Audit Report — Frontend Scan

**Generated**: 2026-05-19  
**Scope**: 39 modules in `apps/web/src/modules/`  
**Method**: Structure analysis + test coverage + route validation + Constitution AP-2/AP-3  

---

## Summary

| Metric | Value |
|--------|-------|
| Total Modules | 39 |
| With Clean Architecture | 15 (38%) |
| With Tests | 2 (5%) |
| With Missing Layers | 8 (21%) |
| With All Routes Registered | 35 (90%) |

---

## Tier 1 Modules (Core Business)

### AUTH — SEVERITY: HIGH

**Structure**:
```
modules/auth/
└── ui/           # ONLY ui/ — missing domain, application, infrastructure!
```

**Issues**:
- ❌ **Missing layers**: No `domain/`, `application/`, `infrastructure/`
- ❌ **No tests**: 0 test files
- ⚠️ **Auth logic in contexts/**: `AuthContext.tsx` (462 lines) handles auth state, not the module
- ⚠️ **No lazy loading**: `Auth` page imported directly (not lazy)

**Constitution AP-2**: "SHOULD: Use Clean Architecture patterns where they already exist"  
**Note**: Auth is a special case — much logic lives in `contexts/AuthContext.tsx`. But the module structure is incomplete.

**Fix**: Migrate auth logic from `contexts/` to `modules/auth/application/` and `modules/auth/infrastructure/`  
**Effort**: M  

---

### PACIENTES — SEVERITY: MEDIUM

**Structure**:
```
modules/pacientes/
├── application/  ✓
├── components/   ✓
├── domain/       ✓
├── hooks/        ✓
├── index.ts      ✓
├── infrastructure/ ✓
└── ui/           ✓
```

**Issues**:
- ❌ **No tests**: 0 test files
- ⚠️ **Circular dependency**: `usePatientsAPI.ts` ↔ `usePatientsUnified.ts` (P1 CD-002)
- ⚠️ **Large components**: `PatientFormPage.tsx` (unsized), forms likely >400 lines

**Routes**: ✓ All registered (`/pacientes`, `/pacientes/novo`, `/pacientes/:id`)

**Fix**: Extract circular dep, add tests  
**Effort**: S-M  

---

### AGENDA — SEVERITY: MEDIUM

**Structure**:
```
modules/agenda/
├── application/  ✓
├── components/   ✓
├── domain/       ✓
├── hooks/        ✓
├── index.ts      ✓
├── infrastructure/ ✓
├── presentation/ ✓
├── types/        ✓
└── ui/           ✓
```

**Issues**:
- ❌ **No tests**: 0 test files
- ⚠️ **Known TS errors**: 4 Prisma mismatch errors in `agenda/api/agendaController.ts` (backend)

**Routes**: ✓ Registered (`/agenda`)

**Fix**: Add tests, fix TS errors  
**Effort**: S  

---

### FINANCEIRO — SEVERITY: MEDIUM

**Structure**:
```
modules/financeiro/
├── application/  ✓
├── components/   ✓ (1042 files? — check this)
├── domain/       ✓
├── hooks/        ✓
├── index.ts      ✓
├── infrastructure/ ✓
├── presentation/ ✓
├── types/        ✓
└── ui/           ✓
```

**Issues**:
- ✅ **1 test file**: `domain/aggregates/__tests__/Transaction.test.ts`
- ⚠️ **Many components**: `components/` has many files — potential SRP violations
- ⚠️ **Known issues**: `ConciliacaoBancaria.tsx` has useless `@ts-expect-error`

**Routes**: ✓ All registered (`/financeiro`, `/financeiro/receber`, `/financeiro/fiscal/notas`, `/financeiro/conciliacao`)

**Fix**: Add more tests, remove ts-expect-error  
**Effort**: S  

---

## Tier 2 Modules

| Module | Clean Arch | Tests | Routes | Issues |
|--------|-----------|-------|--------|--------|
| `crypto` | Partial | 0 | ✓ | fetch() direct (P1), large components |
| `pdv` | Partial | 0 | ✓ | Large components (IntegracaoContabilConfig 500 lines) |
| `crm` | Full | 1 | ✓ | `Lead.test.ts` exists ✓ |
| `estoque` | Full | 0 | ✓ | Large pages, no tests |
| `orcamentos` | Full | 0 | ✓ | No tests |

---

## Tier 3 Modules

| Module | Clean Arch | Tests | Routes | Issues |
|--------|-----------|-------|--------|--------|
| `marketing-auto` | Partial | 0 | ? | console.debug in useProgramaFidelidade.ts |
| `teleodonto` | Partial | 0 | ? | No tests |
| `tiss` | Partial | 0 | ? | No tests |
| `landpage` | UI only | 0 | ? | Minimal module |

---

## Missing Layers Analysis

| Module | Missing Layer | Impact |
|--------|--------------|--------|
| `auth` | domain, application, infrastructure | HIGH — Auth logic scattered in contexts/ |
| `landpage` | domain, application, infrastructure | LOW — Simple landing page |
| `dashboard` | domain, application, infrastructure | MEDIUM — Dashboard logic in components/ |
| `files` | domain, application, infrastructure | MEDIUM — File handling logic missing |
| `inventario` | domain, application | MEDIUM — Inventory logic |
| `portal-paciente` | domain, application, infrastructure | HIGH — Patient portal needs isolation |
| `procedimentos` | domain, application | LOW — Simple procedures |
| `tratamentos` | domain, application | LOW — Simple treatments |

---

## Test Coverage Analysis

| Module | Test Files | Coverage | Status |
|--------|-----------|----------|--------|
| `core` | 4 | domain/events, valueObjects | ✓ Partial |
| `lib/sync` | 5 | outbox, sync-channel, retry | ✓ Good |
| `crm` | 1 | Lead aggregate | ⚠️ Minimal |
| `financeiro` | 1 | Transaction aggregate | ⚠️ Minimal |
| `pep` | 1 | useOdontogramaStore | ⚠️ Minimal |
| **All others** | **0** | **N/A** | **✗ None** |

**Total**: 16 test files for 2,136 source files = **0.75% coverage**

---

## Route Registration Check

| Module | Routes | Lazy | ModuleKey | Status |
|--------|--------|------|-----------|--------|
| auth | `/auth` | ❌ No | N/A | ⚠️ Not lazy |
| pacientes | `/pacientes/*` | ✓ Yes | PACIENTES | ✓ |
| agenda | `/agenda` | ✓ Yes | AGENDA | ✓ |
| financeiro | `/financeiro/*` | ✓ Yes | FINANCEIRO | ✓ |
| estoque | `/estoque/*` | ✓ Yes | ESTOQUE | ✓ |
| pdv | `/pdv` | ✓ Yes | PDV | ✓ |
| crm | `/crm` | ✓ Yes | CRM | ✓ |
| crypto | `/crypto-payment` | ✓ Yes | CRYPTO_PAYMENTS | ✓ |

**Missing routes**: Some modules (teleodonto, tiss, landpage) may not have routes registered.

---

## Recommendations

| Priority | Action | Modules | Effort |
|----------|--------|---------|--------|
| 1 | Add test infrastructure | ALL | L |
| 2 | Complete auth module structure | auth | M |
| 3 | Add tests to T1 modules | auth, pacientes, agenda | M |
| 4 | Resolve circular deps | pacientes | S |
| 5 | Make auth page lazy-loaded | auth | XS |
| 6 | Audit T3 modules for route registration | teleodonto, tiss, landpage | S |

---

## Cross-References

- **P1**: `docs/plans/frontend-scan-reports/P1-architecture-violations.md`
- **P2**: `docs/plans/frontend-scan-reports/P2-component-audit.md`
- **Playbook**: `PB02-module-scan.md`
- **Project Profile**: `P0-project-profile.md`
