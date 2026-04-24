# Banco de Dados Descentralizado por Categoria Modular

## TL;DR

> **Quick Summary**: Cada uma das 6 categorias modulares (CORE, FINANCEIRO, OPERACIONAL, COMERCIAL, CLINICO, ADMINISTRATIVO) passa a ter seu próprio schema PostgreSQL completamente anotado, serviço de backup isolado, endpoint de administração de banco dedicado, cron job de backup individual e painel frontend de gerenciamento.
>
> **Deliverables**:
> - 178 modelos Prisma com `@@schema` correto por categoria
> - `CategoryDatabaseManager` e `CategoryBackupService` — classes base reutilizáveis
> - 6 routers de DB admin (um por categoria), registrados nos módulos existentes
> - 6 cron jobs de backup escalonados
> - Página frontend `DatabaseManagementPage` com abas por categoria
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 5 waves, máximo 8 tasks em paralelo
> **Critical Path**: T1 (schema annotations) → T2 (base classes) → T6–T11 (per-category) → T12–T14 (integration) → T15–T16 (frontend)

---

## Context

### Original Request
> "crie um plano para cada Categorias modulares possuir gerenciamento de banco de dados descentralizado. Cada categoria contem seu gerenciamento database e backup. continue"

### Research Findings
- **178 modelos Prisma** (AGENTS.md diz 171 — desatualizado)
- **Multi-schema Prisma já ativo** — `datasource.schemas` declara: `["public", "pacientes", "inventario", "pdv", "financeiro", "pep", "faturamento", "configuracoes", "database_admin", "backups", "crypto_config", "github_tools", "terminal"]`
- **115 modelos ainda no `@@schema("public")`** — precisam ser re-anotados para seus schemas de categoria
- **Distribuição atual**: `pacientes`=13, `configuracoes`=11, `pep`=9, `pdv`=9, `financeiro`=9, `inventario`=7, `faturamento`=5
- **Um único `PrismaClient` singleton** — arquivo: `backend/src/infrastructure/database/prismaClient.ts`
- **Backup**: único `POST /backups/manager`, sem separação por categoria
- **database_admin**: health + maintenance + audit_logs globais, sem granularidade

### Decisão de Arquitetura: PostgreSQL Multi-Schema (não multi-database)
Usamos **schemas PostgreSQL por categoria** (não bancos separados) pois:
1. Multi-schema já está parcialmente implementado no Prisma
2. Queries cross-categoria continuam funcionando via JOIN nativo no PostgreSQL
3. Backup por schema é trivial com `pg_dump --schema=<nome>`
4. Menor overhead operacional (1 connection pool, 1 servidor)

**Mapeamento definitivo categoria → schemas PostgreSQL:**

| Categoria | Schemas PostgreSQL | Nº aprox. modelos |
|-----------|-------------------|-------------------|
| CORE | `core`, `pacientes`, `pep` | ~60 |
| FINANCEIRO | `financeiro`, `pdv`, `faturamento`, `crypto_config` | ~45 |
| OPERACIONAL | `operacional`, `inventario` | ~15 |
| COMERCIAL | `comercial` | ~20 |
| CLINICO | `clinico` | ~12 |
| ADMINISTRATIVO | `administrativo`, `configuracoes`, `database_admin`, `backups` | ~26 |

> **Nota**: schemas `public` será esvaziado — todos os modelos migram para schemas de categoria. Os schemas existentes (`pacientes`, `financeiro`, etc.) são mantidos e agrupados sob suas categorias.

---

## Work Objectives

### Core Objective
Isolar cada categoria modular em seus próprios schemas PostgreSQL com backup, health check e administração de banco independentes — sem quebrar queries cross-categoria existentes.

### Concrete Deliverables
- `backend/prisma/schema.prisma` com todos os 178 modelos anotados com `@@schema` correto
- `backend/src/infrastructure/database/categoryClients.ts` — factory de clientes por categoria
- `backend/src/infrastructure/database/CategoryDatabaseManager.ts` — classe base
- `backend/src/infrastructure/database/CategoryBackupService.ts` — classe base
- 6 arquivos `backend/src/modules/<categoria>/infrastructure/DatabaseManager.ts`
- 6 arquivos `backend/src/modules/<categoria>/infrastructure/BackupService.ts`
- 6 arquivos `backend/src/modules/<categoria>/api/dbRouter.ts`
- `backend/src/workers/categoryBackupScheduler.ts` — 6 cron jobs escalonados
- `apps/web/src/modules/settings/ui/pages/DatabaseManagementPage.tsx`
- `apps/web/src/hooks/useCategoryDatabase.ts`

### Definition of Done
- [ ] `grep -c '@@schema("public")' backend/prisma/schema.prisma` retorna 0
- [ ] `GET /api/<categoria>/db/health` responde 200 para todas as 6 categorias
- [ ] `POST /api/<categoria>/db/backup` cria arquivo `.sql` em `/backups/<categoria>/`
- [ ] `GET /api/<categoria>/db/stats` retorna `{ schema, tableCount, sizeBytes, lastBackup }`
- [ ] Frontend mostra painel por categoria sem crash
- [ ] `pnpm build` (frontend) e `tsc -p tsconfig.build.json` (backend) passam sem novos erros

### Must Have
- `@@schema` correto em todos os 178 modelos
- Backup isolado por categoria (pg_dump por schema)
- Health endpoint por categoria
- Cron de backup por categoria
- Frontend com abas por categoria

### Must NOT Have (Guardrails)
- **NÃO** criar bancos PostgreSQL separados — apenas schemas dentro do mesmo banco
- **NÃO** quebrar o `prisma` singleton global existente — adicionar clients de categoria como complemento, não substituição
- **NÃO** modificar queries existentes nos controllers — apenas adicionar infraestrutura nova
- **NÃO** mover arquivos de schema do Prisma para múltiplos `.prisma` — manter arquivo único
- **NÃO** remover `@@schema("public")` de modelos antes de criar o schema de destino no PostgreSQL
- **NÃO** adicionar lógica de negócio nos DatabaseManager/BackupService — apenas operações de DB

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (nenhum test framework configurado)
- **Automated tests**: None
- **Agent-Executed QA**: SEMPRE — todos os cenários abaixo são executados pelo agente via curl/bash

### QA Policy
Cada task verifica via curl (APIs) ou bash (filesystem/cron). Evidências em `.sisyphus/evidence/`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — paralelo total):
├── T1: Prisma schema audit + re-anotação de todos os modelos [deep]
├── T2: CategoryDatabaseManager base class [quick]
├── T3: CategoryBackupService base class [quick]
└── T4: categoryClients.ts factory + novos schemas no datasource [quick]

Wave 2 (Per-category implementations — 6 em paralelo):
├── T5:  CORE DB Manager + Backup + router [unspecified-high]
├── T6:  FINANCEIRO DB Manager + Backup + router [unspecified-high]
├── T7:  OPERACIONAL DB Manager + Backup + router [quick]
├── T8:  COMERCIAL DB Manager + Backup + router [quick]
├── T9:  CLINICO DB Manager + Backup + router [quick]
└── T10: ADMINISTRATIVO DB Manager + Backup + router [quick]

Wave 3 (Integration):
├── T11: Registrar 6 dbRouters no index.ts [quick]
├── T12: categoryBackupScheduler.ts — 6 cron jobs escalonados [quick]
└── T13: Script de migração SQL — criar schemas + mover tabelas [deep]

Wave 4 (Frontend):
├── T14: useCategoryDatabase hook [quick]
├── T15: DatabaseManagementPage + CategoryDbCard component [visual-engineering]
└── T16: Integrar DatabaseManagementPage no Settings router [quick]

Wave FINAL (revisão paralela):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: QA manual completo (unspecified-high)
└── F4: Scope fidelity check (deep)
→ Apresentar resultados → Aguardar aprovação do usuário

