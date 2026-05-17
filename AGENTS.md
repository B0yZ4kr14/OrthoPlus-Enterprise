<!--
  AGENTS.md — OrthoPlus Enterprise (Root)
  Arquivo de referencia canonico para agentes de IA.
  Idioma principal do projeto: Portugues (codigo e documentacao).
  **Atualizado:** 2026-05-17
-->

# AGENTS.md — OrthoPlus Enterprise

> Este arquivo e o ponto de entrada para agentes de IA. Leia-o por inteiro antes de modificar qualquer arquivo.
> Subdiretorios podem conter `AGENTS.md` adicionais com regras mais especificas que **supersedem** as deste arquivo.

---

## 1. Visao Geral

O **OrthoPlus Enterprise** e um monorepo full-stack de gestao odontologica, organizado em workspaces pnpm e orquestrado pelo Turbo.

- **Frontend**: React 18.3 + Vite 8 + Tailwind CSS 3.4 + TypeScript 5.8
- **Backend**: Node.js 20 + Express 4 + Prisma 6 + PostgreSQL 16
- **Agent Service**: Python 3.14 + FastAPI + Agno 2.5
- **Package Manager**: pnpm 10.33.0 (obrigatorio)
- **Workspaces**: `apps/*`, `backend`, `shared-types`, `categories/@orthoplus/*`

### Portas Padrao

| Servico | Porta Dev | Porta Producao |
|---------|-----------|----------------|
| Frontend (Vite) | 3000 | 8080 (nginx) |
| Backend (Express) | 3005 | 3005 |
| Agent Service | 8000 | 8000 |
| PostgreSQL | — (container) | 5432 |
| Redis | — (container) | 6379 |

---

## 2. Estrutura de Diretorios

```
OrthoPlus-Enterprise/
├── apps/web/                     # Frontend React (SPA)
│   ├── src/
│   │   ├── main.tsx              # Ponto de entrada
│   │   ├── App.tsx               # Providers globais
│   │   ├── routes/AppRoutes.tsx  # React Router v6 (lazy-loaded)
│   │   ├── components/           # ~1116 componentes compartilhados
│   │   ├── modules/              # 37 modulos de UI
│   │   ├── domain/               # 24 entidades, 19 repos (Clean Arch parcial)
│   │   ├── application/use-cases/# 60 use-cases
│   │   ├── infrastructure/       # 15 repos concretos, DI, event bus
│   │   ├── hooks/                # Hooks globais + hooks de API
│   │   ├── contexts/             # AuthContext, ModulesContext, ThemeContext
│   │   ├── lib/                  # apiClient, utils, adapters, schemas
│   │   └── types/database.ts     # ~8929 linhas, AUTOGERADO (nao editar)
│   ├── vite.config.ts            # Alias, proxy /api -> :3005, chunks manuais
│   └── vitest.config.ts          # Testes unitarios (jsdom)
│
├── backend/                      # Backend Node.js / Express
│   ├── src/
│   │   ├── index.ts              # Ponto de entrada (~425 linhas)
│   │   ├── middleware/           # auth, clinicGuard, errorHandler, lgpd
│   │   ├── modules/              # 37 modulos de dominio
│   │   ├── workers/              # 9 cron jobs + scheduler de backup
│   │   ├── infrastructure/       # Prisma singleton, logger (Winston), Redis
│   │   ├── shared/               # CQRS bus, event registry
│   │   ├── routes/modules.ts     # Rotas legadas de gerenciamento de modulos
│   │   └── custom.d.ts           # Extensao de Request (user, clinicId)
│   ├── prisma/schema.prisma      # 180 models, 18 schemas PostgreSQL
│   ├── tests/unit/               # 17 suites de teste (Jest)
│   └── jest.config.js            # ts-jest, coverage threshold 20%
│
├── agent-service/                # Microservico Python/FastAPI
│   ├── src/main.py               # FastAPI app, endpoints /api/agents/*
│   ├── src/config.py             # Env vars, API keys, contexto do projeto
│   ├── src/agents/               # Backend, Frontend, Database agents
│   ├── src/workflows/            # crud, bugfix, refactor
│   └── src/tools/                # ReadFile, WriteFile, SearchCode, PrismaTools
│
├── shared-types/                 # Tipos TypeScript cross-stack
│   └── src/index.ts              # ApiResponse, auth, pacientes, agenda, crypto...
│
├── categories/@orthoplus/        # Pacotes internos (source-only, exceto shared-types)
│   └── core/packages/
│       ├── ui/                   # 50+ componentes (Radix + CVA + Tailwind)
│       ├── hooks/                # useToast (sonner wrapper)
│       ├── types/                # Tipos globais frontend
│       └── utils/                # formatDate, formatCurrency, cn
│
├── scripts/                      # Scripts de deploy (bash)
│   ├── deploy-orthoplus-full.sh  # Deploy completo para VPS
│   ├── deploy-vps.sh             # Deploy VPS simplificado
│   ├── deploy-prod.sh            # Docker Compose producao
│   └── deploy-ubuntu.sh          # Bootstrap Ubuntu Server
│
├── .github/workflows/            # 14 workflows (CI/CD, E2E, security, deploy)
├── docker-compose.yml            # Stack completo local
├── docker-compose.prod.yml       # Producao (sem Postgres — DB externo)
├── docker-compose.ubuntu.yml     # Ubuntu Server LTS
├── docker-compose.onprem.yml     # On-premise (MinIO + network segregation)
├── Dockerfile                    # Frontend (multi-stage -> nginx:alpine)
├── backend/Dockerfile            # Backend (multi-stage -> node:20-alpine)
└── nginx.conf                    # Reverse proxy, TLS, rate limits, CSP
```

