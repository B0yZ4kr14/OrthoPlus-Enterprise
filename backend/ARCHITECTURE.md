# OrthoPlus Backend — Architecture

> Arquitetura do backend Node.js/Express do OrthoPlus Enterprise

---

## Infraestrutura

```
┌─────────────────────────────────────────────────────────────┐
│  VPS vps-tsi-02 (Tailscale 100.111.74.69)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PM2: orthoplus-backend (port 3005)                  │   │
│  │  ├── Express + Helmet + CORS + Rate Limit            │   │
│  │  ├── 35 Modular Domains (100% clinicGuard)           │   │
│  │  ├── modulesRouter (legacy Edge Functions)           │   │
│  │  └── 9 Background Workers (cron)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  Nginx reverse proxy (80 → 3005, 443 → 3005)              │
│  Tailscale Funnel (HTTPS público)                         │
└─────────────────────────────────────────────────────────────┘
         │ PostgreSQL 16 (5432) — 171 models, 13 schemas
         │ Redis 7 (auth-enabled)
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Agno Agent Service (port 8000) — Python/FastAPI            │
│  CodeAgent · BugfixAgent · RefactorAgent · ReviewAgent      │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Modules (35)

| # | Domain | Module | Controller | Prisma | Router |
|---|--------|--------|------------|--------|--------|
| 1 | Agenda | `agenda` | ✅ | ✅ | ✅ |
| 2 | Analytics | `analytics` | ✅ | ⚠️ | ✅ |
| 3 | Auth | `auth` | ✅ | ⚠️ | ✅ |
| 4 | Backups | `backups` | ✅ | ❌ | ✅ |
| 5 | BI | `bi` | ❌ | ❌ | ✅ |
| 6 | Communication | `comm` | ✅ | ❌ | ✅ |
| 7 | Config | `configuracoes` | ✅ | ❌ | ✅ |
| 8 | Contracts | `contratos` | ✅ | ❌ | ✅ |
| 9 | CRM | `crm` | ✅ | ❌ | ✅ |
| 10 | Crypto Config | `crypto_config` | ✅ | ✅ | ✅ |
| 11 | Dashboard | `dashboard` | ✅ | ✅ | ✅ |
| 12 | Database Admin | `database_admin` | ✅ | ✅ | ✅ |
| 13 | Billing | `faturamento` | ✅ | ⚠️ | ✅ |
| 14 | Loyalty | `fidelidade` | ❌ | ❌ | ✅ |
| 15 | Files | `files` | ✅ | ✅ | ✅ |
| 16 | Finance | `financeiro` | ✅ | ✅ | ✅ |
| 17 | Employees | `funcionarios` | ❌ | ❌ | ✅ |
| 18 | GitHub Tools | `github_tools` | ✅ | ❌ | ✅ |
| 19 | Collections | `inadimplencia` | ❌ | ❌ | ✅ |
| 20 | Inventory | `inventario` | ✅ | ⚠️ | ✅ |
| 21 | LGPD | `lgpd` | ❌ | ❌ | ✅ |
| 22 | Marketing | `marketing` | ✅ | ⚠️ | ✅ |
| 23 | NF-e | `nfe` | ❌ | ❌ | ✅ |
| 24 | Notifications | `notifications` | ✅ | ⚠️ | ✅ |
| 25 | Quotes | `orcamentos` | ✅ | ❌ | ✅ |
| 26 | Patients | `pacientes` | ✅ | ✅ | ✅ |
| 27 | PDV | `pdv` | ✅ | ✅ | ✅ |
| 28 | PEP | `pep` | ✅ | ⚠️ | ✅ |
| 29 | Procedures | `procedimentos` | ✅ | ⚠️ | ✅ |
| 30 | Split Payment | `split_pagamento` | ✅ | ❌ | ✅ |
| 31 | Teledentistry | `teleodonto` | ✅ | ⚠️ | ✅ |
| 32 | Terminal | `terminal` | ✅ | ❌ | ✅ |
| 33 | TISS | `tiss` | ❌ | ❌ | ✅ |
| 34 | Users | `usuarios` | ✅ | ⚠️ | ✅ |
| 35 | Agents IA | `agents` | ✅ | ❌ | ✅ |

**Legenda:**
- ✅ Completo (Controller + Prisma Client + Router)
- ⚠️ Parcial (usa queryRaw ou tem gaps técnicos)
- ❌ API-only / stub (router existe, controller é mock)

---

## Router Registration

Todos os 35 routers são registrados em `backend/src/index.ts`:

```typescript
// Auth (público)
app.use("/api/auth", authRouter);

