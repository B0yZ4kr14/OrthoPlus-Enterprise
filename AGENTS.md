<!--
  AGENTS.md — OrthoPlus Enterprise (Root)
  Arquivo de referencia canonico para agentes de IA.
  Idioma principal do projeto: Portugues (codigo e documentacao).
  **Atualizado:** 2026-05-19
-->

# AGENTS.md — OrthoPlus Enterprise

> Este arquivo e o ponto de entrada para agentes de IA. Leia-o por inteiro antes de modificar qualquer arquivo.
> Subdiretorios podem conter `AGENTS.md` adicionais com regras mais especificas que **supersedem** as deste arquivo.
>
> **Regras arquiteturais, padroes de design e principios de codigo estao em `.specify/memory/constitution.md`.**
> Consulte a constituicao antes de tomar decisoes de arquitetura ou design.

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
│   │   ├── modules/              # 39 modulos de UI (37 de negocio + 2 de infraestrutura: core, ui)
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
│   │   ├── modules/              # 38 modulos de dominio
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
│   ├── deploy-ubuntu.sh          # Bootstrap Ubuntu Server
│   └── validate-production.sh    # Validacao de variaveis antes do deploy
│
├── .github/workflows/            # 15 workflows (CI/CD, E2E, security, deploy)
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

## 4. Comandos de Build e Teste

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

> **Nota:** O script `format:check` e usado no CI (`quality-check.yml`) para verificar formatacao. Nao esta definido no root `package.json` — e injetado via CI ou pode ser executado com `npx prettier --check "**/*.{ts,tsx,json,md}"`.

### Backend
```bash
cd backend
pnpm dev              # nodemon + tsx (hot reload)
pnpm build            # tsc -p tsconfig.build.json && tsc-alias (ESTRITO — falha em erro)
pnpm start            # node dist/index.js
pnpm test             # jest (17 suites, ~367 testes)
pnpm lint             # ESLINT_USE_FLAT_CONFIG=false eslint src --ext .ts
pnpm predeploy        # Valida env vars criticas e flags de seguranca
```

### Frontend
```bash
cd apps/web
pnpm dev              # Vite dev server (porta 3000)
pnpm build            # vite build (terser, drop_console, chunks manuais)
pnpm lint             # eslint . --report-unused-disable-directives
pnpm type-check       # tsc --noEmit
```

### Agent Service
```bash
cd agent-service
python src/main.py                      # Desenvolvimento
uvicorn src.main:app --reload --port 8000  # Alternativa com reload
```

---

## 5. Git Workflow e CI/CD

### Estrategia de Branch
- **Branches ativas:** `main` (producao) e `develop` (integracao).
- Pull requests devem passar nos gates de CI antes do merge.
- Commits diretos em `main` sao permitidos apenas para hotfixes emergenciais.

### Pre-commit Hook
Localizado em `.husky/pre-commit`:
```bash
pnpm lint
pnpm type-check
```
Se qualquer comando falhar, o commit e abortado.

### Workflows do GitHub Actions (`.github/workflows/`)

| Workflow | Gatilho | Proposito |
|----------|---------|-----------|
| `ci.yml` | push/PR em `main` | Build de shared-types, frontend e backend em sequencia |
| `build.yml` | push/PR em `main`, `develop` | Type-check + build + bundle size gate (<10MB) + backend build & test |
| `quality-check.yml` | push/PR em `main`, `develop` | Type-check, lint (continue-on-error), format-check (continue-on-error), build, test, validate:quality, bundle size gate |
| `test.yml` | push/PR em `main`, `develop` | Vitest unit tests + upload de coverage para Codecov |
| `e2e-tests.yml` | push/PR em `main`, `develop` | Playwright E2E com PostgreSQL service (Chromium, Firefox, WebKit) |
| `playwright.yml` | workflow_dispatch | E2E contra staging (Tailscale endpoint) |
| `security.yml` | push/PR em `main` + cron segunda-feira | Auditoria de dependencias, ESLint security scan |
| `production-validation.yml` | push/PR em `main` | Dry-run producao + security audit |
| `deploy-vps-orthoplus.yml` | push em `main` + dispatch | SCP backend dist + frontend dist para VPS via SSH, reload PM2 |
| `deploy-vps-tsi-02.yml` | push em `main` + dispatch | Deploy alternativo para VPS tsi-02 |
| `deploy.yml` | push em `main`, `master` | Deploy para Proxmox VM200 via SSH |
| `cd.yml` | push em `main` | CD autonomo para VM200 |
| `zscan.yml` | push/PR em `main` | Zimperium zScan (mobile security) — continue-on-error ate configurado |

### Concorrencia
- Todos os workflows usam `concurrency: group: <workflow>-${{ github.ref }}` com `cancel-in-progress: true`, exceto deploys que usam `cancel-in-progress: false`.

---

## 6. Deploy e Operacoes

### Docker Compose