---

## 3. Tecnologias e Dependencias Principais

### Backend
- `express` ^4.18.2 — Framework web
- `@prisma/client` ^6.19.3 — ORM (multi-schema PostgreSQL)
- `jsonwebtoken` ^9.0.2 — JWT
- `bcrypt` ^6.0.0 — Hash de senhas
- `helmet` ^7.1.0 — Headers de seguranca HTTP
- `express-rate-limit` ^8.3.1 — Rate limiting
- `zod` ^3.25.76 — Validacao de schemas
- `winston` ^3.11.0 — Logging
- `ioredis` ^5.10.0 — Client Redis
- `node-cron` ^4.2.1 — Cron jobs
- `prom-client` ^15.1.0 — Metricas Prometheus
- `pg` ^8.11.3 — Driver PostgreSQL nativo

### Frontend
- `react` ^18.3.1 + `react-dom` ^18.3.1
- `vite` ^8.0.0 (plugin `@vitejs/plugin-react-swc`)
- `tailwindcss` ^3.4.17 + `postcss` + `autoprefixer`
- `@tanstack/react-query` ^5.96.1 — Server state
- `zustand` ^5.x (via lockfile) — Client state (modulos selecionados)
- `react-router-dom` ^6.30.1 — Roteamento
- `react-hook-form` ^7.72.0 + `@hookform/resolvers` — Formularios
- `zod` ^4.3.6 — Validacao frontend
- `axios` ^1.14.0 — HTTP client (wrappado por `apiClient`)
- `lucide-react` ^0.462.0 — Icones
- `framer-motion` ^12.38.0 — Animacoes
- `date-fns` ^4.1.0 — Manipulacao de datas (sempre via `date.utils.ts`)
- `recharts` ^2.15.4 — Graficos
- `sonner` ^1.7.4 — Toasts
- `fabric`, `jspdf`, `html2canvas`, `exceljs` — PDF, canvas, Excel

### Agent Service
- Python 3.14
- `fastapi` ^0.135.3 + `uvicorn` ^0.43.0
- `agno` ^2.5.14 — Framework de agentes LLM
- `pydantic` ^2.12.5 — Validacao
- `google-genai`, `openai` — Providers LLM

---

## 4. Arquitetura do Backend

### 4.1 Ponto de Entrada (`src/index.ts`)

Ordem fixa de inicializacao (nao alterar):
1. `validateEnvironment()` — checa `JWT_SECRET`, `DATABASE_URL`, bloqueia placeholders e flags perigosas em producao.
2. Express app (`trust proxy` para nginx).
3. Rate limiting (3 tiers: auth 10/15min, upload 50/h, API 500/15min).
4. CORS (whitelist via `ALLOWED_ORIGINS`).
5. CSRF protection (Origin/Referer check para requisicoes state-changing com cookie).
6. Helmet + JSON parser (limite 10MB).
7. Health checks publicos (`/health`, `/api/health`).
8. `authMiddleware` — popula `req.user` e `req.clinicId` a partir do JWT (cookie `access_token` ou header `Authorization: Bearer`).
9. Registro de 37+ routers sob `/api/*`.
10. Event handlers + workers.
11. Global `errorHandler` (ultimo middleware).
12. Graceful shutdown (`SIGTERM`/`SIGINT`) — fecha HTTP, Prisma e Redis em ate 10s.

### 4.2 Middleware

Todos em `backend/src/middleware/`:

| Middleware | Funcao |
|------------|--------|
| `authMiddleware.ts` | Valida JWT (HS256), suporta `AUTH_ALLOW_MOCK` (dev) e bypass de cron interno (`X-Internal-Cron` + `127.0.0.1`). |
| `clinicGuard.ts` | **Obrigatorio em todos os routers protegidos**. Verifica `req.user.clinicId`. |
| `errorHandler.ts` | Formato **RFC 7807 Problem Details** (`application/problem+json`). Exporta `ApiError`, `Errors` factory e `asyncHandler()` wrapper. |
| `lgpdMiddleware.ts` | Compliance LGPD (Lei Geral de Protecao de Dados). |

### 4.3 Estrutura de Modulo (Canonico)

```
src/modules/{modulo}/
├── api/
│   ├── router.ts              # Express router + clinicGuard obrigatorio
│   └── {Modulo}Controller.ts
├── application/
│   └── {Modulo}Service.ts     # orquestracao / commands / queries
├── domain/
│   └── {Modulo}Types.ts       # entidades, repos, value-objects
└── infrastructure/
    └── {Modulo}Repository.ts  # I/O Prisma
```

**Regras:**
- `router.ts` DEVE aplicar `clinicGuard` como primeiro middleware.
- Controllers NUNCA acessam Prisma diretamente — delegam para Repository.
- Services orquestram, Repositories fazem I/O.
- Use `throw new ApiError(...)` de `@/middleware/errorHandler` para erros operacionais.

**Desvio conhecido:** `dashboard` tem controller em `src/controllers/` em vez de `api/` — nao replicar.

