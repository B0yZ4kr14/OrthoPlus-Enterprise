# 🔍 AUDITORIA DATABASE - ORTHOPLUS ENTERPRISE

**Data:** 2026-04-22  
**Banco:** `orthoplus` @ `100.111.74.69:5432` (acesso via SSH tunnel Tailscale)  
**Prisma Schema:** `backend/prisma/schema.prisma` (3047 linhas, 178 models)  

---

## 1. Prisma Schema vs Banco Real

| Métrica | Valor |
|---------|-------|
| Models no Prisma | **178** |
| Tabelas no Banco | **172** |
| Schemas no Banco | **8** (`public`, `pacientes`, `inventario`, `pdv`, `financeiro`, `faturamento`, `configuracoes`, `pep`) |

### a) Tabelas no BANCO sem Model no Prisma
✅ **Nenhuma.** Todas as 172 tabelas existentes no banco possuem model correspondente no schema Prisma.

### b) Models no PRISMA sem Tabela no Banco (Ghost Models)
⚠️ **7 models** estão declarados no Prisma mas **não possuem tabela correspondente** no banco:

| Schema | Model | Observação |
|--------|-------|------------|
| `faturamento` | `nfe_records` | Wave-2 ghost table (nota fiscal eletrônica) |
| `financeiro` | `crypto_exchange_rates` | Novo model (taxas de câmbio crypto) |
| `inventario` | `estoque_alertas` | Alertas de estoque baixo |
| `public` | `bi_export_jobs` | Jobs de exportação BI |
| `public` | `fidelidade_pacientes` | Programa fidelidade - saldo por paciente |
| `public` | `fidelidade_transacoes` | Transações de pontos fidelidade |
| `public` | `gamification_goals` | Metas gamificadas |

> 💡 **Recomendação:** Executar `npx prisma db push` ou criar migration para gerar essas tabelas, ou removê-las do schema se não forem mais necessárias.

---

## 2. Relações Faltantes

| Métrica | Valor |
|---------|-------|
| Total campos `*_id` no schema | **301** |
| Com `@relation` explícita | **5** |
| **SEM `@relation`** | **296** |

### Models que JÁ possuem relations configuradas:
- `appointments` → `patients` (via `patient_id`)
- `clinic_modules` → `module_catalog` (via `module_catalog_id`)
- `pep_tratamentos` → `prontuarios` (via `prontuario_id`)
- `recalls` → `patients` (via `patient_id`)
- `campaign_triggers` → `marketing_campaigns` (via `campaign_id`)

### Campos `*_id` sem `@relation` — principais candidatos:

Há **296 campos** que poderiam se beneficiar de foreign keys / relations. Os mais críticos:

| Model | Campo | Provável Referência |
|-------|-------|---------------------|
| `appointments` | `clinic_id` | `clinics.id` |
| `appointments` | `dentist_id` | `funcionarios.id` ou `users.id` |
| `appointments` | `treatment_id` | `pep_tratamentos.id` |
| `budgets` | `patient_id` | `patients.id` |
| `contratos` | `patient_id` | `patients.id` |
| `contratos` | `orcamento_id` | `orcamentos.id` |
| `contas_receber` | `patient_id` | `patients.id` |
| `orcamentos` | `patient_id` | `patients.id` |
| `pep_tratamentos` | `procedimento_id` | `procedimento_templates.id` |
| `prontuarios` | `patient_id` | `patients.id` |
| `analises_radiograficas` | `patient_id` | `patients.id` |
| `analises_radiograficas` | `prontuario_id` | `prontuarios.id` |
| `teleconsultas` | `patient_id` | `patients.id` |
| `teleconsultas` | `dentist_id` | `funcionarios.id` |
| `tiss_guides` | `patient_id` | `patients.id` |
| `overdue_accounts` | `patient_id` | `patients.id` |
| `user_roles` | `user_id` | `users.id` |
| `user_clinic_access` | `user_id` | `users.id` |
| `funcionarios` | `user_id` | `users.id` |
| `audit_logs` | `user_id` | `users.id` |
| `audit_logs` | `clinic_id` | `clinics.id` |

> 💡 **Recomendação:** Adicionar `@relation` nos campos que referenciam outras tabelas para garantir integridade referencial e habilitar joins otimizados do Prisma Client.

---

## 3. Migrations

| Métrica | Valor |
|---------|-------|
| Migrations aplicadas | **1** |
| Última migration | `00_initial_baseline` |
| Data de aplicação | `2026-04-06 06:46:24 UTC` |
| Diretório local | `prisma/migrations/00_initial_baseline` |

### 🚨 Issues:
- **Apenas 1 migration** está registrada na tabela `_prisma_migrations`
- Isso indica que o schema foi criado via **`prisma db push`** ou via **`prisma migrate dev --create-only`** sem aplicação incremental
- **Não há histórico de versionamento** para rollback ou deploy em múltiplos ambientes

