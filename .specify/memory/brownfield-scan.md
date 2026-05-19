# Project Profile — OrthoPlus Enterprise

**Generated**: 2026-05-17 via brownfield scan  
**Spec-Kit Version**: 0.8.11  
**Scan Type**: Full monorepo analysis

---

## Tech Stack

| Category | Detected |
|----------|----------|
| **Primary languages** | TypeScript (~72%), JavaScript/JSON (~15%), Python (~5%), Shell (~3%), SQL (~2%), CSS (~1%) |
| **Frontend framework** | React 18.3, Vite 8, Tailwind CSS 3.4 |
| **Backend framework** | Express 4, Prisma 6 ORM, PostgreSQL 16 |
| **Agent Service** | Python 3.14, FastAPI, Agno 2.5 |
| **State management** | Zustand 5, React Query (TanStack) |
| **Testing** | Playwright (e2e), Vitest/Jest pattern, Python unittest |
| **CI/CD** | GitHub Actions (15 workflows) |
| **Package manager** | pnpm 10.33 + Turbo monorepo |
| **Build tool** | Turbo, Vite, tsc, Prisma generate |
| **Container** | Docker + Docker Compose (5 variants) |
| **Auth** | JWT, bcrypt, clinicGuard middleware |
| **Date handling** | date-fns (frontend), native Date (backend) |
| **UI Components** | Radix UI + CVA + Tailwind (shadcn/ui pattern) |

---

## Architecture

- **Pattern**: Monorepo with workspaces (Turbo)
- **Structure**: Full-stack separated + shared packages + agent service

```
OrthoPlus-Enterprise/
├── apps/web/              # Frontend React SPA (port 3000 dev)
│   ├── src/modules/       # 37 UI modules
│   ├── src/domain/        # 24 entities, 19 repos (Clean Arch partial)
│   ├── src/application/   # 60 use-cases
│   └── src/infrastructure/# 15 concrete repos, DI, event bus
├── backend/               # Backend Express API (port 3005)
│   ├── src/modules/       # 37 domain modules
│   ├── src/middleware/    # Express middleware
│   ├── src/routes/        # modulesRouter
│   ├── prisma/            # 180 models, 18 schemas
│   └── workers/           # 9 cron jobs
├── agent-service/         # Python FastAPI (port 8000)
│   ├── src/agents/        # AI agents
│   ├── src/workflows/     # crud, bugfix, refactor workflows
│   └── src/tools/         # Agent tools
├── shared-types/          # TypeScript shared types
└── categories/@orthoplus/ # Internal packages
    ├── core-ui/           # Button, Card, Input, Tabs, cn()
    ├── core-hooks/        # useToast, etc.
    ├── core-types/        # ApiResponse, etc.
    └── core-utils/        # formatDate, formatCurrency
```

---

## Module Map

### Frontend Modules (apps/web/src/modules/)
| Module | Path | Purpose |
|--------|------|---------|
| auth | modules/auth/ | Authentication UI |
| agenda | modules/agenda/ | Appointment scheduling |
| pacientes | modules/pacientes/ | Patient management |
| financeiro | modules/financeiro/ | Financial management |
| pep | modules/pep/ | Electronic health record |
| pdv | modules/pdv/ | Point of sale |
| crm | modules/crm/ | Customer relationship |
| estoque | modules/estoque/ | Inventory |
| landpage | modules/landpage/ | Landing/marketing |
| + 28 others | — | (see backend parity) |

