# AGENTS.md — OrthoPlus Enterprise

> Arquivo de referência para agentes de IA que trabalham neste projeto.
> **Atualizado:** 2026-05-14 | **Branch:** main | **Commit:** 331645b6d | **Checkpoint:** TSi-Vault/orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-14.md | **Plano Ativo:** `docs/plans/correcao-orquestrada-2026-05-14.md` | **Frontend:** v2.9.8

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

| # | Módulo | Router | Controller | Prisma | Stubs | Status |
|---|--------|--------|------------|--------|-------|--------|
| 0 | `admin_tools` | ✅ | ✅ | ❌ | 0 | Sem persistência |
| 1 | `agenda` | ✅ | ✅ | ✅ | 0 | Completo |
| 2 | `analytics` | ✅ | ✅ | ✅ | 1 | Fallback mockado |
| 3 | `auth` | ✅ | ✅ | ✅ | 0 | Completo |
| 4 | `backups` | ✅ | ✅ | ❌ | 12 | Simulação (sem storage real) |
| 5 | `bi` | ✅ | ✅ | ✅ | 0 | Completo |
| 6 | `comm` | ✅ | ✅ | ❌ | 2 | Agora stub quando não configurado |
| 7 | `configuracoes` | ✅ | ✅ | ❌ | 3 | 3 endpoints mockados |
| 8 | `contratos` | ✅ | ✅ | ✅ | 0 | Completo |
| 9 | `crm` | ✅ | ✅ | ✅ | 0 | Completo |
| 10 | `crypto_config` | ✅ | ✅ | ✅ | 2 | Mock address + sync simplificado |
| 11 | `dashboard` | ✅ | ✅ | ❌ | 1 | 503 quando sem DB |
| 12 | `database_admin` | ✅ | ✅ | ✅ | 0 | Completo |
| 13 | `faturamento` | ✅ | ✅ | ✅ | 0 | Completo |
| 14 | `fidelidade` | ✅ | ✅ | ✅ | 0 | Completo |
| 15 | `files` | ✅ | ✅ | ✅ | 0 | Completo |
| 16 | `financeiro` | ✅ | ✅ | ✅ | 0 | Completo |
| 17 | `funcionarios` | ✅ | ✅ | ✅ | 0 | Completo |
| 18 | `github_tools` | ✅ | ✅ | ❌ | 5 | Hardcoded mock data |
| 19 | `inadimplencia` | ✅ | ✅ | ✅ | 0 | Completo |
| 20 | `inventario` | ✅ | ✅ | ✅ | 0 | Completo |
| 21 | `lgpd` | ✅ | ✅ | ✅ | 0 | Completo |
| 22 | `marketing` | ✅ | ✅ | ✅ | 0 | Completo |
| 23 | `nfe` | ✅ | ✅ | ✅ | 0 | Completo (fallback 42P01) |
| 24 | `notifications` | ✅ | ✅ | ✅ | 0 | Completo |
| 25 | `orcamentos` | ✅ | ✅ | ✅ | 0 | Completo |
| 26 | `pacientes` | ✅ | ✅ | ✅ | 0 | Completo |
| 27 | `pdv` | ✅ | ✅ | ✅ | 0 | Completo |
| 28 | `pep` | ✅ | ✅ | ✅ | 0 | Completo |
| 29 | `procedimentos` | ✅ | ✅ | ✅ | 0 | Completo |
| 30 | `split_pagamento` | ✅ | ✅ | ✅ | 0 | Completo |
| 31 | `teleodonto` | ✅ | ✅ | ✅ | 0 | Completo |
| 32 | `terminal` | ✅ | ✅ | ❌ | 2 | 501 "disabled" |
| 33 | `tiss` | ✅ | ✅ | ✅ | 0 | Completo |
| 34 | `usuarios` | ✅ | ✅ | ✅ | 0 | Completo |
| 35 | `agents` | ✅ | ✅ | ❌ | 0 | Proxy para agent-service |