> 💡 **Recomendação:**
> 1. Executar `npx prisma migrate dev` para gerar migration incremental com as alterações pendentes
> 2. Ou usar `prisma migrate reset` (⚠️ cuidado: apaga dados) em ambiente de dev para normalizar o histórico
> 3. Em produção, usar `prisma migrate deploy` com migrations gerenciadas

---

## 4. Índices

| Métrica | Valor |
|---------|-------|
| Índices declarados no Prisma (`@@index`) | **25** |
| Índices no Banco (total) | **174** |
| Primary Keys | 172 |
| Unique Indexes | 1 (`users_email_key`) |
| Non-Unique Indexes | 1 (`domain_events_aggregate_id_occurred_at_idx`) |

### a) Índices Prisma ENCONTRADOS no Banco
✅ Apenas **1** índice declarado no Prisma está presente no banco:

| Schema | Tabela | Colunas | Nome no Banco |
|--------|--------|---------|---------------|
| `public` | `domain_events` | `aggregate_id`, `occurred_at` | `domain_events_aggregate_id_occurred_at_idx` |

### b) Índices Prisma NÃO encontrados no Banco (24 pendentes)

| Schema | Tabela | Colunas |
|--------|--------|---------|
| `pacientes` | `appointments` | `clinic_id`, `start_time` |
| `pacientes` | `appointments` | `patient_id` |
| `pacientes` | `appointments` | `clinic_id`, `status` |
| `configuracoes` | `audit_logs` | `clinic_id`, `created_at` |
| `configuracoes` | `audit_logs` | `user_id` |
| `configuracoes` | `clinics` | `name` |
| `configuracoes` | `users` | `clinic_id` |
| `financeiro` | `contas_pagar` | `clinic_id`, `data_vencimento`, `status` |
| `financeiro` | `contas_receber` | `clinic_id`, `data_vencimento`, `status` |
| `financeiro` | `contas_receber` | `patient_id` |
| `pacientes` | `event_store` | `clinic_id`, `created_at` |
| `pacientes` | `event_store` | `aggregate_id` |
| `pacientes` | `patients` | `clinic_id`, `full_name` |
| `pacientes` | `patients` | `cpf` |
| `pacientes` | `patients` | `email` |
| `pacientes` | `patients` | `clinic_id`, `status` |
| `faturamento` | `nfe_records` | `clinic_id` |
| `faturamento` | `nfe_records` | `status` |
| `public` | `fidelidade_pacientes` | `clinic_id`, `patient_id` |
| `public` | `fidelidade_transacoes` | `clinic_id`, `patient_id` |
| `public` | `gamification_goals` | `clinic_id`, `user_id`, `status` |
| `public` | `bi_export_jobs` | `clinic_id`, `status` |
| `inventario` | `estoque_alertas` | `clinic_id`, `lido` |
| `financeiro` | `crypto_exchange_rates` | `coin_type`, `timestamp` |

> ⚠️ **Nota:** Os 24 índices pendentes pertencem majoritariamente aos **7 ghost models** (nfe_records, crypto_exchange_rates, estoque_alertas, bi_export_jobs, fidelidade_pacientes, fidelidade_transacoes, gamification_goals) e a tabelas que podem ter sido criadas antes da declaração dos índices no schema.

> 💡 **Recomendação:** Executar `npx prisma db push` ou `npx prisma migrate dev` para aplicar os índices pendentes. Isso melhorará drasticamente a performance de queries filtradas por `clinic_id`, `patient_id`, etc.

---

## 📊 Resumo Executivo

### Status Geral: ⚠️ REQUER ATENÇÃO

| Issue | Quantidade | Severidade |
|-------|-----------|------------|
| Ghost Models (Prisma sem tabela) | **7** | 🟡 Média |
| Tabelas órfãs (Banco sem model) | **0** | 🟢 Nenhuma |
| Campos `*_id` sem `@relation` | **296** | 🔴 Alta |
| Índices Prisma não aplicados | **24** | 🟡 Média |
| Histórico de migrations inadequado | **1 baseline** | 🟡 Média |

### 🎯 Recomendações Prioritárias

1. **🔴 CRÍTICO — Adicionar `@relation`:** 296 campos `*_id` estão sem foreign keys declaradas. Isso impede integridade referencial e otimização de queries relacionais do Prisma. Priorizar `patient_id`, `clinic_id`, `user_id` e `dentist_id`.

2. **🟡 MÉDIO — Aplicar schema pendente:** 7 ghost models e 24 índices precisam ser criados no banco via `prisma db push` ou migration.

3. **🟡 MÉDIO — Normalizar migrations:** Estabelecer workflow de `migrate dev` → `migrate deploy` para versionamento adequado do schema em múltiplos ambientes.

4. **🟢 BAIXO — Monitorar:** O banco está consistente em relação a tabelas mapeadas (0 órfãs), o que indica bom controle de schema atual.

---

*Relatório gerado automaticamente por agente de auditoria database.*

