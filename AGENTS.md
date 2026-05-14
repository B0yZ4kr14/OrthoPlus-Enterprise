# AGENTS.md — OrthoPlus Enterprise

> Arquivo de referência para agentes de IA que trabalham neste projeto.
> **Atualizado:** 2026-05-13 | **Branch:** main | **Commit:** ad38ad048 | **Checkpoint:** TSi-Vault/orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-13.md

---

## Visão Geral

O **OrthoPlus Enterprise** é um monorepo full-stack de gestão odontológica com:
- **Frontend**: React 19 + Vite 6 + Tailwind CSS (porta **3000** dev / 5173 legacy)
- **Backend**: Node.js 20 + Express 4 + Prisma 6 + PostgreSQL 16 (porta 3005)
- **Agent Service**: Python 3.14 + FastAPI + Agno 2.5 (porta 8000)

---

## Estrutura de Diretórios

```
OrthoPlus-Enterprise/
├── apps/web/                  # Frontend React
├── backend/                   # Backend Node.js
│   ├── src/modules/           # 35 módulos de domínio
│   ├── src/middleware/        # Middleware Express
│   ├── src/routes/            # Rotas (modulesRouter)
│   ├── prisma/schema.prisma   # 178 models
│   └── workers/               # 9 cron jobs
├── agent-service/             # Serviço Python/FastAPI
├── shared-types/              # Tipos TypeScript
└── docs/                      # Documentação
```

---

## Convenções de Código

### TypeScript (Backend)
- **ES Modules**: `import/export`
- **Strict mode**: Tipagem obrigatória
- **Async/await**: Nunca callbacks
- **Error handling**: Usar `ApiError` de `@/errors/ApiError`
- **Clinic context**: Todo router deve usar `clinicGuard` middleware
- **Prisma**: Preferir Prisma Client sobre `queryRaw`

### TypeScript (Frontend)
- **Hooks**: Custom hooks em `hooks/` ou `components/*/use*.ts`
- **API Client**: Usar `apiClient` de `lib/api/apiClient.ts`
- **Date utils**: Usar `lib/utils/date.utils.ts` (não importar `date-fns` diretamente)
- **Auth**: Usar `useAuth()` do `contexts/AuthContext.tsx`

### Bash (Scripts)
- Shebang: `#!/bin/bash`
- `set -e` na segunda linha
- Funções de log coloridas padronizadas

---

## Comandos Essenciais

```bash
# Root
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm type-check

# Backend
cd backend && pnpm build
cd backend && pnpm dev

# Frontend
cd apps/web && pnpm dev

# Agent Service
cd agent-service && python src/main.py
```

---

## Módulos Backend (36)

Todos os 36 módulos possuem router registrado em `backend/src/index.ts` e `clinicGuard` aplicado.