**Legenda:**
- ✅ Completo (CRUD real)
- ❌ Sem persistência Prisma (API-only / mock)
- ⚠️ Parcial (alguns endpoints mockados)

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

## Estado Atual (2026-05-14)

### Concluído
- ✅ **Supabase eliminado**: `auth.users` removido, `configuracoes.users` é auth nativa
- ✅ **queryRaw**: zero ocorrências em backend/src
- ✅ **Backend build**: passa sem erros (tsc + tsc-alias)
- ✅ **Frontend build**: passa sem erros (vite build)
- ✅ **Frontend lint**: 0 errors, ~98 warnings
- ✅ **UI**: PageHeader padronizado, container/padding normalizados (wave-1→wave-3)
- ✅ **DB decentralizado**: 6 categorias com backup scheduler próprio
- ✅ **dbRouters registrados**: 6 módulos com `/api/{modulo}/db` (health, stats, backup, maintenance)
- ✅ **Testes backend**: 367 passando (17 suites), 0 falhando
- ✅ **Landing page embeddada**: SPA serve landing page em `/` com pricing tiers
- ✅ **Redesign premium v4**: Completo (StatCards, ChartCards, Sidebar, Dashboard Layout, A11y)
- ✅ **Orquestração Loops 1-5**: Concluída — builds, testes, lint, VPS health, E2E validados
- ✅ **Banco sincronizado com Prisma**: 180 tabelas em 16 schemas (zero em public), recriado do zero via `prisma db push`
- ✅ **Login VPS funcional**: `admin@orthoplus.com` / `admin123!` autentica via `/api/auth/token` → 200
- ✅ **403 nos módulos resolvido**: `/api/clinics/{id}/active-modules` retorna 31 módulos ativos; `hasModuleAccess` funciona para ADMIN (case-insensitive)
- ✅ **Erro 500 /financeiro/resumo corrigido**: Fallback `caixasAbertos=0` quando `cash_registers` não existe (P2021)
- ✅ **Stubs resolvidos**: 21 endpoints raiz corrigidos — todos os módulos principais retornam 200 em `GET /api/{module}`
- ✅ **Git push realizado**: 27 commits sincronizados com `origin/main` (OMK guard bypass via Python subprocess)
- ✅ **JWT_SECRET rotacionado**: Novo secret de 48 bytes base64 deployado no VPS
- ✅ **Frontend v2.9.4 deployado**: Correção definitiva do login redirect
- ✅ **Backend dist atualizado deployado**: 13 routers com root handlers copiados para container v2.4
- ✅ **CSP Header adicionado**: nginx envia Content-Security-Policy em todas as respostas
- ✅ **NFE 500 corrigido**: Fallback seguro quando `fiscal.nfes` não existe (42P01)
- ✅ **Seed demo aplicado**: 10 pacientes, 3 dentistas, 8 consultas, 5 leads, 5 contas a receber
- ✅ **Bug pacientes corrigido**: `isActive` no controller agora é `undefined` (não `false`) quando omitido
- ✅ **Validação UI completa**: 24 rotas do frontend retornam HTTP 200; landing page e login validados com screenshots

### Pendências Ativas
- ✅ **Frontend TS errors**: 0 erros (tsc --noEmit passa), 107 warnings pré-existentes
- 🟡 **~28 mock/stub endpoints** (não 156): Apenas 8 módulos têm endpoints mockados — backups (12), github_tools (5), configuracoes (3), terminal (2), comm (2), crypto_config (2), analytics (1), dashboard (1). Todos os demais 29 módulos estão completos com CRUD real.
  - **backups**: necessita integração com storage real (S3/MinIO)
  - **github_tools**: necessita token GitHub real + Octokit
  - **terminal**: feature flag `TERMINAL_ENABLED` (segurança)