**Modulos API-only** (sem camadas application/domain/infrastructure — controller chama Prisma ou e mock):
`admin_tools`, `analytics`, `backups`, `bi`, `comm`, `configuracoes`, `crypto_config`, `dashboard`, `fidelidade`, `files`, `funcionarios`, `github_tools`, `inadimplencia`, `lgpd`, `marketing`, `notifications`, `orcamentos`, `procedimentos`, `split_pagamento`, `tiss`, `usuarios`.

### 4.4 Prisma

- **Schema:** `backend/prisma/schema.prisma` — **180 models**, **18 schemas** PostgreSQL.
- **Preview feature:** `multiSchema`.
- **Schemas:** `public`, `pacientes`, `inventario`, `pdv`, `financeiro`, `pep`, `faturamento`, `configuracoes`, `database_admin`, `backups`, `crypto_config`, `github_tools`, `terminal`, `core`, `comercial`, `clinico`, `operacional`, `administrativo`.
- **Client:** Singleton em `backend/src/infrastructure/database/prismaClient.ts`. Auto-disconnect em `beforeExit`.
- **Migrations:** Nunca editar `migrations/` manualmente. Usar `prisma migrate dev`.
- **`$queryRaw`:** ~14 ocorrencias legitimas em `backend/src/` (admin_tools, analytics, inventario, marketing, notifications, database_admin) para agregacoes complexas ou queries administrativas. Preferir Prisma Client puro para CRUD.

### 4.5 Workers (Cron Jobs)

Localizados em `backend/src/workers/`:

| Job | Arquivo | Frequencia |
|-----|---------|------------|
| `scheduleAppointments` | `jobs/scheduleAppointments.ts` | Horaria |
| `scheduleBiExport` | `jobs/scheduleBiExport.ts` | Diaria 02:00 |
| `backupJobs` | `jobs/backupJobs.ts` | Varias (stubs) |
| `estoqueJobs` | `jobs/estoqueJobs.ts` | Diaria 02:00–05:00 |
| `cryptoJobs` | `jobs/cryptoJobs.ts` | A cada 5–15 min |
| `financeiroJobs` | `jobs/financeiroJobs.ts` | Diaria 01:00 e 18:00 |
| `gamificationJobs` | `jobs/gamificationJobs.ts` | Diaria 23:30 |
| `adminJobs` | `jobs/adminJobs.ts` | Semanal dom 02:00 + diaria 01:00 |
| `marketingJobs` | `jobs/marketingJobs.ts` | Diaria 08:00–09:00 |

**Category Backup Scheduler:** `categoryBackupScheduler.ts` — backups noturnos por categoria (CORE 01:00, FINANCEIRO 01:15, OPERACIONAL 01:30, COMERCIAL 01:45, CLINICO 02:00, ADMINISTRATIVO 02:15).

**Padrao especial:** `financeiroJobs` dispara via HTTP POST para `localhost:3005/api/financeiro/jobs/execute` com header `X-Internal-Cron: true`, que `authMiddleware` permite de `127.0.0.1`.

---

## 5. Arquitetura do Frontend

### 5.1 Ponto de Entrada e Roteamento

- **Entry:** `src/main.tsx` — `createRoot` + `StrictMode` + DI bootstrap.
- **App Shell:** `src/App.tsx` — providers aninhados:
  ```
  QueryClientProvider -> TooltipProvider -> ThemeProvider -> BrowserRouter -> AuthProvider -> ModulesProvider -> AppRoutes
  ```
- **Rotas:** `src/routes/AppRoutes.tsx` — React Router v6.
  - Rotas publicas (`/`, `/demo`, `/auth`) carregadas eager.
  - Todas as rotas de modulos sao **lazy-loaded** (`React.lazy`) com `Suspense` + `ErrorBoundary`.
  - `protectedRoute()` injeta `ProtectedRoute` (auth + permissao de modulo) + `AppLayout`.
  - `moduleKey` (ex: `PACIENTES`, `FINANCEIRO`) integra-se ao catalogo de modulos do backend.

### 5.2 Requisicoes HTTP

**Cliente centralizado:** `src/lib/api/apiClient.ts`
- Singleton `ApiClient` wrapper de Axios.
- Base URL via `VITE_API_BASE_URL` (default `/api`).
- Request interceptor injeta `Bearer` token do `localStorage.accessToken`.
- Response interceptor loga erros em dev; **nao exibe toasts** (quem chama cuida do UX).
- Metodos tipados: `get<T>`, `post<T>`, `patch<T>`, `put<T>`, `delete<T>`.

**Proxy de dev (Vite):**
```ts
"/api" -> http://localhost:3005
"/rest" -> http://localhost:3005
```

**Regra absoluta:** Usar `apiClient`. Nunca `fetch` ou `axios` direto.

### 5.3 Gerenciamento de Estado

| Tipo | Tecnologia | Onde |
|------|------------|------|
| Server state | TanStack React Query | Hooks em `hooks/api/`, modulos modernos |
| Client/global | Zustand | `modules/{modulo}/hooks/use{Modulo}Store.ts` |
| Session/Auth | React Context | `contexts/AuthContext.tsx` |
| Theme | React Context | `contexts/ThemeContext.tsx` |
| Local | `useState` | Componentes e hooks customizados |