Critical Path: T1 → T4 → T5–T10 → T11+T12 → T13 → T15 → T16 → F1–F4
Parallel Speedup: ~75% mais rápido que sequencial
Max Concurrent: 6 (Wave 2)
```

### Dependency Matrix

| Task | Depende de | Bloqueia |
|------|-----------|---------|
| T1 | — | T4, T5–T10, T13 |
| T2 | — | T5–T10 |
| T3 | — | T5–T10 |
| T4 | T1 | T5–T10 |
| T5–T10 | T1, T2, T3, T4 | T11, T12 |
| T11 | T5–T10 | F1–F4 |
| T12 | T5–T10 | F1–F4 |
| T13 | T1 | F1–F4 |
| T14 | T11 | T15 |
| T15 | T14 | T16 |
| T16 | T15 | F1–F4 |

### Agent Dispatch Summary
- **Wave 1**: T1 → `deep`, T2–T4 → `quick`
- **Wave 2**: T5–T6 → `unspecified-high`, T7–T10 → `quick`
- **Wave 3**: T11–T12 → `quick`, T13 → `deep`
- **Wave 4**: T14 → `quick`, T15 → `visual-engineering`, T16 → `quick`
- **Final**: F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] T1. **Prisma Schema Audit — Re-anotar todos os 178 modelos**

  **What to do**:
  - Ler `backend/prisma/schema.prisma` completo
  - Para cada model ainda em `@@schema("public")`, determinar a categoria correta e alterar a anotação conforme mapeamento abaixo
  - Adicionar os novos schemas ao bloco `datasource.schemas` se não existirem: `"core"`, `"comercial"`, `"clinico"`, `"operacional"`
  - **Mapeamento modelo → schema**:
    - `@@schema("core")`: `clinics`, `profiles`, `users`, `user_roles`, `user_clinic_access`, `user_module_permissions`, `appointments`, `appointment_confirmations`, `appointment_reminders`, `dentist_schedules`, `blocked_times`, `room_availability`, `recalls`, `login_attempts`, `permission_audit_logs`, `permission_templates`, `audit_logs`, `audit_trail`, `domain_events`, `event_store`, `onboarding_analytics`, `rum_metrics`
    - Manter `@@schema("pacientes")`: todos os 13 models de pacientes já anotados
    - Manter `@@schema("pep")`: todos os 9 models pep já anotados
    - `@@schema("financeiro")`: manter os 9 existentes + adicionar `contas_pagar`, `contas_receber`, `banco_extratos`, `payment_methods`, `payment_negotiations`, `budgets`, `budget_items`, `budget_approvals`, `budget_versions`, `orcamentos`, `orcamento_itens`, `orcamento_pagamento`, `orcamento_visualizacoes`, `contratos`, `contrato_anexos`, `contrato_templates`, `split_comissoes`, `split_payment_config`, `split_payment_details`, `split_payment_recipients`, `split_payment_rules`, `split_payment_transactions`, `split_transactions`, `fiscal_config`, `integracao_contabil_config`, `integracao_contabil_envios`
    - Manter `@@schema("pdv")`: 9 existentes + `cash_registers`, `fechamento_caixa`, `caixa_movimentos`, `caixa_incidentes`, `vendedor_metas`, `vendedor_ranking`
    - Manter `@@schema("faturamento")`: 5 existentes + `nfe_records`, `notas_fiscais`, `sat_mfe_config`, `sat_mfe_impressoes`, `nfce_carta_correcao`, `nfce_contingencia`, `nfce_inutilizacao`
    - Manter `@@schema("crypto_config")`: todos já anotados
    - Manter `@@schema("inventario")`: 7 existentes + `produtos`, `movimentacoes_estoque`, `estoque_alertas`, `estoque_pedidos`, `estoque_pedidos_config`, `estoque_pedidos_itens`
    - `@@schema("operacional")`: `inventarios`, `inventario_agendamentos`, `inventario_itens`
    - `@@schema("comercial")`: `crm_leads`, `crm_activities`, `crm_conversions`, `crm_interactions`, `crm_stages`, `leads`, `lead_interacoes`, `lead_tags`, `fidelidade_badges`, `fidelidade_indicacoes`, `fidelidade_pacientes`, `fidelidade_pontos`, `fidelidade_recompensas`, `fidelidade_transacoes`, `campanhas_marketing`, `marketing_campaigns`, `campaign_metrics`, `campaign_sends`, `campaign_templates`, `campaign_triggers`, `campanha_envios`, `overdue_accounts`, `inadimplentes`, `campanhas_inadimplencia`, `collection_actions`, `collection_automation_config`, `gamification_goals`
    - `@@schema("clinico")`: `teleconsultas`, `teleodonto_chat`, `teleodonto_files`, `teleodonto_sessions`, `triagem_teleconsulta`, `prescricoes_remotas`, `tiss_batches`, `tiss_guides`, `analises_radiograficas`, `analises_radiograficas_history`, `problemas_radiograficos`, `radiografia_ai_feedback`, `radiografia_laudo_templates`
    - `@@schema("configuracoes")`: manter 11 existentes + `admin_configurations`, `clinic_modules`, `module_catalog`, `module_configuration_templates`, `module_dependencies`, `rate_limit_config`, `rate_limit_log`, `security_audit_log`, `root_actions_log`, `abuse_reports`, `architecture_decision_records`
    - Manter `@@schema("database_admin")`: existentes
    - Manter `@@schema("backups")`: existentes + `scheduled_backups`, `backup_history`, `backup_replications`, `backup_retention_policies`, `backup_verification_log`
    - `@@schema("administrativo")`: `bi_dashboards`, `bi_data_cache`, `bi_export_jobs`, `bi_metrics`, `bi_reports`, `bi_widgets`, `scheduled_exports`, `lgpd_consents`, `lgpd_data_consents`, `lgpd_data_exports`, `lgpd_data_requests`, `notifications`, `patient_notifications`, `system_health_metrics`, `wiki_pages`, `wiki_page_versions`
    - Manter `@@schema("github_tools")`, `@@schema("terminal")`: existentes
    - `funcionarios`: `@@schema("core")`
  - Após editar, rodar `npx prisma validate` para verificar sem erros de schema

  **Must NOT do**:
  - Não remover o bloco `datasource db` nem alterar `provider`
  - Não alterar campos, tipos ou relações dos modelos — apenas adicionar/trocar `@@schema`
  - Não criar múltiplos arquivos `.prisma`

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 178 modelos para auditar — requer leitura cuidadosa e decisões de domínio por modelo
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (bloqueia T4 e T5–T10)
  - **Parallel Group**: Wave 1 (início imediato, mas T1 é bloqueante)
  - **Blocks**: T4, T5, T6, T7, T8, T9, T10, T13
  - **Blocked By**: None

  **References**:
  - `backend/prisma/schema.prisma` — arquivo principal a editar
  - `backend/src/modules/configuracoes/api/ModulosController.ts:MODULE_CATALOG` — mapeamento de categorias por módulo
  - Grep: `grep '@@schema' backend/prisma/schema.prisma | sort | uniq -c` — estado atual

  **Acceptance Criteria**:
  - [ ] `grep -c '@@schema("public")' backend/prisma/schema.prisma` retorna `0`
  - [ ] `grep -c '@@schema' backend/prisma/schema.prisma` retorna `178`
  - [ ] `cd backend && npx prisma validate` retorna sem erros

  **QA Scenarios**:
  ```
  Scenario: Todos os modelos têm schema de categoria
    Tool: Bash
    Steps:
      1. cd /data/home/ubuntu/OrthoPlus/backend && grep -c '@@schema("public")' prisma/schema.prisma
    Expected Result: 0
    Evidence: .sisyphus/evidence/task-T1-schema-public-count.txt

  Scenario: Prisma valida sem erros
    Tool: Bash
    Steps:
      1. cd /data/home/ubuntu/OrthoPlus/backend && npx prisma validate 2>&1
    Expected Result: "The schema at ... is valid"
    Evidence: .sisyphus/evidence/task-T1-prisma-validate.txt
  ```

  **Commit**: YES (Wave 1)
  - Message: `feat(db): complete @@schema annotations for all 178 prisma models`
  - Files: `backend/prisma/schema.prisma`

- [x] T2. **CategoryDatabaseManager — Classe Base**

  **What to do**:
  - Criar `backend/src/infrastructure/database/CategoryDatabaseManager.ts`
  - Interface e classe abstrata com métodos:
    - `getHealth(): Promise<{ status: 'healthy'|'degraded'|'down', schemas: string[], latencyMs: number }>`
    - `getStats(): Promise<{ schemas: string[], tableCount: number, sizeBytes: number, sizeHuman: string, lastBackup: string | null }>`
    - `runMaintenance(): Promise<{ vacuum: boolean, analyze: boolean, reindex: boolean }>`
  - Implementar usando `$queryRaw` do prisma singleton global para queries `information_schema`
  - Construtor recebe `schemas: string[]` e `categoryName: string`

  **Must NOT do**:
  - Não criar novo PrismaClient — usar o singleton global `prisma`
  - Não fazer lógica de negócio — apenas operações de banco

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1, paralelo com T1, T3, T4)
  - **Blocks**: T5–T10
  - **Blocked By**: None

  **References**:
  - `backend/src/infrastructure/database/prismaClient.ts` — singleton a usar
  - `backend/src/modules/database_admin/api/DatabaseAdminController.ts` — padrão existente de health/maintenance

  **Acceptance Criteria**:
  - [ ] Arquivo criado em `backend/src/infrastructure/database/CategoryDatabaseManager.ts`
  - [ ] TypeScript compila sem erros no arquivo (`npx tsc --noEmit backend/src/infrastructure/database/CategoryDatabaseManager.ts`)

  **QA Scenarios**:
  ```
  Scenario: Arquivo existe e exporta a classe
    Tool: Bash
    Steps:
      1. test -f /data/home/ubuntu/OrthoPlus/backend/src/infrastructure/database/CategoryDatabaseManager.ts && echo "OK"
      2. grep -c "export class CategoryDatabaseManager" .../CategoryDatabaseManager.ts
    Expected Result: "OK" e count=1
    Evidence: .sisyphus/evidence/task-T2-file-exists.txt
  ```

  **Commit**: YES (Wave 1, junto com T3 e T4)
  - Message: `feat(db): add CategoryDatabaseManager and CategoryBackupService base classes`

- [x] T3. **CategoryBackupService — Classe Base**

  **What to do**:
  - Criar `backend/src/infrastructure/database/CategoryBackupService.ts`
  - Classe com métodos:
    - `runBackup(options?: { compress?: boolean }): Promise<{ filePath: string, sizeBytes: number, durationMs: number, schemas: string[] }>`
    - `listBackups(): Promise<Array<{ filePath: string, createdAt: Date, sizeBytes: number }>>`
    - `getLastBackupInfo(): Promise<{ lastBackup: string | null, lastBackupSize: number | null }>`
  - Implementação usa `child_process.spawn('pg_dump', ['--schema=<nome>', ...])` para cada schema da categoria
  - Outputs em `/backups/<categoryName>/backup-<timestamp>.sql` (ou `.sql.gz` se compress=true)
  - Construtor recebe `schemas: string[]`, `categoryName: string`, `databaseUrl: string`
  - Extrair `databaseUrl` de `process.env.DATABASE_URL`
  - Garantir que diretório `/backups/<categoryName>/` é criado se não existir (`fs.mkdirSync`)

  **Must NOT do**:
  - Não usar Prisma para backup — usar pg_dump via child_process
  - Não fazer sync (bloquear event loop) — usar spawn com Promise wrapper

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1, paralelo com T1, T2, T4)
  - **Blocks**: T5–T10
  - **Blocked By**: None

  **References**:
  - `backend/src/modules/backups/api/backupController.ts` — padrão atual de backup
  - Node.js `child_process.spawn` para pg_dump

  **Acceptance Criteria**:
  - [ ] Arquivo criado em `backend/src/infrastructure/database/CategoryBackupService.ts`
  - [ ] Exporta `class CategoryBackupService` com os 3 métodos

  **QA Scenarios**:
  ```
  Scenario: Arquivo existe com métodos corretos
    Tool: Bash
    Steps:
      1. grep -E "runBackup|listBackups|getLastBackupInfo" .../CategoryBackupService.ts | wc -l
    Expected Result: 3 (um por método)
    Evidence: .sisyphus/evidence/task-T3-methods-count.txt
  ```

  **Commit**: YES (Wave 1, junto com T2 e T4)

- [x] T4. **categoryClients.ts — Factory e Novos Schemas no Datasource**

  **What to do**:
  - Criar `backend/src/infrastructure/database/categoryClients.ts`
  - Exportar constante `CATEGORY_SCHEMAS` mapeando cada categoria para seus schemas:
    ```typescript
    export const CATEGORY_SCHEMAS: Record<string, string[]> = {
      CORE:           ['core', 'pacientes', 'pep'],
      FINANCEIRO:     ['financeiro', 'pdv', 'faturamento', 'crypto_config'],
      OPERACIONAL:    ['operacional', 'inventario'],
      COMERCIAL:      ['comercial'],
      CLINICO:        ['clinico'],
      ADMINISTRATIVO: ['administrativo', 'configuracoes', 'database_admin', 'backups'],
    }
    ```
  - Exportar `getCategoryDatabaseManager(category: string): CategoryDatabaseManager`
  - Exportar `getCategoryBackupService(category: string): CategoryBackupService`
  - Ambas as funções fazem lazy instantiation com cache (Map singleton por categoria)
  - Verificar que `backend/prisma/schema.prisma` tem todos os novos schemas em `datasource.schemas` — se não, adicioná-los: `"core"`, `"comercial"`, `"clinico"`, `"operacional"`, `"administrativo"`

  **Must NOT do**:
  - Não instanciar novos PrismaClient — usar singleton global
  - Não modificar `prismaClient.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1, após T1 completar)
  - **Blocks**: T5–T10
  - **Blocked By**: T1 (para confirmar schemas corretos)

  **References**:
  - `backend/src/infrastructure/database/CategoryDatabaseManager.ts` (T2)
  - `backend/src/infrastructure/database/CategoryBackupService.ts` (T3)
  - `backend/prisma/schema.prisma` — bloco `datasource.schemas`

  **Acceptance Criteria**:
  - [ ] `CATEGORY_SCHEMAS` exportado com 6 categorias
  - [ ] `getCategoryDatabaseManager` e `getCategoryBackupService` exportados

  **QA Scenarios**:
  ```
  Scenario: Factory exporta corretamente
    Tool: Bash
    Steps:
      1. grep -c "getCategoryDatabaseManager\|getCategoryBackupService\|CATEGORY_SCHEMAS" .../categoryClients.ts
    Expected Result: 3
    Evidence: .sisyphus/evidence/task-T4-exports.txt
  ```

  **Commit**: YES (Wave 1)
  - Message: `feat(db): add category schema factory and update prisma datasource schemas`
  - Files: `backend/src/infrastructure/database/categoryClients.ts`, `backend/prisma/schema.prisma` (datasource block)