### Backend Modules (backend/src/modules/)
| # | Module | Router | Controller | Prisma |
|---|--------|--------|------------|--------|
| 0 | admin_tools | yes | yes | no |
| 1 | ai | yes | yes | no |
| 2 | agenda | yes | yes | yes |
| 3 | analytics | yes | yes | yes |
| 4 | auth | yes | yes | yes |
| 5 | backups | yes | yes | no |
| 6 | bi | yes | yes | yes |
| 7 | comm | yes | yes | no |
| 8 | configuracoes | yes | yes | no |
| 9 | contratos | yes | yes | yes |
| 10 | crm | yes | yes | yes |
| 11 | crypto_config | yes | yes | yes |
| 12 | dashboard | yes | yes | no |
| 13 | database_admin | yes | yes | yes |
| 14 | faturamento | yes | yes | yes |
| 15 | fidelidade | yes | yes | yes |
| 16 | files | yes | yes | yes |
| 17 | financeiro | yes | yes | yes |
| 18 | funcionarios | yes | yes | yes |
| 19 | github_tools | yes | yes | no |
| 20 | inadimplencia | yes | yes | yes |
| 21 | inventario | yes | yes | yes |
| 22 | lgpd | yes | yes | yes |
| 23 | marketing | yes | yes | yes |
| 24 | nfe | yes | yes | yes |
| 25 | notifications | yes | yes | yes |
| 26 | orcamentos | yes | yes | yes |
| 27 | pacientes | yes | yes | yes |
| 28 | pdv | yes | yes | yes |
| 29 | pep | yes | yes | yes |
| 30 | procedimentos | yes | yes | yes |
| 31 | split_pagamento | yes | yes | yes |
| 32 | teleodonto | yes | yes | yes |
| 33 | terminal | yes | yes | no |
| 34 | tiss | yes | yes | yes |
| 35 | usuarios | yes | yes | yes |
| 36 | agents | yes | yes | no |

### Shared Packages (categories/@orthoplus/)
| Package | Exports |
|---------|---------|
| core-ui | Button, Card, Input, Label, Tabs, cn() |
| core-hooks | useToast, etc. |
| core-types | ApiResponse, global types |
| core-utils | formatDate, formatCurrency |

---

## Conventions

- **File naming**: 
  - Directories: kebab-case (modules/pacientes/, components/shared/)
  - Components: PascalCase (StatsCard.tsx, DashboardHeader.tsx)
  - Utilities/hooks: camelCase (date.utils.ts, useAuth.ts)
- **Branch pattern**: main (primary), feat/*, fix/*, copilot/*
- **Commit style**: Conventional Commits (type(scope): message)
  - Types: feat, fix, docs, chore, refactor
- **Test location**: backend/tests/, tests/e2e/, inline *.test.ts
- **Documentation**: AGENTS.md (agent-focused), README.md, docs/

---

## Existing Governance

| File | Status |
|------|--------|
| yes AGENTS.md | Canon project reference (625 lines) |
| yes README.md | Human contributor guide |
| yes .specify/ | Spec-kit project initialized |
| yes .specify/memory/constitution.md | 7 non-negotiable principles |
| yes .specify/extensions.yml | 34 extensions configured |
| yes eslint.config.js | TypeScript/React linting |
| yes .eslintrc.json | Legacy config |
| yes .github/workflows/ | 15 CI/CD workflows |
| yes docker-compose.yml | Local dev + prod variants |
| yes Dockerfile | Container config |
| yes turbo.json | Monorepo orchestration |
| yes capacitor.config.ts | Mobile (Capacitor) |
| no ARCHITECTURE.md | Not detected (only docs/ARCHITECTURE.md exists) |
| no ADR/ | Not detected |
| no .prettierrc | Not detected |

---

## Recommendations

1. **Constitution enforcement**: The existing .specify/memory/constitution.md already covers AP-1 through DOC-2 principles — align new specs with these
2. **Feature specs should map to module parity**: Each feature typically requires both frontend (apps/web/src/modules/X/) and backend (backend/src/modules/X/) changes
3. **Clean Architecture partial**: Only some modules use domain/application/infrastructure — do not force CA where not present
4. **Prisma autogenerated**: apps/web/src/types/database.ts (~8929 lines) is autogenerated — never edit manually
5. **Multi-tenancy**: All backend routes use clinicGuard — new specs must account for clinicId isolation
6. **Quality gates**: pnpm build, pnpm type-check, pnpm lint must pass — enforce in spec acceptance criteria
7. **Next action**: Run brownfield bootstrap to generate spec-kit config tailored to this profile, or proceed to specify for the next feature