**Regra:** Nao usar Context para estado servidor. Nao usar `useState` para dados async se React Query estiver disponivel no modulo.

### 5.4 Autenticacao e Permissoes

**`AuthContext`** (`src/contexts/AuthContext.tsx`):
- Fornece `user`, `session`, `userRole` (`ADMIN` | `MEMBER`), `clinicId`, `availableClinics`, `activeModules`, `userPermissions`.
- Login em `/auth/token`, restore via `/auth/me`.
- `switchClinic(clinicId)` atualiza contexto e refetch modulos.
- Token armazenado em `localStorage.accessToken`.

**`ProtectedRoute`** (`src/components/ProtectedRoute.tsx`):
- Redireciona nao autenticados para `/auth`.
- `requireAdmin` -> pagina "Acesso Negado" se nao for admin.
- `moduleKey` -> verifica `hasModuleAccess()` contra catalogo do backend.

**Modelo de permissoes:**
- **ADMIN:** ve todos os modulos ativos (ou todos se nenhum configurado). Permissoes `["ALL"]`.
- **MEMBER:** precisa do modulo ativo na clinica + match explicito de permission string.
- **PATIENT:** perfil separado para portal do paciente.

**Regra absoluta:** Usar `useAuth()` do `AuthContext`. Nunca checar `localStorage` manualmente.

### 5.5 Clean Architecture (Parcial)

Aplicada **apenas** onde ja existe (principalmente `financeiro`, `agenda`, `estoque`, `crypto`, `pacientes`).

```
src/domain/          # 24 entidades, 19 interfaces de repositorio
src/application/     # 60 use-cases / commands / queries
src/infrastructure/  # 15 implementacoes concretas, DI bootstrap, event bus
```

Modulos **sem** essas camadas (maioria) usam hooks + `apiClient` direto. **Nao forcar** DDD/Clean Arch onde nao existe.

### 5.6 Componentes e Estilizacao

**Design System interno:** `@orthoplus/core-ui`
- Baseado em **Radix UI** primitives + **CVA** + **Tailwind CSS**.
- 50+ componentes: Button (10 variantes), Card, Input, Dialog, Tabs, Select, Table, Toast, Calendar, Chart, etc.
- Exporta `cn()` (clsx + tailwind-merge).
- Suporta imports por subcaminho: `@orthoplus/core-ui/button`.

**Tailwind:** v3.4.17. Config em `frontend/tailwind.config.js` (ou raiz).
`src/index.css` define extensas CSS custom properties para temas: Light, Dark, Professional Dark, High Contrast, Premium Light, Premium Dental Dark.

**Icones:** `lucide-react`.

**Regra absoluta:** Usar `@orthoplus/core-ui` para UI. Nao criar componente shadcn local se ja existir no `core-ui`.

---

## 6. Servico de Agentes

- **Porta:** 8000
- **Entrada:** `agent-service/src/main.py`
- **Config:** `agent-service/src/config.py`

**Endpoints:**
| Metodo | Rota | Proposito |
|--------|------|-----------|
| GET | `/health` | Health check + status dos providers |
| POST | `/api/agents/crud` | Gera modulo CRUD completo |
| POST | `/api/agents/crud/simple` | CRUD simplificado |
| POST | `/api/agents/bugfix` | Diagnostico e fix automatico |
| POST | `/api/agents/refactor` | Planejamento de refatoracao |
| POST | `/api/agents/review` | Code review automatico |

**Workflows:** `crud_workflow` (3 passos: DB -> Backend -> Frontend), `bugfix_workflow` (4 passos: analise -> reproducao -> fix -> verificacao), `refactor_workflow` (impacto -> plano -> exemplo -> checklist).

**Comunicacao com backend:** HTTP REST para `http://localhost:3005/api`, autenticado com JWT service token (`SERVICE_JWT_TOKEN`). **Nunca acessar o banco diretamente.**

---

## 7. Pacotes Internos

| Pacote | Local | Compilado? | Consumidores |
|--------|-------|------------|--------------|
| `@orthoplus/core-ui` | `categories/@orthoplus/core/packages/ui` | Nao Source-only | `apps/web` |
| `@orthoplus/core-hooks` | `categories/@orthoplus/core/packages/hooks` | Nao Source-only | `apps/web` |
| `@orthoplus/core-types` | `categories/@orthoplus/core/packages/types` | Nao Source-only | `apps/web` |
| `@orthoplus/core-utils` | `categories/@orthoplus/core/packages/utils` | Nao Source-only | `apps/web` |
| `@orthoplus/shared-types` | `shared-types/` | Sim `tsc` -> `dist/` (CJS) | `backend` + `apps/web` |

**Regras para `core-ui`:**
- Nunca quebrar exports existentes (consumidores dependem de subcaminhos).
- Novo componente = arquivo proprio + export em `src/index.ts` + entry em `package.json#exports`.
- Usar CVA para variantes, Radix para acessibilidade, zero logica de negocio.

---

## 8. Comandos de Build e Teste

### Root (Monorepo)
```bash
pnpm install          # Instala dependencias de todos os workspaces
pnpm dev              # Turbo dev paralelo (frontend 3000 + backend 3005)
pnpm build            # Turbo build (dependencias em ordem)
pnpm lint             # Turbo lint
pnpm type-check       # Turbo type-check
pnpm test             # Turbo test
pnpm format           # Prettier em **/*.{ts,tsx,json,md}
pnpm clean            # Turbo clean + rm -rf node_modules
```