- [x] T5. **CORE — DatabaseManager + BackupService + dbRouter**

  **What to do**:
  - Criar `backend/src/modules/pacientes/infrastructure/CoreDatabaseManager.ts` — estende `CategoryDatabaseManager` com schemas `['core', 'pacientes', 'pep']`
  - Criar `backend/src/modules/pacientes/infrastructure/CoreBackupService.ts` — estende `CategoryBackupService` com schemas `['core', 'pacientes', 'pep']`
  - Criar `backend/src/modules/pacientes/api/dbRouter.ts` — router Express com:
    - `GET /db/health` → `manager.getHealth()`
    - `GET /db/stats` → `manager.getStats()`
    - `POST /db/backup` → `backup.runBackup()`
    - `GET /db/backups` → `backup.listBackups()`
    - `POST /db/maintenance` → `manager.runMaintenance()`
  - Aplicar `clinicGuard` em todas as rotas
  - Registrar `dbRouter` no `backend/src/modules/pacientes/api/router.ts` com prefix `/db`

  **Must NOT do**:
  - Não alterar rotas existentes do módulo pacientes
  - Não fazer queries Prisma no router — delegar para DatabaseManager/BackupService

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Módulo CORE tem mais schemas e é mais crítico
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, paralelo com T6–T10)
  - **Blocks**: T11, T12
  - **Blocked By**: T1, T2, T3, T4

  **References**:
  - `backend/src/infrastructure/database/CategoryDatabaseManager.ts` (T2)
  - `backend/src/infrastructure/database/CategoryBackupService.ts` (T3)
  - `backend/src/infrastructure/database/categoryClients.ts` (T4)
  - `backend/src/modules/pacientes/api/router.ts` — router existente para registrar dbRouter
  - `backend/src/modules/database_admin/api/DatabaseAdminController.ts` — padrão de health/maintenance

  **Acceptance Criteria**:
  - [ ] `GET /api/pacientes/db/health` retorna `{ status: "healthy", schemas: ["core","pacientes","pep"], latencyMs: <number> }`
  - [ ] `GET /api/pacientes/db/stats` retorna `{ schemas: [...], tableCount: <n>, sizeBytes: <n>, lastBackup: null }`
  - [ ] `POST /api/pacientes/db/backup` cria arquivo em `/backups/core/backup-*.sql`

  **QA Scenarios**:
  ```
  Scenario: Health check CORE
    Tool: Bash (curl)
    Preconditions: TOKEN=<autenticado como admin>
    Steps:
      1. curl -s -H "Authorization: Bearer $TOKEN" https://orthoplus.179.190.9.199.nip.io/api/pacientes/db/health
      2. Verificar campo "status" == "healthy"
    Expected Result: { "status": "healthy", "schemas": ["core","pacientes","pep"], "latencyMs": <number> }
    Evidence: .sisyphus/evidence/task-T5-core-health.json

  Scenario: Backup CORE cria arquivo
    Tool: Bash
    Steps:
      1. curl -s -X POST -H "Authorization: Bearer $TOKEN" https://orthoplus.179.190.9.199.nip.io/api/pacientes/db/backup
      2. ls /backups/core/*.sql | head -1
    Expected Result: arquivo .sql presente com tamanho > 0
    Evidence: .sisyphus/evidence/task-T5-core-backup.txt
  ```

  **Commit**: YES (Wave 2, junto com T6–T10)
  - Message: `feat(db): add per-category DatabaseManager, BackupService and db routes`

