# AGENTS.md — OrthoPlus Enterprise

> Arquivo de referência para agentes de IA que trabalham neste projeto.
> **Atualizado:** 2026-05-15 | **Branch:** main | **Commit:** d25ca3a6 | **Checkpoint:** TSi-Vault/orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-15.md | **Plano Ativo:** `docs/plans/correcao-orquestrada-2026-05-14.md` | **Frontend:** v2.9.9

---

## Visão Geral

O **OrthoPlus Enterprise** é um monorepo full-stack de gestão odontológica com:
- **Frontend**: React 18.3 + Vite 8 + Tailwind CSS 3.4 (porta **3000** dev / 5173 legacy)
- **Backend**: Node.js 20 + Express 4 + Prisma 6 + PostgreSQL 16 (porta 3005)
- **Agent Service**: Python 3.14 + FastAPI + Agno 2.5 (porta 8000)

---

## Estrutura de Diretórios

```
OrthoPlus-Enterprise/
├── apps/web/                  # Frontend React
├── backend/                   # Backend Node.js
│   ├── src/modules/           # 37 módulos de domínio
│   ├── src/middleware/        # Middleware Express
│   ├── src/routes/            # Rotas (modulesRouter)
│   ├── prisma/schema.prisma   # 180 models
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
- **queryRaw**: ~14 ocorrências em backend/src/ (admin_tools, analytics, inventario, marketing, notifications, database admin) — usado para queries administrativas PostgreSQL e agregações complexas

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

## Módulos Backend (37)

Todos os 37 módulos possuem router registrado em `backend/src/index.ts` e `clinicGuard` aplicado.

| # | Módulo | Router | Controller | Prisma | Stubs | Status |
|---|--------|--------|------------|--------|-------|--------|
| 0 | `admin_tools` | ✅ | ✅ | ❌ | 0 | Sem persistência |
| 1 | `ai` | ✅ | ✅ | ❌ | 0 | Proxy para serviços de IA |
| 2 | `agenda` | ✅ | ✅ | ✅ | 0 | Completo |
| 3 | `analytics` | ✅ | ✅ | ✅ | 1 | Fallback mockado |
| 4 | `auth` | ✅ | ✅ | ✅ | 0 | Completo |
| 5 | `backups` | ✅ | ✅ | ❌ | 12 | Simulação (sem storage real) |
| 6 | `bi` | ✅ | ✅ | ✅ | 0 | Completo |
| 7 | `comm` | ✅ | ✅ | ❌ | 2 | Agora stub quando não configurado |
| 8 | `configuracoes` | ✅ | ✅ | ❌ | 3 | 3 endpoints mockados |
| 9 | `contratos` | ✅ | ✅ | ✅ | 0 | Completo |
| 10 | `crm` | ✅ | ✅ | ✅ | 0 | Completo |
| 11 | `crypto_config` | ✅ | ✅ | ✅ | 2 | Mock address + sync simplificado |
| 12 | `dashboard` | ✅ | ✅ | ❌ | 1 | 503 quando sem DB |
| 13 | `database_admin` | ✅ | ✅ | ✅ | 0 | Completo |
| 14 | `faturamento` | ✅ | ✅ | ✅ | 0 | Completo |
| 15 | `fidelidade` | ✅ | ✅ | ✅ | 0 | Completo |
| 16 | `files` | ✅ | ✅ | ✅ | 0 | Completo |
| 17 | `financeiro` | ✅ | ✅ | ✅ | 0 | Completo |
| 18 | `funcionarios` | ✅ | ✅ | ✅ | 0 | Completo |
| 19 | `github_tools` | ✅ | ✅ | ❌ | 5 | Hardcoded mock data |
| 20 | `inadimplencia` | ✅ | ✅ | ✅ | 0 | Completo |
| 21 | `inventario` | ✅ | ✅ | ✅ | 0 | Completo |
| 22 | `lgpd` | ✅ | ✅ | ✅ | 0 | Completo |
| 23 | `marketing` | ✅ | ✅ | ✅ | 0 | Completo |
| 24 | `nfe` | ✅ | ✅ | ✅ | 0 | Completo (fallback 42P01) |
| 25 | `notifications` | ✅ | ✅ | ✅ | 0 | Completo |
| 26 | `orcamentos` | ✅ | ✅ | ✅ | 0 | Completo |
| 27 | `pacientes` | ✅ | ✅ | ✅ | 0 | Completo |
| 28 | `pdv` | ✅ | ✅ | ✅ | 0 | Completo |
| 29 | `pep` | ✅ | ✅ | ✅ | 0 | Completo |
| 30 | `procedimentos` | ✅ | ✅ | ✅ | 0 | Completo |
| 31 | `split_pagamento` | ✅ | ✅ | ✅ | 0 | Completo |
| 32 | `teleodonto` | ✅ | ✅ | ✅ | 0 | Completo |
| 33 | `terminal` | ✅ | ✅ | ❌ | 2 | 501 "disabled" |
| 34 | `tiss` | ✅ | ✅ | ✅ | 0 | Completo |
| 35 | `usuarios` | ✅ | ✅ | ✅ | 0 | Completo |
| 36 | `agents` | ✅ | ✅ | ❌ | 0 | Proxy para agent-service |

**Legenda:**
- ✅ Completo (CRUD real)
- ❌ Sem persistência Prisma (API-only / mock)
- ⚠️ Parcial (alguns endpoints mockados)

---

## Rotas e Endpoints

### Base URL
- Local: `http://localhost:3005/api`
- Produção: `https://tsiapp.io/api` (via nginx proxy)

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
9. `marketingJobs` — Marketing automation

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

