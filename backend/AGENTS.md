# AGENTS.md — backend/

> Contexto específico do backend Node.js. Não repete o root AGENTS.md.

---

## Entrada e Middleware

`src/index.ts` — ponto de entrada. Ordem do middleware (não alterar):
```
cors → helmet → morgan → express.json → clinicContext → auth → modulesRouter → errorHandler
```

- `clinicContext`: extrai `clinicId` do JWT, popula `req.user`
- `auth`: valida JWT; rotas públicas são whitelistadas antes desse ponto
- `errorHandler`: captura `ApiError` e erros genéricos; sempre use `ApiError` para respostas de erro

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
│   └── {Modulo}Types.ts   # Interfaces e enums de domínio
└── infrastructure/
    └── {Modulo}Repository.ts  # Prisma queries
```

**Regras:**
- Novos módulos DEVEM seguir essa estrutura exata
- `router.ts` DEVE aplicar `clinicGuard` como primeiro middleware de todas as rotas protegidas
- Controllers NUNCA acessam Prisma diretamente — delegam para Repository
- Services orquestram, Repositories fazem I/O
- Erros: `throw new ApiError(httpStatus, 'mensagem')` de `@/errors/ApiError`

---

## Prisma

- Schema: `prisma/schema.prisma` — 171 models, nunca editar `migrations/` manualmente
- Client: importar de `@/lib/prisma` (singleton)
- Preferir Prisma Client sobre `$queryRaw`; `$queryRaw` só aceitável para queries SQL complexas sem equivalente no ORM
- Módulos com `$queryRaw` justificado: `analytics`, `auth`, `faturamento`, `inventario`, `marketing`, `notifications`, `pep`, `procedimentos`, `teleodonto`, `usuarios`

---

## Workers (cron jobs)

`workers/index.ts` — scheduler raiz. Jobs em `workers/jobs/`:

| Job | Responsabilidade |
|-----|-----------------|
| `adminJobs` | tarefas admin |
| `backupJobs` | backups automáticos |
| `cryptoJobs` | alertas crypto |
| `estoqueJobs` | estoque mínimo |
| `financeiroJobs` | reconciliação |
| `gamificationJobs` | pontos/fidelidade |
| `scheduleAppointments` | lembretes agenda |
| `scheduleBiExport` | exportação BI |
| `notificationJobs` | push notifications |

Ao adicionar job: registrar em `workers/index.ts`, usar `node-cron`, nunca bloquear o event loop.

---

## Erros Comuns

- Esquecer `clinicGuard` em novo router → 403 silencioso em produção
- Usar `prisma.$queryRaw` sem template literal tagged → SQL injection
- `async` controller sem try/catch → unhandled rejection (errorHandler não captura)
- Importar Prisma diretamente no controller (bypass do repository)

---

## Módulo `financeiro` — Atenção

`api/FinanceiroController.ts` tem ~1279 linhas. Ao adicionar funcionalidade:
1. Criar método em `application/FinanceiroService.ts` primeiro
2. Controller apenas chama service e retorna resposta HTTP
3. Não adicionar lógica de negócio no controller

---

## Variáveis de Ambiente Requeridas

Ver `.env.example`. Críticas:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — mínimo 256 bits de entropia
- `NODE_ENV` — `development` | `production`