- [x] T6. **FINANCEIRO — DatabaseManager + BackupService + dbRouter**

  **What to do**:
  - Criar `backend/src/modules/financeiro/infrastructure/FinanceiroDatabaseManager.ts` — schemas `['financeiro', 'pdv', 'faturamento', 'crypto_config']`
  - Criar `backend/src/modules/financeiro/infrastructure/FinanceiroBackupService.ts` — mesmos schemas
  - Criar `backend/src/modules/financeiro/api/dbRouter.ts` — mesmas 5 rotas do padrão
  - Aplicar `clinicGuard` e registrar no `backend/src/modules/financeiro/api/router.ts` com prefix `/db`

  **Must NOT do**:
  - Não tocar em `FinanceiroController.ts` (~1279 linhas) — apenas adicionar novo router
  - Não alterar rotas financeiras existentes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Módulo financeiro é o mais sensível — cuidado com backup de dados financeiros
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: T11, T12
  - **Blocked By**: T1, T2, T3, T4

  **References**:
  - `backend/src/infrastructure/database/CategoryDatabaseManager.ts` (T2)
  - `backend/src/infrastructure/database/CategoryBackupService.ts` (T3)
  - `backend/src/modules/financeiro/api/router.ts` — router existente (atenção: arquivo grande)
  - Pattern de T5 para estrutura consistente

  **Acceptance Criteria**:
  - [ ] `GET /api/financeiro/db/health` → 200 com `{ status: "healthy", schemas: ["financeiro","pdv","faturamento","crypto_config"] }`
  - [ ] `POST /api/financeiro/db/backup` → arquivo em `/backups/financeiro/`

  **QA Scenarios**:
  ```
  Scenario: Health check FINANCEIRO
    Tool: Bash (curl)
    Steps:
      1. curl -s -H "Authorization: Bearer $TOKEN" https://orthoplus.179.190.9.199.nip.io/api/financeiro/db/health
    Expected Result: status=healthy, schemas contém "financeiro"
    Evidence: .sisyphus/evidence/task-T6-financeiro-health.json
  ```

  **Commit**: YES (Wave 2, batch com T5, T7–T10)

- [x] T7. **OPERACIONAL — DatabaseManager + BackupService + dbRouter**

  **What to do**:
  - Criar `backend/src/modules/inventario/infrastructure/OperacionalDatabaseManager.ts` — schemas `['operacional', 'inventario']`
  - Criar `backend/src/modules/inventario/infrastructure/OperacionalBackupService.ts`
  - Criar `backend/src/modules/inventario/api/dbRouter.ts` — 5 rotas padrão
  - Registrar no router existente do inventario com prefix `/db`

  **Recommended Agent Profile**: `quick`
  **Parallelization**: YES (Wave 2) | **Blocks**: T11, T12 | **Blocked By**: T1–T4

  **References**:
  - `backend/src/modules/inventario/api/router.ts`
  - Pattern de T5

  **Acceptance Criteria**:
  - [ ] `GET /api/inventario/db/health` → 200

  **QA Scenarios**:
  ```
  Scenario: Health check OPERACIONAL
    Tool: Bash (curl)
    Steps: curl -s -H "Authorization: Bearer $TOKEN" .../api/inventario/db/health
    Expected Result: status=healthy
    Evidence: .sisyphus/evidence/task-T7-operacional-health.json
  ```
  **Commit**: YES (Wave 2 batch)

- [x] T8. **COMERCIAL — DatabaseManager + BackupService + dbRouter**

  **What to do**:
  - Criar `backend/src/modules/crm/infrastructure/ComercialDatabaseManager.ts` — schema `['comercial']`
  - Criar `backend/src/modules/crm/infrastructure/ComercialBackupService.ts`
  - Criar `backend/src/modules/crm/api/dbRouter.ts` — 5 rotas padrão
  - Registrar no router do crm com prefix `/db`

  **Recommended Agent Profile**: `quick`
  **Parallelization**: YES (Wave 2) | **Blocks**: T11, T12 | **Blocked By**: T1–T4

  **References**: `backend/src/modules/crm/api/router.ts`, pattern de T5

  **Acceptance Criteria**:
  - [ ] `GET /api/crm/db/health` → 200

  **QA Scenarios**:
  ```
  Scenario: Health check COMERCIAL
    Tool: Bash (curl)
    Steps: curl -s -H "Authorization: Bearer $TOKEN" .../api/crm/db/health
    Expected Result: status=healthy
    Evidence: .sisyphus/evidence/task-T8-comercial-health.json
  ```
  **Commit**: YES (Wave 2 batch)

- [x] T9. **CLINICO — DatabaseManager + BackupService + dbRouter**

  **What to do**:
  - Criar `backend/src/modules/teleodonto/infrastructure/ClinicoDatabaseManager.ts` — schema `['clinico']`
  - Criar `backend/src/modules/teleodonto/infrastructure/ClinicoBackupService.ts`
  - Criar `backend/src/modules/teleodonto/api/dbRouter.ts` — 5 rotas padrão
  - Registrar no router do teleodonto com prefix `/db`

  **Recommended Agent Profile**: `quick`
  **Parallelization**: YES (Wave 2) | **Blocks**: T11, T12 | **Blocked By**: T1–T4

  **References**: `backend/src/modules/teleodonto/api/router.ts`, pattern de T5

  **Acceptance Criteria**:
  - [ ] `GET /api/teleodonto/db/health` → 200

  **QA Scenarios**:
  ```
  Scenario: Health check CLINICO
    Tool: Bash (curl)
    Steps: curl -s -H "Authorization: Bearer $TOKEN" .../api/teleodonto/db/health
    Expected Result: status=healthy
    Evidence: .sisyphus/evidence/task-T9-clinico-health.json
  ```
  **Commit**: YES (Wave 2 batch)

- [x] T10. **ADMINISTRATIVO — DatabaseManager + BackupService + dbRouter**

  **What to do**:
  - Criar `backend/src/modules/configuracoes/infrastructure/AdministrativoDatabaseManager.ts` — schemas `['administrativo', 'configuracoes', 'database_admin', 'backups']`
  - Criar `backend/src/modules/configuracoes/infrastructure/AdministrativoBackupService.ts`
  - Criar `backend/src/modules/configuracoes/api/dbRouter.ts` — 5 rotas padrão
  - Registrar no router do configuracoes com prefix `/db`

  **Recommended Agent Profile**: `quick`
  **Parallelization**: YES (Wave 2) | **Blocks**: T11, T12 | **Blocked By**: T1–T4

  **References**: `backend/src/modules/configuracoes/api/router.ts`, pattern de T5

  **Acceptance Criteria**:
  - [ ] `GET /api/configuracoes/db/health` → 200

  **QA Scenarios**:
  ```
  Scenario: Health check ADMINISTRATIVO
    Tool: Bash (curl)
    Steps: curl -s -H "Authorization: Bearer $TOKEN" .../api/configuracoes/db/health
    Expected Result: status=healthy
    Evidence: .sisyphus/evidence/task-T10-admin-health.json
  ```
  **Commit**: YES (Wave 2 batch)

- [x] T11. **Registrar 6 dbRouters no index.ts (Wave 3)**

  **What to do**:
  - O backend já registra os module routers em `backend/src/index.ts`
  - Os dbRouters de T5–T10 já são registrados internamente dentro de cada module router — mas verificar que os prefixos estão corretos:
    - `GET /api/pacientes/db/*` → CORE
    - `GET /api/financeiro/db/*` → FINANCEIRO
    - `GET /api/inventario/db/*` → OPERACIONAL
    - `GET /api/crm/db/*` → COMERCIAL
    - `GET /api/teleodonto/db/*` → CLINICO
    - `GET /api/configuracoes/db/*` → ADMINISTRATIVO
  - Testar todos os 6 health endpoints após deploy

  **Must NOT do**:
  - Não alterar a ordem de middleware em `index.ts`

  **Recommended Agent Profile**: `quick`
  **Parallelization**: NO (sequential após T5–T10)
  **Blocks**: F1–F4 | **Blocked By**: T5–T10

  **References**: `backend/src/index.ts`

  **Acceptance Criteria**:
  - [ ] Todos os 6 `GET .../db/health` retornam 200 após `pm2 reload orthoplus-backend`

  **QA Scenarios**:
  ```
  Scenario: Todos os 6 health endpoints respondem 200
    Tool: Bash (curl)
    Steps:
      1. TOKEN=$(curl login...) && for ROUTE in "pacientes" "financeiro" "inventario" "crm" "teleodonto" "configuracoes"; do
           STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" https://orthoplus.179.190.9.199.nip.io/api/$ROUTE/db/health)
           echo "$ROUTE: $STATUS"
         done
    Expected Result: todas as 6 linhas mostram "200"
    Evidence: .sisyphus/evidence/task-T11-all-health.txt
  ```
  **Commit**: NO (já commitado em T5–T10)