| Arquivo | Ambiente | Observacao |
|---------|----------|------------|
| `docker-compose.yml` | Local/Dev | Stack completo: frontend, backend, Postgres, Redis, nginx, Prometheus, Grafana. |
| `docker-compose.prod.yml` | Producao (cloud) | Backend + Frontend + Redis. **Sem Postgres** — espera DB externo via connection string. |
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
- **`scripts/validate-production.sh`** — Valida variaveis de ambiente criticas antes do deploy. Verifica env vars obrigatorias, ausencia de placeholders, flags de seguranca desativadas, etc. Retorna exit code 1 em violacoes criticas.

### Nginx (`nginx.conf`)
- Reverse proxy para `/api/*` -> backend, `/api/agent/*` -> agent-service, `/s3/*` -> MinIO, `/` -> SPA.
- `try_files` fallback para `index.html` (SPA).
- Cache de assets estaticos: 1 ano.
- Rate limiting por zona.

---

## 7. Variaveis de Ambiente e Seguranca Operacional

### Arquivos de Exemplo
| Arquivo | Proposito |
|---------|-----------|
| `.env.example` | Configuracao basica de desenvolvimento |
| `.env.production.example` | Configuracao de producao com comentarios de seguranca |
| `.env.ubuntu.example` | Configuracao para deploy em Ubuntu Server LTS |

### Variaveis Criticas (nunca commitar)
- Chave de assinatura do token de autenticacao — minimo 256 bits de entropia.
- Connection string do banco de dados PostgreSQL.
- Senhas de Redis, PostgreSQL e Grafana.
- Flag de mock de autenticacao — **proibido em producao** (`predeploy` falha se ativada).
- Flag de endpoints admin perigosos — **proibido em producao**.

### Validacoes de Seguranca no CI/CD
- `production-validation.yml` executa `validate-production.sh` com `NODE_ENV=production`.
- `security.yml` executa auditoria de dependencias toda segunda-feira.
- `zscan.yml` escaneia binarios mobile (continue-on-error ate configuracao completa).

---

## 8. Toolchain e Configuracoes

### pnpm Workspaces
Definido em `pnpm-workspace.yaml`:
```yaml
packages:
  - "categories/@orthoplus/*"
  - "categories/@orthoplus/*/packages/*"
  - "apps/*"
  - "backend"
  - "shared-types"
```

### Turbo (`turbo.json`)
- `build` depende de `^build` (topologico).
- `dev` e `clean` tem `cache: false`.
- `lint`, `type-check`, `test` nao tem dependencias explicitas.

### ESLint
- **Root (`eslint.config.js`):** Flat config com `typescript-eslint`, `react-hooks`, `react-refresh`. A maioria das regras TypeScript esta desabilitada (incluindo `no-explicit-any`, `no-floating-promises`, `no-misused-promises`). Target: 0 erros, warnings tolerados (~98).
- **Backend:** Usa `ESLINT_USE_FLAT_CONFIG=false` porque ainda depende de ESLint v8 com config legacy (`@typescript-eslint/eslint-plugin` v7).

### Prettier
- Executado via `pnpm format` no root.
- Scope: `**/*.{ts,tsx,json,md}`.
- Padrao: sem ponto e virgula no final das linhas.

---

## 9. Convencoes de Codigo

### TypeScript / Geral
- **ES Modules:** `import/export` obrigatorio. Nunca `require`.
- **Strict mode:** Tipagem obrigatoria (embora muitas regras ESLint estejam desabilitadas — ver secao 8).
- **Async/await:** Nunca callbacks. Sempre `async/await` ou Promises.
- **Sem ponto e virgula:** O projeto nao usa `;` no final das linhas (padrao do Prettier).

### Bash (Scripts)
- Shebang: `#!/bin/bash`
- `set -e` na segunda linha
- Funcoes de log coloridas padronizadas (copiar de scripts existentes)

> **Nota:** Convencoes especificas de backend e frontend (uso de ApiError, clinicGuard, apiClient, useAuth, gerenciamento de estado, etc.) estao documentadas na constituicao do projeto (`.specify/memory/constitution.md`).

---

## 10. Estrategia de Testes

### Backend — Jest + ts-jest
- **Config:** `backend/jest.config.js`
- **Diretorio:** `backend/tests/unit/` (17 arquivos `.test.ts`)
- **Suites:** agenda, auth, contratos, dashboard, financeiro, health, nfe, pdv, pep, split-pagamento, teleodonto, tiss, inadimplencia, fidelidade, estoque, lgpd
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

---

## 11. Anti-Padroes e TS Errors Conhecidos

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
- `apps/web/src/types/database.ts` — ~8929 linhas, autogenerado pelo Prisma. **Regenerar obrigatoriamente apos `prisma migrate dev` ou qualquer alteracao em `schema.prisma`. Nunca editar manualmente.**

