# Project Profile: OrthoPlus Enterprise

**Scan Date**: 2026-05-24
**Scanner**: speckit-brownfield-scan
**Repository**: OrthoPlus-Enterprise (monorepo full-stack de gestao odontologica)

---

## Tech Stack

| Category | Detected |
|----------|----------|
| **Primary Languages** | TypeScript (~78%), Python (~12%), Shell (~3%), YAML (~2%) |
| **Frontend** | React 18.3, Vite 8, TailwindCSS 3.4, TypeScript 5.8 |
| **Backend** | Node.js 20, Express 4, Prisma 6.19, PostgreSQL 16, Redis 7 |
| **Agent Service** | Python 3.14, FastAPI 0.135, Agno 2.5, Pydantic 2.12 |
| **State Management** | Zustand 5 (client), TanStack Query 5 (server), React Hook Form 7 |
| **Testing** | Vitest + jsdom (frontend), Jest + ts-jest (backend), Playwright (E2E) |
| **CI/CD** | GitHub Actions (14 workflows) |
| **Package Manager** | pnpm 10.33.0 + Turbo |
| **Build Tools** | tsc + tsc-alias (backend), Vite (frontend), Docker (multi-stage) |
| **Documentation** | Markdown, Mermaid (diagrams), Prisma schema as source of truth |

### Key Dependencies

**Frontend**: react, react-dom, react-router-dom, axios, zod, date-fns, recharts, framer-motion, sonner, lucide-react, fabric, jspdf, html2canvas, exceljs

**Backend**: express, @prisma/client, token library, hashing library, helmet, express-rate-limit, zod, winston, ioredis, node-cron, prom-client, bullmq, chokidar, better-sqlite3

**Agent Service**: fastapi, uvicorn, agno, google-genai, openai, pydantic, gitpython

---

## Architecture

### Pattern: Monorepo Full-Stack (Frontend + Backend + Agent Service)

```
OrthoPlus-Enterprise/
├── apps/web/                     # Frontend React SPA (Vite)
├── backend/                      # Express API (Node.js 20)
│   ├── src/modules/              # 39 modulos de dominio
│   ├── prisma/schema.prisma      # 188 models, 18 schemas PostgreSQL
│   └── workers/                  # 9 cron jobs + scheduler
├── agent-service/                # Python/FastAPI microservice
├── shared-types/                 # Tipos TypeScript cross-stack
├── categories/@orthoplus/        # Pacotes internos (UI, hooks, types, utils)
└── scripts/                      # Scripts de deploy (bash)
```