- [x] T12. **categoryBackupScheduler.ts — 6 Cron Jobs Escalonados (Wave 3)**

  **What to do**:
  - Criar `backend/src/workers/categoryBackupScheduler.ts`
  - Usar `node-cron` (já presente como dependência) com 6 jobs diários escalonados a cada 15 min:
    ```
    CORE:           '0 1 * * *'   (01:00)
    FINANCEIRO:     '15 1 * * *'  (01:15)
    OPERACIONAL:    '30 1 * * *'  (01:30)
    COMERCIAL:      '45 1 * * *'  (01:45)
    CLINICO:        '0 2 * * *'   (02:00)
    ADMINISTRATIVO: '15 2 * * *'  (02:15)
    ```
  - Cada job chama `getCategoryBackupService(category).runBackup({ compress: true })`
  - Log de sucesso/falha usando `logger` de `@/infrastructure/logger`
  - Exportar `startCategoryBackupScheduler()` função
  - Importar e chamar `startCategoryBackupScheduler()` no ponto de entrada do backend (`backend/src/index.ts`)

  **Must NOT do**:
  - Não bloquear o event loop — backup é async, usar await com try/catch
  - Não hardcodar DATABASE_URL — usar process.env

  **Recommended Agent Profile**: `quick`
  **Parallelization**: YES (Wave 3, paralelo com T13)
  **Blocks**: F1–F4 | **Blocked By**: T5–T10

  **References**:
  - `backend/src/infrastructure/database/categoryClients.ts` (T4)
  - `backend/src/infrastructure/logger.ts` — logger padrão
  - `backend/src/index.ts` — ponto de entrada

  **Acceptance Criteria**:
  - [ ] Arquivo criado com 6 cron jobs
  - [ ] `startCategoryBackupScheduler` importado e chamado em `index.ts`
  - [ ] Após deploy, `pm2 logs orthoplus-backend` mostra "Category backup scheduler started"

  **QA Scenarios**:
  ```
  Scenario: Scheduler iniciado sem erros
    Tool: Bash
    Steps:
      1. pm2 reload orthoplus-backend && sleep 5
      2. pm2 logs orthoplus-backend --lines 30 | grep -i "backup scheduler"
    Expected Result: linha "Category backup scheduler started" presente
    Evidence: .sisyphus/evidence/task-T12-scheduler-log.txt
  ```
  **Commit**: YES (Wave 3)
  - Message: `feat(workers): add per-category backup cron scheduler`
  - Files: `backend/src/workers/categoryBackupScheduler.ts`, `backend/src/index.ts`

- [x] T13. **Script de Migração SQL — Criar Schemas no PostgreSQL (Wave 3)**

  **What to do**:
  - Criar `backend/scripts/migrate-category-schemas.sql`
  - Script idempotente que cria os novos schemas se não existirem:
    ```sql
    CREATE SCHEMA IF NOT EXISTS core;
    CREATE SCHEMA IF NOT EXISTS comercial;
    CREATE SCHEMA IF NOT EXISTS clinico;
    CREATE SCHEMA IF NOT EXISTS operacional;
    CREATE SCHEMA IF NOT EXISTS administrativo;
    -- schemas já existentes (garantir):
    CREATE SCHEMA IF NOT EXISTS pacientes;
    CREATE SCHEMA IF NOT EXISTS financeiro;
    CREATE SCHEMA IF NOT EXISTS pdv;
    CREATE SCHEMA IF NOT EXISTS faturamento;
    CREATE SCHEMA IF NOT EXISTS inventario;
    CREATE SCHEMA IF NOT EXISTS pep;
    CREATE SCHEMA IF NOT EXISTS configuracoes;
    CREATE SCHEMA IF NOT EXISTS database_admin;
    CREATE SCHEMA IF NOT EXISTS backups;
    CREATE SCHEMA IF NOT EXISTS crypto_config;
    CREATE SCHEMA IF NOT EXISTS github_tools;
    CREATE SCHEMA IF NOT EXISTS terminal;
    ```
  - Criar `backend/scripts/migrate-category-schemas.sh` que aplica o SQL:
    ```bash
    #!/bin/bash
    set -e
    psql "$DATABASE_URL" -f "$(dirname $0)/migrate-category-schemas.sql"
    echo "Category schemas created/verified."
    ```
  - Rodar o script imediatamente: `DATABASE_URL=<valor> bash backend/scripts/migrate-category-schemas.sh`
  - Após criar schemas, rodar `npx prisma db push --schema=backend/prisma/schema.prisma` para sincronizar

  **Must NOT do**:
  - Não rodar DROP SCHEMA — apenas CREATE IF NOT EXISTS
  - Não mover tabelas manualmente — o Prisma gerencia a estrutura

  **Recommended Agent Profile**: `deep`
    - Reason: Envolve operações de banco — requer cuidado para não perder dados

  **Parallelization**: YES (Wave 3, paralelo com T12)
  **Blocks**: F1–F4 | **Blocked By**: T1

  **References**:
  - `backend/.env.example` — formato de DATABASE_URL
  - `backend/prisma/schema.prisma` — lista definitiva de schemas

  **Acceptance Criteria**:
  - [ ] `psql $DATABASE_URL -c "\dn" | grep -E "core|comercial|clinico|operacional|administrativo"` mostra 5 novos schemas
  - [ ] `npx prisma db push` completa sem erros

  **QA Scenarios**:
  ```
  Scenario: Novos schemas existem no PostgreSQL
    Tool: Bash
    Steps:
      1. psql $DATABASE_URL -c "\dn" | grep -E "^(core|comercial|clinico|operacional|administrativo)"
    Expected Result: 5 linhas, uma por schema
    Evidence: .sisyphus/evidence/task-T13-schemas-list.txt

  Scenario: prisma db push sem erros
    Tool: Bash
    Steps:
      1. cd /data/home/ubuntu/OrthoPlus/backend && npx prisma db push 2>&1 | tail -5
    Expected Result: "Your database is now in sync with your Prisma schema"
    Evidence: .sisyphus/evidence/task-T13-prisma-push.txt
  ```
  **Commit**: YES (Wave 3)
  - Message: `feat(db): add category schema migration script`
  - Files: `backend/scripts/migrate-category-schemas.sql`, `backend/scripts/migrate-category-schemas.sh`

- [x] T14. **useCategoryDatabase Hook (Wave 4)**

  **What to do**:
  - Criar `apps/web/src/hooks/useCategoryDatabase.ts`
  - Hook que expõe para cada categoria:
    - `health: { status, schemas, latencyMs } | null`
    - `stats: { tableCount, sizeBytes, sizeHuman, lastBackup } | null`
    - `isLoading: boolean`
    - `triggerBackup(): Promise<{ filePath, sizeBytes }>`
    - `runMaintenance(): Promise<void>`
  - Aceita parâmetro `category: 'CORE' | 'FINANCEIRO' | 'OPERACIONAL' | 'COMERCIAL' | 'CLINICO' | 'ADMINISTRATIVO'`
  - Mapear categoria → endpoint base:
    ```typescript
    const CATEGORY_ENDPOINTS: Record<string, string> = {
      CORE: '/pacientes/db',
      FINANCEIRO: '/financeiro/db',
      OPERACIONAL: '/inventario/db',
      COMERCIAL: '/crm/db',
      CLINICO: '/teleodonto/db',
      ADMINISTRATIVO: '/configuracoes/db',
    }
    ```
  - Usar `apiClient` de `lib/api/apiClient.ts` (não importar fetch diretamente)
  - Cache 30s via `useQuery` do TanStack Query (já instalado)

  **Must NOT do**:
  - Não usar fetch diretamente — apenas apiClient
  - Não criar estado global — hook local por componente

  **Recommended Agent Profile**: `quick`
  **Parallelization**: YES (Wave 4, pode iniciar assim que T11 completa)
  **Blocks**: T15 | **Blocked By**: T11

  **References**:
  - `apps/web/src/lib/api/apiClient.ts` — cliente HTTP
  - `apps/web/src/hooks/useModules.ts` — padrão de hook com apiClient
  - Endpoints definidos em T5–T10

  **Acceptance Criteria**:
  - [ ] Arquivo criado com os 6 mapeamentos de categoria
  - [ ] Exporta `useCategoryDatabase(category)` com os 5 campos

  **QA Scenarios**:
  ```
  Scenario: Hook exportado corretamente
    Tool: Bash
    Steps:
      1. grep -c "useCategoryDatabase\|CATEGORY_ENDPOINTS\|triggerBackup" .../useCategoryDatabase.ts
    Expected Result: 3
    Evidence: .sisyphus/evidence/task-T14-hook-exports.txt
  ```
  **Commit**: YES (Wave 4)
  - Message: `feat(frontend): add useCategoryDatabase hook`

