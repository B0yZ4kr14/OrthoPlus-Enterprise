<!--
  AGENTS.md — OrthoPlus Enterprise (Root)
  Arquivo de referencia canonico para agentes de IA.
  Idioma principal do projeto: Portugues (codigo e documentacao).
  **Atualizado:** 2026-05-31
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

| Servico           | Porta Dev     | Porta Producao |
| ----------------- | ------------- | -------------- |
| Frontend (Vite)   | 3000          | 8080 (nginx)   |
| Backend (Express) | 3005          | 3005           |
| Agent Service     | 8000          | 8000           |
| PostgreSQL        | — (container) | 5432           |
| Redis             | — (container) | 6379           |

---

## 2. Estrutura de Diretorios

```
OrthoPlus-Enterprise/
├── apps/web/                     # Frontend React (SPA)
│   ├── src/
│   │   ├── main.tsx              # Ponto de entrada
│   │   ├── App.tsx               # Providers globais
│   │   ├── routes/AppRoutes.tsx  # React Router v6 (lazy-loaded)
│   │   ├── components/           # ~32 pastas de componentes compartilhados
│   │   ├── modules/              # 39 modulos de UI (37 negocio + 2 infra: core, ui)
│   │   ├── domain/               # Entidades, repos, events, value-objects
│   │   ├── application/use-cases/# Casos de uso por dominio
│   │   ├── infrastructure/       # Repos concretos, DI, event bus, mappers
│   │   ├── hooks/                # Hooks globais + hooks de API
│   │   ├── contexts/             # AuthContext, ModulesContext, ThemeContext
│   │   ├── lib/                  # apiClient, utils, adapters, schemas
│   │   └── types/database.ts     # ~8928 linhas, AUTOGERADO (nao editar)
│   ├── vite.config.ts            # Alias, proxy /api -> :3005, chunks manuais
│   └── vitest.config.ts          # Testes unitarios (jsdom)
│
├── backend/                      # Backend Node.js / Express
│   ├── src/
│   │   ├── index.ts              # Ponto de entrada (~437 linhas)
│   │   ├── middleware/           # auth, clinicGuard, errorHandler, lgpd
│   │   ├── modules/              # 38 modulos de dominio
│   │   ├── workers/              # Cron jobs + scheduler de backup
│   │   ├── infrastructure/       # Prisma singleton, logger (Winston), Redis
│   │   ├── shared/               # CQRS bus, event registry
│   │   ├── routes/modules.ts     # Rotas legadas de gerenciamento de modulos
│   │   └── custom.d.ts           # Extensao de Request (user, clinicId)
│   ├── prisma/schema.prisma      # ~3102 linhas, multi-schema PostgreSQL
│   ├── tests/unit/               # 26 suites de teste (Jest)
│   └── jest.config.js            # ts-jest, coverage threshold 20%
│
├── agent-service/                # Microservico Python/FastAPI
│   ├── src/main.py               # FastAPI app, endpoints /api/agents/*
│   ├── src/config.py             # Env vars, API keys, contexto do projeto
│   ├── src/agents/               # Backend, Frontend, Database agents
│   ├── src/models/               # Providers LLM (Google GenAI, OpenAI)
│   ├── src/workflows/            # crud, bugfix, refactor
│   └── src/tools/                # ReadFile, WriteFile, SearchCode, PrismaTools
│
├── shared-types/                 # Tipos TypeScript cross-stack
│   └── src/index.ts              # ApiResponse, auth, pacientes, agenda...
│
├── categories/@orthoplus/        # Pacotes internos (source-only, exceto shared-types)
│   └── core/packages/
│       ├── ui/                   # Componentes (Radix + CVA + Tailwind)
│       ├── hooks/                # useToast (sonner wrapper)
│       ├── types/                # Tipos globais frontend
│       └── utils/                # formatDate, formatCurrency, cn
│   └── admin-devops/packages/
│       └── database-config/      # Configuracao de banco de dados
│
├── scripts/                      # Scripts de deploy (bash)
│   ├── deploy-orthoplus-full.sh  # Deploy completo para VPS
│   ├── deploy-vps.sh             # Deploy VPS simplificado
│   ├── deploy-prod.sh            # Docker Compose producao
│   ├── deploy-ubuntu.sh          # Bootstrap Ubuntu Server
│   └── validate-production.sh    # Validacao de variaveis antes do deploy
│
├── .github/workflows/            # 15+ workflows (CI/CD, E2E, security, deploy)
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
- `express-rate-limit` ^8.5.2 — Rate limiting
- `zod` ^3.25.76 — Validacao de schemas
- `winston` ^3.11.0 — Logging
- `ioredis` ^5.10.0 — Client Redis
- `node-cron` ^4.2.1 — Cron jobs
- `prom-client` ^15.1.0 — Metricas Prometheus
- `pg` ^8.11.3 — Driver PostgreSQL nativo
- `multer` ^2.1.1 — Upload de arquivos
- `nodemailer` ^8.0.7 — Envio de e-mail
- `cookie-parser` ^1.4.7 — Parsing de cookies
- `cors` ^2.8.5 — CORS
- `dotenv` ^16.3.1 — Variaveis de ambiente
- `axios` ^1.16.1 — HTTP client

### Frontend

- `react` ^18.3.1 + `react-dom` ^18.3.1
- `vite` ^8.0.0 (plugin `@vitejs/plugin-react-swc`)
- `tailwindcss` ^3.4.17 + `postcss` + `autoprefixer`
- `@tanstack/react-query` ^5.96.1 — Server state
- `react-router-dom` ^6.30.1 — Roteamento
- `react-hook-form` ^7.72.0 + `@hookform/resolvers` — Formularios
- `zod` ^4.3.6 — Validacao frontend
- `axios` ^1.16.1 — HTTP client (wrappado por `apiClient`)
- `lucide-react` ^0.462.0 — Icones
- `framer-motion` ^12.38.0 — Animacoes
- `date-fns` ^4.1.0 — Manipulacao de datas (sempre via `date.utils.ts`)
- `recharts` ^2.15.4 — Graficos
- `sonner` ^1.7.4 — Toasts
- `fabric`, `jspdf`, `html2canvas`, `exceljs` — PDF, canvas, Excel
- `@dnd-kit/core` ^6.3.1 — Drag and drop
- `@react-three/fiber` + `@react-three/drei` — 3D rendering
- `qrcode` ^1.5.4 — Geracao de QR codes
- `uuid` ^13.0.1 — UUIDs
- `canvas-confetti` ^1.9.4 — Efeitos visuais

### Agent Service

- Python 3.14
- `fastapi` ^0.135.3 + `uvicorn` ^0.43.0
- `agno` ^2.5.14 — Framework de agentes LLM
- `pydantic` ^2.12.5 — Validacao
- `google-genai`, `openai` — Providers LLM
- `GitPython` ^3.1.46 — Integracao Git

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
pnpm guard            # Style guard: detecta cores Tailwind nativas/hardcoded em UI
```

> **Nota:** O script `format:check` esta definido no root `package.json` e usado no CI (`quality-check.yml`).

### Backend

```bash
cd backend
pnpm dev              # nodemon + tsx (hot reload)
pnpm build            # tsc -p tsconfig.build.json && tsc-alias (ESTRITO — falha em erro)
pnpm start            # node dist/index.js
pnpm test             # jest (48 suites, ~741+ testes)
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
pnpm preview          # Preview do build de producao
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

| Workflow                    | Gatilho                                | Proposito                                                                                                               |
| --------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                    | push/PR em `main`                      | Build de shared-types, frontend e backend em sequencia                                                                  |
| `build.yml`                 | push/PR em `main`, `develop`           | Type-check + build + bundle size gate (<10MB) + backend build & test                                                    |
| `quality-check.yml`         | push/PR em `main`, `develop`           | Type-check, lint (continue-on-error), format-check (continue-on-error), build, test, validate:quality, bundle size gate |
| `test.yml`                  | push/PR em `main`, `develop`           | Vitest unit tests + upload de coverage para Codecov                                                                     |
| `e2e-tests.yml`             | push/PR em `main`, `develop`           | Playwright E2E com PostgreSQL service (Chromium, Firefox, WebKit)                                                       |
| `playwright.yml`            | workflow_dispatch                      | E2E contra staging (Tailscale endpoint)                                                                                 |
| `security.yml`              | push/PR em `main` + cron segunda-feira | Auditoria de dependencias, ESLint security scan                                                                         |
| `production-validation.yml` | push/PR em `main`                      | Dry-run producao + security audit                                                                                       |
| `deploy-vps-orthoplus.yml`  | push em `main` + dispatch              | SCP backend dist + frontend dist para VPS via SSH, reload PM2                                                           |
| `deploy-vps-tsi-02.yml`     | push em `main` + dispatch              | Deploy alternativo para VPS tsi-02                                                                                      |
| `deploy.yml`                | push em `main`, `master`               | Deploy para Proxmox VM200 via SSH                                                                                       |
| `cd.yml`                    | push em `main`                         | CD autonomo para VM200                                                                                                  |
| `zscan.yml`                 | push/PR em `main`                      | Zimperium zScan (mobile security) — continue-on-error ate configurado                                                   |
| `gitnexus-index.yml`        | push em `main`                         | Reindexacao automatica do GitNexus                                                                                      |
| `speckit-compliance.yml`    | push/PR em `main`                      | Validacao de conformidade com SpecKit                                                                                   |

### Concorrencia

- Todos os workflows usam `concurrency: group: <workflow>-${{ github.ref }}` com `cancel-in-progress: true`, exceto deploys que usam `cancel-in-progress: false`.

### Convencao de Commits

O projeto segue uma convencao inspirada em Conventional Commits, observada na pratica do historico de commits:

- `feat(<scope>):` — Nova funcionalidade
- `fix(<scope>):` — Correcao de bug
- `docs(<scope>):` — Documentacao
- `chore(<scope>):` — Tarefas de manutencao
- `polish(<scope>):` — Ajustes finos de UI/UX (tipo customizado do projeto)
- `refactor(<scope>):` — Refatoracao de codigo
- `test(<scope>):` — Adicao ou correcao de testes
- Escopos comuns: `ui`, `backend`, `brownkit`, `infra`, etc.
- Mensagens de commit podem ser em portugues.

---

## 6. Deploy e Operacoes

### Docker Compose

| Arquivo                     | Ambiente          | Observacao                                                                                                                   |
| --------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.yml`        | Local/Dev         | Stack completo: frontend, backend, Postgres, Redis, nginx, Prometheus, Grafana, Agent Service, node-exporter, redis-exporter |
| `docker-compose.prod.yml`   | Producao (cloud)  | Backend + Frontend + Redis. **Sem Postgres** — espera DB externo via connection string                                       |
| `docker-compose.ubuntu.yml` | Ubuntu Server LTS | Stack completo com limites de recurso, volumes bind-mounted em `/opt/orthoplus/data`, PostgreSQL otimizado                   |
| `docker-compose.onprem.yml` | On-premise        | + MinIO S3, 3 redes segregadas, replicas frontend (2) e backend (3), node-exporter                                           |

### Dockerfiles

- **Frontend (`Dockerfile`):** Multi-stage (node:20-alpine builder -> nginx:1.25-alpine). Expoe 8080. Healthcheck via wget. Build inclui geracao de CSS Tailwind.
- **Backend (`backend/Dockerfile`):** Multi-stage (node:20-alpine builder + prisma generate -> node:20-alpine production com `postgresql-client` para backups). Expoe 3005. Healthcheck via wget.
- **Agent Service (`agent-service/Dockerfile`):** Python slim com FastAPI.

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
- TLS 1.3 com cipher suites fortes.
- Headers de seguranca (CSP, HSTS, X-Frame-Options, etc.).

---

## 7. Variaveis de Ambiente e Seguranca Operacional

### Arquivos de Exemplo

| Arquivo                   | Proposito                                             |
| ------------------------- | ----------------------------------------------------- |
| `.env.example`            | Configuracao basica de desenvolvimento                |
| `.env.production.example` | Configuracao de producao com comentarios de seguranca |
| `.env.ubuntu.example`     | Configuracao para deploy em Ubuntu Server LTS         |

### Variaveis Criticas (nunca commitar)

- `JWT_SECRET` — Chave de assinatura do token de autenticacao (minimo 256 bits de entropia).
- `DATABASE_URL` — Connection string do banco de dados PostgreSQL.
- `REDIS_PASSWORD` / `POSTGRES_PASSWORD` / `GRAFANA_PASSWORD` — Senhas de servicos.
- `AUTH_ALLOW_MOCK` — Flag de mock de autenticacao — **proibido em producao** (`predeploy` falha se ativada).
- Endpoints admin perigosos — **proibidos em producao**.

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

### TypeScript

- **Frontend (`apps/web/tsconfig.json`):** Target ES2020, Module ESNext, Strict true.
- **Backend (`backend/tsconfig.json`):** Target ES2022, Module CommonJS, Strict true, `noUnusedLocals: true`, `noUnusedParameters: true`.
- **Shared Types (`shared-types/tsconfig.json`):** Target ES2020, gera `.d.ts`.

### ESLint

- **Root (`eslint.config.js`):** Flat config com `typescript-eslint`, `react-hooks`, `react-refresh`. A maioria das regras TypeScript esta desabilitada (incluindo `no-explicit-any`, `no-floating-promises`, `no-misused-promises`). Target: 0 erros, warnings tolerados (~98).
- **Backend:** Usa `ESLINT_USE_FLAT_CONFIG=false` porque ainda depende de ESLint v8 com config legacy (`@typescript-eslint/eslint-plugin` v7).

### Prettier

- Executado via `pnpm format` no root.
- Scope: `**/*.{ts,tsx,json,md}`.
- Padrao: sem ponto e virgula no final das linhas.

### Tailwind CSS

- Configuracao central em `tailwind.config.ts` (raiz do monorepo).
- `darkMode: ["class"]` — classe CSS controla tema escuro.
- Cores customizadas via CSS variables (HSL): `--interactive`, `--primary`, `--background`, etc.
- Fontes: Inter (sans), Plus Jakarta Sans (display), JetBrains Mono (mono).
- Animacoes customizadas: fade-in, slide-in, shimmer, shake, glow, ripple, pulse-border.
- Safelist extensa para cores dinamicas.
- Plugin: `tailwindcss-animate`.

---

## 9. Convencoes de Codigo

### Bash (Scripts)

- Shebang: `#!/bin/bash`
- `set -e` na segunda linha
- Funcoes de log coloridas padronizadas (copiar de scripts existentes)

### Frontend

- **Path aliases:** `@/` -> `src/`, `@/components`, `@/hooks`, `@/lib`, `@/modules`, etc.

### Backend

- **Path aliases:** `@/` -> `src/`, `@modules/` -> `src/modules/`, `@infrastructure/` -> `src/infrastructure/`, `@shared/` -> `src/shared/`.

> **Nota:** Todas as convencoes arquiteturais detalhadas (Clean Architecture, uso de ApiError, clinicGuard, apiClient, useAuth, gerenciamento de estado, formularios, datas, icones, componentes UI, Prisma, logging, etc.) estao documentadas na constituicao do projeto (`.specify/memory/constitution.md`).

---

## 10. Estrategia de Testes

### Backend — Jest + ts-jest

- **Config:** `backend/jest.config.js`
- **Diretorio:** `backend/tests/unit/` (26 arquivos `.test.ts`)
- **Suites:** agenda, auth, contratos, crm, dashboard, fidelidade, financeiro, health, nfe, orcamentos, pacientes, pacienteSearch, pdv, pep, procedimentos, produto, splitPagamento, teleodonto, tiss, transaction
- **Coverage:** threshold global de **20%** (branches, functions, lines, statements).
- **Module name mapper:** `@/` -> `src/`, `@modules/` -> `src/modules/`, etc.

### Frontend — Vitest + jsdom

- **Config:** `vitest.config.ts` (raiz do monorepo)
- **Padrao:** `src/**/*.{test,spec}.{ts,tsx}`
- **Bibliotecas:** `@testing-library/react` para component tests.
- **Setup:** `src/test/setup.ts`
- **Exemplo:** `src/contexts/__tests__/AuthContext.test.tsx`, `src/lib/sync/__tests__/`.

### E2E — Playwright

- **Config:** `playwright.config.ts` (raiz do monorepo)
- **Diretorio:** `tests/e2e/`
- **Base URL:** `http://localhost:8080/OrthoPlus-Enterprise/`
- **Global setup:** `tests/e2e/global-setup.ts` (login + storage state)
- **Projetos:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari.
- **Timeout:** 120s global, 15s expect, 15s action, 30s navigation.
- **Retries:** 2 em CI, 0 local.
- **WebServer:** sobe backend (`localhost:3005`) e frontend (`localhost:8080`) automaticamente.
- **Report:** HTML + JSON + list.

---

## 11. TS Errors Conhecidos (Nao Regredir)

> **Nota:** As regras gerais de qualidade de codigo (proibicao de `as any`, `@ts-ignore`, `@ts-expect-error` inuteis) estao na constituicao (CQ-2). Esta secao lista apenas os erros pre-existentes que nao devem ser aumentados.

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

- `apps/web/src/types/database.ts` — ~8928 linhas, autogenerado pelo Prisma. **Regenerar obrigatoriamente apos `prisma migrate dev` ou qualquer alteracao em `schema.prisma`. Nunca editar manualmente.**

**ESLint:**

- `eslint.config.js` na raiz desabilita a **maioria** das regras TypeScript (incluindo `no-explicit-any`, `no-floating-promises`, `no-misused-promises`, etc.).
- Target: 0 erros, warnings tolerados (~98 atualmente).

---

## 12. Glossario de Nomes — Frontend vs Backend

> Mapeamento oficial de nomes entre camadas. Sempre usar estes nomes em novos artefatos.

### Modulos com Nomes Divergentes