### Backend
```bash
cd backend
pnpm dev              # nodemon + tsx (hot reload)
pnpm build            # tsc -p tsconfig.build.json && tsc-alias (ESTRITO — falha em erro)
pnpm start            # node dist/index.js
pnpm test             # jest (17 suites, ~367 testes)
pnpm lint             # ESLint src --ext .ts
```

### Frontend
```bash
cd apps/web
pnpm dev              # Vite dev server (porta 3000)
pnpm build            # vite build (terser, drop_console, chunks manuais)
pnpm lint             # ESLint . --report-unused-disable-directives
pnpm type-check       # tsc --noEmit
```

### Agent Service
```bash
cd agent-service
python src/main.py                      # Desenvolvimento
uvicorn src.main:app --reload --port 8000  # Alternativa com reload
```

---

## 9. Convencoes de Codigo

### TypeScript / Geral
- **ES Modules:** `import/export` obrigatorio. Nunca `require`.
- **Strict mode:** Tipagem obrigatoria (embora muitas regras ESLint estejam desabilitadas — ver secao 12).
- **Async/await:** Nunca callbacks. Sempre `async/await` ou Promises.
- **Sem ponto e virgula:** O projeto nao usa `;` no final das linhas (padrao do Prettier).

### Backend
- **Erros:** Sempre usar `ApiError` (de `@/middleware/errorHandler`). Retornar `application/problem+json` (RFC 7807). Nunca enviar `Error` raw para clientes.
- **clinicGuard:** Todo router de modulo deve usa-lo.
- **Controllers:** Nunca acessar Prisma diretamente. Delegar para Service/Repository.
- **Logging:** Usar Winston (`src/infrastructure/logger/index.ts`). JSON em producao, colorido em dev.
- **Variaveis de ambiente:** Nunca hardcode secrets. Usar `process.env` com fallback seguro.

### Frontend
- **HTTP:** `apiClient` apenas.
- **Datas:** `lib/utils/date.utils.ts` (nunca importar `date-fns` direto).
- **Auth:** `useAuth()` apenas.
- **Toasts:** `useToast` de `@orthoplus/core-hooks` ou `sonner`.
- **UI:** `@orthoplus/core-ui`.
- **Estado servidor:** React Query (`useQuery`/`useMutation`).
- **Estado global:** Zustand stores dentro de `modules/{modulo}/hooks/`.

### Bash (Scripts)
- Shebang: `#!/bin/bash`
- `set -e` na segunda linha
- Funcoes de log coloridas padronizadas (copiar de scripts existentes)

---

## 10. Estrategia de Testes

### Backend — Jest + ts-jest
- **Config:** `backend/jest.config.js`
- **Diretorio:** `backend/tests/unit/` (17 arquivos `.test.ts`)
- **Suites:** agenda, auth, contratos, dashboard, financeiro, health, nfe, pdv, pep, produto, splitPagamento, teleodonto, tiss, transaction
- **Coverage:** threshold global de **20%** (branches, functions, lines, statements).
- **Module name mapper:** `@/` -> `src/`, `@modules/` -> `src/modules/`, etc.

### Frontend — Vitest + jsdom
- **Config:** `apps/web/vitest.config.ts`
- **Padrao:** `src/**/*.{test,spec}.{ts,tsx}`
- **Bibliotecas:** `@testing-library/react` para component tests.
- **Exemplo:** `src/contexts/__tests__/AuthContext.test.tsx`.

### E2E — Playwright
- **Config:** `playwright.config.ts` (raiz do monorepo)
- **Diretorio:** `tests/e2e/`
- **Base URL:** `http://localhost:8080`
- **Global setup:** `tests/e2e/global-setup.ts` (login + storage state)
- **Projetos:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari.
- **Timeout:** 120s global, 15s expect, 15s action, 30s navigation.
- **Retries:** 2 em CI, 0 local.
- **WebServer:** sobe backend (`localhost:3005`) e frontend (`localhost:8080`) automaticamente.
- **Report:** HTML + JSON + list.

### CI/CD (GitHub Actions)
Principais workflows:
- `ci.yml` — build + type-check em PRs/push para `main`.
- `build.yml` — build root + backend + testes unitarios backend.
- `quality-check.yml` — type-check, lint, format-check, build, test, bundle size gate (<10MB).
- `test.yml` — Vitest + upload de coverage para Codecov.
- `e2e-tests.yml` — Playwright E2E com servico PostgreSQL.
- `security.yml` — `pnpm audit --moderate`, ESLint security scan (segundas).
- `production-validation.yml` — dry-run de producao + security audit.
- `deploy-vps-orthoplus.yml` / `deploy-vps-tsi-02.yml` — Deploy para VPS.
- `cd.yml` / `deploy.yml` — Deploy para Proxmox VM200.

---

## 11. Seguranca

### Autenticacao e Autorizacao
- **JWT:** Algoritmo **HS256** apenas. Secret de 256+ bits. Expira em 24h.
- **clinicGuard:** Isolamento multi-tenant obrigatorio via `clinicId` no token.
- **Cookies:** `access_token` como HttpOnly em producao (com sameSite=strict).

