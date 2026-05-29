# AGENTS.md — backend/

> Contexto específico do backend Node.js. Não repete o root AGENTS.md.
> **Atualizado:** 2026-05-24

---

## Entrada e Middleware

`src/index.ts` — ponto de entrada. Ordem do middleware (não alterar):

```
cors → helmet → morgan → express.json → clinicContext → auth → modulesRouter → errorHandler
```

- `clinicContext`: extrai `clinicId` do JWT, popula `req.user`
- `auth`: valida JWT; rotas públicas são whitelistadas antes desse ponto
- `errorHandler`: captura `ApiError` e erros genéricos; sempre use `ApiError` para respostas de erro
- `lgpdMiddleware`: middleware LGPD aplicado globalmente

Middleware disponíveis em `src/middleware/`:

- `authMiddleware.ts` — validação JWT
- `clinicGuard.ts` — validação clinicId (obrigatório em todos os routers)
- `errorHandler.ts` — handler global de erros
- `lgpdMiddleware.ts` — compliance LGPD

---

## Estrutura de Módulo (Canônica)

```
src/modules/{modulo}/
├── api/
│   ├── router.ts          # Express router + clinicGuard obrigatório
│   └── {Modulo}Controller.ts
├── application/
│   └── {Modulo}Service.ts
├── domain/
│   └── {Modulo}Types.ts
└── infrastructure/
    └── {Modulo}Repository.ts
```

**Regras:**

- Novos módulos DEVEM seguir essa estrutura exata
- `router.ts` DEVE aplicar `clinicGuard` como primeiro middleware de todas as rotas protegidas
- Controllers NUNCA acessam Prisma diretamente — delegam para Repository
- Services orquestram, Repositories fazem I/O
- Erros: `throw new ApiError(httpStatus, 'mensagem')` de `@/errors/ApiError`

**Desvio conhecido:** `dashboard` tem controller em `/controllers/` em vez de `/api/` — não replicar esse padrão.

**Módulos API-only** (sem camada application/infrastructure — controller chama Prisma diretamente):
`admin_tools`, `analytics`, `backups`, `bi`, `comm`, `fidelidade`, `files`, `funcionarios`, `inadimplencia`, `lgpd`, `marketing`, `notifications`, `orcamentos`, `procedimentos`, `split_pagamento`, `tiss`, `usuarios`

---

## Prisma

- Schema: `prisma/schema.prisma` — **178 models** (docs dizem 171 — diferença de ~7 modelos recentes)
- Client: importar de `@/lib/prisma` (singleton)
- **$queryRaw removido**: zero ocorrências em `backend/src` — usar Prisma Client puro
- Nunca editar `migrations/` manualmente; usar `prisma migrate dev`
- Múltiplos schemas PostgreSQL: `public`, `pacientes`, `inventario`, `pdv`, `financeiro`, `pep`, `faturamento`, `configuracoes`, `database_admin`, `backups`, `crypto_config`, `github_tools`, `terminal`, `core`, `comercial`, `clinico`, `operacional`, `administrativo`

---

## TS Errors Conhecidos (não regredir)

- `agenda/api/agendaController.ts` — 4 erros Prisma type mismatch (String vs relação)
- `auth/api/AuthController.ts` — 1 erro `@orthoplus/shared-types` não resolvido
- Build usa `tsc -p tsconfig.build.json` — **strict, falha em erros**. Executar `cd backend && pnpm build` antes de deploy.

---

## Workers (cron jobs)

`workers/index.ts` — scheduler raiz. Jobs em `workers/jobs/`:

| Job                    | Cronograma principal                   |
| ---------------------- | -------------------------------------- |
| `adminJobs`            | Weekly Sun 02:00, daily 01:00          |
| `backupJobs`           | Daily 01-05h, a cada 30min (streaming) |
| `cryptoJobs`           | A cada 5-15 min                        |
| `estoqueJobs`          | Daily 02-05h                           |
| `financeiroJobs`       | Daily 01:00 e 18:00                    |
| `gamificationJobs`     | Daily 23:30                            |
| `scheduleAppointments` | A cada hora                            |
| `scheduleBiExport`     | Daily 02:00                            |
| `notificationJobs`     | Daily 08-09h                           |

`workers/categoryBackupScheduler.ts` — backups por categoria DB (CORE 01:00, FINANCEIRO 01:15, etc.)

Ao adicionar job: registrar em `workers/index.ts`, usar `node-cron`, nunca bloquear event loop.

---

## Erros Comuns

- Esquecer `clinicGuard` em novo router → 403 silencioso em produção
- `async` controller sem try/catch → unhandled rejection (errorHandler não captura)
- Importar Prisma diretamente no controller (bypass do repository)
- Colocar controller fora de `/api/` (ver desvio do `dashboard`)

---

## Módulo `financeiro` — Atenção

`api/FinanceiroController.ts` tem ~1279 linhas e 38 ocorrências de `as any`. Ao adicionar:

1. Criar método em `application/FinanceiroService.ts` primeiro
2. Controller apenas chama service e retorna HTTP
3. Nunca adicionar lógica de negócio no controller

Ver `backend/src/modules/financeiro/AGENTS.md` para detalhes.

---

## Variáveis de Ambiente Requeridas

Ver `.env.example`. Críticas:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — mínimo 256 bits de entropia
- `NODE_ENV` — `development` | `production`

⚠️ `backend/.env` e `ecosystem.json` contêm secrets reais — rotacionar e remover do git.