- [x] T15. **DatabaseManagementPage + DatabaseAdvancedPanel + BackupLocalCard (Wave 4)**

  **What to do**:

  ### Arquivos a criar:
  1. `apps/web/src/modules/settings/ui/pages/DatabaseManagementPage.tsx`
  2. `apps/web/src/modules/settings/ui/components/database/DatabaseAdvancedPanel.tsx`
  3. `apps/web/src/modules/settings/ui/components/database/BackupLocalCard.tsx`
  4. `apps/web/src/modules/settings/ui/components/database/tabs/MotorTab.tsx`
  5. `apps/web/src/modules/settings/ui/components/database/tabs/ConfigTab.tsx`
  6. `apps/web/src/modules/settings/ui/components/database/tabs/RepairTab.tsx`
  7. `apps/web/src/modules/settings/ui/components/database/tabs/MigrationTab.tsx`
  8. `apps/web/src/modules/settings/ui/components/database/tabs/TemplatesTab.tsx`
  9. `apps/web/src/modules/settings/ui/components/database/tabs/DocsTab.tsx`

  ---

  ### 1. `DatabaseManagementPage.tsx`
  - `PageHeader` com `icon={Database}` (LucideIcon, NÃO `<Database />`), title="Gerenciamento de Banco de Dados"
  - Para cada uma das 6 categorias, renderiza uma seção com:
    - `<DatabaseAdvancedPanel category="CORE" categorySchemas={['core','pacientes','pep']} />`
    - etc. para FINANCEIRO, OPERACIONAL, COMERCIAL, CLINICO, ADMINISTRATIVO
  - Após todos os painéis: `<BackupLocalCard />`
  - Layout: flex col com gap-6

  ---

  ### 2. `DatabaseAdvancedPanel.tsx`
  **Estados internos**:
  - `selectedEngine: 'PostgreSQL' | 'SQLite' | 'MariaDB' | 'Firebird'` (default: `'PostgreSQL'`)
  - `activeTab: 'motor' | 'config' | 'reparo' | 'migracao' | 'templates' | 'docs'` (default: `'motor'`)
  - `isCollapsed: boolean` (default: false)

  **Props**: `category: string`, `categorySchemas: string[]`

  **Header** (sempre visível mesmo collapsed):
  - Ícone `Database` azul/cyan + título **"Banco de Dados Avançado"** em amarelo/dourado (`text-yellow-400`)
  - Subtítulo: "Configure o motor e conexão do banco de dados"
  - Botão `∧` (collapse) alinhado à direita

  **Nav de tabs** (6 tabs, visível quando não collapsed):
  - Motor (ícone `Settings2`), Config (ícone `Server`), Reparo (ícone `Wrench`),
    Migração (ícone `ArrowLeftRight`), Templates (ícone `FileCode`), Docs (ícone `BookOpen`)
  - Tab ativa: fundo rose/pink `bg-rose-600` ou `bg-pink-700`, texto branco
  - Tabs inativas: texto muted, hover com leve highlight

  **Passagem de props para cada tab**:
  ```typescript
  <MotorTab selectedEngine={selectedEngine} onSelectEngine={setSelectedEngine} />
  <ConfigTab selectedEngine={selectedEngine} />
  <RepairTab selectedEngine={selectedEngine} category={category} />
  <MigrationTab selectedEngine={selectedEngine} />
  <TemplatesTab category={category} categorySchemas={categorySchemas} />
  <DocsTab selectedEngine={selectedEngine} />
  ```

  ---

  ### 3. `MotorTab.tsx`
  **Grid 2x2 de `EngineCard`**:
  ```
  SQLite     | PostgreSQL (default selected, borda dourada + ✓)
  MariaDB    | Firebird
  ```
  Cada `EngineCard`:
  - Ícone do engine (usar `Database` genérico ou SVG emoji como `🔵`/`🔥`)
  - Nome + Porta (ex: "PostgreSQL / Porta: 5432")
  - Descrição curta
  - Estado: `selected` → `border border-yellow-400 bg-yellow-400/10`, com `✓` (Check icon)
  - Estado: `unselected` → `border border-gray-700`
  - `onClick` → `onSelectEngine(engine)`

  **Painel de detalhes** (renderiza abaixo do grid quando engine selecionada):

  Título: `"<EngineName> — Detalhes"` com ícone do engine

  Dois colunas dentro do painel:
  - **✅ Quando usar:** lista de bullets verdes
  - **⚠️ Limitações:** lista de bullets amarelos

  Linha de chips **🚀 Recursos:**:
  ```
  PostgreSQL: JSON/JSONB nativo | Full-text search avançado | Replicação síncrona/assíncrona | Extensões (PostGIS, etc) | MVCC robusto
  Firebird:   Modo embedded e servidor | Stored procedures | Triggers avançados | Instalação pequena | Suporte a eventos
  SQLite:     Zero config | Arquivo único | Sem servidor | Leitura rápida | Embedded
  MariaDB:    MySQL compatible | Performance melhorada | Galera Cluster | JSON suporte | Replicação
  ```

  Dados completos do painel por engine:
  ```typescript
  const ENGINE_DETAILS = {
    PostgreSQL: {
      whenToUse: ['Ambientes corporativos com alta concorrência', 'Alta disponibilidade com replicação', 'Dados JSON semi-estruturados (JSONB)', 'Queries analíticas complexas'],
      limitations: ['Configuração inicial mais complexa', 'Consumo de memória maior', 'Overhead para bancos pequenos'],
      resources: ['JSON/JSONB nativo', 'Full-text search avançado', 'Replicação síncrona/assíncrona', 'Extensões (PostGIS, etc)', 'MVCC robusto'],
    },
    Firebird: {
      whenToUse: ['Sistemas legados existentes', 'Aplicações desktop standalone', 'Compatibilidade com Interbase', 'Embedded database com servidor'],
      limitations: ['Comunidade menor', 'Menos ferramentas modernas', 'Documentação menos extensa'],
      resources: ['Modo embedded e servidor', 'Stored procedures', 'Triggers avançados', 'Instalação pequena', 'Suporte a eventos'],
    },
    SQLite: {
      whenToUse: ['Desenvolvimento e testes locais', 'Aplicações single-node', 'Dispositivos com poucos recursos', 'Banco embutido em app'],
      limitations: ['Sem multi-user concorrente', 'Sem servidor remoto nativo', 'Sem full-text search nativo'],
      resources: ['Zero config', 'Arquivo único', 'Sem servidor', 'Leitura rápida', 'Embedded'],
    },
    MariaDB: {
      whenToUse: ['Migração de sistemas MySQL', 'Workloads OLTP tradicionais', 'Compatibilidade com legado', 'Cluster com Galera'],
      limitations: ['Menos nativo no ecossistema Node/Prisma', 'JSON menos poderoso que PostgreSQL', 'Extensões limitadas'],
      resources: ['MySQL compatible', 'Performance melhorada', 'Galera Cluster', 'JSON suporte', 'Replicação'],
    },
  }
  ```

  ---

  ### 4. `ConfigTab.tsx`
  **Campos por engine**:
  ```typescript
  const ENGINE_CONFIG = {
    PostgreSQL: { fields: ['host','port','database','user','password'], portDefault: '5432', dbLabel: 'Banco de Dados', userDefault: 'postgres', buttonLabel: 'Testar Conexão PostgreSQL' },
    Firebird:   { fields: ['host','port','dbpath','user','password'],   portDefault: '3050', dbLabel: 'Caminho do Banco',  userDefault: 'SYSDBA',    buttonLabel: 'Testar Conexão Firebird'   },
    MariaDB:    { fields: ['host','port','database','user','password'], portDefault: '3306', dbLabel: 'Banco de Dados', userDefault: 'root',      buttonLabel: 'Testar Conexão MariaDB'    },
    SQLite:     { fields: ['filepath','user','password'],              portDefault: '',     dbLabel: 'Caminho do Arquivo', userDefault: '',         buttonLabel: 'Testar Conexão SQLite'     },
  }
  ```

  Campos renderizados em ordem: Host (se não SQLite), Porta (se não SQLite), Banco/Caminho, Usuário, Senha (com toggle 🔑 para reveal)

  Botão: `"▷ Testar Conexão <EngineName>"` — fundo azul (`bg-blue-600`), ícone `Play`

  Banner fixo (sempre): `⚠ Modo Demo: Conexão será simulada` — fundo `bg-yellow-900/40`, borda `border-yellow-600`, ícone `AlertTriangle`

  ---

  ### 5. `RepairTab.tsx`
  **Subtítulo**: `"Ferramentas de manutenção e reparo para <EngineName>"`

  **Tools por engine**:
  ```typescript
  const ENGINE_REPAIR_TOOLS = {
    PostgreSQL: [
      { name: 'VACUUM FULL',       desc: 'Compacta e recupera espaço',    cmd: 'VACUUM FULL;' },
      { name: 'ANALYZE',           desc: 'Atualiza estatísticas',         cmd: 'ANALYZE;' },
      { name: 'REINDEX DATABASE',  desc: 'Reconstrói índices',            cmd: 'REINDEX DATABASE orthoplus;' },
      { name: 'pg_checksums',      desc: 'Verifica checksums das páginas', cmd: 'pg_checksums --check' },
    ],
    Firebird: [
      { name: 'gfix -sweep',    desc: 'Remove versões antigas de registros', cmd: 'gfix -sweep orthoplus.fdb' },
      { name: 'gfix -validate', desc: 'Valida estrutura do banco',           cmd: 'gfix -validate -full orthoplus.fdb' },
      { name: 'gfix -mend',     desc: 'Repara erros encontrados',            cmd: 'gfix -mend orthoplus.fdb' },
      { name: 'gstat',          desc: 'Estatísticas do banco',              cmd: 'gstat -h orthoplus.fdb' },
    ],
    MariaDB: [
      { name: 'OPTIMIZE TABLE', desc: 'Desfragmenta tabelas',  cmd: 'OPTIMIZE TABLE nome;' },
      { name: 'CHECK TABLE',    desc: 'Verifica erros',        cmd: 'CHECK TABLE nome;' },
      { name: 'REPAIR TABLE',   desc: 'Repara erros',          cmd: 'REPAIR TABLE nome;' },
      { name: 'ANALYZE TABLE',  desc: 'Atualiza estatísticas', cmd: 'ANALYZE TABLE nome;' },
    ],
    SQLite: [
      { name: 'VACUUM',            desc: 'Compacta e recria arquivo', cmd: 'VACUUM;' },
      { name: 'INTEGRITY CHECK',   desc: 'Verifica integridade',      cmd: 'PRAGMA integrity_check;' },
      { name: 'ANALYZE',           desc: 'Atualiza índices',          cmd: 'ANALYZE;' },
      { name: 'REINDEX',           desc: 'Reconstrói índices',        cmd: 'REINDEX;' },
    ],
  }
  ```

  Cada `RepairToolCard`: nome + descrição + code block com o comando + botão `▶` (Play icon)
  - Botão ▶ em PostgreSQL: chama `useCategoryDatabase(category).runMaintenance()` (real)
  - Botão ▶ em outras engines: mostra toast "Modo Demo — operação simulada"

  **Seção de histórico** (abaixo do grid):
  - Estado vazio: ícone Activity + "Nenhum histórico de conexão disponível" + "Execute um teste de conexão para começar"

  ---

  ### 6. `MigrationTab.tsx`
  Igual para todas as engines (não varia por engine):
  - Subtítulo: "Exporte e importe dados entre diferentes motores de banco"
  - Cards lado a lado:
    - `⬇ Exportar Dados` / "JSON/SQL" → onClick: chama `POST /db/export` ou demo toast
    - `⬆ Importar Dados` / "De outro banco" → onClick: abre file picker ou demo toast
  - **"Migração Assistida"** box (borda amarela):
    - Texto explicativo
    - `<selectedEngine>` ⇄ `<targetEngine ▼>` (dropdown com as outras 3 engines)
    - Botão "Iniciar Migração" → demo toast "Migração iniciada (modo demo)"

  ---

  ### 7. `TemplatesTab.tsx`
  **Conteúdo real por categoria** — busca do backend via `useCategoryDatabase`:
  - Subtítulo: `"Templates de tabelas para PostgreSQL"` (sempre PostgreSQL — dados reais)
  - Botão "📄 Exportar Schema" → `POST /db/export` ou download do DDL
  - Lista de `TemplateCard` — cada um: nome da tabela + `CREATE TABLE` DDL + botão Copiar

  **Fallback hardcoded** (se API falhar) por categoria:
  - CORE: patients, appointments, profiles
  - FINANCEIRO: financial_transactions, contas_pagar, contas_receber
  - OPERACIONAL: produtos, movimentacoes_estoque
  - COMERCIAL: crm_leads, campanhas_marketing
  - CLINICO: teleconsultas, tiss_guides
  - ADMINISTRATIVO: clinic_modules, audit_logs

  ---

  ### 8. `DocsTab.tsx` — Totalmente estático, zero API calls
  ```typescript
  const ENGINE_DOCS = {
    PostgreSQL: {
      subtitle: 'Documentação oficial e recursos para PostgreSQL',
      links: [
        { label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/' },
        { label: 'Tutorial Iniciante', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
        { label: 'PostgreSQL Wiki', url: 'https://wiki.postgresql.org/' },
      ],
      installTips: { arch: 'sudo pacman -S postgresql', ubuntu: 'sudo apt install postgresql' },
    },
    Firebird: {
      subtitle: 'Documentação oficial e recursos para Firebird',
      links: [
        { label: 'Firebird Docs', url: 'https://firebirdsql.org/en/documentation/' },
        { label: 'Firebird FAQ',  url: 'https://firebirdsql.org/en/faq/' },
      ],
      installTips: { arch: 'yay -S firebird', ubuntu: 'Download: firebirdsql.org/downloads' },
    },
    MariaDB: {
      subtitle: 'Documentação oficial e recursos para MariaDB',
      links: [
        { label: 'MariaDB Docs', url: 'https://mariadb.com/kb/en/' },
        { label: 'MariaDB Blog', url: 'https://mariadb.com/kb/en/mariadb-blog/' },
      ],
      installTips: { arch: 'sudo pacman -S mariadb', ubuntu: 'sudo apt install mariadb-server' },
    },
    SQLite: {
      subtitle: 'Documentação oficial e recursos para SQLite',
      links: [
        { label: 'SQLite Docs',     url: 'https://www.sqlite.org/docs.html' },
        { label: 'SQLite Tutorial', url: 'https://www.sqlitetutorial.net/' },
      ],
      installTips: { arch: 'sudo pacman -S sqlite', ubuntu: 'sudo apt install sqlite3' },
    },
  }
  ```
  Cada link: ícone `BookOpen` + label + ícone `ExternalLink`
  "Dicas de Instalação" box: `Arch/CachyOS:` + code block + `Ubuntu/Debian:` + code block

  ---

  ### 9. `BackupLocalCard.tsx` (componente separado)
  **Estados internos**: `isCollapsed`, `activeSubTab: 'local'|'nuvem'|'distribuido'`, `backupType: 'completo'|'incremental'`, `autoSchedule: boolean`

  **Header**:
  - Ícone `HardDrive` azul + **"Backup Local"** amarelo/dourado
  - Subtítulo: "Criar e restaurar backups do banco de dados"
  - Botões: `?` (tooltip com info) + `∨/∧` (collapse)

  **Caixa educativa** "O que são Backups?":
  - 4 itens numerados (fundo escuro levemente diferente, borda sutil)
  - 3 dicas com 💡 (fundo amber/yellow escuro)
  - 1 alerta ⚠ (fundo red escuro, texto "Sem backup, se o computador quebrar, você perde TUDO! Não arrisque.")

  **Sub-tabs**: Local | Nuvem | Distribuído
  - Nuvem e Distribuído: mostram banner "🚧 Em breve"

  **Botões de tipo** (toggle-style, width full):
  - `⬇ Backup Completo` e `⬇ Incremental`
  - Ativo: `bg-teal-700`, Inativo: `bg-gray-800`

  **Lista de backups**: estado vazio → "Nenhum backup encontrado" (centralizado, text-muted)

  **"📅 Agendamento Automático"** + Switch (off por padrão)

  ---

  **Must NOT do**:
  - Não usar `as any` ou `@ts-ignore`
  - NÃO passar `icon={<Database />}` para PageHeader — usar `icon={Database}`
  - Não fazer chamadas API no DocsTab — 100% estático
  - Não quebrar o layout geral da página settings

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI complexa com múltiplos estados, tabs aninhadas, conteúdo dinâmico por engine
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential após T14)
  - **Blocks**: T16
  - **Blocked By**: T14

  **References**:
  - `apps/web/src/components/shared/PageHeader.tsx` — espera `icon: LucideIcon` (componente, NÃO JSX)
  - `apps/web/src/components/settings/ModuleCard.tsx` — padrão de card em configurações
  - `apps/web/src/hooks/useCategoryDatabase.ts` (T14) — dados de health/stats/backup
  - `categories/@orthoplus/core/packages/ui/` — Button, Card, Badge de `@orthoplus/core-ui`
  - `apps/web/src/modules/pdv/ui/pages/DashboardExecutivoPDV.tsx` — exemplo de icon={TrendingUp} correto
  - `.sisyphus/drafts/db-descentralizado.md` — spec completa de UI por engine

  **Acceptance Criteria**:
  - [ ] `DatabaseManagementPage` renderiza sem crash (sem React #130, sem TypeError)
  - [ ] `DatabaseAdvancedPanel` exibe as 6 abas para cada categoria
  - [ ] `MotorTab`: clicar em "Firebird" muda borda para dourada e exibe "Firebird — Detalhes" com chips corretos
  - [ ] `ConfigTab`: com Firebird selecionado, campo 3 tem label "Caminho do Banco" e porta padrão "3050"
  - [ ] `RepairTab`: com Firebird selecionado, mostra `gfix -sweep`, `gfix -validate`, `gfix -mend`, `gstat`
  - [ ] `DocsTab`: com MariaDB selecionado, mostra "MariaDB Docs" e "MariaDB Blog", install tip tem `sudo pacman -S mariadb`
  - [ ] `BackupLocalCard` renderiza com sub-tabs Local/Nuvem/Distribuído
  - [ ] Toggle "Agendamento Automático" é funcional (muda visual)
  - [ ] `pnpm --filter @orthoplus/web build` passa sem novos erros TypeScript

  **QA Scenarios**:
  ```
  Scenario: Motor tab - seleção de Firebird mostra detalhes corretos
    Tool: Playwright
    Preconditions: Logado como admin@orthoplus.com, na rota /configuracoes/database
    Steps:
      1. Localizar o primeiro DatabaseAdvancedPanel (categoria CORE)
      2. Clicar na aba "Motor"
      3. Clicar no card "Firebird"
      4. Verificar: card Firebird tem borda dourada + ícone ✓
      5. Verificar: painel "Firebird — Detalhes" aparece com chip "Modo embedded e servidor"
      6. Screenshot
    Expected Result: Borda dourada visível no card Firebird, painel de detalhes com chips corretos
    Evidence: .sisyphus/evidence/task-T15-motor-firebird.png

  Scenario: Config tab - campos mudam por engine
    Tool: Playwright
    Steps:
      1. Na aba Motor, selecionar "Firebird"
      2. Clicar na aba "Config"
      3. Verificar: label do campo 3 é "Caminho do Banco" (não "Banco de Dados")
      4. Verificar: campo porta tem valor "3050"
      5. Verificar: campo usuário tem valor "SYSDBA"
      6. Verificar: botão tem texto "Testar Conexão Firebird"
      7. Screenshot
    Expected Result: Todos os campos mostram valores de Firebird
    Evidence: .sisyphus/evidence/task-T15-config-firebird.png

  Scenario: Reparo tab - ferramentas Firebird
    Tool: Playwright
    Steps:
      1. Com Firebird selecionado, clicar na aba "Reparo"
      2. Verificar: subtítulo contém "Firebird"
      3. Verificar: 4 cards presentes com nomes gfix -sweep, gfix -validate, gfix -mend, gstat
      4. Screenshot
    Expected Result: 4 tool cards do Firebird visíveis
    Evidence: .sisyphus/evidence/task-T15-reparo-firebird.png

  Scenario: Docs tab - MariaDB
    Tool: Playwright
    Steps:
      1. Com MariaDB selecionado, clicar na aba "Docs"
      2. Verificar: links "MariaDB Docs" e "MariaDB Blog" presentes
      3. Verificar: "Dicas de Instalação" contém "sudo pacman -S mariadb"
      4. Screenshot
    Expected Result: Links MariaDB e install tip corretos
    Evidence: .sisyphus/evidence/task-T15-docs-mariadb.png

  Scenario: BackupLocalCard colapsa e expande
    Tool: Playwright
    Steps:
      1. Localizar seção "Backup Local"
      2. Verificar estado inicial: expandido, sub-tabs visíveis
      3. Clicar no botão ∧ (collapse)
      4. Verificar: conteúdo oculto, apenas header visível
      5. Clicar novamente para expandir
      6. Verificar: conteúdo volta
    Expected Result: Collapse/expand funcional
    Evidence: .sisyphus/evidence/task-T15-backup-local-collapse.png
  ```
  **Commit**: YES (Wave 4)
  - Message: `feat(frontend): add DatabaseAdvancedPanel with engine-aware tabs and BackupLocalCard`

- [x] T16. **Integrar DatabaseManagementPage no Settings Router (Wave 4)**

  **What to do**:
  - Localizar o arquivo de rotas do frontend para configurações (provável: `apps/web/src/modules/settings/routes.tsx` ou similar)
  - Adicionar rota `/configuracoes/database` → `DatabaseManagementPage`
  - Adicionar link no menu lateral de configurações (localizar `SettingsSidebar` ou equivalente)
  - Item: ícone `Database`, label "Banco de Dados", link `/configuracoes/database`

  **Must NOT do**:
  - Não alterar rotas existentes de configurações
  - Não modificar outros itens do menu

  **Recommended Agent Profile**: `quick`
  **Parallelization**: NO (sequential após T15)
  **Blocks**: F1–F4 | **Blocked By**: T15

  **References**:
  - `apps/web/src/modules/settings/` — estrutura de rotas e sidebar
  - `apps/web/src/modules/settings/ui/pages/ModulesPage.tsx` — padrão de página existente em settings

  **Acceptance Criteria**:
  - [ ] Navegar para `/configuracoes/database` carrega `DatabaseManagementPage` sem 404
  - [ ] Link "Banco de Dados" aparece no menu de configurações

  **QA Scenarios**:
  ```
  Scenario: Rota acessível
    Tool: Playwright
    Steps:
      1. Navegar diretamente para https://orthoplus.179.190.9.199.nip.io/configuracoes/database
      2. Verificar que DatabaseManagementPage renderiza (não 404, não tela em branco)
    Expected Result: Página com título "Gerenciamento de Banco de Dados" visível
    Evidence: .sisyphus/evidence/task-T16-route-access.png
  ```
  **Commit**: YES (Wave 4)
  - Message: `feat(frontend): register database management route in settings`
  - Pre-commit: `export PATH="/data/npm-global/bin:$PATH" && pnpm --filter @orthoplus/web build`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Ler o plano e verificar: cada "Must Have" foi implementado (ler arquivo, curl endpoint)? Cada "Must NOT Have" está ausente (grep por bancos separados, múltiplos schema.prisma)? Evidências em `.sisyphus/evidence/` existem?
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Rodar `tsc -p tsconfig.build.json || true` no backend e verificar que não foram introduzidos novos erros (comparar com baseline). Checar novos arquivos por `as any` excessivo, catches vazios, imports não usados.
  Output: `Build [PASS/FAIL] | New errors [N] | VERDICT`

- [ ] F3. **Real QA** — `unspecified-high`
  Autenticar como `admin@orthoplus.com / Ortho2026`. Testar todos os 6 `GET /api/<cat>/db/health`, todos os 6 `GET /api/<cat>/db/stats`, 1 `POST /api/<cat>/db/backup` por categoria. Verificar arquivo `.sql` gerado. Screenshots/outputs em `.sisyphus/evidence/final-qa/`.
  Output: `Endpoints [N/N pass] | Backup files [N/6 criados] | VERDICT`

- [ ] F4. **Scope Fidelity** — `deep`
  Para cada task: verificar que "What to do" foi implementado sem creep. Confirmar que nenhum controller existente foi modificado. Confirmar que prisma singleton global (`prismaClient.ts`) não foi alterado.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/issues] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(db): complete prisma schema annotations for all 178 models`
- **Wave 2**: `feat(db): add per-category DatabaseManager and BackupService`
- **Wave 3**: `feat(db): register category db routers and backup scheduler`
- **Wave 4**: `feat(frontend): add database management page with category tabs`

---

## Success Criteria

### Verification Commands
```bash
# Zero modelos sem schema de categoria
grep -c '@@schema("public")' backend/prisma/schema.prisma  # Expected: 0

# Health de todas as categorias
for cat in core financeiro operacional comercial clinico administrativo; do
  curl -s -H "Authorization: Bearer $TOKEN" https://orthoplus.179.190.9.199.nip.io/api/$cat/db/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'$cat: {d[\"status\"]}')"
done
# Expected: todas retornam "healthy"

# Backup criado
curl -s -X POST -H "Authorization: Bearer $TOKEN" https://orthoplus.179.190.9.199.nip.io/api/core/db/backup
ls /backups/core/*.sql  # Expected: arquivo .sql presente
```

### Final Checklist
- [ ] Todos os 178 modelos têm `@@schema` de categoria (não `public`)
- [ ] 6 endpoints `/db/health` respondendo 200
- [ ] 6 endpoints `/db/stats` retornando `{ schema, tableCount, sizeBytes, lastBackup }`
- [ ] 6 endpoints `/db/backup` gerando arquivo `.sql`
- [ ] 6 cron jobs registrados e executando sem erro
- [ ] Frontend DatabaseManagementPage renderiza sem crash
- [ ] `pnpm build` frontend: 0 novos erros
- [ ] Backend build: 0 novos erros TypeScript