## Estado Atual (2026-05-15)

### Concluído
- ✅ **Supabase eliminado**: `auth.users` removido, `configuracoes.users` é auth nativa
- ✅ **queryRaw**: ~14 ocorrências documentadas em backend/src/ (casos legítimos)
- ✅ **Backend build**: passa sem erros (tsc + tsc-alias) — 0 erros TS
- ✅ **Frontend build**: passa sem erros (vite build) — 0 erros TS
- ✅ **Backend testes**: 367 passando (17 suites), 0 falhando
- ✅ **DB decentralizado**: 6 categorias com backup scheduler próprio
- ✅ **dbRouters registrados**: 6 módulos com `/api/{modulo}/db`
- ✅ **Landing page embeddada**: SPA serve landing page em `/` com pricing tiers
- ✅ **Redesign premium v4**: Completo
- ✅ **Validação orquestrada 60 rotas**: 37/37 rotas reais OK, 16 stubs, 0 erros 403
- ✅ **Banco sincronizado com Prisma**: 180 tabelas em 17 schemas
- ✅ **Login VPS funcional**: `admin@orthoplus.com` / `admin123!`
- ✅ **Git push realizado**: sincronizado com `origin/main`
- ✅ **Frontend v2.9.9 deployado**: VPS + Local
- ✅ **Backend v2.5.3 deployado**: VPS + Local
- ✅ **Validação forense round 2**: 8 agentes, 30+ hipóteses, 1 issue real (DEV-001)
- ✅ **Validação tripla**: LOCAL/GITHUB sincronizados, VPS desatualizada
- ✅ **Consolidação canônica**: AGENTS.md, CANONICAL.md, TSi-Vault, OMK memory atualizados

### Pendências Ativas
- 🟡 **DEV-001**: Backend Dockerfile sem `HEALTHCHECK`
- 🟡 **VPS desatualizada**: RESOLVIDO — VPS sincronizada em `d25ca3a6`
- 🟡 **~16 mock/stub endpoints** em 8 módulos (backups, github_tools, configuracoes, terminal, comm, crypto_config, analytics, dashboard)
- 🟡 **SSL Expiry**: `vps-tsi-02.tailbda57.ts.net` Let's Encrypt válido até Jul 22 2026

### Commits Recentes
- `3e7f0f9d` — feat(omk): triple validation report — LOCAL x GITHUB x VPS sync analysis
- `69dbd494` — feat(omk): forensic validation round 2
- `95c519c0` — feat(omk): create fix squadron and execute fixes
- `078bf6e8` — fix: resolve TypeScript warnings and update AGENTS.md queryRaw statement

---

## Checkpoint de Sessão (2026-05-15)

### Memória Persistente
- **TSi-Vault checkpoint:** `orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-15.md`

### Contexto de Deploy
- **Imagem frontend atual:** `orthoplus-frontend:v2.9.9`
- **Imagem backend atual:** `orthoplus-backend:v2.5.3`
- **Container frontend (Local):** `tsiapp-orthoplus` (porta 8083)
- **Container backend (Local):** `tsiapp-orthoplus-backend` (porta 3005, host network)
- **Container Redis (Local):** `orthoplus-redis` (porta 6379)

### Deploy VPS (2026-05-15)
- ⚠️ **Código desatualizado**: VPS em `89aa485` vs Local/GitHub em `3e7f0f9`
- ✅ **Build concluído**: Imagem `apps-orthoplus` buildada e deployada
- ✅ **Docker compose fix**: Port mapping corrigido de `8083:80` para `8083:8080`
- ✅ **Containers rodando**: frontend (healthy), backend (running), redis (running)
- ✅ **Banco**: 180 tabelas, 37 módulos catalogados
- ✅ **Login funcional**: `admin@orthoplus.com` / `admin123!`
### Como Continuar
1. Verificar `git log --oneline -3` e `git status`
2. Rodar builds: `cd backend && pnpm build`, `cd apps/web && pnpm build`
3. Rodar testes: `cd backend && pnpm test`
4. Para deploy VPS: seguir checklist na seção 13

---

## Contatos e Suporte

- Repositório: `B0yZ4kr14/OrthoPlus-Enterprise`
- Deploy: VPS `tsiapp.io` via Cloudflare
- Documentação: Obsidian Vault + `docs/` no repo