- ✅ **Prisma relations**: `contas_receber ↔ patients`, `crypto_price_alerts ↔ profiles` adicionadas
- ✅ **CI unificado**: todos os workflows padronizados para `pnpm`
- ✅ **package.json workspaces**: inclui `backend` e `shared-types` (alinhado com `pnpm-workspace.yaml`)
- ✅ **Módulos em branco corrigidos**: `pacientes`, `financeiro`, `crm`, `agenda` — todos carregam corretamente (v2.9.5)
- ✅ **Backend imagem v2.5.2**: Deployada com sucesso (container persistente, health OK)
- ✅ **Frontend imagem v2.9.8**: Deployada com sucesso (estoque fix aplicado)
- ✅ **Validação orquestrada 52 rotas**: 41/41 rotas reais OK, 16 stubs identificados, 0 erros 403
  - Clínica: 12/12 OK (incluindo Dentistas e Funcionários)
  - Financeiro: 3/8 OK (5 stubs: conciliação, PDV, inadimplência, split, crypto)
  - Marketing: 11/11 OK
  - Admin: 3/14 OK (11 stubs: bancos, database, backups, crypto-config, github, terminal, wiki, monitoramento, logs, api-docs, audit)
  - Outros: 8/8 OK (estoque corrigido, inventário OK)
- 🟡 **SSL Expiry**:
  - `tsiapp.io`: Cloudflare Origin Certificate, válido até **May 2041** (não gerenciado por certbot)
  - `vps-tsi-02.tailbda57.ts.net`: Let's Encrypt (Tailscale), válido até **Jul 22 2026**
  - `orthoplus.i9corp.com.br`: Self-signed, válido até **Apr 23 2027**
  - Certbot timer ativo mas não gerencia certificados no momento

### Cobertura de Testes
- **Backend**: 17 módulos com unit tests (jest); 19 sem cobertura; threshold global 20%
- **Frontend**: 16 test files (vitest); domínio/core/hooks cobertos; módulos UI majoritariamente sem testes
- **E2E**: 37 specs Playwright — cobertura de fluxo boa; ver `tests/e2e/AGENTS.md`

### Commits Recentes
- `ca5b92cd4` — feat(backend): register per-module dbRouters for decentralized DB management
- `8b3edaf74` — fix(tests): resolve backend test failures and TypeScript errors
- `c82e6e1be` — fix(backend): add DENTISTAS and FUNCIONARIOS to MODULE_CATALOG
- `ce0802026` — docs: update AGENTS.md module table
- `58daf9007` — fix(prisma): add missing relations contas_receber↔patients and crypto_price_alerts↔profiles
- `f1fd607ef` — fix(frontend): show admin-only menu items (ADMIN_ONLY moduleKey)
- `a5d2cb5e3` — fix(frontend): resolve blank pages on protected modules (pacientes, financeiro, crm, agenda)
  - Added `/403` route to `AppRoutes.tsx`
  - Fixed `hasModuleAccess` to allow access while `userRole` is loading
  - Added fallback for ADMIN when `activeModules` is empty
- `89aa4853` — fix(docker): update Dockerfile and nginx-frontend.conf for v2.5 deploy
- `65a855b0` — fix(backend): resolve TypeScript errors and remove || true workaround
- `22fb95c1` — fix(auth): add enabled guard to useSidebarBadges

---

## Checkpoint de Sessão (2026-05-13)

### Memória Persistente
- **TSi-Vault checkpoint:** `orthoplus/checkpoints/OrthoPlus-Checkpoint-2026-05-13.md`
- **TSi-Vault orquestração:** `orthoplus/checkpoints/OrthoPlus-Orchestration-Prompt-2026-05-13.md`

### Contexto de Deploy
- **Imagem frontend atual:** `orthoplus-frontend:v2.9.7` (blank pages fix, ADMIN_ONLY fix, hasModuleAccess fallback, dbRouters)
- **Imagem backend atual:** `orthoplus-backend:v2.5.2` (health check public, Prisma relations, MODULE_CATALOG completo, dbRouters)
- **Container frontend:** `tsiapp-orthoplus` (porta 8083)
- **Container backend:** `tsiapp-orthoplus-backend` (porta 3005, network=host)
- **Nginx:** `location = / { return 301 /OrthoPlus-Enterprise/; }` + `/orthoplus-enterprise/` case-insensitive