### Rate Limiting
- **Auth:** 10 requisicoes / 15 min (mutacoes em `/api/auth`; GET `/api/auth/me` isento).
- **Upload:** 50 requisicoes / hora (`/api/files`).
- **API geral:** 500 requisicoes / 15 min (`/api/*`).
- **Nginx (producao):** limites adicionais por IP (global 100 req/s, API 30 req/s, auth 5 req/min, upload 10 req/min).

### CSRF
- Origin/Referer check para requisicoes state-changing que carregam cookie `access_token`.
- Whitelist de origens via `ALLOWED_ORIGINS`.

### Headers e TLS
- **Helmet:** headers de seguranca padrao.
- **Nginx:** TLS 1.2+1.3, HSTS (`max-age=63072000`), OCSP stapling, cipher suites fortes.
- **CSP:** configurado no nginx (permite `unsafe-inline`/`unsafe-eval` para compatibilidade React/Vite).

### LGPD
- Middleware `lgpdMiddleware.ts` aplicado globalmente no backend.
- Modulo dedicado `lgpd` para gestao de consentimentos e relatorios.

### Variaveis Criticas (nunca commitar)
- `JWT_SECRET` — minimo 256 bits de entropia.
- `DATABASE_URL` — connection string PostgreSQL.
- `REDIS_PASSWORD`, `POSTGRES_PASSWORD`, `GRAFANA_PASSWORD`.
- `AUTH_ALLOW_MOCK` — **proibido em producao** (`predeploy` falha se `true`).
- `ENABLE_DANGEROUS_ADMIN_ENDPOINTS` — **proibido em producao**.

---

## 12. Deploy e Operacoes

### Docker Compose

| Arquivo | Ambiente | Observacao |
|---------|----------|------------|
| `docker-compose.yml` | Local/Dev | Stack completo: frontend, backend, Postgres, Redis, nginx, Prometheus, Grafana. |
| `docker-compose.prod.yml` | Producao (cloud) | Backend + Frontend + Redis. **Sem Postgres** — espera DB externo via `DATABASE_URL`. |
| `docker-compose.ubuntu.yml` | Ubuntu Server LTS | Stack completo com limites de recurso, volumes bind-mounted em `/opt/orthoplus/data`, PostgreSQL otimizado. |
| `docker-compose.onprem.yml` | On-premise | + MinIO S3, 3 redes segregadas, replicas frontend (2) e backend (3), node-exporter. |

### Dockerfiles
- **Frontend (`Dockerfile`):** Multi-stage (node:20-alpine builder -> nginx:1.25-alpine). Expoe 8080. Healthcheck via wget.
- **Backend (`backend/Dockerfile`):** Multi-stage (node:20-alpine builder + prisma generate -> node:20-alpine production com `postgresql-client` para backups). Expoe 3005. Healthcheck via wget.

### Scripts de Deploy
- **`scripts/deploy-orthoplus-full.sh`** — Deploy completo para VPS:
  1. Build frontend localmente
  2. Build backend localmente (`tsc`)
  3. Rsync frontend dist + nginx.conf para VPS
  4. Rsync backend dist + package.json + prisma para VPS
  5. SSH: `pnpm install --prod` -> `prisma migrate deploy` -> `prisma generate` -> PM2 reload -> health check (`curl /health`)
- **`scripts/deploy-vps.sh`** — Rsync + execucao remota via SSH (Tailscale).
- **`scripts/deploy-prod.sh`** — Docker Compose producao com `prisma migrate deploy` pos-deploy.
- **`scripts/deploy-ubuntu.sh`** — Bootstrap completo de Ubuntu Server 22.04/24.04 LTS (instala Docker, gera secrets, configura UFW/fail2ban, cria cron de backup).

### Nginx (`nginx.conf`)
- Reverse proxy para `/api/*` -> backend, `/api/agent/*` -> agent-service, `/s3/*` -> MinIO, `/` -> SPA.
- `try_files` fallback para `index.html` (SPA).
- Cache de assets estaticos: 1 ano.
- Rate limiting por zona.

---

## 13. Observabilidade e Database Federation (DevSecOps)

### 13.1 Categoria Master (Federation Hub)
O backend implementa um **MasterDatabaseManager** que agrega 6 categorias de banco de dados:
- **CORE**: core, pacientes, pep
- **FINANCEIRO**: financeiro, pdv, faturamento, crypto_config
- **OPERACIONAL**: operacional, inventario
- **COMERCIAL**: comercial
- **CLINICO**: clinico
- **ADMINISTRATIVO**: administrativo, configuracoes, database_admin, backups

**Endpoints:**
- `GET /api/database_admin/categories` — Lista configuracao das categorias
- `GET /api/database_admin/master/health` — Health consolidado (overall + por categoria)
- `GET /api/database_admin/master/stats` — Stats agregados (tabelas, tamanho)
- `POST /api/database_admin/master/cross-query` — Query cross-schema (SELECT only, max 1000 rows)
- `GET /api/database_admin/master/backups` — Status de backup por categoria
- `POST /api/database_admin/master/backup/:category` — Executa backup manual

### 13.2 Circuit Breaker por Categoria
Cada categoria possui um circuit breaker independente:
- Estados: CLOSED -> OPEN -> HALF_OPEN -> CLOSED
- Thresholds: 3 falhas para abrir, 2 sucessos para fechar, recovery 15s
- Fallback automatico quando circuito aberto