### Orchestration
- **Turbo**: Build topologico, dev paralelo, cache por task
- **pnpm workspaces**: 5 workspaces (apps/*, backend, shared-types, categories)

### Database Architecture
- **PostgreSQL 16**: Multi-schema (18 schemas: administrativo, clinico, comercial, financeiro, pacientes, etc.)
- **Prisma ORM**: 188 models, migracoes versionadas
- **Redis**: Pub/sub, queues (BullMQ), cache/sessions
- **SQLite**: Memory Hub index (local, clinic-scoped)

### Deploy Targets
- **Docker Compose**: 5 variants (local, prod, ubuntu, onprem, cloud)
- **PM2**: VPS production (cluster mode, 2 instances)
- **Nginx**: Reverse proxy, TLS, rate limits, SPA fallback

---

## Module Map

### Frontend (apps/web/)

| Area | Path | Purpose |
|------|------|---------|
| Entry | src/main.tsx | Bootstrap React + providers |
| Routing | src/routes/AppRoutes.tsx | React Router v6, lazy-loaded |
| Components | src/components/ | ~1116 componentes compartilhados |
| Modules | src/modules/ | 37 modulos de UI |
| Domain | src/domain/ | 24 entidades, 19 repos (Clean Arch parcial) |
| Use Cases | src/application/use-cases/ | 60 use-cases |
| Infrastructure | src/infrastructure/ | 15 repos concretos, DI, event bus |
| Hooks | src/hooks/ | Hooks globais + hooks de API |
| Contexts | src/contexts/ | AuthContext, ModulesContext, ThemeContext |
| Types | src/types/database.ts | ~8929 linhas, AUTOGERADO (Prisma) |

### Backend (backend/src/modules/)

| Modulo | Dominio |
|--------|---------|
| agenda | Gestao de consultas e calendario |
| auth | Autenticacao token-based, permissoes |
| pacientes | Cadastro e prontuario |
| financeiro | Faturamento, conciliacao bancaria |
| fidelidade | Programa de pontos e badges |
| marketing | Campanhas e indicacoes |
| teleodonto | Consultas remotas |
| ia_radiografia | Analise AI de radiografias |
| memory_hub | RAG sobre documentacao do projeto |
| nfe | Nota Fiscal Eletronica |
| dashboard | Metricas e KPIs |
| pdv | Ponto de venda |
| pep | Prontuario Eletronico do Paciente |
| tiss | TISS (odontologia) |
| split_pagamento | Split de pagamentos |
| crypto_config | Configuracoes de criptomoedas |
| backups | Backup automatizado |
| lgpd | Compliance LGPD |
| ... | 39 modulos no total |

### Agent Service (agent-service/src/)

| Componente | Proposito |
|------------|-----------|
| main.py | FastAPI app, endpoints /api/agents/* |
| config.py | Environment configuration, external service credentials |
| agents/ | Backend, Frontend, Database agents |
| workflows/ | crud, bugfix, refactor |
| tools/ | ReadFile, WriteFile, SearchCode, PrismaTools |

### Internal Packages (categories/@orthoplus/core/packages/)

| Pacote | Conteudo |
|--------|----------|
| ui/ | 50+ componentes (Radix + CVA + Tailwind) |
| hooks/ | useToast (sonner wrapper) |
| types/ | Tipos globais frontend |
| utils/ | formatDate, formatCurrency, cn |

---

## Conventions

### File Naming
| Context | Pattern | Exemplos |
|---------|---------|----------|
| React components | PascalCase | AppLayout.tsx, PatientForm.tsx |
| Hooks | camelCase com prefixo use | useAuth.ts, useDashboard.ts |
| Diretorios | kebab-case | memory-hub/, split-pagamento/ |
| Backend modules | snake_case | memory_hub/, ia_radiografia/ |
| Tests | *.test.ts ou *.test.tsx | AuthContext.test.tsx |

### Code Style
- Sem ponto e virgula: Padrao Prettier do projeto
- ES Modules: import/export obrigatorio
- Async/await: Nunca callbacks
- Strict TypeScript: Tipagem obrigatoria (embora ESLint relaxado)

### Branching
- Ativas: main (producao), develop (integracao)
- Features: feat/019-ia-radiografia, feat/all-features-completion
- Hotfixes: Commits diretos em main apenas para emergencias

### Commits
- Estilo: Conventional Commits (feat:, fix:, docs:, chore:, refactor:)
- Escopo: Frequentemente inclui modulo

### Testing
- Frontend: __tests__/ diretorios adjacentes ao codigo, Vitest + jsdom
- Backend: backend/tests/unit/, Jest + ts-jest, 636 testes, threshold 20%
- E2E: tests/e2e/, Playwright (Chromium, Firefox, WebKit)

---

## Existing Governance

| Artefato | Status | Path |
|----------|--------|------|
| AGENTS.md | ✅ | Root + subdirs |
| ARCHITECTURE.md | ✅ | docs/ARCHITECTURE.md |
| Constitution | ✅ | .specify/memory/constitution.md |
| Security Constitution | ✅ | .specify/memory/security_constitution.md |
| Architecture Constitution | ✅ | .specify/memory/architecture_constitution.md |
| Spec-Kit Memory | ✅ | .specify/memory/ (25+ arquivos) |
| Agent Governance | ✅ | .specify/memory/agent-governance.md |
| VPS Canonical User | ✅ | .specify/memory/VPS_CANONICAL_USER.md |
| CI/CD Workflows | ✅ | 14 workflows GitHub Actions |
| Pre-commit Hook | ✅ | .husky/pre-commit |

### Spec-Kit Integration
- Templates: spec, plan, tasks, checklist, constitution
- Scripts: bash scripts para setup de features, plan, tasks, doctor
- Integrations: Manifests para varios agents
- Workflows: speckit workflows registrados
- Features: features/index.md com tracking

---

## Recommendations

1. Spec-Kit Bootstrap: Projeto ja possui configuracao avancada. Recomendar validacao de sincronia.

2. Constitution Enforcement: A constituicao existe e eh abrangente. Recomendar garantia de conformidade para novos modulos.

3. Type Safety Debt: O custom.d.ts declara user como any, debito tecnico global. Recomendar refatoracao cross-module.

4. Test Coverage: Backend threshold de 20% eh baixo para projeto de 188 models. Recomendar aumentar gradualmente.

5. Deploy Pipeline: O deploy script foi recentemente corrigido. Recomendar teste end-to-end no proximo deploy.

6. Memory Hub: Modulo ativo com RAG, embeddings multi-provider, e FileWatcher. Recomendar monitoramento de performance do SQLite em producao.

---

## Metrics

| Metric | Value |
|--------|-------|
| Total Files (excl. node_modules) | ~55,000 |
| TypeScript Files (.ts, .tsx) | ~13,500 |
| Python Files | ~450 |
| Backend Modules | 39 |
| Frontend Modules | 37 |
| Prisma Models | 188 |
| PostgreSQL Schemas | 18 |
| GitHub Workflows | 14 |
| Test Suites | 39 (backend) + N (frontend) |
| Total Tests | 636+ |
| Specs Completos | 25+ (100% tasks) |