**ESLint:**
- `eslint.config.js` na raiz desabilita a **maioria** das regras TypeScript (incluindo `no-explicit-any`, `no-floating-promises`, `no-misused-promises`, etc.).
- Target: 0 erros, warnings tolerados (~98 atualmente).

---

## 12. Glossario de Nomes — Frontend vs Backend

> Mapeamento oficial de nomes entre camadas. Sempre usar estes nomes em novos artefatos.

### Modulos com Nomes Divergentes

| Funcionalidade | Diretorio Frontend | Diretorio Backend | Rota Frontend | Rota API |
|----------------|-------------------|-------------------|---------------|----------|
| Administracao | `admin` | `admin_tools` | `/admin/*` | `/api/admin` |
| Configuracoes | `settings` | `configuracoes` | `/configuracoes/*` | `/api/configuracoes` |
| Crypto Pagamentos | `crypto` | `crypto_config` | `/crypto-payment` | `/api/crypto`, `/api/crypto_config` |
| Financeiro/Fiscal | `financeiro` | `faturamento` | `/financeiro/*` | `/api/faturamento`, `/api/fiscal` |
| Marketing | `marketing-auto` | `marketing` | `/marketing-auto`, `/recall` | `/api/marketing` |
| IA Radiografia | `ia-radiografia` | `ai` | `/ia-radiografia` | `/api/ai` |
| Cobranca/Inadimplencia | `cobranca` / `inadimplencia` | `inadimplencia` | `/inadimplencia` | `/api/inadimplencia` |
| Estoque/Inventario | `estoque` / `inventario` | `inventario` | `/estoque/*`, `/inventario/dashboard` | `/api/estoque`, `/api/inventario` |
| Split Pagamento | `split-pagamento` | `split_pagamento` | `/split-pagamento` | `/api/split-pagamento`, `/api/split` |

### Modulos com Nomes Identicos

`agenda`, `auth`, `bi`, `contratos`, `crm`, `dashboard`, `fidelidade`, `files`, `funcionarios`, `lgpd`, `orcamentos`, `pacientes`, `pdv`, `pep`, `procedimentos`, `teleodonto`, `tiss`

### Modulos Backend sem Frontend Dedicado

| Backend | Rota API | Observacao |
|---------|----------|------------|
| `analytics` | `/api/analytics` | APIs internas de metricas |
| `comm` | `/api/comm` | APIs de comunicacao |
| `notifications` | `/api/notifications` | Notificacoes push |
| `nfe` | `/api/nfe` | Nota Fiscal Eletronica |
| `agents` | `/api/agents` | Usa agent-service externo (porta 8000) |

### Modulos Frontend sem Backend Dedicado

| Frontend | Rota | Observacao |
|----------|------|------------|
| `landpage` | `/` | Pagina publica (sem API) |
| `portal-paciente` | `/portal-paciente` | Portal do paciente |
| `odontograma` | `/odontograma` | Reusa dados de pacientes |
| `tratamentos` | `/tratamentos` | Reusa modulo PEP |

### Modulos de Infraestrutura (nao de negocio)

| Diretorio | Camada | Proposito |
|-----------|--------|-----------|
| `application` | Frontend | Configuracao de aplicacao |
| `core` | Frontend | Pacotes internos re-exportados |
| `domain` | Frontend | Tipos/entidades compartilhados |
| `ui` | Frontend | Componentes internos do modulo admin |
| `dashboards` | Frontend | Dashboards comerciais secundarios |

---

## 13. Checklist antes de Commit

- [ ] `cd backend && pnpm build` passa sem erros (tsc + tsc-alias sao estritos).
- [ ] `cd apps/web && pnpm type-check` passa (erros pre-existentes listados acima sao esperados).
- [ ] `pnpm lint` passa.
- [ ] Nenhuma credencial/secrets adicionado ao codigo.
- [ ] `.env` nao foi commitado.
- [ ] `clinicGuard` aplicado em novos routers do backend.
- [ ] Testes existentes passam (`pnpm test`).
- [ ] Se modificou `AGENTS.md` em subdiretorios, atualizar data de atualizacao.
- [ ] Se modificou `schema.prisma`, regenerar `apps/web/src/types/database.ts`.

---

## 14. Referencia Rapida de Arquivos

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
| Pre-commit hook | `.husky/pre-commit` |
| Production validation | `scripts/validate-production.sh` |
| Constituicao do projeto | `.specify/memory/constitution.md` |

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/017-omk-governance-integration/plan.md

**Active Feature**: 017-omk-governance-integration (OMK Governance Integration)
**Status**: Completed
<!-- SPECKIT END -->

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **OrthoPlus-Enterprise** (33916 symbols, 71142 relationships, 288 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/OrthoPlus-Enterprise/context` | Codebase overview, check index freshness |
| `gitnexus://repo/OrthoPlus-Enterprise/clusters` | All functional areas |
| `gitnexus://repo/OrthoPlus-Enterprise/processes` | All execution flows |
| `gitnexus://repo/OrthoPlus-Enterprise/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
