# AGENTS.md — OrthoPlus Enterprise

> Arquivo de referência para agentes de IA que trabalham neste projeto.

---

## Visão Geral

O **OrthoPlus Enterprise** é um monorepo full-stack de gestão odontológica com:
- **Frontend**: React 19 + Vite 6 + Tailwind CSS (porta 5173)
- **Backend**: Node.js 20 + Express 4 + Prisma 6 + PostgreSQL 16 (porta 3005)
- **Agent Service**: Python 3.14 + FastAPI + Agno (porta 8000)

---

## Estrutura de Diretórios

```
OrthoPlus-Enterprise/
├── apps/web/                  # Frontend React
├── backend/                   # Backend Node.js
│   ├── src/modules/           # 35 módulos de domínio
│   ├── src/middleware/        # Middleware Express
│   ├── src/routes/            # Rotas (modulesRouter)
│   ├── prisma/schema.prisma   # 171 models
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
| 2 | `analytics` | ✅ | ✅ | ⚠️ queryRaw |
| 3 | `auth` | ✅ | ✅ | ⚠️ queryRaw |
| 4 | `backups` | ✅ | ✅ | ❌ |
| 5 | `bi` | ✅ | ❌ | ❌ |
| 6 | `comm` | ✅ | ✅ | ❌ |
| 7 | `configuracoes` | ✅ | ✅ | ❌ |
| 8 | `contratos` | ✅ | ✅ | ❌ |
| 9 | `crm` | ✅ | ✅ | ❌ |
| 10 | `crypto_config` | ✅ | ✅ | ✅ |
| 11 | `dashboard` | ✅ | ✅ | ✅ |
| 12 | `database_admin` | ✅ | ✅ | ✅ |
| 13 | `faturamento` | ✅ | ✅ | ⚠️ queryRaw |
| 14 | `fidelidade` | ✅ | ❌ | ❌ |
| 15 | `files` | ✅ | ✅ | ✅ |
| 16 | `financeiro` | ✅ | ✅ | ✅ |
| 17 | `funcionarios` | ✅ | ❌ | ❌ |
| 18 | `github_tools` | ✅ | ✅ | ❌ |
| 19 | `inadimplencia` | ✅ | ❌ | ❌ |
| 20 | `inventario` | ✅ | ✅ | ⚠️ queryRaw |
| 21 | `lgpd` | ✅ | ❌ | ❌ |
| 22 | `marketing` | ✅ | ✅ | ⚠️ queryRaw |
| 23 | `nfe` | ✅ | ❌ | ❌ |
| 24 | `notifications` | ✅ | ✅ | ⚠️ queryRaw |
| 25 | `orcamentos` | ✅ | ✅ | ❌ |
| 26 | `pacientes` | ✅ | ✅ | ✅ |
| 27 | `pdv` | ✅ | ✅ | ✅ |
| 28 | `pep` | ✅ | ✅ | ⚠️ queryRaw |
| 29 | `procedimentos` | ✅ | ✅ | ⚠️ queryRaw |
| 30 | `split_pagamento` | ✅ | ✅ | ❌ |
| 31 | `teleodonto` | ✅ | ✅ | ⚠️ queryRaw |
| 32 | `terminal` | ✅ | ✅ | ❌ |
| 33 | `tiss` | ✅ | ❌ | ❌ |
| 34 | `usuarios` | ✅ | ✅ | ⚠️ queryRaw |
| 35 | `agents` | ✅ | ✅ | ❌ |

**Legenda:**
- ✅ Completo
- ⚠️ Parcial (usa queryRaw ou tem gaps)
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

## Estado Atual (2026-04-24)

### Wave-2 Concluída
- ✅ **Supabase eliminado**: `auth.users` removido, `configuracoes.users` é a tabela de auth nativa
- ✅ **queryRaw finalizado**: 9 ocorrências restantes, todas arquiteturalmente justificadas
- ✅ **Backend build**: `tsc && tsc-alias` limpo
- ✅ **Frontend lint**: 0 errors, ~98 warnings
- ✅ **Segurança**: `.ssh_key_vps` removido do git

### Wave-3 Concluída
- ✅ **Frontend fixes**: react-hooks lint errors resolvidos
- Último commit: `1ee9304 merge: frontend fixes (wave-3)`

### Pendências
- ⚠️ **PostgreSQL user**: Backend conecta como `postgres` (superuser). Criar role `orthoplus`.
- ⚠️ **Frontend type-check**: Falhas pré-existentes em `crypto-pagamentos`, `marketing-auto`
- ⚠️ **Prisma relations faltantes**: `contas_receber ↔ patients`, `crypto_price_alerts ↔ profiles`
- ⚠️ **Backend módulo `admin_tools`**: Existe em `src/modules/` mas não listado na tabela original (36 módulos reais vs 35 documentados)

### Commits Recentes
- `1ee9304` — merge: frontend fixes (wave-3)
- `aeb645f` — fix(frontend): resolve react-hooks lint errors
- `0f0d279` — refactor(backend): eliminate Supabase references and finalize queryRaw cleanup
- `b0b311e` — security: remove .ssh_key_vps from git

---

## Contatos e Suporte

- Repositório: `B0yZ4kr14/OrthoPlus-Enterprise`
- Deploy: VPS `vps-tsi-02` via Tailscale
- Documentação: Obsidian Vault + `docs/` no repo
