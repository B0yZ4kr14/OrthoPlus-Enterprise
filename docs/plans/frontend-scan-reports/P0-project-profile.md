# Project Profile: OrthoPlus Enterprise Frontend

**Generated**: 2026-05-19  
**Scope**: `apps/web/src/`  
**Method**: speckit-brownfield-scan + manual analysis  

---

## Tech Stack

| Category | Detected |
|----------|----------|
| **Framework** | React 18.3.1 |
| **Bundler** | Vite 8.0.0 |
| **Styling** | TailwindCSS 3.4.17 |
| **Language** | TypeScript 5.8.3 |
| **State (Server)** | TanStack React Query (useQuery/useMutation) |
| **State (Client)** | Zustand (via modules/*/hooks/) |
| **Forms** | react-hook-form + Zod |
| **Icons** | lucide-react |
| **Charts** | recharts |
| **Tables** | custom DataTable + TanStack Table |
| **Testing** | Vitest + @testing-library/react (16 test files) |
| **HTTP Client** | axios (wrapped by apiClient) |
| **Router** | react-router-dom v6 (lazy-loaded) |
| **Animation** | framer-motion |
| **Toasts** | sonner |
| **PDF** | jspdf, html2canvas |
| **Excel** | exceljs |
| **Date** | date-fns |

---

## Architecture

**Pattern**: Hybrid — Feature-based modules + Clean Architecture (partial)

```
Frontend Structure:
├── components/         # 31 shared component trees (239 settings, 191 crypto, 168 patients)
├── modules/            # 39 domain modules (feature-based)
│   ├── domain/         # Entities, value objects, repositories
│   ├── application/    # Use cases, event handlers
│   ├── infrastructure/ # API clients, mappers, concrete repos
│   ├── ui/             # Components, pages, hooks
│   └── types/          # Module-specific types
├── contexts/           # AuthContext, ModulesContext, ThemeContext
├── hooks/              # Global hooks + API hooks
├── lib/                # apiClient, utils, adapters, schemas
├── routes/             # AppRoutes.tsx (lazy-loaded)
├── types/              # database.ts (~8.929 linhas, autogerado)
└── domain/             # 24 entities, 19 repositories (Clean Arch partial)
```

---

## Module Map

| Module | Files | Tier | Clean Arch | Notes |
|--------|-------|------|-----------|-------|
| `estoque` | 120 | T2 (Média) | Full | Inventory management |
| `financeiro` | 108 | T1 (Alta) | Full | Payments, invoices, reports |
| `pep` | 76 | T1 (Alta) | Full | Patient electronic record |
| `agenda` | 49 | T1 (Alta) | Full | Scheduling |
| `marketing-auto` | 39 | T3 (Baixa) | Partial | Marketing automation |
| `settings` | 34 | T1 (Alta) | Partial | System configuration |
| `ia-radiografia` | 33 | T2 (Média) | Partial | AI radiography |
| `crypto` | 31 | T2 (Média) | Partial | Bitcoin, wallets |
| `crm` | 29 | T2 (Média) | Full | Leads, activities |
| `orcamentos` | 22 | T2 (Média) | Full | Budgets |
| `bi` | 21 | T2 (Média) | Partial | Business intelligence |
| `admin` | 16 | T1 (Alta) | Partial | Admin panel |
| `pacientes` | 15 | T1 (Alta) | Full | Patient management |
| `funcionarios` | 14 | T2 (Média) | Partial | Staff management |
| `dentistas` | 13 | T2 (Média) | Partial | Dentist management |

---

## Component Map

| Component Tree | Files | Focus |
|---------------|-------|-------|
| `settings` | 239 | Configuration, backups, themes |
| `crypto` | 191 | Bitcoin, wallets, QR codes, portfolios |
| `patients` | 168 | Forms, tabs, headers, status |
| `pdv` | 117 | Point of sale, cashier, fiscal |
| `shared` | 49 | DataTable, FormField, keyboard shortcuts |
| `onboarding` | 49 | Onboarding wizard, steps |
| `modules` | 41 | Module adoption, templates, sidebar |
| `crm` | 34 | Lead cards, activity forms |
| `dashboard` | 28 | Charts, metrics, market rates |
| `fidelidade` | 23 | Badge forms, rewards |
| `admin` | 23 | Repository manager, webhook manager |
| `auth` | 17 | Login, forgot password, strength indicator |
| `financeiro` | 13 | Payment dialogs |
| `split-pagamento` | 12 | Split payment config |
| `campaigns` | 12 | Campaign source selector |

---

## Code Statistics

| Metric | Value |
|--------|-------|
| Total files (TS/TSX) | 2,136 |
| Total lines of code | ~17,739 |
| Test files | 16 |
| CSS files | 1 (index.css) |
| Known `any` types | 0 (in financeiro, but 738 @ts-ignore/@ts-expect-error globally) |
| console.log occurrences | 18 |
| Pre-existent TS errors | ~12 (documented in AGENTS.md) |

---

## Governance

| Item | Status |
|------|--------|
| Constitution | ✅ `.specify/memory/constitution.md` v1.1.0 |
| AGENTS.md | ✅ Root + subdirs |
| ESLint | ✅ `eslint.config.js` (flat config, many rules disabled) |
| Prettier | ❌ Not configured |
| TypeScript strict | ⚠️ Partial (many ESLint rules disabled) |
| Tests | ⚠️ 16 files only (~0.7% of source files) |

---

## Known Hotspots

| File | Issue | Severity |
|------|-------|----------|
| `agenda/api/agendaController.ts` | 4 Prisma mismatch errors | Medium |
| `auth/api/AuthController.ts` | Import error `@orthoplus/shared-types` | Medium |
| `crypto-pagamentos` | Multiple `@financeiro` aliases unmapped | Medium |
| `marketing-auto/IndicacoesTab.tsx` | Incompatible string variant | Low |
| `financeiro/ConciliacaoBancaria.tsx` | Useless `@ts-expect-error` | Low |
| `auth/Auth.tsx` | Button variant `cta` doesn't exist | Low |
| `pacientes/PacientesListPage.tsx` | Button variant `cta` doesn't exist | Low |

---

## Constitution Principles (Relevant to Frontend)

### AP-3: Frontend State Management
- **MUST**: Server state uses TanStack React Query
- **MUST**: Never use fetch or raw axios — always use apiClient
- **SHOULD**: Client state uses Zustand stores within modules

### AP-2: Clean Architecture Boundaries
- **SHOULD**: Use Clean Architecture patterns where they exist
- **NOTE**: Do NOT force Clean Architecture where it doesn't exist yet

---

## Recommendations

1. **Test Coverage**: 16 test files for 2,136 source files is critically low. Prioritize testing core modules (auth, pacientes, agenda, financeiro).
2. **Type Safety**: 738 `@ts-ignore`/`@ts-expect-error` occurrences indicate significant technical debt. Plan gradual removal.
3. **Prettier**: No formatter configured. Add `.prettierrc` for consistency.
4. **ESLint**: Many TypeScript rules disabled. Consider enabling `no-explicit-any`, `no-floating-promises` incrementally.
5. **Circular Dependencies**: Run `npx madge --circular` to detect and resolve.
6. **Console Logs**: 18 occurrences should be removed before production builds.

---

## Next Phase

Proceed to **P1: Architecture Guard Scan** using `PB06-architecture-guard.md` playbook.