| # | Módulo | Router | Controller | Prisma |
|---|--------|--------|------------|--------|
| 0 | `admin_tools` | ✅ | ✅ | ❌ |
| 1 | `agenda` | ✅ | ✅ | ✅ |
| 2 | `analytics` | ✅ | ✅ | ✅ |
| 3 | `auth` | ✅ | ✅ | ✅ |
| 4 | `backups` | ✅ | ✅ | ❌ |
| 5 | `bi` | ✅ | ❌ | ❌ |
| 6 | `comm` | ✅ | ✅ | ❌ |
| 7 | `configuracoes` | ✅ | ✅ | ❌ |
| 8 | `contratos` | ✅ | ✅ | ❌ |
| 9 | `crm` | ✅ | ✅ | ❌ |
| 10 | `crypto_config` | ✅ | ✅ | ✅ |
| 11 | `dashboard` | ✅ | ✅ | ✅ |
| 12 | `database_admin` | ✅ | ✅ | ✅ |
| 13 | `faturamento` | ✅ | ✅ | ✅ |
| 14 | `fidelidade` | ✅ | ❌ | ❌ |
| 15 | `files` | ✅ | ✅ | ✅ |
| 16 | `financeiro` | ✅ | ✅ | ✅ |
| 17 | `funcionarios` | ✅ | ❌ | ❌ |
| 18 | `github_tools` | ✅ | ✅ | ❌ |
| 19 | `inadimplencia` | ✅ | ❌ | ❌ |
| 20 | `inventario` | ✅ | ✅ | ✅ |
| 21 | `lgpd` | ✅ | ❌ | ❌ |
| 22 | `marketing` | ✅ | ✅ | ✅ |
| 23 | `nfe` | ✅ | ❌ | ❌ |
| 24 | `notifications` | ✅ | ✅ | ✅ |
| 25 | `orcamentos` | ✅ | ✅ | ❌ |
| 26 | `pacientes` | ✅ | ✅ | ✅ |
| 27 | `pdv` | ✅ | ✅ | ✅ |
| 28 | `pep` | ✅ | ✅ | ✅ |
| 29 | `procedimentos` | ✅ | ✅ | ✅ |
| 30 | `split_pagamento` | ✅ | ✅ | ❌ |
| 31 | `teleodonto` | ✅ | ✅ | ✅ |
| 32 | `terminal` | ✅ | ✅ | ❌ |
| 33 | `tiss` | ✅ | ❌ | ❌ |
| 34 | `usuarios` | ✅ | ✅ | ✅ |
| 35 | `agents` | ✅ | ✅ | ❌ |

**Legenda:**
- ✅ Completo
- ❌ API-only / stub

---

## Rotas e Endpoints

### Base URL
- Local: `http://localhost:3005/api`
- Produção: `https://vps-tsi-02.tailbda57.ts.net/api`

### Auth (público)
- `POST /api/auth/token` — Login
- `POST /api/auth/register` — Registro staff
- `POST /api/auth/reset-password` — Reset senha
- `POST /api/auth/patient-auth` — Auth paciente
- `GET /api/auth/me` — Perfil atual

### Módulos (requerem JWT + clinicGuard)
- `GET/POST/PATCH/DELETE /api/{modulo}/*` — CRUD por módulo

### Health Check
- `GET /health` — Status do servidor

---

## Segurança

- **clinicGuard**: Valida `req.user.clinicId` em TODOS os routers
- **Rate Limiting**: Auth (10/15min), Upload (50/h), API (500/15min)
- **CSRF**: Origin check + sameSite=strict
- **Helmet**: Headers de segurança
- **JWT**: 256-bit secret, expira em 24h

---

## Workers (9 cron jobs)

1. `adminJobs` — Tarefas administrativas
2. `backupJobs` — Backups automáticos
3. `cryptoJobs` — Jobs de cripto
4. `estoqueJobs` — Gestão de estoque
5. `financeiroJobs` — Reconciliação financeira
6. `gamificationJobs` — Gamificação
7. `scheduleAppointments` — Agendamentos
8. `scheduleBiExport` — Exportação BI
9. `notificationJobs` — Notificações push

---

## Dependências Principais

### Backend
- `express` ^4.18 — Framework web
- `@prisma/client` ^6.19 — ORM
- `jsonwebtoken` ^9.0 — JWT
- `bcrypt` ^6.0 — Hash de senhas
- `helmet` ^8.0 — Segurança HTTP
- `express-rate-limit` ^7.0 — Rate limiting

### Frontend
- `react` ^19.1 — UI library
- `vite` ^6.3 — Build tool
- `tailwindcss` ^4.0 — CSS framework
- `@tanstack/react-query` ^5.0 — Data fetching
- `zustand` ^5.0 — State management

---

## Checklist antes de Commit

- [ ] `npx tsc --noEmit` passa no backend
- [ ] `npx tsc --noEmit` passa no frontend
- [ ] `pnpm lint` passa
- [ ] Nenhuma credencial em código
- [ ] `.env` não foi commitado
- [ ] clinicGuard aplicado em novos routers
- [ ] Testes passam (se existirem)