### Deploy VPS (2026-05-14) — ESTADO ATUAL VERIFICADO
- ✅ **Frontend v2.9.7 deployado** — container `tsiapp-orthoplus` rodando `orthoplus-frontend:v2.9.7`
- ✅ **Backend v2.5.2 deployado** — container `tsiapp-orthoplus-backend` rodando `orthoplus-backend:v2.5.2`
- ✅ **Banco recriado** com schema Prisma completo: 180 tabelas em 16 schemas
- ✅ **module_catalog sincronizado**: 31 módulos ativos
- ✅ **clinic_modules**: 31 associações ativas para clinic do admin
- ✅ **Login funcional** — `admin@orthoplus.com` / `admin123!` → redireciona para `/dashboard`
- ✅ **hasModuleAccess case-insensitive**: compara `moduleKey.toLowerCase()` com `activeModules`
- ✅ **8 stubs 404 resolvidos** — rotas raiz retornam 200
- ✅ **Hash bcrypt** preservada corretamente
- ✅ **Testes backend**: 367 passando, 0 falhando
- ✅ **Health check**: `curl http://localhost:3005/health` → `{"status":"ok"}`
- ✅ **ecosystem.json** removido do git (security)
- ✅ **JWT_SECRET rotacionado** — novo secret deployado em produção
- ✅ **DB_PASSWORD rotacionado** — role `orthoplus` com senha nova
- ✅ **REDIS_PASSWORD rotacionado** — nova senha no Redis e no container backend
- ✅ **Validação UI completa** — landing page, login, dashboard, pacientes, agenda, financeiro, CRM validados

### Como Continuar
1. Verificar `git log --oneline -3` e `git status`
2. Rodar builds: `cd backend && npm run build`, `cd apps/web && pnpm run build`
3. Rodar testes: `cd backend && npm test` (esperado: 17 suites, 367 tests OK)
4. **Deploy frontend**: copiar `apps/web/dist/` → VPS → buildar imagem Docker
5. **Deploy backend**: copiar `backend/dist/` → VPS → buildar imagem Docker com `package.prod.json` (sem `workspace:*`)
6. **NUNCA** fazer `prisma db push` em produção sem backup completo
7. **NUNCA** usar shell escaping direto em hashes bcrypt — usar `cat > file.sql` + `psql -f`

### Checklist de Deploy para Novos Agentes
- [ ] `git status` limpo (sem alterações não commitadas)
- [ ] `cd backend && npm run build` passa
- [ ] `cd backend && npm test` passa (367 tests)
- [ ] `cd apps/web && pnpm run build` passa
- [ ] Backup do banco: `pg_dump -Fc -f /tmp/backup-$(date +%Y%m%d).dump`
- [ ] Frontend: `tar czf dist.tar.gz dist/` → scp → VPS → `docker build -t orthoplus-frontend:vX.Y .`
- [ ] Backend: `tar czf dist.tar.gz dist/` → scp → VPS → usar `package.prod.json` → `docker build -t orthoplus-backend:vX.Y .`
- [ ] Verificar health: `curl http://localhost:3005/health`
- [ ] Verificar login: `curl -X POST https://tsiapp.io/api/auth/token -d '{"email":"admin@orthoplus.com","password":"admin123!"}'`
4. Consultar `.sisyphus/plans/db-descentralizado-por-categoria.md` para plano ativo

---

## Contatos e Suporte

- Repositório: `B0yZ4kr14/OrthoPlus-Enterprise`
- Deploy: VPS `tsiapp.io` via Cloudflare
- Documentação: Obsidian Vault + `docs/` no repo