// Módulos (protegidos por authMiddleware + clinicGuard)
app.use("/api/agenda", agendaRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/backups", backupsRouter);
app.use("/api/bi", biRouter);
app.use("/api/comm", commRouter);
app.use("/api/configuracoes", configuracoesRouter);
app.use("/api/contratos", contratosRouter);
app.use("/api/crm", crmRouter);
app.use("/api/crypto_config", cryptoConfigRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/db", databaseAdminRouter);
app.use("/api/faturamento", faturamentoRouter);
app.use("/api/fiscal", faturamentoRouter);        // alias
app.use("/api/fidelidade", fidelidadeRouter);
app.use("/api/files", filesRouter);
app.use("/api/financeiro", financeiroRouter);
app.use("/api/payments", financeiroRouter);       // alias
app.use("/api/funcionarios", funcionariosRouter);
app.use("/api/github", githubToolsRouter);
app.use("/api/inadimplencia", inadimplenciaRouter);
app.use("/api/estoque", inventarioRouter);
app.use("/api/inventario", inventarioRouter);     // alias (removed duplicate)
app.use("/api/lgpd", lgpdRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/nfe", nfeRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/orcamentos", orcamentosRouter);
app.use("/api/pacientes", pacientesRouter);
app.use("/api/pdv", pdvRouter);
app.use("/api/pep", pepRouter);
app.use("/api/procedimentos", procedimentosRouter);
app.use("/api/split-pagamento", splitPagamentoRouter);
app.use("/api/split", splitPagamentoRouter);      // alias
app.use("/api/teleodonto", teleodontoRouter);
app.use("/api/terminal", terminalRouter);
app.use("/api/tiss", tissRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/agents", agentsRouter);

// Legacy modules (migrated from Edge Functions)
app.use("/api/modules", modulesRouter);
```

---

## Middleware Stack

```
1. trust proxy (loopback)
2. Rate Limiters (auth, upload, api)
3. CORS
4. Cookie Parser
5. CSRF Protection (state-changing requests)
6. Helmet
7. express.json (10MB limit)
8. Health Check (public)
9. authMiddleware (populates req.user)
10. Routes (all protected)
11. errorHandler (global)
```

### clinicGuard
Aplicado em **100% dos routers de módulos** (35/35). Valida `req.user?.clinicId` e injeta `req.clinicId`.

---

## Prisma Schema

- **Models:** 171
- **Schemas PostgreSQL:** 13 (public, auth, agenda, analytics, configuracoes, financeiro, faturamento, inventario, marketing, notifications, pacientes, pdv, pep)
- **Migrations:** Gerenciadas via Prisma Migrate
- **Client:** Gerado em `node_modules/.pnpm/@prisma+client`

### Models por Módulo (principais)

| Módulo | Models |
|--------|--------|
| `pacientes` | patients, prontuarios, historico_clinico, odontogramas |
| `agenda` | appointments, appointment_confirmations, blocked_times |
| `financeiro` | financial_transactions, financial_categories, caixa_movimentos |
| `faturamento` | notas_fiscais, nfce_emitidas, sat_mfe_config |
| `inventario` | produtos, inventario_itens, movimentacoes_estoque |
| `pep` | pep_tratamentos, pep_odontograma, pep_assinaturas |
| `pdv` | pdv_vendas, cash_registers, pdv_dashboard |
| `crypto_config` | crypto_wallets, crypto_transactions, crypto_payments |

---

## Workers (9 cron jobs)

| Worker | Descrição | Frequência |
|--------|-----------|------------|
| `adminJobs` | Tarefas administrativas | Diário |
| `backupJobs` | Backup automático PostgreSQL | 4x/dia |
| `cryptoJobs` | Sincronização de taxas crypto | 15 min |
| `estoqueJobs` | Alertas de reposição | 1 hora |
| `financeiroJobs` | Reconciliação bancária | 6 horas |
| `gamificationJobs` | Atualização de rankings | 1 hora |
| `scheduleAppointments` | Lembretes de consulta | 15 min |
| `scheduleBiExport` | Exportação de relatórios BI | Diário |
| `notificationJobs` | Push e alertas | 5 min |

---

## Error Handling

### ApiError Class
```typescript
class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, any>;
}
```

### Factory Methods
- `ApiError.badRequest()` — 400
- `ApiError.unauthorized()` — 401
- `ApiError.forbidden()` — 403
- `ApiError.notFound()` — 404
- `ApiError.internal()` — 500

---

## Agent Service Integration

O backend Node.js proxya requisições para o Agent Service Python:

```
POST /api/agents/crud      → Python FastAPI (port 8000)
POST /api/agents/bugfix    → Python FastAPI
POST /api/agents/refactor  → Python FastAPI
POST /api/agents/review    → Python FastAPI
```

---

## Deploy

### VPS (Produção)
```bash
# Build
pnpm --filter orthoplus-backend build

# Deploy manual
ssh tsi@100.111.74.69
cd /home/tsi/OrthoPlus-Enterprise
git pull origin main
pnpm install
pnpm --filter @orthoplus/shared-types build
npx prisma generate
pnpm --filter orthoplus-backend build
pm2 reload orthoplus-backend
```

### GitHub Actions
Workflow: `.github/workflows/deploy-vps-orthoplus.yml`
Trigger: push para `main`

---

## Status Atual (2026-04-23)

- ✅ 35 routers registrados
- ✅ clinicGuard em 100% dos módulos
- ✅ 21 ghost endpoints `/functions/v1` corrigidos
- ✅ 14 HTTP method mismatches corrigidos
- ✅ Backend compila sem erros (`tsc --noEmit`)
- ⚠️ 156 endpoints ainda retornam 404 (stubs necessários)
- ⚠️ 20 módulos com controllers mock/API-only
- ⚠️ 8 tabelas fantasmas no schema Prisma