| Funcionalidade         | Diretorio Frontend           | Diretorio Backend | Rota Frontend                         | Rota API                             |
| ---------------------- | ---------------------------- | ----------------- | ------------------------------------- | ------------------------------------ |
| Administracao          | `admin`                      | `admin_tools`     | `/admin/*`                            | `/api/admin`                         |
| Configuracoes          | `settings`                   | `configuracoes`   | `/configuracoes/*`                    | `/api/configuracoes`                 |
| Crypto Pagamentos      | `crypto`                     | `crypto_config`   | `/crypto-payment`                     | `/api/crypto`, `/api/crypto_config`  |
| Financeiro/Fiscal      | `financeiro`                 | `faturamento`     | `/financeiro/*`                       | `/api/faturamento`, `/api/fiscal`    |
| Financeiro (Transacoes)| `financeiro`                 | `financeiro`      | `/financeiro/*`                       | `/api/financeiro`, `/api/payments`   |
| Marketing              | `marketing-auto`             | `marketing`       | `/marketing-auto`, `/recall`          | `/api/marketing`                     |
| IA Radiografia         | `ia-radiografia`             | `ai`              | `/ia-radiografia`                     | `/api/ai`                            |
| Cobranca/Inadimplencia | `cobranca` / `inadimplencia` | `inadimplencia`   | `/inadimplencia`                      | `/api/inadimplencia`                 |
| Estoque/Inventario     | `estoque` / `inventario`     | `inventario`      | `/estoque/*`, `/inventario/dashboard` | `/api/estoque`, `/api/inventario`    |
| Split Pagamento        | `split-pagamento`            | `split_pagamento` | `/split-pagamento`                    | `/api/split-pagamento`, `/api/split` |

### Modulos com Nomes Identicos

`agenda`, `auth`, `bi`, `contratos`, `crm`, `dashboard`, `fidelidade`, `files`, `funcionarios`, `lgpd`, `orcamentos`, `pacientes`, `pdv`, `pep`, `procedimentos`, `teleodonto`, `tiss`

### Modulos Backend sem Frontend Dedicado

| Backend         | Rota API             | Observacao                             |
| --------------- | -------------------- | -------------------------------------- |
| `analytics`     | `/api/analytics`     | APIs internas de metricas              |
| `comm`          | `/api/comm`          | APIs de comunicacao                    |
| `notifications` | `/api/notifications` | Notificacoes push                      |
| `nfe`           | `/api/nfe`           | Nota Fiscal Eletronica                 |
| `agents`        | `/api/agents`        | Usa agent-service externo (porta 8000) |

### Modulos Frontend sem Backend Dedicado

| Frontend          | Rota               | Observacao               |
| ----------------- | ------------------ | ------------------------ |
| `landpage`        | `/`                | Pagina publica (sem API) |
| `portal-paciente` | `/portal-paciente` | Portal do paciente       |
| `odontograma`     | `/odontograma`     | Reusa dados de pacientes |
| `tratamentos`     | `/tratamentos`     | Reusa modulo PEP         |

### Modulos de Infraestrutura (nao de negocio)

| Diretorio     | Camada   | Proposito                            |
| ------------- | -------- | ------------------------------------ |
| `application` | Frontend | Configuracao de aplicacao            |
| `core`        | Frontend | Pacotes internos re-exportados       |
| `domain`      | Frontend | Tipos/entidades compartilhados       |
| `ui`          | Frontend | Componentes internos do modulo admin |
| `dashboards`  | Frontend | Dashboards comerciais secundarios    |

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

| Proposito                | Caminho                                               |
| ------------------------ | ----------------------------------------------------- |
| Entry backend            | `backend/src/index.ts`                                |
| Entry frontend           | `apps/web/src/main.tsx`                               |
| Rotas frontend           | `apps/web/src/routes/AppRoutes.tsx`                   |
| API Client               | `apps/web/src/lib/api/apiClient.ts`                   |
| Auth frontend            | `apps/web/src/contexts/AuthContext.tsx`               |
| Auth middleware          | `backend/src/middleware/authMiddleware.ts`            |
| clinicGuard              | `backend/src/middleware/clinicGuard.ts`               |
| Error handler / ApiError | `backend/src/middleware/errorHandler.ts`              |
| Prisma schema            | `backend/prisma/schema.prisma`                        |
| Prisma client            | `backend/src/infrastructure/database/prismaClient.ts` |
| Logger                   | `backend/src/infrastructure/logger/index.ts`          |
| Workers                  | `backend/src/workers/index.ts`                        |
| Backend tests            | `backend/tests/unit/`                                 |
| Frontend tests           | `apps/web/src/**/*.test.{ts,tsx}`                     |
| E2E tests                | `tests/e2e/`                                          |
| Playwright config        | `playwright.config.ts`                                |
| ESLint config            | `eslint.config.js`                                    |
| Tailwind config          | `tailwind.config.ts`                                  |
| Vite config              | `apps/web/vite.config.ts`                             |
| Root package.json        | `package.json`                                        |
| Turbo config             | `turbo.json`                                          |
| pnpm workspaces          | `pnpm-workspace.yaml`                                 |
| Core UI package          | `categories/@orthoplus/core/packages/ui/`             |
| Shared types             | `shared-types/src/index.ts`                           |
| Agent service entry      | `agent-service/src/main.py`                           |
| Nginx config             | `nginx.conf`                                          |
| Docker Compose root      | `docker-compose.yml`                                  |
| Backend Dockerfile       | `backend/Dockerfile`                                  |
| Frontend Dockerfile      | `Dockerfile`                                          |
| Pre-commit hook          | `.husky/pre-commit`                                   |
| Production validation    | `scripts/validate-production.sh`                      |
| Constituicao do projeto  | `.specify/memory/constitution.md`                     |

<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/017-omk-governance-integration/plan.md

**Active Feature**: 017-omk-governance-integration (OMK Governance Integration)
**Status**: Completed and Archived
**Archived**: 2026-05-19 in `.specify/memory/` (spec.md, plan.md, changelog.md)

**Recent Changes**:

- 2026-05-19: Feature 017 — OMK Governance Integration (GitNexus + SpecKit + OMK + VPS docs)
<!-- SPECKIT END -->

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **OrthoPlus-Enterprise** (31465 symbols, 66485 relationships, 267 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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

<!-- SPECKIT GOVERNANCE START -->

## Repository Agent Governance

Agent governance SSOT: `.specify/memory/agent-governance.md`.
Follow these repository instructions when working in this project.

## Governance Domains

- Agent Governance Domain: `.specify/memory/agent-governance.md` is the SSOT for agent collaboration rules, tool and MCP permissions, write boundaries, and skill invocation contracts.
- Project Governance Domain: independent SSOT, managed outside this projection.
- Keep governance domains decoupled; do not encode upstream/downstream dependencies between them.

## Resolved Repository Context

- Active Integration: codex
- Resolved Constraints File: AGENTS.md
- Installed Integrations: codex, kimi, claude, cursor-agent, copilot, opencode
- Governance Memory: .specify/memory/agent-governance.md (present)
- Skills: .agents/skills/speckit-adosync/SKILL.md, .agents/skills/speckit-agent-assign-assign/SKILL.md, .agents/skills/speckit-agent-assign-execute/SKILL.md, .agents/skills/speckit-agent-assign-validate/SKILL.md, .agents/skills/speckit-agent-governance-refresh/SKILL.md, .agents/skills/speckit-agent-orchestrator-discover/SKILL.md, .agents/skills/speckit-agent-orchestrator-index/SKILL.md, .agents/skills/speckit-agent-orchestrator-route/SKILL.md, .agents/skills/speckit-aide-create-item/SKILL.md, .agents/skills/speckit-aide-create-progress/SKILL.md, .agents/skills/speckit-aide-create-queue/SKILL.md, .agents/skills/speckit-aide-create-roadmap/SKILL.md, .agents/skills/speckit-aide-create-vision/SKILL.md, .agents/skills/speckit-aide-execute-item/SKILL.md, .agents/skills/speckit-aide-feedback-loop/SKILL.md, .agents/skills/speckit-analyze/SKILL.md, .agents/skills/speckit-arch-generate/SKILL.md, .agents/skills/speckit-arch-reverse/SKILL.md, .agents/skills/speckit-architecture-guard-architecture-apply/SKILL.md, .agents/skills/speckit-architecture-guard-architecture-review/SKILL.md, .agents/skills/speckit-architecture-guard-architecture-verify/SKILL.md, .agents/skills/speckit-architecture-guard-architecture-workflow/SKILL.md, .agents/skills/speckit-architecture-guard-governed-implement/SKILL.md, .agents/skills/speckit-architecture-guard-governed-plan/SKILL.md, .agents/skills/speckit-architecture-guard-governed-tasks/SKILL.md, .agents/skills/speckit-architecture-guard-init/SKILL.md, .agents/skills/speckit-architecture-guard-refactor-generator/SKILL.md, .agents/skills/speckit-architecture-guard-violation-detection/SKILL.md, .agents/skills/speckit-archive-run/SKILL.md, .agents/skills/speckit-azure-devops-sync/SKILL.md, .agents/skills/speckit-blueprint-generate/SKILL.md, .agents/skills/speckit-blueprint-validate/SKILL.md, .agents/skills/speckit-branch-convention-configure/SKILL.md, .agents/skills/speckit-branch-convention-rename/SKILL.md, .agents/skills/speckit-branch-convention-validate/SKILL.md, .agents/skills/speckit-brownfield-bootstrap/SKILL.md, .agents/skills/speckit-brownfield-migrate/SKILL.md, .agents/skills/speckit-brownfield-scan/SKILL.md, .agents/skills/speckit-brownfield-validate/SKILL.md, .agents/skills/speckit-brownkit-assess/SKILL.md, .agents/skills/speckit-brownkit-discover/SKILL.md, .agents/skills/speckit-brownkit-enrich/SKILL.md, .agents/skills/speckit-brownkit-finish/SKILL.md, .agents/skills/speckit-brownkit-gate/SKILL.md, .agents/skills/speckit-brownkit-generate/SKILL.md, .agents/skills/speckit-brownkit-init/SKILL.md, .agents/skills/speckit-brownkit-report/SKILL.md, .agents/skills/speckit-brownkit-scan/SKILL.md, .agents/skills/speckit-brownkit-validate/SKILL.md, .agents/skills/speckit-bugfix-patch/SKILL.md, .agents/skills/speckit-bugfix-report/SKILL.md, .agents/skills/speckit-bugfix-verify/SKILL.md, .agents/skills/speckit-canon-drift-analyze/SKILL.md, .agents/skills/speckit-canon-drift-canonize/SKILL.md, .agents/skills/speckit-canon-drift-detect/SKILL.md, .agents/skills/speckit-canon-drift-implement/SKILL.md, .agents/skills/speckit-canon-drift-reconcile/SKILL.md, .agents/skills/speckit-canon-drift-resolve/SKILL.md, .agents/skills/speckit-canon-drift-reverse/SKILL.md, .agents/skills/speckit-canon-drift/SKILL.md, .agents/skills/speckit-canon-vibecode-drift-analyze/SKILL.md, .agents/skills/speckit-canon-vibecode-drift-canonize/SKILL.md, .agents/skills/speckit-canon-vibecode-drift-detect/SKILL.md, .agents/skills/speckit-canon-vibecode-drift-express/SKILL.md, .agents/skills/speckit-canon-vibecode-drift-reconcile/SKILL.md, .agents/skills/speckit-canon-vibecode-drift-reverse/SKILL.md, .agents/skills/speckit-canon-vibecode-drift/SKILL.md, .agents/skills/speckit-canon-vibecode-specify/SKILL.md, .agents/skills/speckit-catalog-ci-check-urls/SKILL.md, .agents/skills/speckit-catalog-ci-diff/SKILL.md, .agents/skills/speckit-catalog-ci-lint/SKILL.md, .agents/skills/speckit-catalog-ci-validate/SKILL.md, .agents/skills/speckit-checklist/SKILL.md, .agents/skills/speckit-checkpoint-commit/SKILL.md, .agents/skills/speckit-clarify/SKILL.md, .agents/skills/speckit-cleanup-run/SKILL.md, .agents/skills/speckit-cleanup/SKILL.md, .agents/skills/speckit-conduct-run/SKILL.md, .agents/skills/speckit-constitution/SKILL.md, .agents/skills/speckit-convert/SKILL.md, .agents/skills/speckit-cost-budget/SKILL.md, .agents/skills/speckit-cost-compare/SKILL.md, .agents/skills/speckit-cost-export/SKILL.md, .agents/skills/speckit-cost-report/SKILL.md, .agents/skills/speckit-cost-track/SKILL.md, .agents/skills/speckit-critique-run/SKILL.md, .agents/skills/speckit-deploy/SKILL.md, .agents/skills/speckit-diagram-dependencies/SKILL.md, .agents/skills/speckit-diagram-status/SKILL.md, .agents/skills/speckit-diagram-workflow/SKILL.md, .agents/skills/speckit-docguard-diagnose/SKILL.md, .agents/skills/speckit-docguard-fix/SKILL.md, .agents/skills/speckit-docguard-generate/SKILL.md, .agents/skills/speckit-docguard-guard/SKILL.md, .agents/skills/speckit-docguard-review/SKILL.md, .agents/skills/speckit-docguard-score/SKILL.md, .agents/skills/speckit-doctor-check/SKILL.md, .agents/skills/speckit-doctor/SKILL.md, .agents/skills/speckit-drift/SKILL.md, .agents/skills/speckit-extensify-create-catalog/SKILL.md, .agents/skills/speckit-extensify-create-extension-from-skill/SKILL.md, .agents/skills/speckit-extensify-create-extension/SKILL.md, .agents/skills/speckit-extensify-validate-catalog/SKILL.md, .agents/skills/speckit-extensify-validate-extension/SKILL.md, .agents/skills/speckit-fix-findings-run/SKILL.md, .agents/skills/speckit-fix-findings/SKILL.md, .agents/skills/speckit-fixit-run/SKILL.md, .agents/skills/speckit-fleet-review/SKILL.md, .agents/skills/speckit-fleet-run/SKILL.md, .agents/skills/speckit-fx-to-dotnet-assess/SKILL.md, .agents/skills/speckit-fx-to-dotnet-convert/SKILL.md, .agents/skills/speckit-fx-to-dotnet-detect/SKILL.md, .agents/skills/speckit-fx-to-dotnet-fix/SKILL.md, .agents/skills/speckit-fx-to-dotnet-implement-hook/SKILL.md, .agents/skills/speckit-fx-to-dotnet-initialize/SKILL.md, .agents/skills/speckit-fx-to-dotnet-inventory/SKILL.md, .agents/skills/speckit-fx-to-dotnet-multitarget-migrate/SKILL.md, .agents/skills/speckit-fx-to-dotnet-orchestrate/SKILL.md, .agents/skills/speckit-fx-to-dotnet-plan-hook/SKILL.md, .agents/skills/speckit-fx-to-dotnet-plan/SKILL.md, .agents/skills/speckit-fx-to-dotnet-show-policy/SKILL.md, .agents/skills/speckit-fx-to-dotnet-specify-hook/SKILL.md, .agents/skills/speckit-fx-to-dotnet-tasks-hook/SKILL.md, .agents/skills/speckit-fx-to-dotnet-update-packages/SKILL.md, .agents/skills/speckit-fx-to-dotnet-verify-hook/SKILL.md, .agents/skills/speckit-fx-to-dotnet-web-migrate/SKILL.md, .agents/skills/speckit-github-issues-import/SKILL.md, .agents/skills/speckit-github-issues-link/SKILL.md, .agents/skills/speckit-github-issues-sync/SKILL.md, .agents/skills/speckit-implement/SKILL.md, .agents/skills/speckit-issue-import/SKILL.md, .agents/skills/speckit-issue-link/SKILL.md, .agents/skills/speckit-issue-sync/SKILL.md, .agents/skills/speckit-iterate-apply/SKILL.md, .agents/skills/speckit-iterate-define/SKILL.md, .agents/skills/speckit-jira-discover-fields/SKILL.md, .agents/skills/speckit-jira-specstoissues/SKILL.md, .agents/skills/speckit-jira-sync-status/SKILL.md, .agents/skills/speckit-learn-clarify/SKILL.md, .agents/skills/speckit-learn-review/SKILL.md, .agents/skills/speckit-maqa-azure-devops-populate/SKILL.md, .agents/skills/speckit-maqa-azure-devops-setup/SKILL.md, .agents/skills/speckit-maqa-ci-check/SKILL.md, .agents/skills/speckit-maqa-ci-setup/SKILL.md, .agents/skills/speckit-maqa-coordinator/SKILL.md, .agents/skills/speckit-maqa-feature/SKILL.md, .agents/skills/speckit-maqa-github-projects-populate/SKILL.md, .agents/skills/speckit-maqa-github-projects-setup/SKILL.md, .agents/skills/speckit-maqa-jira-populate/SKILL.md, .agents/skills/speckit-maqa-jira-setup/SKILL.md, .agents/skills/speckit-maqa-linear-populate/SKILL.md, .agents/skills/speckit-maqa-linear-setup/SKILL.md, .agents/skills/speckit-maqa-qa/SKILL.md, .agents/skills/speckit-maqa-setup/SKILL.md, .agents/skills/speckit-maqa-trello-populate/SKILL.md, .agents/skills/speckit-maqa-trello-setup/SKILL.md, .agents/skills/speckit-maqa/SKILL.md, .agents/skills/speckit-markitdown-convert/SKILL.md, .agents/skills/speckit-mde-next/SKILL.md, .agents/skills/speckit-mde-setup/SKILL.md, .agents/skills/speckit-mde-status/SKILL.md, .agents/skills/speckit-mde-sync/SKILL.md, .agents/skills/speckit-memory-loader-load/SKILL.md, .agents/skills/speckit-memory-md-audit/SKILL.md, .agents/skills/speckit-memory-md-capture-from-diff/SKILL.md, .agents/skills/speckit-memory-md-capture/SKILL.md, .agents/skills/speckit-memory-md-init/SKILL.md, .agents/skills/speckit-memory-md-log-finding/SKILL.md, .agents/skills/speckit-memory-md-plan-with-memory/SKILL.md, .agents/skills/speckit-memory-md-token-report/SKILL.md, .agents/skills/speckit-memorylint-load-agents/SKILL.md, .agents/skills/speckit-memorylint-run/SKILL.md, .agents/skills/speckit-multi-model-review-apply-review/SKILL.md, .agents/skills/speckit-multi-model-review-cross-review/SKILL.md, .agents/skills/speckit-multi-model-review-review-package/SKILL.md, .agents/skills/speckit-multi-model-review-spec-handoff/SKILL.md, .agents/skills/speckit-onboard-badge/SKILL.md, .agents/skills/speckit-onboard-explain/SKILL.md, .agents/skills/speckit-onboard-mentor/SKILL.md, .agents/skills/speckit-onboard-quiz/SKILL.md, .agents/skills/speckit-onboard-start/SKILL.md, .agents/skills/speckit-onboard-team/SKILL.md, .agents/skills/speckit-onboard-trail/SKILL.md, .agents/skills/speckit-optimize-learn/SKILL.md, .agents/skills/speckit-optimize-run/SKILL.md, .agents/skills/speckit-optimize-tokens/SKILL.md, .agents/skills/speckit-orchestrator-conflicts/SKILL.md, .agents/skills/speckit-orchestrator-next/SKILL.md, .agents/skills/speckit-orchestrator-status/SKILL.md, .agents/skills/speckit-orchestrator-sync/SKILL.md, .agents/skills/speckit-plan-review-gate-check/SKILL.md, .agents/skills/speckit-plan/SKILL.md, .agents/skills/speckit-presetify-create-catalog/SKILL.md, .agents/skills/speckit-presetify-create-preset/SKILL.md, .agents/skills/speckit-presetify-validate-catalog/SKILL.md, .agents/skills/speckit-presetify-validate-preset/SKILL.md, .agents/skills/speckit-preview-html/SKILL.md, .agents/skills/speckit-product-forge-api-docs/SKILL.md, .agents/skills/speckit-product-forge-backfill/SKILL.md, .agents/skills/speckit-product-forge-bridge/SKILL.md, .agents/skills/speckit-product-forge-change-request/SKILL.md, .agents/skills/speckit-product-forge-code-review/SKILL.md, .agents/skills/speckit-product-forge-experiment-design/SKILL.md, .agents/skills/speckit-product-forge-feature-flag-cleanup/SKILL.md, .agents/skills/speckit-product-forge-forge/SKILL.md, .agents/skills/speckit-product-forge-i18n-harvest/SKILL.md, .agents/skills/speckit-product-forge-implement/SKILL.md, .agents/skills/speckit-product-forge-migration-plan/SKILL.md, .agents/skills/speckit-product-forge-monitoring-setup/SKILL.md, .agents/skills/speckit-product-forge-plan/SKILL.md, .agents/skills/speckit-product-forge-portfolio/SKILL.md, .agents/skills/speckit-product-forge-pre-impl-review/SKILL.md, .agents/skills/speckit-product-forge-problem-discovery/SKILL.md, .agents/skills/speckit-product-forge-product-spec/SKILL.md, .agents/skills/speckit-product-forge-release-readiness/SKILL.md, .agents/skills/speckit-product-forge-research/SKILL.md, .agents/skills/speckit-product-forge-retrospective/SKILL.md, .agents/skills/speckit-product-forge-revalidate/SKILL.md, .agents/skills/speckit-product-forge-security-check/SKILL.md, .agents/skills/speckit-product-forge-status/SKILL.md, .agents/skills/speckit-product-forge-sync-verify/SKILL.md, .agents/skills/speckit-product-forge-tasks/SKILL.md, .agents/skills/speckit-product-forge-test-plan/SKILL.md, .agents/skills/speckit-product-forge-test-run/SKILL.md, .agents/skills/speckit-product-forge-tracking-plan/SKILL.md, .agents/skills/speckit-product-forge-verify-full/SKILL.md, .agents/skills/speckit-qa-run/SKILL.md, .agents/skills/speckit-ralph-iterate/SKILL.md, .agents/skills/speckit-ralph-run/SKILL.md, .agents/skills/speckit-reconcile-run/SKILL.md, .agents/skills/speckit-red-team-gate/SKILL.md, .agents/skills/speckit-red-team-run/SKILL.md, .agents/skills/speckit-refine-diff/SKILL.md, .agents/skills/speckit-refine-propagate/SKILL.md, .agents/skills/speckit-refine-status/SKILL.md, .agents/skills/speckit-refine-update/SKILL.md, .agents/skills/speckit-repoindex-architecture/SKILL.md, .agents/skills/speckit-repoindex-module/SKILL.md, .agents/skills/speckit-repoindex-overview/SKILL.md, .agents/skills/speckit-reqnroll-bdd-generate/SKILL.md, .agents/skills/speckit-reqnroll-bdd-inject-tasks/SKILL.md, .agents/skills/speckit-reqnroll-bdd-plan/SKILL.md, .agents/skills/speckit-reqnroll-bdd-verify/SKILL.md, .agents/skills/speckit-retro-run/SKILL.md, .agents/skills/speckit-retrospective-analyze/SKILL.md, .agents/skills/speckit-review-code/SKILL.md, .agents/skills/speckit-review-comments/SKILL.md, .agents/skills/speckit-review-errors/SKILL.md, .agents/skills/speckit-review-run/SKILL.md, .agents/skills/speckit-review-simplify/SKILL.md, .agents/skills/speckit-review-tests/SKILL.md, .agents/skills/speckit-review-types/SKILL.md, .agents/skills/speckit-ripple-check/SKILL.md, .agents/skills/speckit-ripple-resolve/SKILL.md, .agents/skills/speckit-ripple-scan/SKILL.md, .agents/skills/speckit-schedule-calibrate/SKILL.md, .agents/skills/speckit-schedule-portfolio/SKILL.md, .agents/skills/speckit-schedule-run/SKILL.md, .agents/skills/speckit-schedule-solve/SKILL.md, .agents/skills/speckit-schedule-status/SKILL.md, .agents/skills/speckit-schedule-visualize/SKILL.md, .agents/skills/speckit-scope-budget/SKILL.md, .agents/skills/speckit-scope-compare/SKILL.md, .agents/skills/speckit-scope-creep/SKILL.md, .agents/skills/speckit-scope-estimate/SKILL.md, .agents/skills/speckit-security-review-apply/SKILL.md, .agents/skills/speckit-security-review-audit/SKILL.md, .agents/skills/speckit-security-review-branch/SKILL.md, .agents/skills/speckit-security-review-export/SKILL.md, .agents/skills/speckit-security-review-followup/SKILL.md, .agents/skills/speckit-security-review-init/SKILL.md, .agents/skills/speckit-security-review-plan/SKILL.md, .agents/skills/speckit-security-review-staged/SKILL.md, .agents/skills/speckit-security-review-tasks/SKILL.md, .agents/skills/speckit-sf-change/SKILL.md, .agents/skills/speckit-sf-clarify/SKILL.md, .agents/skills/speckit-sf-constitution/SKILL.md, .agents/skills/speckit-sf-deploy/SKILL.md, .agents/skills/speckit-sf-hotfix/SKILL.md, .agents/skills/speckit-sf-implement/SKILL.md, .agents/skills/speckit-sf-plan/SKILL.md, .agents/skills/speckit-sf-pr/SKILL.md, .agents/skills/speckit-sf-qa/SKILL.md, .agents/skills/speckit-sf-regression/SKILL.md, .agents/skills/speckit-sf-release-notes/SKILL.md, .agents/skills/speckit-sf-review/SKILL.md, .agents/skills/speckit-sf-score/SKILL.md, .agents/skills/speckit-sf-setup/SKILL.md, .agents/skills/speckit-sf-specify/SKILL.md, .agents/skills/speckit-sf-stories/SKILL.md, .agents/skills/speckit-sf-uat/SKILL.md, .agents/skills/speckit-sf-verify/SKILL.md, .agents/skills/speckit-ship-run/SKILL.md, .agents/skills/speckit-spec-reference-loader-load/SKILL.md, .agents/skills/speckit-spec-validate-analytics/SKILL.md, .agents/skills/speckit-spec-validate-gate/SKILL.md, .agents/skills/speckit-spec-validate-review/SKILL.md, .agents/skills/speckit-spec-validate-status/SKILL.md, .agents/skills/speckit-spec-validate-validate-tasks/SKILL.md, .agents/skills/speckit-spec-validate-validate/SKILL.md, .agents/skills/speckit-spec2cloud-deploy/SKILL.md, .agents/skills/speckit-spec2cloud-verify/SKILL.md, .agents/skills/speckit-specify/SKILL.md, .agents/skills/speckit-speckit-superpowers-bridge-execute/SKILL.md, .agents/skills/speckit-speckit-superpowers-bridge-guard/SKILL.md, .agents/skills/speckit-speckit-superpowers-bridge-handoff/SKILL.md, .agents/skills/speckit-specstoissues/SKILL.md, .agents/skills/speckit-squad-generate/SKILL.md, .agents/skills/speckit-squad-init/SKILL.md, .agents/skills/speckit-squad-route/SKILL.md, .agents/skills/speckit-squad-status/SKILL.md, .agents/skills/speckit-staff-review-run/SKILL.md, .agents/skills/speckit-status-show/SKILL.md, .agents/skills/speckit-status/SKILL.md, .agents/skills/speckit-superb-check/SKILL.md, .agents/skills/speckit-superb-critique/SKILL.md, .agents/skills/speckit-superb-debug/SKILL.md, .agents/skills/speckit-superb-finish/SKILL.md, .agents/skills/speckit-superb-respond/SKILL.md, .agents/skills/speckit-superb-review/SKILL.md, .agents/skills/speckit-superb-tdd/SKILL.md, .agents/skills/speckit-superb-verify/SKILL.md, .agents/skills/speckit-superpowers-bridge/SKILL.md, .agents/skills/speckit-sync-analyze/SKILL.md, .agents/skills/speckit-sync-apply/SKILL.md, .agents/skills/speckit-sync-backfill/SKILL.md, .agents/skills/speckit-sync-conflicts/SKILL.md, .agents/skills/speckit-sync-propose/SKILL.md, .agents/skills/speckit-tasks/SKILL.md, .agents/skills/speckit-taskstoissues/SKILL.md, .agents/skills/speckit-threatmodel-analyze/SKILL.md, .agents/skills/speckit-time-machine-analyze/SKILL.md, .agents/skills/speckit-time-machine-next/SKILL.md, .agents/skills/speckit-time-machine-status/SKILL.md, .agents/skills/speckit-tinyspec-classify/SKILL.md, .agents/skills/speckit-tinyspec-implement/SKILL.md, .agents/skills/speckit-tinyspec-tinyspec/SKILL.md, .agents/skills/speckit-token-analyzer-baseline/SKILL.md, .agents/skills/speckit-token-analyzer-compare/SKILL.md, .agents/skills/speckit-token-analyzer-report/SKILL.md, .agents/skills/speckit-v-model-acceptance/SKILL.md, .agents/skills/speckit-v-model-architecture-design/SKILL.md, .agents/skills/speckit-v-model-audit-report/SKILL.md, .agents/skills/speckit-v-model-hazard-analysis/SKILL.md, .agents/skills/speckit-v-model-impact-analysis/SKILL.md, .agents/skills/speckit-v-model-integration-test/SKILL.md, .agents/skills/speckit-v-model-module-design/SKILL.md, .agents/skills/speckit-v-model-peer-review/SKILL.md, .agents/skills/speckit-v-model-requirements/SKILL.md, .agents/skills/speckit-v-model-system-design/SKILL.md, .agents/skills/speckit-v-model-system-test/SKILL.md, .agents/skills/speckit-v-model-test-results/SKILL.md, .agents/skills/speckit-v-model-trace/SKILL.md, .agents/skills/speckit-v-model-unit-test/SKILL.md, .agents/skills/speckit-verify-run/SKILL.md, .agents/skills/speckit-verify-tasks-run/SKILL.md, .agents/skills/speckit-verify-tasks/SKILL.md, .agents/skills/speckit-verify/SKILL.md, .agents/skills/speckit-version-guard-check/SKILL.md, .agents/skills/speckit-version-guard-load/SKILL.md, .agents/skills/speckit-version-guard-validate/SKILL.md, .agents/skills/speckit-wireframe-generate/SKILL.md, .agents/skills/speckit-wireframe-inspect/SKILL.md, .agents/skills/speckit-wireframe-prep/SKILL.md, .agents/skills/speckit-wireframe-review/SKILL.md, .agents/skills/speckit-wireframe-screenshots/SKILL.md, .agents/skills/speckit-wireframe-view/SKILL.md, .agents/skills/speckit-workiq-ask/SKILL.md, .agents/skills/speckit-workiq-context/SKILL.md, .agents/skills/speckit-workiq-enrich/SKILL.md, .agents/skills/speckit-workiq-stakeholders/SKILL.md, .agents/skills/speckit-worktree-clean/SKILL.md, .agents/skills/speckit-worktree-create/SKILL.md, .agents/skills/speckit-worktree-list/SKILL.md, .agents/skills/speckit-worktrees-clean/SKILL.md, .agents/skills/speckit-worktrees-create/SKILL.md, .agents/skills/speckit-worktrees-list/SKILL.md, .claude/skills/gitnexus/gitnexus-cli/SKILL.md, .claude/skills/gitnexus/gitnexus-debugging/SKILL.md, .claude/skills/gitnexus/gitnexus-exploring/SKILL.md, .claude/skills/gitnexus/gitnexus-guide/SKILL.md, .claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md, .claude/skills/gitnexus/gitnexus-refactoring/SKILL.md, .claude/skills/speckit-adosync/SKILL.md, .claude/skills/speckit-agent-assign-assign/SKILL.md, .claude/skills/speckit-agent-assign-execute/SKILL.md, .claude/skills/speckit-agent-assign-validate/SKILL.md, .claude/skills/speckit-agent-governance-refresh/SKILL.md, .claude/skills/speckit-agent-orchestrator-discover/SKILL.md, .claude/skills/speckit-agent-orchestrator-index/SKILL.md, .claude/skills/speckit-agent-orchestrator-route/SKILL.md, .claude/skills/speckit-aide-create-item/SKILL.md, .claude/skills/speckit-aide-create-progress/SKILL.md, .claude/skills/speckit-aide-create-queue/SKILL.md, .claude/skills/speckit-aide-create-roadmap/SKILL.md, .claude/skills/speckit-aide-create-vision/SKILL.md, .claude/skills/speckit-aide-execute-item/SKILL.md, .claude/skills/speckit-aide-feedback-loop/SKILL.md, .claude/skills/speckit-analyze/SKILL.md, .claude/skills/speckit-arch-generate/SKILL.md, .claude/skills/speckit-arch-reverse/SKILL.md, .claude/skills/speckit-architecture-guard-architecture-apply/SKILL.md, .claude/skills/speckit-architecture-guard-architecture-review/SKILL.md, .claude/skills/speckit-architecture-guard-architecture-verify/SKILL.md, .claude/skills/speckit-architecture-guard-architecture-workflow/SKILL.md, .claude/skills/speckit-architecture-guard-governed-implement/SKILL.md, .claude/skills/speckit-architecture-guard-governed-plan/SKILL.md, .claude/skills/speckit-architecture-guard-governed-tasks/SKILL.md, .claude/skills/speckit-architecture-guard-init/SKILL.md, .claude/skills/speckit-architecture-guard-refactor-generator/SKILL.md, .claude/skills/speckit-architecture-guard-violation-detection/SKILL.md, .claude/skills/speckit-archive-run/SKILL.md, .claude/skills/speckit-azure-devops-sync/SKILL.md, .claude/skills/speckit-blueprint-generate/SKILL.md, .claude/skills/speckit-blueprint-validate/SKILL.md, .claude/skills/speckit-branch-convention-configure/SKILL.md, .claude/skills/speckit-branch-convention-rename/SKILL.md, .claude/skills/speckit-branch-convention-validate/SKILL.md, .claude/skills/speckit-brownfield-bootstrap/SKILL.md, .claude/skills/speckit-brownfield-migrate/SKILL.md, .claude/skills/speckit-brownfield-scan/SKILL.md, .claude/skills/speckit-brownfield-validate/SKILL.md, .claude/skills/speckit-brownkit-assess/SKILL.md, .claude/skills/speckit-brownkit-discover/SKILL.md, .claude/skills/speckit-brownkit-enrich/SKILL.md, .claude/skills/speckit-brownkit-finish/SKILL.md, .claude/skills/speckit-brownkit-gate/SKILL.md, .claude/skills/speckit-brownkit-generate/SKILL.md, .claude/skills/speckit-brownkit-init/SKILL.md, .claude/skills/speckit-brownkit-report/SKILL.md, .claude/skills/speckit-brownkit-scan/SKILL.md, .claude/skills/speckit-brownkit-validate/SKILL.md, .claude/skills/speckit-bugfix-patch/SKILL.md, .claude/skills/speckit-bugfix-report/SKILL.md, .claude/skills/speckit-bugfix-verify/SKILL.md, .claude/skills/speckit-canon-drift-analyze/SKILL.md, .claude/skills/speckit-canon-drift-canonize/SKILL.md, .claude/skills/speckit-canon-drift-detect/SKILL.md, .claude/skills/speckit-canon-drift-implement/SKILL.md, .claude/skills/speckit-canon-drift-reconcile/SKILL.md, .claude/skills/speckit-canon-drift-resolve/SKILL.md, .claude/skills/speckit-canon-drift-reverse/SKILL.md, .claude/skills/speckit-canon-drift/SKILL.md, .claude/skills/speckit-canon-vibecode-drift-analyze/SKILL.md, .claude/skills/speckit-canon-vibecode-drift-canonize/SKILL.md, .claude/skills/speckit-canon-vibecode-drift-detect/SKILL.md, .claude/skills/speckit-canon-vibecode-drift-express/SKILL.md, .claude/skills/speckit-canon-vibecode-drift-reconcile/SKILL.md, .claude/skills/speckit-canon-vibecode-drift-reverse/SKILL.md, .claude/skills/speckit-canon-vibecode-drift/SKILL.md, .claude/skills/speckit-canon-vibecode-specify/SKILL.md, .claude/skills/speckit-catalog-ci-check-urls/SKILL.md, .claude/skills/speckit-catalog-ci-diff/SKILL.md, .claude/skills/speckit-catalog-ci-lint/SKILL.md, .claude/skills/speckit-catalog-ci-validate/SKILL.md, .claude/skills/speckit-checklist/SKILL.md, .claude/skills/speckit-checkpoint-commit/SKILL.md, .claude/skills/speckit-clarify/SKILL.md, .claude/skills/speckit-cleanup-run/SKILL.md, .claude/skills/speckit-cleanup/SKILL.md, .claude/skills/speckit-conduct-run/SKILL.md, .claude/skills/speckit-constitution/SKILL.md, .claude/skills/speckit-convert/SKILL.md, .claude/skills/speckit-cost-budget/SKILL.md, .claude/skills/speckit-cost-compare/SKILL.md, .claude/skills/speckit-cost-export/SKILL.md, .claude/skills/speckit-cost-report/SKILL.md, .claude/skills/speckit-cost-track/SKILL.md, .claude/skills/speckit-critique-run/SKILL.md, .claude/skills/speckit-deploy/SKILL.md, .claude/skills/speckit-diagram-dependencies/SKILL.md, .claude/skills/speckit-diagram-status/SKILL.md, .claude/skills/speckit-diagram-workflow/SKILL.md, .claude/skills/speckit-docguard-diagnose/SKILL.md, .claude/skills/speckit-docguard-fix/SKILL.md, .claude/skills/speckit-docguard-generate/SKILL.md, .claude/skills/speckit-docguard-guard/SKILL.md, .claude/skills/speckit-docguard-review/SKILL.md, .claude/skills/speckit-docguard-score/SKILL.md, .claude/skills/speckit-doctor-check/SKILL.md, .claude/skills/speckit-doctor/SKILL.md, .claude/skills/speckit-drift/SKILL.md, .claude/skills/speckit-extensify-create-catalog/SKILL.md, .claude/skills/speckit-extensify-create-extension-from-skill/SKILL.md, .claude/skills/speckit-extensify-create-extension/SKILL.md, .claude/skills/speckit-extensify-validate-catalog/SKILL.md, .claude/skills/speckit-extensify-validate-extension/SKILL.md, .claude/skills/speckit-fix-findings-run/SKILL.md, .claude/skills/speckit-fix-findings/SKILL.md, .claude/skills/speckit-fixit-run/SKILL.md, .claude/skills/speckit-fleet-review/SKILL.md, .claude/skills/speckit-fleet-run/SKILL.md, .claude/skills/speckit-fx-to-dotnet-assess/SKILL.md, .claude/skills/speckit-fx-to-dotnet-convert/SKILL.md, .claude/skills/speckit-fx-to-dotnet-detect/SKILL.md, .claude/skills/speckit-fx-to-dotnet-fix/SKILL.md, .claude/skills/speckit-fx-to-dotnet-implement-hook/SKILL.md, .claude/skills/speckit-fx-to-dotnet-initialize/SKILL.md, .claude/skills/speckit-fx-to-dotnet-inventory/SKILL.md, .claude/skills/speckit-fx-to-dotnet-multitarget-migrate/SKILL.md, .claude/skills/speckit-fx-to-dotnet-orchestrate/SKILL.md, .claude/skills/speckit-fx-to-dotnet-plan-hook/SKILL.md, .claude/skills/speckit-fx-to-dotnet-plan/SKILL.md, .claude/skills/speckit-fx-to-dotnet-show-policy/SKILL.md, .claude/skills/speckit-fx-to-dotnet-specify-hook/SKILL.md, .claude/skills/speckit-fx-to-dotnet-tasks-hook/SKILL.md, .claude/skills/speckit-fx-to-dotnet-update-packages/SKILL.md, .claude/skills/speckit-fx-to-dotnet-verify-hook/SKILL.md, .claude/skills/speckit-fx-to-dotnet-web-migrate/SKILL.md, .claude/skills/speckit-github-issues-import/SKILL.md, .claude/skills/speckit-github-issues-link/SKILL.md, .claude/skills/speckit-github-issues-sync/SKILL.md, .claude/skills/speckit-implement/SKILL.md, .claude/skills/speckit-issue-import/SKILL.md, .claude/skills/speckit-issue-link/SKILL.md, .claude/skills/speckit-issue-sync/SKILL.md, .claude/skills/speckit-iterate-apply/SKILL.md, .claude/skills/speckit-iterate-define/SKILL.md, .claude/skills/speckit-jira-discover-fields/SKILL.md, .claude/skills/speckit-jira-specstoissues/SKILL.md, .claude/skills/speckit-jira-sync-status/SKILL.md, .claude/skills/speckit-learn-clarify/SKILL.md, .claude/skills/speckit-learn-review/SKILL.md, .claude/skills/speckit-maqa-azure-devops-populate/SKILL.md, .claude/skills/speckit-maqa-azure-devops-setup/SKILL.md, .claude/skills/speckit-maqa-ci-check/SKILL.md, .claude/skills/speckit-maqa-ci-setup/SKILL.md, .claude/skills/speckit-maqa-coordinator/SKILL.md, .claude/skills/speckit-maqa-feature/SKILL.md, .claude/skills/speckit-maqa-github-projects-populate/SKILL.md, .claude/skills/speckit-maqa-github-projects-setup/SKILL.md, .claude/skills/speckit-maqa-jira-populate/SKILL.md, .claude/skills/speckit-maqa-jira-setup/SKILL.md, .claude/skills/speckit-maqa-linear-populate/SKILL.md, .claude/skills/speckit-maqa-linear-setup/SKILL.md, .claude/skills/speckit-maqa-qa/SKILL.md, .claude/skills/speckit-maqa-setup/SKILL.md, .claude/skills/speckit-maqa-trello-populate/SKILL.md, .claude/skills/speckit-maqa-trello-setup/SKILL.md, .claude/skills/speckit-maqa/SKILL.md, .claude/skills/speckit-markitdown-convert/SKILL.md, .claude/skills/speckit-mde-next/SKILL.md, .claude/skills/speckit-mde-setup/SKILL.md, .claude/skills/speckit-mde-status/SKILL.md, .claude/skills/speckit-mde-sync/SKILL.md, .claude/skills/speckit-memory-loader-load/SKILL.md, .claude/skills/speckit-memory-md-audit/SKILL.md, .claude/skills/speckit-memory-md-capture-from-diff/SKILL.md, .claude/skills/speckit-memory-md-capture/SKILL.md, .claude/skills/speckit-memory-md-init/SKILL.md, .claude/skills/speckit-memory-md-log-finding/SKILL.md, .claude/skills/speckit-memory-md-plan-with-memory/SKILL.md, .claude/skills/speckit-memory-md-token-report/SKILL.md, .claude/skills/speckit-memorylint-load-agents/SKILL.md, .claude/skills/speckit-memorylint-run/SKILL.md, .claude/skills/speckit-multi-model-review-apply-review/SKILL.md, .claude/skills/speckit-multi-model-review-cross-review/SKILL.md, .claude/skills/speckit-multi-model-review-review-package/SKILL.md, .claude/skills/speckit-multi-model-review-spec-handoff/SKILL.md, .claude/skills/speckit-onboard-badge/SKILL.md, .claude/skills/speckit-onboard-explain/SKILL.md, .claude/skills/speckit-onboard-mentor/SKILL.md, .claude/skills/speckit-onboard-quiz/SKILL.md, .claude/skills/speckit-onboard-start/SKILL.md, .claude/skills/speckit-onboard-team/SKILL.md, .claude/skills/speckit-onboard-trail/SKILL.md, .claude/skills/speckit-optimize-learn/SKILL.md, .claude/skills/speckit-optimize-run/SKILL.md, .claude/skills/speckit-optimize-tokens/SKILL.md, .claude/skills/speckit-orchestrator-conflicts/SKILL.md, .claude/skills/speckit-orchestrator-next/SKILL.md, .claude/skills/speckit-orchestrator-status/SKILL.md, .claude/skills/speckit-orchestrator-sync/SKILL.md, .claude/skills/speckit-plan-review-gate-check/SKILL.md, .claude/skills/speckit-plan/SKILL.md, .claude/skills/speckit-presetify-create-catalog/SKILL.md, .claude/skills/speckit-presetify-create-preset/SKILL.md, .claude/skills/speckit-presetify-validate-catalog/SKILL.md, .claude/skills/speckit-presetify-validate-preset/SKILL.md, .claude/skills/speckit-preview-html/SKILL.md, .claude/skills/speckit-product-forge-api-docs/SKILL.md, .claude/skills/speckit-product-forge-backfill/SKILL.md, .claude/skills/speckit-product-forge-bridge/SKILL.md, .claude/skills/speckit-product-forge-change-request/SKILL.md, .claude/skills/speckit-product-forge-code-review/SKILL.md, .claude/skills/speckit-product-forge-experiment-design/SKILL.md, .claude/skills/speckit-product-forge-feature-flag-cleanup/SKILL.md, .claude/skills/speckit-product-forge-forge/SKILL.md, .claude/skills/speckit-product-forge-i18n-harvest/SKILL.md, .claude/skills/speckit-product-forge-implement/SKILL.md, .claude/skills/speckit-product-forge-migration-plan/SKILL.md, .claude/skills/speckit-product-forge-monitoring-setup/SKILL.md, .claude/skills/speckit-product-forge-plan/SKILL.md, .claude/skills/speckit-product-forge-portfolio/SKILL.md, .claude/skills/speckit-product-forge-pre-impl-review/SKILL.md, .claude/skills/speckit-product-forge-problem-discovery/SKILL.md, .claude/skills/speckit-product-forge-product-spec/SKILL.md, .claude/skills/speckit-product-forge-release-readiness/SKILL.md, .claude/skills/speckit-product-forge-research/SKILL.md, .claude/skills/speckit-product-forge-retrospective/SKILL.md, .claude/skills/speckit-product-forge-revalidate/SKILL.md, .claude/skills/speckit-product-forge-security-check/SKILL.md, .claude/skills/speckit-product-forge-status/SKILL.md, .claude/skills/speckit-product-forge-sync-verify/SKILL.md, .claude/skills/speckit-product-forge-tasks/SKILL.md, .claude/skills/speckit-product-forge-test-plan/SKILL.md, .claude/skills/speckit-product-forge-test-run/SKILL.md, .claude/skills/speckit-product-forge-tracking-plan/SKILL.md, .claude/skills/speckit-product-forge-verify-full/SKILL.md, .claude/skills/speckit-qa-run/SKILL.md, .claude/skills/speckit-ralph-iterate/SKILL.md, .claude/skills/speckit-ralph-run/SKILL.md, .claude/skills/speckit-reconcile-run/SKILL.md, .claude/skills/speckit-red-team-gate/SKILL.md, .claude/skills/speckit-red-team-run/SKILL.md, .claude/skills/speckit-refine-diff/SKILL.md, .claude/skills/speckit-refine-propagate/SKILL.md, .claude/skills/speckit-refine-status/SKILL.md, .claude/skills/speckit-refine-update/SKILL.md, .claude/skills/speckit-repoindex-architecture/SKILL.md, .claude/skills/speckit-repoindex-module/SKILL.md, .claude/skills/speckit-repoindex-overview/SKILL.md, .claude/skills/speckit-reqnroll-bdd-generate/SKILL.md, .claude/skills/speckit-reqnroll-bdd-inject-tasks/SKILL.md, .claude/skills/speckit-reqnroll-bdd-plan/SKILL.md, .claude/skills/speckit-reqnroll-bdd-verify/SKILL.md, .claude/skills/speckit-retro-run/SKILL.md, .claude/skills/speckit-retrospective-analyze/SKILL.md, .claude/skills/speckit-review-code/SKILL.md, .claude/skills/speckit-review-comments/SKILL.md, .claude/skills/speckit-review-errors/SKILL.md, .claude/skills/speckit-review-run/SKILL.md, .claude/skills/speckit-review-simplify/SKILL.md, .claude/skills/speckit-review-tests/SKILL.md, .claude/skills/speckit-review-types/SKILL.md, .claude/skills/speckit-ripple-check/SKILL.md, .claude/skills/speckit-ripple-resolve/SKILL.md, .claude/skills/speckit-ripple-scan/SKILL.md, .claude/skills/speckit-schedule-calibrate/SKILL.md, .claude/skills/speckit-schedule-portfolio/SKILL.md, .claude/skills/speckit-schedule-run/SKILL.md, .claude/skills/speckit-schedule-solve/SKILL.md, .claude/skills/speckit-schedule-status/SKILL.md, .claude/skills/speckit-schedule-visualize/SKILL.md, .claude/skills/speckit-scope-budget/SKILL.md, .claude/skills/speckit-scope-compare/SKILL.md, .claude/skills/speckit-scope-creep/SKILL.md, .claude/skills/speckit-scope-estimate/SKILL.md, .claude/skills/speckit-security-review-apply/SKILL.md, .claude/skills/speckit-security-review-audit/SKILL.md, .claude/skills/speckit-security-review-branch/SKILL.md, .claude/skills/speckit-security-review-export/SKILL.md, .claude/skills/speckit-security-review-followup/SKILL.md, .claude/skills/speckit-security-review-init/SKILL.md, .claude/skills/speckit-security-review-plan/SKILL.md, .claude/skills/speckit-security-review-staged/SKILL.md, .claude/skills/speckit-security-review-tasks/SKILL.md, .claude/skills/speckit-sf-change/SKILL.md, .claude/skills/speckit-sf-clarify/SKILL.md, .claude/skills/speckit-sf-constitution/SKILL.md, .claude/skills/speckit-sf-deploy/SKILL.md, .claude/skills/speckit-sf-hotfix/SKILL.md, .claude/skills/speckit-sf-implement/SKILL.md, .claude/skills/speckit-sf-plan/SKILL.md, .claude/skills/speckit-sf-pr/SKILL.md, .claude/skills/speckit-sf-qa/SKILL.md, .claude/skills/speckit-sf-regression/SKILL.md, .claude/skills/speckit-sf-release-notes/SKILL.md, .claude/skills/speckit-sf-review/SKILL.md, .claude/skills/speckit-sf-score/SKILL.md, .claude/skills/speckit-sf-setup/SKILL.md, .claude/skills/speckit-sf-specify/SKILL.md, .claude/skills/speckit-sf-stories/SKILL.md, .claude/skills/speckit-sf-uat/SKILL.md, .claude/skills/speckit-sf-verify/SKILL.md, .claude/skills/speckit-ship-run/SKILL.md, .claude/skills/speckit-spec-reference-loader-load/SKILL.md, .claude/skills/speckit-spec-validate-analytics/SKILL.md, .claude/skills/speckit-spec-validate-gate/SKILL.md, .claude/skills/speckit-spec-validate-review/SKILL.md, .claude/skills/speckit-spec-validate-status/SKILL.md, .claude/skills/speckit-spec-validate-validate-tasks/SKILL.md, .claude/skills/speckit-spec-validate-validate/SKILL.md, .claude/skills/speckit-spec2cloud-deploy/SKILL.md, .claude/skills/speckit-spec2cloud-verify/SKILL.md, .claude/skills/speckit-specify/SKILL.md, .claude/skills/speckit-speckit-superpowers-bridge-execute/SKILL.md, .claude/skills/speckit-speckit-superpowers-bridge-guard/SKILL.md, .claude/skills/speckit-speckit-superpowers-bridge-handoff/SKILL.md, .claude/skills/speckit-specstoissues/SKILL.md, .claude/skills/speckit-squad-generate/SKILL.md, .claude/skills/speckit-squad-init/SKILL.md, .claude/skills/speckit-squad-route/SKILL.md, .claude/skills/speckit-squad-status/SKILL.md, .claude/skills/speckit-staff-review-run/SKILL.md, .claude/skills/speckit-status-show/SKILL.md, .claude/skills/speckit-status/SKILL.md, .claude/skills/speckit-superb-check/SKILL.md, .claude/skills/speckit-superb-critique/SKILL.md, .claude/skills/speckit-superb-debug/SKILL.md, .claude/skills/speckit-superb-finish/SKILL.md, .claude/skills/speckit-superb-respond/SKILL.md, .claude/skills/speckit-superb-review/SKILL.md, .claude/skills/speckit-superb-tdd/SKILL.md, .claude/skills/speckit-superb-verify/SKILL.md, .claude/skills/speckit-superpowers-bridge/SKILL.md, .claude/skills/speckit-sync-analyze/SKILL.md, .claude/skills/speckit-sync-apply/SKILL.md, .claude/skills/speckit-sync-backfill/SKILL.md, .claude/skills/speckit-sync-conflicts/SKILL.md, .claude/skills/speckit-sync-propose/SKILL.md, .claude/skills/speckit-tasks/SKILL.md, .claude/skills/speckit-taskstoissues/SKILL.md, .claude/skills/speckit-threatmodel-analyze/SKILL.md, .claude/skills/speckit-time-machine-analyze/SKILL.md, .claude/skills/speckit-time-machine-next/SKILL.md, .claude/skills/speckit-time-machine-status/SKILL.md, .claude/skills/speckit-tinyspec-classify/SKILL.md, .claude/skills/speckit-tinyspec-implement/SKILL.md, .claude/skills/speckit-tinyspec-tinyspec/SKILL.md, .claude/skills/speckit-token-analyzer-baseline/SKILL.md, .claude/skills/speckit-token-analyzer-compare/SKILL.md, .claude/skills/speckit-token-analyzer-report/SKILL.md, .claude/skills/speckit-v-model-acceptance/SKILL.md, .claude/skills/speckit-v-model-architecture-design/SKILL.md, .claude/skills/speckit-v-model-audit-report/SKILL.md, .claude/skills/speckit-v-model-hazard-analysis/SKILL.md, .claude/skills/speckit-v-model-impact-analysis/SKILL.md, .claude/skills/speckit-v-model-integration-test/SKILL.md, .claude/skills/speckit-v-model-module-design/SKILL.md, .claude/skills/speckit-v-model-peer-review/SKILL.md, .claude/skills/speckit-v-model-requirements/SKILL.md, .claude/skills/speckit-v-model-system-design/SKILL.md, .claude/skills/speckit-v-model-system-test/SKILL.md, .claude/skills/speckit-v-model-test-results/SKILL.md, .claude/skills/speckit-v-model-trace/SKILL.md, .claude/skills/speckit-v-model-unit-test/SKILL.md, .claude/skills/speckit-verify-run/SKILL.md, .claude/skills/speckit-verify-tasks-run/SKILL.md, .claude/skills/speckit-verify-tasks/SKILL.md, .claude/skills/speckit-verify/SKILL.md, .claude/skills/speckit-version-guard-check/SKILL.md, .claude/skills/speckit-version-guard-load/SKILL.md, .claude/skills/speckit-version-guard-validate/SKILL.md, .claude/skills/speckit-wireframe-generate/SKILL.md, .claude/skills/speckit-wireframe-inspect/SKILL.md, .claude/skills/speckit-wireframe-prep/SKILL.md, .claude/skills/speckit-wireframe-review/SKILL.md, .claude/skills/speckit-wireframe-screenshots/SKILL.md, .claude/skills/speckit-wireframe-view/SKILL.md, .claude/skills/speckit-workiq-ask/SKILL.md, .claude/skills/speckit-workiq-context/SKILL.md, .claude/skills/speckit-workiq-enrich/SKILL.md, .claude/skills/speckit-workiq-stakeholders/SKILL.md, .claude/skills/speckit-worktree-clean/SKILL.md, .claude/skills/speckit-worktree-create/SKILL.md, .claude/skills/speckit-worktree-list/SKILL.md, .claude/skills/speckit-worktrees-clean/SKILL.md, .claude/skills/speckit-worktrees-create/SKILL.md, .claude/skills/speckit-worktrees-list/SKILL.md, .cursor/skills/speckit-adosync/SKILL.md, .cursor/skills/speckit-agent-assign-assign/SKILL.md, .cursor/skills/speckit-agent-assign-execute/SKILL.md, .cursor/skills/speckit-agent-assign-validate/SKILL.md, .cursor/skills/speckit-agent-governance-refresh/SKILL.md, .cursor/skills/speckit-agent-orchestrator-discover/SKILL.md, .cursor/skills/speckit-agent-orchestrator-index/SKILL.md, .cursor/skills/speckit-agent-orchestrator-route/SKILL.md, .cursor/skills/speckit-aide-create-item/SKILL.md, .cursor/skills/speckit-aide-create-progress/SKILL.md, .cursor/skills/speckit-aide-create-queue/SKILL.md, .cursor/skills/speckit-aide-create-roadmap/SKILL.md, .cursor/skills/speckit-aide-create-vision/SKILL.md, .cursor/skills/speckit-aide-execute-item/SKILL.md, .cursor/skills/speckit-aide-feedback-loop/SKILL.md, .cursor/skills/speckit-analyze/SKILL.md, .cursor/skills/speckit-arch-generate/SKILL.md, .cursor/skills/speckit-arch-reverse/SKILL.md, .cursor/skills/speckit-architecture-guard-architecture-apply/SKILL.md, .cursor/skills/speckit-architecture-guard-architecture-review/SKILL.md, .cursor/skills/speckit-architecture-guard-architecture-verify/SKILL.md, .cursor/skills/speckit-architecture-guard-architecture-workflow/SKILL.md, .cursor/skills/speckit-architecture-guard-governed-implement/SKILL.md, .cursor/skills/speckit-architecture-guard-governed-plan/SKILL.md, .cursor/skills/speckit-architecture-guard-governed-tasks/SKILL.md, .cursor/skills/speckit-architecture-guard-init/SKILL.md, .cursor/skills/speckit-architecture-guard-refactor-generator/SKILL.md, .cursor/skills/speckit-architecture-guard-violation-detection/SKILL.md, .cursor/skills/speckit-archive-run/SKILL.md, .cursor/skills/speckit-azure-devops-sync/SKILL.md, .cursor/skills/speckit-blueprint-generate/SKILL.md, .cursor/skills/speckit-blueprint-validate/SKILL.md, .cursor/skills/speckit-branch-convention-configure/SKILL.md, .cursor/skills/speckit-branch-convention-rename/SKILL.md, .cursor/skills/speckit-branch-convention-validate/SKILL.md, .cursor/skills/speckit-brownfield-bootstrap/SKILL.md, .cursor/skills/speckit-brownfield-migrate/SKILL.md, .cursor/skills/speckit-brownfield-scan/SKILL.md, .cursor/skills/speckit-brownfield-validate/SKILL.md, .cursor/skills/speckit-brownkit-assess/SKILL.md, .cursor/skills/speckit-brownkit-discover/SKILL.md, .cursor/skills/speckit-brownkit-enrich/SKILL.md, .cursor/skills/speckit-brownkit-finish/SKILL.md, .cursor/skills/speckit-brownkit-gate/SKILL.md, .cursor/skills/speckit-brownkit-generate/SKILL.md, .cursor/skills/speckit-brownkit-init/SKILL.md, .cursor/skills/speckit-brownkit-report/SKILL.md, .cursor/skills/speckit-brownkit-scan/SKILL.md, .cursor/skills/speckit-brownkit-validate/SKILL.md, .cursor/skills/speckit-bugfix-patch/SKILL.md, .cursor/skills/speckit-bugfix-report/SKILL.md, .cursor/skills/speckit-bugfix-verify/SKILL.md, .cursor/skills/speckit-canon-drift-analyze/SKILL.md, .cursor/skills/speckit-canon-drift-canonize/SKILL.md, .cursor/skills/speckit-canon-drift-detect/SKILL.md, .cursor/skills/speckit-canon-drift-implement/SKILL.md, .cursor/skills/speckit-canon-drift-reconcile/SKILL.md, .cursor/skills/speckit-canon-drift-resolve/SKILL.md, .cursor/skills/speckit-canon-drift-reverse/SKILL.md, .cursor/skills/speckit-canon-drift/SKILL.md, .cursor/skills/speckit-canon-vibecode-drift-analyze/SKILL.md, .cursor/skills/speckit-canon-vibecode-drift-canonize/SKILL.md, .cursor/skills/speckit-canon-vibecode-drift-detect/SKILL.md, .cursor/skills/speckit-canon-vibecode-drift-express/SKILL.md, .cursor/skills/speckit-canon-vibecode-drift-reconcile/SKILL.md, .cursor/skills/speckit-canon-vibecode-drift-reverse/SKILL.md, .cursor/skills/speckit-canon-vibecode-drift/SKILL.md, .cursor/skills/speckit-canon-vibecode-specify/SKILL.md, .cursor/skills/speckit-catalog-ci-check-urls/SKILL.md, .cursor/skills/speckit-catalog-ci-diff/SKILL.md, .cursor/skills/speckit-catalog-ci-lint/SKILL.md, .cursor/skills/speckit-catalog-ci-validate/SKILL.md, .cursor/skills/speckit-checklist/SKILL.md, .cursor/skills/speckit-checkpoint-commit/SKILL.md, .cursor/skills/speckit-clarify/SKILL.md, .cursor/skills/speckit-cleanup-run/SKILL.md, .cursor/skills/speckit-cleanup/SKILL.md, .cursor/skills/speckit-conduct-run/SKILL.md, .cursor/skills/speckit-constitution/SKILL.md, .cursor/skills/speckit-convert/SKILL.md, .cursor/skills/speckit-cost-budget/SKILL.md, .cursor/skills/speckit-cost-compare/SKILL.md, .cursor/skills/speckit-cost-export/SKILL.md, .cursor/skills/speckit-cost-report/SKILL.md, .cursor/skills/speckit-cost-track/SKILL.md, .cursor/skills/speckit-critique-run/SKILL.md, .cursor/skills/speckit-deploy/SKILL.md, .cursor/skills/speckit-diagram-dependencies/SKILL.md, .cursor/skills/speckit-diagram-status/SKILL.md, .cursor/skills/speckit-diagram-workflow/SKILL.md, .cursor/skills/speckit-docguard-diagnose/SKILL.md, .cursor/skills/speckit-docguard-fix/SKILL.md, .cursor/skills/speckit-docguard-generate/SKILL.md, .cursor/skills/speckit-docguard-guard/SKILL.md, .cursor/skills/speckit-docguard-review/SKILL.md, .cursor/skills/speckit-docguard-score/SKILL.md, .cursor/skills/speckit-doctor-check/SKILL.md, .cursor/skills/speckit-doctor/SKILL.md, .cursor/skills/speckit-drift/SKILL.md, .cursor/skills/speckit-extensify-create-catalog/SKILL.md, .cursor/skills/speckit-extensify-create-extension-from-skill/SKILL.md, .cursor/skills/speckit-extensify-create-extension/SKILL.md, .cursor/skills/speckit-extensify-validate-catalog/SKILL.md, .cursor/skills/speckit-extensify-validate-extension/SKILL.md, .cursor/skills/speckit-fix-findings-run/SKILL.md, .cursor/skills/speckit-fix-findings/SKILL.md, .cursor/skills/speckit-fixit-run/SKILL.md, .cursor/skills/speckit-fleet-review/SKILL.md, .cursor/skills/speckit-fleet-run/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-assess/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-convert/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-detect/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-fix/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-implement-hook/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-initialize/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-inventory/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-multitarget-migrate/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-orchestrate/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-plan-hook/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-plan/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-show-policy/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-specify-hook/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-tasks-hook/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-update-packages/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-verify-hook/SKILL.md, .cursor/skills/speckit-fx-to-dotnet-web-migrate/SKILL.md, .cursor/skills/speckit-github-issues-import/SKILL.md, .cursor/skills/speckit-github-issues-link/SKILL.md, .cursor/skills/speckit-github-issues-sync/SKILL.md, .cursor/skills/speckit-implement/SKILL.md, .cursor/skills/speckit-issue-import/SKILL.md, .cursor/skills/speckit-issue-link/SKILL.md, .cursor/skills/speckit-issue-sync/SKILL.md, .cursor/skills/speckit-iterate-apply/SKILL.md, .cursor/skills/speckit-iterate-define/SKILL.md, .cursor/skills/speckit-jira-discover-fields/SKILL.md, .cursor/skills/speckit-jira-specstoissues/SKILL.md, .cursor/skills/speckit-jira-sync-status/SKILL.md, .cursor/skills/speckit-learn-clarify/SKILL.md, .cursor/skills/speckit-learn-review/SKILL.md, .cursor/skills/speckit-maqa-azure-devops-populate/SKILL.md, .cursor/skills/speckit-maqa-azure-devops-setup/SKILL.md, .cursor/skills/speckit-maqa-ci-check/SKILL.md, .cursor/skills/speckit-maqa-ci-setup/SKILL.md, .cursor/skills/speckit-maqa-coordinator/SKILL.md, .cursor/skills/speckit-maqa-feature/SKILL.md, .cursor/skills/speckit-maqa-github-projects-populate/SKILL.md, .cursor/skills/speckit-maqa-github-projects-setup/SKILL.md, .cursor/skills/speckit-maqa-jira-populate/SKILL.md, .cursor/skills/speckit-maqa-jira-setup/SKILL.md, .cursor/skills/speckit-maqa-linear-populate/SKILL.md, .cursor/skills/speckit-maqa-linear-setup/SKILL.md, .cursor/skills/speckit-maqa-qa/SKILL.md, .cursor/skills/speckit-maqa-setup/SKILL.md, .cursor/skills/speckit-maqa-trello-populate/SKILL.md, .cursor/skills/speckit-maqa-trello-setup/SKILL.md, .cursor/skills/speckit-maqa/SKILL.md, .cursor/skills/speckit-markitdown-convert/SKILL.md, .cursor/skills/speckit-mde-next/SKILL.md, .cursor/skills/speckit-mde-setup/SKILL.md, .cursor/skills/speckit-mde-status/SKILL.md, .cursor/skills/speckit-mde-sync/SKILL.md, .cursor/skills/speckit-memory-loader-load/SKILL.md, .cursor/skills/speckit-memory-md-audit/SKILL.md, .cursor/skills/speckit-memory-md-capture-from-diff/SKILL.md, .cursor/skills/speckit-memory-md-capture/SKILL.md, .cursor/skills/speckit-memory-md-init/SKILL.md, .cursor/skills/speckit-memory-md-log-finding/SKILL.md, .cursor/skills/speckit-memory-md-plan-with-memory/SKILL.md, .cursor/skills/speckit-memory-md-token-report/SKILL.md, .cursor/skills/speckit-memorylint-load-agents/SKILL.md, .cursor/skills/speckit-memorylint-run/SKILL.md, .cursor/skills/speckit-multi-model-review-apply-review/SKILL.md, .cursor/skills/speckit-multi-model-review-cross-review/SKILL.md, .cursor/skills/speckit-multi-model-review-review-package/SKILL.md, .cursor/skills/speckit-multi-model-review-spec-handoff/SKILL.md, .cursor/skills/speckit-onboard-badge/SKILL.md, .cursor/skills/speckit-onboard-explain/SKILL.md, .cursor/skills/speckit-onboard-mentor/SKILL.md, .cursor/skills/speckit-onboard-quiz/SKILL.md, .cursor/skills/speckit-onboard-start/SKILL.md, .cursor/skills/speckit-onboard-team/SKILL.md, .cursor/skills/speckit-onboard-trail/SKILL.md, .cursor/skills/speckit-optimize-learn/SKILL.md, .cursor/skills/speckit-optimize-run/SKILL.md, .cursor/skills/speckit-optimize-tokens/SKILL.md, .cursor/skills/speckit-orchestrator-conflicts/SKILL.md, .cursor/skills/speckit-orchestrator-next/SKILL.md, .cursor/skills/speckit-orchestrator-status/SKILL.md, .cursor/skills/speckit-orchestrator-sync/SKILL.md, .cursor/skills/speckit-plan-review-gate-check/SKILL.md, .cursor/skills/speckit-plan/SKILL.md, .cursor/skills/speckit-presetify-create-catalog/SKILL.md, .cursor/skills/speckit-presetify-create-preset/SKILL.md, .cursor/skills/speckit-presetify-validate-catalog/SKILL.md, .cursor/skills/speckit-presetify-validate-preset/SKILL.md, .cursor/skills/speckit-preview-html/SKILL.md, .cursor/skills/speckit-product-forge-api-docs/SKILL.md, .cursor/skills/speckit-product-forge-backfill/SKILL.md, .cursor/skills/speckit-product-forge-bridge/SKILL.md, .cursor/skills/speckit-product-forge-change-request/SKILL.md, .cursor/skills/speckit-product-forge-code-review/SKILL.md, .cursor/skills/speckit-product-forge-experiment-design/SKILL.md, .cursor/skills/speckit-product-forge-feature-flag-cleanup/SKILL.md, .cursor/skills/speckit-product-forge-forge/SKILL.md, .cursor/skills/speckit-product-forge-i18n-harvest/SKILL.md, .cursor/skills/speckit-product-forge-implement/SKILL.md, .cursor/skills/speckit-product-forge-migration-plan/SKILL.md, .cursor/skills/speckit-product-forge-monitoring-setup/SKILL.md, .cursor/skills/speckit-product-forge-plan/SKILL.md, .cursor/skills/speckit-product-forge-portfolio/SKILL.md, .cursor/skills/speckit-product-forge-pre-impl-review/SKILL.md, .cursor/skills/speckit-product-forge-problem-discovery/SKILL.md, .cursor/skills/speckit-product-forge-product-spec/SKILL.md, .cursor/skills/speckit-product-forge-release-readiness/SKILL.md, .cursor/skills/speckit-product-forge-research/SKILL.md, .cursor/skills/speckit-product-forge-retrospective/SKILL.md, .cursor/skills/speckit-product-forge-revalidate/SKILL.md, .cursor/skills/speckit-product-forge-security-check/SKILL.md, .cursor/skills/speckit-product-forge-status/SKILL.md, .cursor/skills/speckit-product-forge-sync-verify/SKILL.md, .cursor/skills/speckit-product-forge-tasks/SKILL.md, .cursor/skills/speckit-product-forge-test-plan/SKILL.md, .cursor/skills/speckit-product-forge-test-run/SKILL.md, .cursor/skills/speckit-product-forge-tracking-plan/SKILL.md, .cursor/skills/speckit-product-forge-verify-full/SKILL.md, .cursor/skills/speckit-qa-run/SKILL.md, .cursor/skills/speckit-ralph-iterate/SKILL.md, .cursor/skills/speckit-ralph-run/SKILL.md, .cursor/skills/speckit-reconcile-run/SKILL.md, .cursor/skills/speckit-red-team-gate/SKILL.md, .cursor/skills/speckit-red-team-run/SKILL.md, .cursor/skills/speckit-refine-diff/SKILL.md, .cursor/skills/speckit-refine-propagate/SKILL.md, .cursor/skills/speckit-refine-status/SKILL.md, .cursor/skills/speckit-refine-update/SKILL.md, .cursor/skills/speckit-repoindex-architecture/SKILL.md, .cursor/skills/speckit-repoindex-module/SKILL.md, .cursor/skills/speckit-repoindex-overview/SKILL.md, .cursor/skills/speckit-reqnroll-bdd-generate/SKILL.md, .cursor/skills/speckit-reqnroll-bdd-inject-tasks/SKILL.md, .cursor/skills/speckit-reqnroll-bdd-plan/SKILL.md, .cursor/skills/speckit-reqnroll-bdd-verify/SKILL.md, .cursor/skills/speckit-retro-run/SKILL.md, .cursor/skills/speckit-retrospective-analyze/SKILL.md, .cursor/skills/speckit-review-code/SKILL.md, .cursor/skills/speckit-review-comments/SKILL.md, .cursor/skills/speckit-review-errors/SKILL.md, .cursor/skills/speckit-review-run/SKILL.md, .cursor/skills/speckit-review-simplify/SKILL.md, .cursor/skills/speckit-review-tests/SKILL.md, .cursor/skills/speckit-review-types/SKILL.md, .cursor/skills/speckit-ripple-check/SKILL.md, .cursor/skills/speckit-ripple-resolve/SKILL.md, .cursor/skills/speckit-ripple-scan/SKILL.md, .cursor/skills/speckit-schedule-calibrate/SKILL.md, .cursor/skills/speckit-schedule-portfolio/SKILL.md, .cursor/skills/speckit-schedule-run/SKILL.md, .cursor/skills/speckit-schedule-solve/SKILL.md, .cursor/skills/speckit-schedule-status/SKILL.md, .cursor/skills/speckit-schedule-visualize/SKILL.md, .cursor/skills/speckit-scope-budget/SKILL.md, .cursor/skills/speckit-scope-compare/SKILL.md, .cursor/skills/speckit-scope-creep/SKILL.md, .cursor/skills/speckit-scope-estimate/SKILL.md, .cursor/skills/speckit-security-review-apply/SKILL.md, .cursor/skills/speckit-security-review-audit/SKILL.md, .cursor/skills/speckit-security-review-branch/SKILL.md, .cursor/skills/speckit-security-review-export/SKILL.md, .cursor/skills/speckit-security-review-followup/SKILL.md, .cursor/skills/speckit-security-review-init/SKILL.md, .cursor/skills/speckit-security-review-plan/SKILL.md, .cursor/skills/speckit-security-review-staged/SKILL.md, .cursor/skills/speckit-security-review-tasks/SKILL.md, .cursor/skills/speckit-sf-change/SKILL.md, .cursor/skills/speckit-sf-clarify/SKILL.md, .cursor/skills/speckit-sf-constitution/SKILL.md, .cursor/skills/speckit-sf-deploy/SKILL.md, .cursor/skills/speckit-sf-hotfix/SKILL.md, .cursor/skills/speckit-sf-implement/SKILL.md, .cursor/skills/speckit-sf-plan/SKILL.md, .cursor/skills/speckit-sf-pr/SKILL.md, .cursor/skills/speckit-sf-qa/SKILL.md, .cursor/skills/speckit-sf-regression/SKILL.md, .cursor/skills/speckit-sf-release-notes/SKILL.md, .cursor/skills/speckit-sf-review/SKILL.md, .cursor/skills/speckit-sf-score/SKILL.md, .cursor/skills/speckit-sf-setup/SKILL.md, .cursor/skills/speckit-sf-specify/SKILL.md, .cursor/skills/speckit-sf-stories/SKILL.md, .cursor/skills/speckit-sf-uat/SKILL.md, .cursor/skills/speckit-sf-verify/SKILL.md, .cursor/skills/speckit-ship-run/SKILL.md, .cursor/skills/speckit-spec-reference-loader-load/SKILL.md, .cursor/skills/speckit-spec-validate-analytics/SKILL.md, .cursor/skills/speckit-spec-validate-gate/SKILL.md, .cursor/skills/speckit-spec-validate-review/SKILL.md, .cursor/skills/speckit-spec-validate-status/SKILL.md, .cursor/skills/speckit-spec-validate-validate-tasks/SKILL.md, .cursor/skills/speckit-spec-validate-validate/SKILL.md, .cursor/skills/speckit-spec2cloud-deploy/SKILL.md, .cursor/skills/speckit-spec2cloud-verify/SKILL.md, .cursor/skills/speckit-specify/SKILL.md, .cursor/skills/speckit-speckit-superpowers-bridge-execute/SKILL.md, .cursor/skills/speckit-speckit-superpowers-bridge-guard/SKILL.md, .cursor/skills/speckit-speckit-superpowers-bridge-handoff/SKILL.md, .cursor/skills/speckit-specstoissues/SKILL.md, .cursor/skills/speckit-squad-generate/SKILL.md, .cursor/skills/speckit-squad-init/SKILL.md, .cursor/skills/speckit-squad-route/SKILL.md, .cursor/skills/speckit-squad-status/SKILL.md, .cursor/skills/speckit-staff-review-run/SKILL.md, .cursor/skills/speckit-status-show/SKILL.md, .cursor/skills/speckit-status/SKILL.md, .cursor/skills/speckit-superb-check/SKILL.md, .cursor/skills/speckit-superb-critique/SKILL.md, .cursor/skills/speckit-superb-debug/SKILL.md, .cursor/skills/speckit-superb-finish/SKILL.md, .cursor/skills/speckit-superb-respond/SKILL.md, .cursor/skills/speckit-superb-review/SKILL.md, .cursor/skills/speckit-superb-tdd/SKILL.md, .cursor/skills/speckit-superb-verify/SKILL.md, .cursor/skills/speckit-superpowers-bridge/SKILL.md, .cursor/skills/speckit-sync-analyze/SKILL.md, .cursor/skills/speckit-sync-apply/SKILL.md, .cursor/skills/speckit-sync-backfill/SKILL.md, .cursor/skills/speckit-sync-conflicts/SKILL.md, .cursor/skills/speckit-sync-propose/SKILL.md, .cursor/skills/speckit-tasks/SKILL.md, .cursor/skills/speckit-taskstoissues/SKILL.md, .cursor/skills/speckit-threatmodel-analyze/SKILL.md, .cursor/skills/speckit-time-machine-analyze/SKILL.md, .cursor/skills/speckit-time-machine-next/SKILL.md, .cursor/skills/speckit-time-machine-status/SKILL.md, .cursor/skills/speckit-tinyspec-classify/SKILL.md, .cursor/skills/speckit-tinyspec-implement/SKILL.md, .cursor/skills/speckit-tinyspec-tinyspec/SKILL.md, .cursor/skills/speckit-token-analyzer-baseline/SKILL.md, .cursor/skills/speckit-token-analyzer-compare/SKILL.md, .cursor/skills/speckit-token-analyzer-report/SKILL.md, .cursor/skills/speckit-v-model-acceptance/SKILL.md, .cursor/skills/speckit-v-model-architecture-design/SKILL.md, .cursor/skills/speckit-v-model-audit-report/SKILL.md, .cursor/skills/speckit-v-model-hazard-analysis/SKILL.md, .cursor/skills/speckit-v-model-impact-analysis/SKILL.md, .cursor/skills/speckit-v-model-integration-test/SKILL.md, .cursor/skills/speckit-v-model-module-design/SKILL.md, .cursor/skills/speckit-v-model-peer-review/SKILL.md, .cursor/skills/speckit-v-model-requirements/SKILL.md, .cursor/skills/speckit-v-model-system-design/SKILL.md, .cursor/skills/speckit-v-model-system-test/SKILL.md, .cursor/skills/speckit-v-model-test-results/SKILL.md, .cursor/skills/speckit-v-model-trace/SKILL.md, .cursor/skills/speckit-v-model-unit-test/SKILL.md, .cursor/skills/speckit-verify-run/SKILL.md, .cursor/skills/speckit-verify-tasks-run/SKILL.md, .cursor/skills/speckit-verify-tasks/SKILL.md, .cursor/skills/speckit-verify/SKILL.md, .cursor/skills/speckit-version-guard-check/SKILL.md, .cursor/skills/speckit-version-guard-load/SKILL.md, .cursor/skills/speckit-version-guard-validate/SKILL.md, .cursor/skills/speckit-wireframe-generate/SKILL.md, .cursor/skills/speckit-wireframe-inspect/SKILL.md, .cursor/skills/speckit-wireframe-prep/SKILL.md, .cursor/skills/speckit-wireframe-review/SKILL.md, .cursor/skills/speckit-wireframe-screenshots/SKILL.md, .cursor/skills/speckit-wireframe-view/SKILL.md, .cursor/skills/speckit-workiq-ask/SKILL.md, .cursor/skills/speckit-workiq-context/SKILL.md, .cursor/skills/speckit-workiq-enrich/SKILL.md, .cursor/skills/speckit-workiq-stakeholders/SKILL.md, .cursor/skills/speckit-worktree-clean/SKILL.md, .cursor/skills/speckit-worktree-create/SKILL.md, .cursor/skills/speckit-worktree-list/SKILL.md, .cursor/skills/speckit-worktrees-clean/SKILL.md, .cursor/skills/speckit-worktrees-create/SKILL.md, .cursor/skills/speckit-worktrees-list/SKILL.md, .kimi/skills/speckit-adosync/SKILL.md, .kimi/skills/speckit-agent-assign-assign/SKILL.md, .kimi/skills/speckit-agent-assign-execute/SKILL.md, .kimi/skills/speckit-agent-assign-validate/SKILL.md, .kimi/skills/speckit-agent-governance-refresh/SKILL.md, .kimi/skills/speckit-agent-orchestrator-discover/SKILL.md, .kimi/skills/speckit-agent-orchestrator-index/SKILL.md, .kimi/skills/speckit-agent-orchestrator-route/SKILL.md, .kimi/skills/speckit-aide-create-item/SKILL.md, .kimi/skills/speckit-aide-create-progress/SKILL.md, .kimi/skills/speckit-aide-create-queue/SKILL.md, .kimi/skills/speckit-aide-create-roadmap/SKILL.md, .kimi/skills/speckit-aide-create-vision/SKILL.md, .kimi/skills/speckit-aide-execute-item/SKILL.md, .kimi/skills/speckit-aide-feedback-loop/SKILL.md, .kimi/skills/speckit-analyze/SKILL.md, .kimi/skills/speckit-arch-generate/SKILL.md, .kimi/skills/speckit-arch-reverse/SKILL.md, .kimi/skills/speckit-architecture-guard-architecture-apply/SKILL.md, .kimi/skills/speckit-architecture-guard-architecture-review/SKILL.md, .kimi/skills/speckit-architecture-guard-architecture-verify/SKILL.md, .kimi/skills/speckit-architecture-guard-architecture-workflow/SKILL.md, .kimi/skills/speckit-architecture-guard-governed-implement/SKILL.md, .kimi/skills/speckit-architecture-guard-governed-plan/SKILL.md, .kimi/skills/speckit-architecture-guard-governed-tasks/SKILL.md, .kimi/skills/speckit-architecture-guard-init/SKILL.md, .kimi/skills/speckit-architecture-guard-refactor-generator/SKILL.md, .kimi/skills/speckit-architecture-guard-violation-detection/SKILL.md, .kimi/skills/speckit-archive-run/SKILL.md, .kimi/skills/speckit-azure-devops-sync/SKILL.md, .kimi/skills/speckit-blueprint-generate/SKILL.md, .kimi/skills/speckit-blueprint-validate/SKILL.md, .kimi/skills/speckit-branch-convention-configure/SKILL.md, .kimi/skills/speckit-branch-convention-rename/SKILL.md, .kimi/skills/speckit-branch-convention-validate/SKILL.md, .kimi/skills/speckit-brownfield-bootstrap/SKILL.md, .kimi/skills/speckit-brownfield-migrate/SKILL.md, .kimi/skills/speckit-brownfield-scan/SKILL.md, .kimi/skills/speckit-brownfield-validate/SKILL.md, .kimi/skills/speckit-brownkit-assess/SKILL.md, .kimi/skills/speckit-brownkit-discover/SKILL.md, .kimi/skills/speckit-brownkit-enrich/SKILL.md, .kimi/skills/speckit-brownkit-finish/SKILL.md, .kimi/skills/speckit-brownkit-gate/SKILL.md, .kimi/skills/speckit-brownkit-generate/SKILL.md, .kimi/skills/speckit-brownkit-init/SKILL.md, .kimi/skills/speckit-brownkit-report/SKILL.md, .kimi/skills/speckit-brownkit-scan/SKILL.md, .kimi/skills/speckit-brownkit-validate/SKILL.md, .kimi/skills/speckit-bugfix-patch/SKILL.md, .kimi/skills/speckit-bugfix-report/SKILL.md, .kimi/skills/speckit-bugfix-verify/SKILL.md, .kimi/skills/speckit-canon-drift-analyze/SKILL.md, .kimi/skills/speckit-canon-drift-canonize/SKILL.md, .kimi/skills/speckit-canon-drift-detect/SKILL.md, .kimi/skills/speckit-canon-drift-implement/SKILL.md, .kimi/skills/speckit-canon-drift-reconcile/SKILL.md, .kimi/skills/speckit-canon-drift-resolve/SKILL.md, .kimi/skills/speckit-canon-drift-reverse/SKILL.md, .kimi/skills/speckit-canon-drift/SKILL.md, .kimi/skills/speckit-canon-vibecode-drift-analyze/SKILL.md, .kimi/skills/speckit-canon-vibecode-drift-canonize/SKILL.md, .kimi/skills/speckit-canon-vibecode-drift-detect/SKILL.md, .kimi/skills/speckit-canon-vibecode-drift-express/SKILL.md, .kimi/skills/speckit-canon-vibecode-drift-reconcile/SKILL.md, .kimi/skills/speckit-canon-vibecode-drift-reverse/SKILL.md, .kimi/skills/speckit-canon-vibecode-drift/SKILL.md, .kimi/skills/speckit-canon-vibecode-specify/SKILL.md, .kimi/skills/speckit-catalog-ci-check-urls/SKILL.md, .kimi/skills/speckit-catalog-ci-diff/SKILL.md, .kimi/skills/speckit-catalog-ci-lint/SKILL.md, .kimi/skills/speckit-catalog-ci-validate/SKILL.md, .kimi/skills/speckit-checklist/SKILL.md, .kimi/skills/speckit-checkpoint-commit/SKILL.md, .kimi/skills/speckit-clarify/SKILL.md, .kimi/skills/speckit-cleanup-run/SKILL.md, .kimi/skills/speckit-cleanup/SKILL.md, .kimi/skills/speckit-conduct-run/SKILL.md, .kimi/skills/speckit-constitution/SKILL.md, .kimi/skills/speckit-convert/SKILL.md, .kimi/skills/speckit-cost-budget/SKILL.md, .kimi/skills/speckit-cost-compare/SKILL.md, .kimi/skills/speckit-cost-export/SKILL.md, .kimi/skills/speckit-cost-report/SKILL.md, .kimi/skills/speckit-cost-track/SKILL.md, .kimi/skills/speckit-critique-run/SKILL.md, .kimi/skills/speckit-deploy/SKILL.md, .kimi/skills/speckit-diagram-dependencies/SKILL.md, .kimi/skills/speckit-diagram-status/SKILL.md, .kimi/skills/speckit-diagram-workflow/SKILL.md, .kimi/skills/speckit-docguard-diagnose/SKILL.md, .kimi/skills/speckit-docguard-fix/SKILL.md, .kimi/skills/speckit-docguard-generate/SKILL.md, .kimi/skills/speckit-docguard-guard/SKILL.md, .kimi/skills/speckit-docguard-review/SKILL.md, .kimi/skills/speckit-docguard-score/SKILL.md, .kimi/skills/speckit-doctor-check/SKILL.md, .kimi/skills/speckit-doctor/SKILL.md, .kimi/skills/speckit-drift/SKILL.md, .kimi/skills/speckit-extensify-create-catalog/SKILL.md, .kimi/skills/speckit-extensify-create-extension-from-skill/SKILL.md, .kimi/skills/speckit-extensify-create-extension/SKILL.md, .kimi/skills/speckit-extensify-validate-catalog/SKILL.md, .kimi/skills/speckit-extensify-validate-extension/SKILL.md, .kimi/skills/speckit-fix-findings-run/SKILL.md, .kimi/skills/speckit-fix-findings/SKILL.md, .kimi/skills/speckit-fixit-run/SKILL.md, .kimi/skills/speckit-fleet-review/SKILL.md, .kimi/skills/speckit-fleet-run/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-assess/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-convert/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-detect/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-fix/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-implement-hook/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-initialize/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-inventory/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-multitarget-migrate/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-orchestrate/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-plan-hook/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-plan/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-show-policy/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-specify-hook/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-tasks-hook/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-update-packages/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-verify-hook/SKILL.md, .kimi/skills/speckit-fx-to-dotnet-web-migrate/SKILL.md, .kimi/skills/speckit-git-commit/SKILL.md, .kimi/skills/speckit-git-feature/SKILL.md, .kimi/skills/speckit-git-initialize/SKILL.md, .kimi/skills/speckit-git-remote/SKILL.md, .kimi/skills/speckit-git-validate/SKILL.md, .kimi/skills/speckit-github-issues-import/SKILL.md, .kimi/skills/speckit-github-issues-link/SKILL.md, .kimi/skills/speckit-github-issues-sync/SKILL.md, .kimi/skills/speckit-implement/SKILL.md, .kimi/skills/speckit-issue-import/SKILL.md, .kimi/skills/speckit-issue-link/SKILL.md, .kimi/skills/speckit-issue-sync/SKILL.md, .kimi/skills/speckit-iterate-apply/SKILL.md, .kimi/skills/speckit-iterate-define/SKILL.md, .kimi/skills/speckit-jira-discover-fields/SKILL.md, .kimi/skills/speckit-jira-specstoissues/SKILL.md, .kimi/skills/speckit-jira-sync-status/SKILL.md, .kimi/skills/speckit-learn-clarify/SKILL.md, .kimi/skills/speckit-learn-review/SKILL.md, .kimi/skills/speckit-maqa-azure-devops-populate/SKILL.md, .kimi/skills/speckit-maqa-azure-devops-setup/SKILL.md, .kimi/skills/speckit-maqa-ci-check/SKILL.md, .kimi/skills/speckit-maqa-ci-setup/SKILL.md, .kimi/skills/speckit-maqa-coordinator/SKILL.md, .kimi/skills/speckit-maqa-feature/SKILL.md, .kimi/skills/speckit-maqa-github-projects-populate/SKILL.md, .kimi/skills/speckit-maqa-github-projects-setup/SKILL.md, .kimi/skills/speckit-maqa-jira-populate/SKILL.md, .kimi/skills/speckit-maqa-jira-setup/SKILL.md, .kimi/skills/speckit-maqa-linear-populate/SKILL.md, .kimi/skills/speckit-maqa-linear-setup/SKILL.md, .kimi/skills/speckit-maqa-qa/SKILL.md, .kimi/skills/speckit-maqa-setup/SKILL.md, .kimi/skills/speckit-maqa-trello-populate/SKILL.md, .kimi/skills/speckit-maqa-trello-setup/SKILL.md, .kimi/skills/speckit-maqa/SKILL.md, .kimi/skills/speckit-markitdown-convert/SKILL.md, .kimi/skills/speckit-mde-next/SKILL.md, .kimi/skills/speckit-mde-setup/SKILL.md, .kimi/skills/speckit-mde-status/SKILL.md, .kimi/skills/speckit-mde-sync/SKILL.md, .kimi/skills/speckit-memory-loader-load/SKILL.md, .kimi/skills/speckit-memory-md-audit/SKILL.md, .kimi/skills/speckit-memory-md-capture-from-diff/SKILL.md, .kimi/skills/speckit-memory-md-capture/SKILL.md, .kimi/skills/speckit-memory-md-init/SKILL.md, .kimi/skills/speckit-memory-md-log-finding/SKILL.md, .kimi/skills/speckit-memory-md-plan-with-memory/SKILL.md, .kimi/skills/speckit-memory-md-token-report/SKILL.md, .kimi/skills/speckit-memorylint-load-agents/SKILL.md, .kimi/skills/speckit-memorylint-run/SKILL.md, .kimi/skills/speckit-multi-model-review-apply-review/SKILL.md, .kimi/skills/speckit-multi-model-review-cross-review/SKILL.md, .kimi/skills/speckit-multi-model-review-review-package/SKILL.md, .kimi/skills/speckit-multi-model-review-spec-handoff/SKILL.md, .kimi/skills/speckit-onboard-badge/SKILL.md, .kimi/skills/speckit-onboard-explain/SKILL.md, .kimi/skills/speckit-onboard-mentor/SKILL.md, .kimi/skills/speckit-onboard-quiz/SKILL.md, .kimi/skills/speckit-onboard-start/SKILL.md, .kimi/skills/speckit-onboard-team/SKILL.md, .kimi/skills/speckit-onboard-trail/SKILL.md, .kimi/skills/speckit-optimize-learn/SKILL.md, .kimi/skills/speckit-optimize-run/SKILL.md, .kimi/skills/speckit-optimize-tokens/SKILL.md, .kimi/skills/speckit-orchestrator-conflicts/SKILL.md, .kimi/skills/speckit-orchestrator-next/SKILL.md, .kimi/skills/speckit-orchestrator-status/SKILL.md, .kimi/skills/speckit-orchestrator-sync/SKILL.md, .kimi/skills/speckit-plan-review-gate-check/SKILL.md, .kimi/skills/speckit-plan/SKILL.md, .kimi/skills/speckit-presetify-create-catalog/SKILL.md, .kimi/skills/speckit-presetify-create-preset/SKILL.md, .kimi/skills/speckit-presetify-validate-catalog/SKILL.md, .kimi/skills/speckit-presetify-validate-preset/SKILL.md, .kimi/skills/speckit-preview-html/SKILL.md, .kimi/skills/speckit-product-forge-api-docs/SKILL.md, .kimi/skills/speckit-product-forge-backfill/SKILL.md, .kimi/skills/speckit-product-forge-bridge/SKILL.md, .kimi/skills/speckit-product-forge-change-request/SKILL.md, .kimi/skills/speckit-product-forge-code-review/SKILL.md, .kimi/skills/speckit-product-forge-experiment-design/SKILL.md, .kimi/skills/speckit-product-forge-feature-flag-cleanup/SKILL.md, .kimi/skills/speckit-product-forge-forge/SKILL.md, .kimi/skills/speckit-product-forge-i18n-harvest/SKILL.md, .kimi/skills/speckit-product-forge-implement/SKILL.md, .kimi/skills/speckit-product-forge-migration-plan/SKILL.md, .kimi/skills/speckit-product-forge-monitoring-setup/SKILL.md, .kimi/skills/speckit-product-forge-plan/SKILL.md, .kimi/skills/speckit-product-forge-portfolio/SKILL.md, .kimi/skills/speckit-product-forge-pre-impl-review/SKILL.md, .kimi/skills/speckit-product-forge-problem-discovery/SKILL.md, .kimi/skills/speckit-product-forge-product-spec/SKILL.md, .kimi/skills/speckit-product-forge-release-readiness/SKILL.md, .kimi/skills/speckit-product-forge-research/SKILL.md, .kimi/skills/speckit-product-forge-retrospective/SKILL.md, .kimi/skills/speckit-product-forge-revalidate/SKILL.md, .kimi/skills/speckit-product-forge-security-check/SKILL.md, .kimi/skills/speckit-product-forge-status/SKILL.md, .kimi/skills/speckit-product-forge-sync-verify/SKILL.md, .kimi/skills/speckit-product-forge-tasks/SKILL.md, .kimi/skills/speckit-product-forge-test-plan/SKILL.md, .kimi/skills/speckit-product-forge-test-run/SKILL.md, .kimi/skills/speckit-product-forge-tracking-plan/SKILL.md, .kimi/skills/speckit-product-forge-verify-full/SKILL.md, .kimi/skills/speckit-qa-run/SKILL.md, .kimi/skills/speckit-ralph-iterate/SKILL.md, .kimi/skills/speckit-ralph-run/SKILL.md, .kimi/skills/speckit-reconcile-run/SKILL.md, .kimi/skills/speckit-red-team-gate/SKILL.md, .kimi/skills/speckit-red-team-run/SKILL.md, .kimi/skills/speckit-refine-diff/SKILL.md, .kimi/skills/speckit-refine-propagate/SKILL.md, .kimi/skills/speckit-refine-status/SKILL.md, .kimi/skills/speckit-refine-update/SKILL.md, .kimi/skills/speckit-repoindex-architecture/SKILL.md, .kimi/skills/speckit-repoindex-module/SKILL.md, .kimi/skills/speckit-repoindex-overview/SKILL.md, .kimi/skills/speckit-reqnroll-bdd-generate/SKILL.md, .kimi/skills/speckit-reqnroll-bdd-inject-tasks/SKILL.md, .kimi/skills/speckit-reqnroll-bdd-plan/SKILL.md, .kimi/skills/speckit-reqnroll-bdd-verify/SKILL.md, .kimi/skills/speckit-retro-run/SKILL.md, .kimi/skills/speckit-retrospective-analyze/SKILL.md, .kimi/skills/speckit-review-code/SKILL.md, .kimi/skills/speckit-review-comments/SKILL.md, .kimi/skills/speckit-review-errors/SKILL.md, .kimi/skills/speckit-review-run/SKILL.md, .kimi/skills/speckit-review-simplify/SKILL.md, .kimi/skills/speckit-review-tests/SKILL.md, .kimi/skills/speckit-review-types/SKILL.md, .kimi/skills/speckit-ripple-check/SKILL.md, .kimi/skills/speckit-ripple-resolve/SKILL.md, .kimi/skills/speckit-ripple-scan/SKILL.md, .kimi/skills/speckit-schedule-calibrate/SKILL.md, .kimi/skills/speckit-schedule-portfolio/SKILL.md, .kimi/skills/speckit-schedule-run/SKILL.md, .kimi/skills/speckit-schedule-solve/SKILL.md, .kimi/skills/speckit-schedule-status/SKILL.md, .kimi/skills/speckit-schedule-visualize/SKILL.md, .kimi/skills/speckit-scope-budget/SKILL.md, .kimi/skills/speckit-scope-compare/SKILL.md, .kimi/skills/speckit-scope-creep/SKILL.md, .kimi/skills/speckit-scope-estimate/SKILL.md, .kimi/skills/speckit-security-review-apply/SKILL.md, .kimi/skills/speckit-security-review-audit/SKILL.md, .kimi/skills/speckit-security-review-branch/SKILL.md, .kimi/skills/speckit-security-review-export/SKILL.md, .kimi/skills/speckit-security-review-followup/SKILL.md, .kimi/skills/speckit-security-review-init/SKILL.md, .kimi/skills/speckit-security-review-plan/SKILL.md, .kimi/skills/speckit-security-review-staged/SKILL.md, .kimi/skills/speckit-security-review-tasks/SKILL.md, .kimi/skills/speckit-sf-change/SKILL.md, .kimi/skills/speckit-sf-clarify/SKILL.md, .kimi/skills/speckit-sf-constitution/SKILL.md, .kimi/skills/speckit-sf-deploy/SKILL.md, .kimi/skills/speckit-sf-hotfix/SKILL.md, .kimi/skills/speckit-sf-implement/SKILL.md, .kimi/skills/speckit-sf-plan/SKILL.md, .kimi/skills/speckit-sf-pr/SKILL.md, .kimi/skills/speckit-sf-qa/SKILL.md, .kimi/skills/speckit-sf-regression/SKILL.md, .kimi/skills/speckit-sf-release-notes/SKILL.md, .kimi/skills/speckit-sf-review/SKILL.md, .kimi/skills/speckit-sf-score/SKILL.md, .kimi/skills/speckit-sf-setup/SKILL.md, .kimi/skills/speckit-sf-specify/SKILL.md, .kimi/skills/speckit-sf-stories/SKILL.md, .kimi/skills/speckit-sf-uat/SKILL.md, .kimi/skills/speckit-sf-verify/SKILL.md, .kimi/skills/speckit-ship-run/SKILL.md, .kimi/skills/speckit-spec-reference-loader-load/SKILL.md, .kimi/skills/speckit-spec-validate-analytics/SKILL.md, .kimi/skills/speckit-spec-validate-gate/SKILL.md, .kimi/skills/speckit-spec-validate-review/SKILL.md, .kimi/skills/speckit-spec-validate-status/SKILL.md, .kimi/skills/speckit-spec-validate-validate-tasks/SKILL.md, .kimi/skills/speckit-spec-validate-validate/SKILL.md, .kimi/skills/speckit-spec2cloud-deploy/SKILL.md, .kimi/skills/speckit-spec2cloud-verify/SKILL.md, .kimi/skills/speckit-specify/SKILL.md, .kimi/skills/speckit-speckit-superpowers-bridge-execute/SKILL.md, .kimi/skills/speckit-speckit-superpowers-bridge-guard/SKILL.md, .kimi/skills/speckit-speckit-superpowers-bridge-handoff/SKILL.md, .kimi/skills/speckit-specstoissues/SKILL.md, .kimi/skills/speckit-squad-generate/SKILL.md, .kimi/skills/speckit-squad-init/SKILL.md, .kimi/skills/speckit-squad-route/SKILL.md, .kimi/skills/speckit-squad-status/SKILL.md, .kimi/skills/speckit-staff-review-run/SKILL.md, .kimi/skills/speckit-status-show/SKILL.md, .kimi/skills/speckit-status/SKILL.md, .kimi/skills/speckit-superb-check/SKILL.md, .kimi/skills/speckit-superb-critique/SKILL.md, .kimi/skills/speckit-superb-debug/SKILL.md, .kimi/skills/speckit-superb-finish/SKILL.md, .kimi/skills/speckit-superb-respond/SKILL.md, .kimi/skills/speckit-superb-review/SKILL.md, .kimi/skills/speckit-superb-tdd/SKILL.md, .kimi/skills/speckit-superb-verify/SKILL.md, .kimi/skills/speckit-superpowers-bridge/SKILL.md, .kimi/skills/speckit-sync-analyze/SKILL.md, .kimi/skills/speckit-sync-apply/SKILL.md, .kimi/skills/speckit-sync-backfill/SKILL.md, .kimi/skills/speckit-sync-conflicts/SKILL.md, .kimi/skills/speckit-sync-propose/SKILL.md, .kimi/skills/speckit-tasks/SKILL.md, .kimi/skills/speckit-taskstoissues/SKILL.md, .kimi/skills/speckit-threatmodel-analyze/SKILL.md, .kimi/skills/speckit-time-machine-analyze/SKILL.md, .kimi/skills/speckit-time-machine-next/SKILL.md, .kimi/skills/speckit-time-machine-status/SKILL.md, .kimi/skills/speckit-tinyspec-classify/SKILL.md, .kimi/skills/speckit-tinyspec-implement/SKILL.md, .kimi/skills/speckit-tinyspec-tinyspec/SKILL.md, .kimi/skills/speckit-token-analyzer-baseline/SKILL.md, .kimi/skills/speckit-token-analyzer-compare/SKILL.md, .kimi/skills/speckit-token-analyzer-report/SKILL.md, .kimi/skills/speckit-v-model-acceptance/SKILL.md, .kimi/skills/speckit-v-model-architecture-design/SKILL.md, .kimi/skills/speckit-v-model-audit-report/SKILL.md, .kimi/skills/speckit-v-model-hazard-analysis/SKILL.md, .kimi/skills/speckit-v-model-impact-analysis/SKILL.md, .kimi/skills/speckit-v-model-integration-test/SKILL.md, .kimi/skills/speckit-v-model-module-design/SKILL.md, .kimi/skills/speckit-v-model-peer-review/SKILL.md, .kimi/skills/speckit-v-model-requirements/SKILL.md, .kimi/skills/speckit-v-model-system-design/SKILL.md, .kimi/skills/speckit-v-model-system-test/SKILL.md, .kimi/skills/speckit-v-model-test-results/SKILL.md, .kimi/skills/speckit-v-model-trace/SKILL.md, .kimi/skills/speckit-v-model-unit-test/SKILL.md, .kimi/skills/speckit-verify-run/SKILL.md, .kimi/skills/speckit-verify-tasks-run/SKILL.md, .kimi/skills/speckit-verify-tasks/SKILL.md, .kimi/skills/speckit-verify/SKILL.md, .kimi/skills/speckit-version-guard-check/SKILL.md, .kimi/skills/speckit-version-guard-load/SKILL.md, .kimi/skills/speckit-version-guard-validate/SKILL.md, .kimi/skills/speckit-wireframe-generate/SKILL.md, .kimi/skills/speckit-wireframe-inspect/SKILL.md, .kimi/skills/speckit-wireframe-prep/SKILL.md, .kimi/skills/speckit-wireframe-review/SKILL.md, .kimi/skills/speckit-wireframe-screenshots/SKILL.md, .kimi/skills/speckit-wireframe-view/SKILL.md, .kimi/skills/speckit-workiq-ask/SKILL.md, .kimi/skills/speckit-workiq-context/SKILL.md, .kimi/skills/speckit-workiq-enrich/SKILL.md, .kimi/skills/speckit-workiq-stakeholders/SKILL.md, .kimi/skills/speckit-worktree-clean/SKILL.md, .kimi/skills/speckit-worktree-create/SKILL.md, .kimi/skills/speckit-worktree-list/SKILL.md, .kimi/skills/speckit-worktrees-clean/SKILL.md, .kimi/skills/speckit-worktrees-create/SKILL.md, .kimi/skills/speckit-worktrees-list/SKILL.md, .omk/open-design/design-templates/audio-jingle/SKILL.md, .omk/open-design/design-templates/blog-post/SKILL.md, .omk/open-design/design-templates/clinical-case-report/SKILL.md, .omk/open-design/design-templates/critique/SKILL.md, .omk/open-design/design-templates/dashboard/SKILL.md, .omk/open-design/design-templates/dating-web/SKILL.md, .omk/open-design/design-templates/dcf-valuation/SKILL.md, .omk/open-design/design-templates/digital-eguide/SKILL.md, .omk/open-design/design-templates/docs-page/SKILL.md, .omk/open-design/design-templates/email-marketing/SKILL.md, .omk/open-design/design-templates/eng-runbook/SKILL.md, .omk/open-design/design-templates/finance-report/SKILL.md, .omk/open-design/design-templates/flowai-live-dashboard-template/SKILL.md, .omk/open-design/design-templates/gamified-app/SKILL.md, .omk/open-design/design-templates/github-dashboard/SKILL.md, .omk/open-design/design-templates/guizang-ppt/SKILL.md, .omk/open-design/design-templates/hr-onboarding/SKILL.md, .omk/open-design/design-templates/html-ppt-course-module/SKILL.md, .omk/open-design/design-templates/html-ppt-dir-key-nav-minimal/SKILL.md, .omk/open-design/design-templates/html-ppt-graphify-dark-graph/SKILL.md, .omk/open-design/design-templates/html-ppt-hermes-cyber-terminal/SKILL.md, .omk/open-design/design-templates/html-ppt-knowledge-arch-blueprint/SKILL.md, .omk/open-design/design-templates/html-ppt-obsidian-claude-gradient/SKILL.md, .omk/open-design/design-templates/html-ppt-pitch-deck/SKILL.md, .omk/open-design/design-templates/html-ppt-presenter-mode-reveal/SKILL.md, .omk/open-design/design-templates/html-ppt-product-launch/SKILL.md, .omk/open-design/design-templates/html-ppt-taste-brutalist/SKILL.md, .omk/open-design/design-templates/html-ppt-taste-editorial/SKILL.md, .omk/open-design/design-templates/html-ppt-tech-sharing/SKILL.md, .omk/open-design/design-templates/html-ppt-testing-safety-alert/SKILL.md, .omk/open-design/design-templates/html-ppt-weekly-report/SKILL.md, .omk/open-design/design-templates/html-ppt-xhs-pastel-card/SKILL.md, .omk/open-design/design-templates/html-ppt-xhs-post/SKILL.md, .omk/open-design/design-templates/html-ppt-xhs-white-editorial/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-8-bit-orbit/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-biennale-yellow/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-block-frame/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-blue-professional/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-bold-poster/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-broadside/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-capsule/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-cartesian/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-cobalt-grid/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-coral/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-creative-mode/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-daisy-days/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-editorial-tri-tone/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-grove/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-long-table/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-mat/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-monochrome/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-neo-grid-bold/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-peoples-platform/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-pin-and-paper/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-pink-script/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-playful/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-raw-grid/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-retro-windows/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-retro-zine/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-sakura-chroma/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-scatterbrain/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-signal/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-soft-editorial/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-stencil-tablet/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-studio/SKILL.md, .omk/open-design/design-templates/html-ppt-zhangzara-vellum/SKILL.md, .omk/open-design/design-templates/html-ppt/SKILL.md, .omk/open-design/design-templates/hyperframes/SKILL.md, .omk/open-design/design-templates/ib-pitch-book/SKILL.md, .omk/open-design/design-templates/image-poster/SKILL.md, .omk/open-design/design-templates/invoice/SKILL.md, .omk/open-design/design-templates/kami-deck/SKILL.md, .omk/open-design/design-templates/kami-landing/SKILL.md, .omk/open-design/design-templates/kanban-board/SKILL.md, .omk/open-design/design-templates/last30days/SKILL.md, .omk/open-design/design-templates/live-artifact/SKILL.md, .omk/open-design/design-templates/live-dashboard/SKILL.md, .omk/open-design/design-templates/magazine-poster/SKILL.md, .omk/open-design/design-templates/meeting-notes/SKILL.md, .omk/open-design/design-templates/mobile-app/SKILL.md, .omk/open-design/design-templates/mobile-onboarding/SKILL.md, .omk/open-design/design-templates/motion-frames/SKILL.md, .omk/open-design/design-templates/open-design-landing-deck/SKILL.md, .omk/open-design/design-templates/open-design-landing/SKILL.md, .omk/open-design/design-templates/orbit-general/SKILL.md, .omk/open-design/design-templates/orbit-github/SKILL.md, .omk/open-design/design-templates/orbit-gmail/SKILL.md, .omk/open-design/design-templates/orbit-linear/SKILL.md, .omk/open-design/design-templates/orbit-notion/SKILL.md, .omk/open-design/design-templates/pm-spec/SKILL.md, .omk/open-design/design-templates/pricing-page/SKILL.md, .omk/open-design/design-templates/replit-deck/SKILL.md, .omk/open-design/design-templates/saas-landing/SKILL.md, .omk/open-design/design-templates/simple-deck/SKILL.md, .omk/open-design/design-templates/social-carousel/SKILL.md, .omk/open-design/design-templates/social-media-dashboard/SKILL.md, .omk/open-design/design-templates/social-media-matrix-tracker-template/SKILL.md, .omk/open-design/design-templates/sprite-animation/SKILL.md, .omk/open-design/design-templates/team-okrs/SKILL.md, .omk/open-design/design-templates/trading-analysis-dashboard-template/SKILL.md, .omk/open-design/design-templates/tweaks/SKILL.md, .omk/open-design/design-templates/video-shortform/SKILL.md, .omk/open-design/design-templates/waitlist-page/SKILL.md, .omk/open-design/design-templates/web-prototype-taste-brutalist/SKILL.md, .omk/open-design/design-templates/web-prototype-taste-editorial/SKILL.md, .omk/open-design/design-templates/web-prototype-taste-soft/SKILL.md, .omk/open-design/design-templates/web-prototype/SKILL.md, .omk/open-design/design-templates/weekly-update/SKILL.md, .omk/open-design/design-templates/wireframe-sketch/SKILL.md, .omk/open-design/design-templates/x-research/SKILL.md, .omk/open-design/docs/examples/saas-landing-skill/SKILL.md, .omk/open-design/skills/8-bit-orbit-video-template/SKILL.md, .omk/open-design/skills/ad-creative/SKILL.md, .omk/open-design/skills/after-hours-editorial-template/SKILL.md, .omk/open-design/skills/agent-browser/SKILL.md, .omk/open-design/skills/ai-music-album/SKILL.md, .omk/open-design/skills/algorithmic-art/SKILL.md, .omk/open-design/skills/apple-hig/SKILL.md, .omk/open-design/skills/artifacts-builder/SKILL.md, .omk/open-design/skills/brainstorming/SKILL.md, .omk/open-design/skills/brand-guidelines/SKILL.md, .omk/open-design/skills/canvas-design/SKILL.md, .omk/open-design/skills/color-expert/SKILL.md, .omk/open-design/skills/competitive-ads-extractor/SKILL.md, .omk/open-design/skills/copywriting/SKILL.md, .omk/open-design/skills/creative-director/SKILL.md, .omk/open-design/skills/d3-visualization/SKILL.md, .omk/open-design/skills/design-brief/SKILL.md, .omk/open-design/skills/design-consultation/SKILL.md, .omk/open-design/skills/design-md/SKILL.md, .omk/open-design/skills/design-review/SKILL.md, .omk/open-design/skills/digits-fintech-swiss-template/SKILL.md, .omk/open-design/skills/doc/SKILL.md, .omk/open-design/skills/docx/SKILL.md, .omk/open-design/skills/domain-name-brainstormer/SKILL.md, .omk/open-design/skills/editorial-burgundy-principles-template/SKILL.md, .omk/open-design/skills/enhance-prompt/SKILL.md, .omk/open-design/skills/fal-3d/SKILL.md, .omk/open-design/skills/fal-generate/SKILL.md, .omk/open-design/skills/fal-image-edit/SKILL.md, .omk/open-design/skills/fal-kling-o3/SKILL.md, .omk/open-design/skills/fal-lip-sync/SKILL.md, .omk/open-design/skills/fal-realtime/SKILL.md, .omk/open-design/skills/fal-restore/SKILL.md, .omk/open-design/skills/fal-train/SKILL.md, .omk/open-design/skills/fal-tryon/SKILL.md, .omk/open-design/skills/fal-upscale/SKILL.md, .omk/open-design/skills/fal-video-edit/SKILL.md, .omk/open-design/skills/fal-vision/SKILL.md, .omk/open-design/skills/faq-page/SKILL.md, .omk/open-design/skills/field-notes-editorial-template/SKILL.md, .omk/open-design/skills/figma-code-connect-components/SKILL.md, .omk/open-design/skills/figma-create-design-system-rules/SKILL.md, .omk/open-design/skills/figma-create-new-file/SKILL.md, .omk/open-design/skills/figma-generate-design/SKILL.md, .omk/open-design/skills/figma-generate-library/SKILL.md, .omk/open-design/skills/figma-implement-design/SKILL.md, .omk/open-design/skills/figma-use/SKILL.md, .omk/open-design/skills/flutter-animating-apps/SKILL.md, .omk/open-design/skills/frontend-design/SKILL.md, .omk/open-design/skills/frontend-dev/SKILL.md, .omk/open-design/skills/frontend-skill/SKILL.md, .omk/open-design/skills/frontend-slides/SKILL.md, .omk/open-design/skills/full-page-screenshot/SKILL.md, .omk/open-design/skills/gif-sticker-maker/SKILL.md, .omk/open-design/skills/gsap-core/SKILL.md, .omk/open-design/skills/gsap-react/SKILL.md, .omk/open-design/skills/gsap-scrolltrigger/SKILL.md, .omk/open-design/skills/gsap-timeline/SKILL.md, .omk/open-design/skills/hand-drawn-diagrams/SKILL.md, .omk/open-design/skills/hatch-pet/SKILL.md, .omk/open-design/skills/html-ppt-retro-quarterly-review/SKILL.md, .omk/open-design/skills/image-enhancer/SKILL.md, .omk/open-design/skills/imagegen/SKILL.md, .omk/open-design/skills/imagen/SKILL.md, .omk/open-design/skills/login-flow/SKILL.md, .omk/open-design/skills/marketing-psychology/SKILL.md, .omk/open-design/skills/minimax-docx/SKILL.md, .omk/open-design/skills/minimax-pdf/SKILL.md, .omk/open-design/skills/nanobanana-ppt/SKILL.md, .omk/open-design/skills/paywall-upgrade-cro/SKILL.md, .omk/open-design/skills/pdf/SKILL.md, .omk/open-design/skills/pixelbin-media/SKILL.md, .omk/open-design/skills/plan-design-review/SKILL.md, .omk/open-design/skills/platform-design/SKILL.md, .omk/open-design/skills/pptx-generator/SKILL.md, .omk/open-design/skills/pptx-html-fidelity-audit/SKILL.md, .omk/open-design/skills/pptx/SKILL.md, .omk/open-design/skills/release-notes-one-pager/SKILL.md, .omk/open-design/skills/remotion/SKILL.md, .omk/open-design/skills/replicate/SKILL.md, .omk/open-design/skills/screenshot/SKILL.md, .omk/open-design/skills/screenshots-marketing/SKILL.md, .omk/open-design/skills/shadcn-ui/SKILL.md, .omk/open-design/skills/shader-dev/SKILL.md, .omk/open-design/skills/slack-gif-creator/SKILL.md, .omk/open-design/skills/slides/SKILL.md, .omk/open-design/skills/sora/SKILL.md, .omk/open-design/skills/speech/SKILL.md, .omk/open-design/skills/stitch-loop/SKILL.md, .omk/open-design/skills/swiftui-design/SKILL.md, .omk/open-design/skills/swiss-creative-mode-template/SKILL.md, .omk/open-design/skills/swiss-user-research-video-template/SKILL.md, .omk/open-design/skills/taste-skill/SKILL.md, .omk/open-design/skills/theme-factory/SKILL.md, .omk/open-design/skills/threejs/SKILL.md, .omk/open-design/skills/ui-skills/SKILL.md, .omk/open-design/skills/ui-ux-pro-max/SKILL.md, .omk/open-design/skills/venice-audio-music/SKILL.md, .omk/open-design/skills/venice-audio-speech/SKILL.md, .omk/open-design/skills/venice-image-edit/SKILL.md, .omk/open-design/skills/venice-image-generate/SKILL.md, .omk/open-design/skills/venice-video/SKILL.md, .omk/open-design/skills/video-downloader/SKILL.md, .omk/open-design/skills/web-artifacts-builder/SKILL.md, .omk/open-design/skills/web-design-guidelines/SKILL.md, .omk/open-design/skills/wpds/SKILL.md, .omk/open-design/skills/youtube-clipper/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-agent-governance-refresh/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-analyze/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-arch-generate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-arch-reverse/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-architecture-apply/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-architecture-review/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-architecture-verify/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-architecture-workflow/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-governed-implement/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-governed-plan/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-governed-tasks/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-init/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-refactor-generator/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-architecture-guard-violation-detection/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-archive-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-blueprint-generate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-blueprint-validate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-brownfield-bootstrap/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-brownfield-migrate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-brownfield-scan/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-brownfield-validate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-checklist/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-checkpoint-commit/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-clarify/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-cleanup-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-cleanup/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-constitution/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-critique-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-diagram-dependencies/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-diagram-status/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-diagram-workflow/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-doctor-check/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-doctor/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-drift/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-fix-findings-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-fix-findings/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-fixit-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-github-issues-import/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-github-issues-link/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-github-issues-sync/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-implement/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-iterate-apply/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-iterate-define/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-memory-loader-load/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-memorylint-load-agents/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-memorylint-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-plan/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-reconcile-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-red-team-gate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-red-team-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-repoindex-architecture/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-repoindex-module/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-repoindex-overview/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-retro-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-retrospective-analyze/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-ripple-check/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-ripple-resolve/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-ripple-scan/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-scope-budget/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-scope-compare/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-scope-creep/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-scope-estimate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-apply/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-audit/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-branch/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-export/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-followup/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-init/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-plan/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-staged/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-security-review-tasks/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-ship-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-specify/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-squad-generate/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-squad-init/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-squad-route/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-squad-status/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-staff-review-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-status-show/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-status/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-sync-analyze/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-sync-apply/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-sync-backfill/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-sync-conflicts/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-sync-propose/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-tasks/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-taskstoissues/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-verify-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-verify-tasks-run/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-verify-tasks/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-version-guard-check/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-version-guard-load/SKILL.md, .specify-backups/20260518-141826/\_agents/skills/speckit-version-guard-validate/SKILL.md, .specify/extensions/docguard/skills/docguard-fix/SKILL.md, .specify/extensions/docguard/skills/docguard-guard/SKILL.md, .specify/extensions/docguard/skills/docguard-review/SKILL.md, .specify/extensions/docguard/skills/docguard-score/SKILL.md, .specify/extensions/multi-model-review/skills/multi-model-review/SKILL.md, docs/spec-kit-source/.github/skills/add-community-extension/SKILL.md, kimi-cli/.kimi/skills/speckit-analyze/SKILL.md, kimi-cli/.kimi/skills/speckit-checklist/SKILL.md, kimi-cli/.kimi/skills/speckit-clarify/SKILL.md, kimi-cli/.kimi/skills/speckit-constitution/SKILL.md, kimi-cli/.kimi/skills/speckit-git-commit/SKILL.md, kimi-cli/.kimi/skills/speckit-git-feature/SKILL.md, kimi-cli/.kimi/skills/speckit-git-initialize/SKILL.md, kimi-cli/.kimi/skills/speckit-git-remote/SKILL.md, kimi-cli/.kimi/skills/speckit-git-validate/SKILL.md, kimi-cli/.kimi/skills/speckit-implement/SKILL.md, kimi-cli/.kimi/skills/speckit-plan/SKILL.md, kimi-cli/.kimi/skills/speckit-specify/SKILL.md, kimi-cli/.kimi/skills/speckit-tasks/SKILL.md, kimi-cli/.kimi/skills/speckit-taskstoissues/SKILL.md
- MCP Configs: .omk/open-design/.tmp/tools-dev/default/web/next/dev/static/chunks/apps*web_src_components_McpClientSection_tsx_01aejdg.*.js, .omk/open-design/.tmp/tools-dev/default/web/next/dev/static/chunks/apps*web_src_components_McpClientSection_tsx_01aejdg.*.js.map, .omk/open-design/apps/daemon/src/mcp-config.ts, .omk/open-design/apps/daemon/src/mcp-daemon-url.ts, .omk/open-design/apps/daemon/src/mcp-install-info.ts, .omk/open-design/apps/daemon/src/mcp-live-artifacts-server.ts, .omk/open-design/apps/daemon/src/mcp-oauth.ts, .omk/open-design/apps/daemon/src/mcp-routes.ts, .omk/open-design/apps/daemon/src/mcp-tokens.ts, .omk/open-design/apps/daemon/src/mcp.ts, .omk/open-design/apps/daemon/src/runtimes/mcp.ts, .omk/open-design/apps/daemon/tests/mcp-config.test.ts, .omk/open-design/apps/daemon/tests/mcp-daemon-url.test.ts, .omk/open-design/apps/daemon/tests/mcp-extract-refs.test.ts, .omk/open-design/apps/daemon/tests/mcp-get-artifact.test.ts, .omk/open-design/apps/daemon/tests/mcp-get-file.test.ts, .omk/open-design/apps/daemon/tests/mcp-install-info.test.ts, .omk/open-design/apps/daemon/tests/mcp-oauth.test.ts, .omk/open-design/apps/daemon/tests/mcp-resolve-project.test.ts, .omk/open-design/apps/daemon/tests/mcp-spawn.test.ts, .omk/open-design/apps/daemon/tests/mcp-tokens.test.ts, .omk/open-design/apps/daemon/tests/runtimes/mcp.test.ts, .omk/open-design/apps/web/src/components/McpClientSection.tsx, .omk/open-design/apps/web/src/state/mcp.ts, .omk/open-design/apps/web/tests/components/McpJsonHelper.test.tsx, .omk/open-design/packages/contracts/dist/api/mcp.d.ts, .omk/open-design/packages/contracts/dist/api/mcp.d.ts.map, .omk/open-design/packages/contracts/src/api/mcp.ts, .specify/extensions/fx-to-dotnet/policies/mcp-setup.md, .specify/extensions/multi-model-review/templates/codex-mcp-review-prompt.md
- Extensions Config: .specify/extensions.yml (present)

## Authority Order

1. Current user instruction
2. Agent governance domain rules from `.specify/memory/agent-governance.md`
3. User-authored repository instructions for agent behavior
4. Skill-local `SKILL.md`
5. Tool and MCP defaults

## Non-Negotiable Execution Gates

- Before editing implementation files, verify the active change has the required project-governance artifacts for implementation.
- If any required project-governance artifact is missing, stop implementation and run the owning project-governance workflow before editing implementation files.
- Do not treat bug fixes, refactors, or small code changes as exceptions to the implementation gate.
- Do not modify governance, CI, MCP config, secrets, permissions, or tool settings unless the user explicitly requests that change.
- Before any mutating MCP call or external write, obtain explicit user intent and report the target, action, and expected effect.
- Before handoff, report changed files, commands run, validation results, and unresolved risks.

## Write Boundaries

- Agent code writes are allowed only while executing the generated Spec Kit implement
  command or integration-equivalent implement skill/alias, such as `/speckit.implement`
  or `/speckit-implement`.
- Before any agent writes source code, tests, build configuration, migrations, runtime
  assets, or other implementation files, the active change MUST have the required
  project-governance artifacts for implementation.
- Bug fixes, refactors, and small code changes are not exceptions. If the required
  project-governance artifacts do not exist, first run the owning project-governance
  workflow, then stop before implementation.
- Direct user requests to "just edit code" or similar are treated as requests to run the
  owning project-governance workflow; they are not permission to bypass the
  implementation gate.
- Do not edit governance, CI, MCP config, secrets, permissions, or tool settings unless
  explicitly requested.
- Do not modify files outside the active task scope.
- Do not overwrite user edits.
- Do not rewrite generated files unless the owning workflow requires it.

## MCP And External Tool Policy

- MCP tools are read-only by default.
- Mutating MCP calls require explicit user intent.
- External writes must report target, action, and result.
- Secrets and tokens must never be logged or written to repo files.

## Skill Usage Policy

Each skill must declare:

- purpose
- trigger
- allowed read paths
- allowed write paths
- forbidden paths
- outputs
- validation command

## Required Handoff Report

Before handoff, report:

- changed files
- commands run
- tests/validation result
- unresolved risks
<!-- SPECKIT GOVERNANCE END -->