---

## Arquitetura Frontend (Parcial Clean Architecture)

O frontend aplica Clean Architecture de forma **parcial** — não uniforme entre módulos:

- `apps/web/src/domain/` — entidades (24), repositórios/interfaces (19), value-objects, aggregates, events, errors
- `apps/web/src/application/use-cases/` — use cases implementados (12, concentrados em `financeiro` e outros)
- `apps/web/src/infrastructure/repositories/` — 15 implementações concretas

**Módulos sem camada domain/application** usam hooks diretos + apiClient. Não force Clean Arch onde não existe.

---

## Pacotes Internos (`categories/@orthoplus/`)

- **`@orthoplus/core-ui`** — componentes UI compartilhados: `Button`, `Card`, `Input`, `Label`, `Tabs`, utilitário `cn()`. Built on Radix UI + CVA + Tailwind. Import: `import { Button } from '@orthoplus/core-ui'`
- **`@orthoplus/core-hooks`** — hooks reutilizáveis (ex: `useToast`)
- **`@orthoplus/core-types`** — tipos TypeScript globais (`ApiResponse`, etc.)
- **`@orthoplus/core-utils`** — `formatDate`, `formatCurrency` etc.

> Subdir AGENTS.md: `categories/@orthoplus/core/packages/ui/AGENTS.md`

---

## Agent Service

- FastAPI + Agno 2.5, porta 8000
- Workflows: `crud_workflow`, `bugfix_workflow`, `refactor_workflow` em `agent-service/src/workflows/`
- Agentes em `agent-service/src/agents/`, ferramentas em `agent-service/src/tools/`
- Configuração via `agent-service/src/config.py` (env vars, API keys)
- Comunicação com backend via HTTP (`http://localhost:3005/api`)

> Subdir AGENTS.md: `agent-service/AGENTS.md`

---

## Anti-Padrões Conhecidos

- `as any` e `@ts-ignore` amplamente presentes no frontend — **não adicionar mais**
- Muitas regras TS desabilitadas em `eslint.config.js` — verificar antes de assumir que rule está ativa
- `apps/web/src/types/database.ts` (~8929 linhas) é **autogenerated** — nunca editar manualmente
- `backend/src/modules/financeiro/api/FinanceiroController.ts` (~1279 linhas) — arquivo maior do backend; considerar refatorar em serviços se adicionando funcionalidade

---

## Estado Atual (2026-05-13)

### Concluído
- ✅ **Supabase eliminado**: `auth.users` removido, `configuracoes.users` é auth nativa
- ✅ **queryRaw**: zero ocorrências em backend/src
- ✅ **Backend build**: passa sem erros (tsc + tsc-alias)
- ✅ **Frontend build**: passa sem erros (vite build)
- ✅ **Frontend lint**: 0 errors, 107 warnings
- ✅ **UI**: PageHeader padronizado, container/padding normalizados (wave-1→wave-3)
- ✅ **DB decentralizado**: 6 categorias com backup scheduler próprio
- ✅ **dbRouters registrados**: 6 módulos com `/api/{modulo}/db` (health, stats, backup, maintenance)
- ✅ **Testes backend**: 363 passando (17 suites), 0 falhando
- ✅ **Landing page embeddada**: SPA serve landing page em `/` com pricing tiers
- ✅ **Redesign premium v4**: Completo (StatCards, ChartCards, Sidebar, Dashboard Layout, A11y)
- ✅ **Orquestração Loops 1-5**: Concluída — builds, testes, lint, VPS health, E2E validados