**Endpoints:**
- `GET /api/database_admin/circuit/metrics` — Métricas de todos os circuit breakers
- `POST /api/database_admin/circuit/reset/:category` — Reset manual

### 13.3 Prometheus Metrics Exporter
Métricas customizadas expostas em `GET /metrics` (antes do auth, rede interna):
- `orthoplus_circuit_breaker_state` — Estado do circuit breaker
- `orthoplus_circuit_breaker_failures_total` — Falhas acumuladas
- `orthoplus_circuit_breaker_rejected_calls_total` — Chamadas rejeitadas
- `orthoplus_db_category_health` — Health do DB (0=down, 1=degraded, 2=healthy)
- `orthoplus_db_category_latency_ms` — Latencia de health check
- `orthoplus_db_category_size_bytes` — Tamanho por categoria
- `orthoplus_backup_duration_seconds` — Duracao do backup
- `orthoplus_backup_success_total` / `orthoplus_backup_failure_total`

### 13.4 Grafana + Alertmanager
- **Dashboard**: `grafana/provisioning/dashboards/orthoplus-database.json` (9 panels)
- **Alertas**: `prometheus-alerts.yml` (circuit breaker OPEN, DB DOWN, backup failure, alta latencia)
- **Scrape**: Prometheus coleta a cada 10s via `backend:3005/metrics`

---

## 14. Spec-Kit Extensions (SDD Workflow)

O projeto utiliza **Spec-Kit v0.8.11** para Spec-Driven Development com **34 extensões** instaladas.

### Extensões Instaladas

| # | Extensão | Versão | Propósito | Tier |
|---|----------|--------|-----------|------|
| 1 | `git` | 1.0.0 | Feature branching workflow | Bundled |
| 2 | `brownfield` | 1.0.0 | Bootstrap SDD para codebase existente | T1 |
| 3 | `architecture-guard` | 1.8.4 | Governança de arquitetura contínua | T1 |
| 4 | `repoindex` | 1.0.0 | Indexar repositório existente | T1 |
| 5 | `blueprint` | 1.0.0 | Blueprint review antes de implementar | T1 |
| 6 | `status` | 1.0.0 | Status/progresso do projeto | T1 |
| 7 | `doctor` | 1.0.0 | Diagnóstico de saúde do projeto | T1 |
| 8 | `memory-loader` | 1.0.0 | Carregar `.specify/memory/` no contexto | T1 |
| 9 | `checkpoint` | 1.0.0 | Commits durante implementação | T1 |
| 10 | `staff-review` | 1.0.0 | Staff-level code review | T2 |
| 11 | `verify` | 1.0.3 | Quality gate pós-implementação | T2 |
| 12 | `verify-tasks` | 1.0.0 | Detectar tasks fantasmas | T2 |
| 13 | `cleanup` | 1.0.0 | Cleanup pós-implementação (scout rule) | T2 |
| 14 | `fix-findings` | 1.0.0 | Auto analyze-fix-reanalyze | T2 |
| 15 | `fixit` | 1.0.0 | Bugfix spec-aware | T2 |
| 16 | `ripple` | 1.0.0 | Detectar side effects | T2 |
| 17 | `security-review` | 1.5.0 | Security audits | T2 |
| 18 | `iterate` | 2.0.0 | Iterar specs mid-implementation | T3 |
| 19 | `refine` | 1.0.0 | Atualizar specs in-place | T3 |
| 20 | `red-team` | 1.0.2 | Adversarial review de specs | T3 |
| 21 | `critique` | 1.0.0 | Dual-lens review | T3 |
| 22 | `sync` | 0.1.0 | Detectar drift specs vs código | T3 |
| 23 | `reconcile` | 1.0.0 | Reconciliar drift | T3 |
| 24 | `scope` | 1.0.0 | Estimação de esforço | T4 |
| 25 | `version-guard` | 1.2.0 | Verificar versões do tech stack | T4 |
| 26 | `diagram` | 1.0.0 | Mermaid diagrams de workflow | T4 |
| 27 | `github-issues` | 1.0.0 | Sync com GitHub Issues | T5 |
| 28 | `ship` | 1.0.0 | Pipeline de release | T5 |
| 29 | `agent-governance` | 1.1.0 | Governança local de agentes | T6 |
| 30 | `memorylint` | 1.3.0 | Auditar AGENTS.md vs constitution | T6 |
| 31 | `squad` | 1.1.0 | Squad agent team | T6 |
| 32 | `arch` | 1.1.0 | 4+1 architecture views | T7 |
| 33 | `retrospective` | 1.0.0 | Retrospectiva pós-implementação | T8 |
| 34 | `retro` | 1.0.0 | Sprint retrospective | T8 |
| 35 | `archive` | 1.0.0 | Arquivar features merged | T9 |

**Falhas (manifest bugs upstream):** `spectest`, `changelog`, `pr-bridge`, `ci-guard`, `architect-preview`.

### Hooks Ativos

Configurados em `.specify/extensions.yml`:
- **`after_specify`**: `memory-loader.load` (obrigatório) + `red-team.review` (opcional)
- **`after_plan`**: `blueprint.generate` + `scope.estimate` + `architecture-guard.governed-plan`
- **`after_tasks`**: `verify-tasks.check` + `squad.bootstrap`
- **`before_implement`**: `blueprint.validate` + `architecture-guard.governed-implement`
- **`after_implement`**: `checkpoint.commit` → `verify.validate` → `ripple.analyze` → `security-review.audit` → `staff-review.review` → `cleanup.run` → `architecture-guard.architecture-verify`
- **`after_analyze`**: `critique.review` + `memorylint.audit`
- **`after_retrospective`**: `archive.run`

### Comandos Essenciais

```bash
# Diagnóstico
/speckit.doctor.check
/speckit.status.show
/speckit.version-guard.check

# Brownfield (para novos módulos em codebase existente)
/speckit.brownfield.scan
/speckit.brownfield.bootstrap

# Quality Gates (pós-implementação)
/speckit.verify.validate
/speckit.ripple.analyze
/speckit.staff-review.review
/speckit.cleanup.run
/speckit.security-review.audit

# Spec Evolution
/speckit.iterate.define
/speckit.refine.update
/speckit.sync.detect
/speckit.reconcile.run

# Architecture
/speckit.arch.generate
/speckit.architecture-guard.architecture-review
/speckit.architecture-guard.violation-detection
```

---

## 15. Anti-Padroes e TS Errors Conhecidos

**Nao adicionar novos:**
- `as any` — ja existem amplamente (ex: `FinanceiroController.ts` tem ~38). Nao aumentar.
- `@ts-ignore` — ja existem. Nao adicionar novos.
- `@ts-expect-error` inuteis — remover se encontrados.

**Erros TypeScript pre-existentes (nao regredir):**
- `agenda/api/agendaController.ts` — 4 erros de mismatch Prisma (String vs relacao).
- `auth/api/AuthController.ts` — 1 erro de import `@orthoplus/shared-types`.
- `crypto-pagamentos` — multiplos aliases `@financeiro` nao mapeados no tsconfig.
- `marketing-auto/IndicacoesTab.tsx` — variant string incompativel.
- `dentistas/useDentistaForm.ts` — campo `horarioAtendimento` inexistente no tipo.
- `usuarios/UserForm.tsx` — SubmitHandler generic mismatch.
- `financeiro/ConciliacaoBancaria.tsx` — `@ts-expect-error` inutil.
- `auth/Auth.tsx`, `pacientes/PacientesListPage.tsx` — variant `cta` nao existe no Button.

**Arquivos criticos — NUNCA editar manualmente:**
- `apps/web/src/types/database.ts` — ~8929 linhas, autogenerado pelo Prisma. **Regenerar obrigatoriamente após `prisma migrate dev` ou qualquer alteração em `schema.prisma`. Nunca editar manualmente.**

**ESLint:**
- `eslint.config.js` na raiz desabilita a **maioria** das regras TypeScript (incluindo `no-explicit-any`, `no-floating-promises`, `no-misused-promises`, etc.).
- Target: 0 erros, warnings tolerados (~98 atualmente).

---

## 16. Checklist antes de Commit

- [ ] `cd backend && pnpm build` passa sem erros (tsc + tsc-alias sao estritos).
- [ ] `cd apps/web && pnpm type-check` passa (erros pre-existentes listados acima sao esperados).
- [ ] `pnpm lint` passa.
- [ ] Nenhuma credencial/secrets adicionado ao codigo.
- [ ] `.env` nao foi commitado.
- [ ] `clinicGuard` aplicado em novos routers do backend.
- [ ] Testes existentes passam (`pnpm test`).
- [ ] Se modificou `AGENTS.md` em subdiretorios, atualizar data de atualizacao.

---

## 17. Referencia Rapida de Arquivos

| Proposito | Caminho |
|-----------|---------|
| Entry backend | `backend/src/index.ts` |
| Entry frontend | `apps/web/src/main.tsx` |
| Rotas frontend | `apps/web/src/routes/AppRoutes.tsx` |
| API Client | `apps/web/src/lib/api/apiClient.ts` |
| Auth frontend | `apps/web/src/contexts/AuthContext.tsx` |
| Auth middleware | `backend/src/middleware/authMiddleware.ts` |
| clinicGuard | `backend/src/middleware/clinicGuard.ts` |
| Error handler / ApiError | `backend/src/middleware/errorHandler.ts` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Prisma client | `backend/src/infrastructure/database/prismaClient.ts` |
| Logger | `backend/src/infrastructure/logger/index.ts` |
| Workers | `backend/src/workers/index.ts` |
| Backend tests | `backend/tests/unit/` |
| Frontend tests | `apps/web/src/**/*.test.{ts,tsx}` |
| E2E tests | `tests/e2e/` |
| Playwright config | `playwright.config.ts` |
| ESLint config | `eslint.config.js` |
| Tailwind config | `frontend/tailwind.config.js` |
| Vite config | `apps/web/vite.config.ts` |
| Root package.json | `package.json` |
| Turbo config | `turbo.json` |
| pnpm workspaces | `pnpm-workspace.yaml` |
| Core UI package | `categories/@orthoplus/core/packages/ui/` |
| Shared types | `shared-types/src/index.ts` |
| Agent service entry | `agent-service/src/main.py` |
| Nginx config | `nginx.conf` |
| Docker Compose root | `docker-compose.yml` |
| Backend Dockerfile | `backend/Dockerfile` |
| Frontend Dockerfile | `Dockerfile` |

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