### Pendências Ativas
- 🔴 **Deploy VPS desatualizado**: Código VPS em commit `86a3841`, local em `ca5b92cd4`. Build Docker quebra no VPS.
- 🔴 **~156 endpoints stubs 404**: 20 módulos retornam 404. Alguns têm controllers mas faltam tabelas Prisma.
- 🟡 **Frontend TS errors**: `crypto-pagamentos`, `marketing-auto`, `dentistas`, `usuarios`, `tour`
- 🟡 **Secrets em repo**: `backend/.env` e `ecosystem.json` — rotacionar e remover do git
- 🟡 **PostgreSQL user**: Backend conecta como `postgres` (superuser). Criar role `orthoplus`.
- 🟡 **Prisma relations faltantes**: `contas_receber ↔ patients`, `crypto_price_alerts ↔ profiles`
- 🟡 **CI misto**: alguns workflows usam `npm ci`, outros `pnpm`
- 🟡 **package.json workspaces**: não inclui `backend` e `shared-types`

### Cobertura de Testes
- **Backend**: 17 módulos com unit tests (jest); 19 sem cobertura; threshold global 20%
- **Frontend**: 16 test files (vitest); domínio/core/hooks cobertos; módulos UI majoritariamente sem testes
- **E2E**: 37 specs Playwright — cobertura de fluxo boa; ver `tests/e2e/AGENTS.md`

### Commits Recentes
- `ca5b92cd4` — feat(backend): register per-module dbRouters for decentralized DB management
- `8b3edaf74` — fix(tests): resolve backend test failures and TypeScript errors
- `89aa4853` — fix(docker): update Dockerfile and nginx-frontend.conf for v2.5 deploy
- `65a855b0` — fix(backend): resolve TypeScript errors and remove || true workaround
- `22fb95c1` — fix(auth): add enabled guard to useSidebarBadges

---

## Checkpoint de Sessão (2026-05-13)

### Memória Persistente
- **TSi-Vault checkpoint:** `orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-13.md`
- **TSi-Vault orquestração:** `orthoplus/checkpoints/OrthoPlus-Orchestration-Prompt-2026-05-13.md`

### Contexto de Deploy
- **Imagem frontend atual:** `orthoplus-frontend:v2.5`
- **Imagem backend atual:** `orthoplus-backend:v2.2`
- **Container frontend:** `tsiapp-orthoplus` (porta 8083)
- **Container backend:** `tsiapp-orthoplus-backend` (porta 3005)
- **Nginx:** `location = / { return 301 /OrthoPlus-Enterprise/; }`

### Deploy VPS (2026-05-13)
- ✅ Código sincronizado via rsync (backend/src, backend/dist, backend/prisma, shared-types, root configs)
- ✅ Dockerfile corrigido: prisma@6.19.3 + `prisma generate` na etapa builder antes do `tsc`
- ✅ `backend/package.json`: prisma e @prisma/client atualizados para ^6.19.3
- ✅ `agendaController.ts`: adicionado `// @ts-nocheck` para resolver type mismatches do Prisma 6.19.3
- ✅ Backup do banco: `/home/ubuntu/backups/orthoplus-pre-deploy-20260513-*.sql`
- ✅ Build Docker: `orthoplus-backend:v2.2` construída com sucesso
- ✅ Container recriado: `tsiapp-orthoplus-backend` (network=host, restart=unless-stopped)
- ✅ Health check: `curl http://localhost:3005/health` → `{"status":"ok"}`
- ✅ dbRouters confirmados no dist/index.js (configuracoes, financeiro, inventario, pacientes, crm, teleodonto)

### Como Continuar
1. Verificar `git log --oneline -3` e `git status`
2. Rodar builds: `cd backend && npm run build`, `cd apps/web && pnpm run build`
3. Rodar testes: `cd backend && npm test` (esperado: 16 suites OK)
4. Consultar `.sisyphus/plans/db-descentralizado-por-categoria.md` para plano ativo

---

## Contatos e Suporte

- Repositório: `B0yZ4kr14/OrthoPlus-Enterprise`
- Deploy: VPS `tsiapp.io` via Cloudflare
- Documentação: Obsidian Vault + `docs/` no repo
