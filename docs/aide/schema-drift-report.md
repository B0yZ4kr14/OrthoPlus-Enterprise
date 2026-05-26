# Relatorio de Drift Schema — OrthoPlus Enterprise

**Gerado em:** 2026-05-26T15:40:32.285Z
**Database:** postgresql://***:***@localhost:5432/orthoplus?schema=public

## Resumo Executivo

| Metrica | Valor |
|--------|-------|
| Modelos Prisma | 189 |
| Campos escalares Prisma | 2338 |
| Tabelas no DB | 190 |
| Colunas no DB | 2347 |
| Tabelas ausentes no DB | 0 |
| Tabelas extras no DB | 1 |
| Mismatch de schema | 0 |
| Colunas ausentes no DB | 0 |
| Colunas extras no DB | 1 |
| Type mismatches | 0 |
| Nullability mismatches | 0 |

## Distribuicao por Severidade

| Severidade | Quantidade |
|------------|------------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 2 |

## Colunas Extras no Banco de Dados (1)

### search_index.content_tsv
- **Severidade:** LOW
- **Mensagem:** Coluna "search_index.content_tsv" existe no DB mas nao esta modelada no Prisma.
- **Recomendacao:** Adicionar campo ao model Prisma "search_index" ou remover a coluna se for obsoleta.

## Tabelas Extras no Banco de Dados (1)

### _prisma_migrations.
- **Severidade:** LOW
- **Mensagem:** Tabela "_prisma_migrations" no schema "public" existe no DB mas nao esta modelada no Prisma.
- **Recomendacao:** Adicionar model "_prisma_migrations" ao schema Prisma com @@schema("public") ou avaliar se a tabela e obsoleta e pode ser removida.

## Avaliacao de Risco por Drift

| Drift | Risco | Justificativa |
|-------|-------|---------------|
| Tabela ausente no DB | **Critical** | Quebra funcionalidades que dependem do model. Queries falham. |
| Mismatch de schema | **Critical** | Prisma aponta para schema errado; queries nao encontram tabela. |
| Coluna obrigatoria ausente | **High** | Inserts falham por campo NOT NULL faltante. |
| Type mismatch | **High** | Cast errors, perda de precisao ou falhas de serializacao. |
| Nullability mismatch | **High/Medium** | Inconsistencia de validacao; pode causar erros em runtime. |
| Coluna opcional ausente | **Medium** | Funcionalidade pode ficar incompleta; nao quebra inserts. |
| Tabela/Coluna extra no DB | **Low** | Dead code; sem impacto direto, mas polui schema. |

## Drifts Conhecidos em Producao (Contexto Fornecido)

> Os itens abaixo foram identificados como drift **especifico do ambiente de producao** e nao aparecem no banco de desenvolvimento local. Sao incluidos aqui para rastreabilidade e acao corretiva.

### patients.photo_url — Coluna Ausente no DB (High)

- **Severidade:** HIGH
- **Contexto:** O campo `photo_url` esta definido no model `patients` do Prisma schema, mas nao existe na tabela `pacientes.patients` em producao.
- **Risco:** Funcionalidades que leem ou gravam `photo_url` falharao em producao (erros de query ou retorno `null` inesperado).
- **Recomendacao:**
  ```sql
  ALTER TABLE "pacientes"."patients" ADD COLUMN "photo_url" TEXT;
  ```
  Ou executar `prisma migrate deploy` se a migration correspondente ja existir no historico.

### appointments — Mismatch de Schema (Critical)

- **Severidade:** CRITICAL
- **Contexto:** Em producao, a tabela `appointments` esta no schema `pacientes`, mas o Prisma schema a referencia no schema `agenda`.
- **Risco:** Todas as queries do Prisma para `appointments` falharao em producao por nao encontrar a tabela no schema esperado.
- **Recomendacao:**
  1. **Opcao A (corrigir DB):** Mover a tabela para o schema `agenda`:
     ```sql
     ALTER TABLE "pacientes"."appointments" SET SCHEMA "agenda";
     ```
     *Requer atualizar todas as FKs, indices e permissoes.*
  2. **Opcao B (corrigir Prisma):** Atualizar o model `appointments` no `schema.prisma` para `@@schema("pacientes")` se o schema `agenda` nao for o destino correto.

### _prisma_migrations — Tabela Ausente em Producao (Medium)

- **Severidade:** MEDIUM
- **Contexto:** A tabela `_prisma_migrations` nao existe no banco de producao. Ela e essencial para o controle de migrations do Prisma Migrate.
- **Risco:** Sem `_prisma_migrations`, nao e possivel usar `prisma migrate deploy` de forma confiavel. O estado das migrations fica opaco.
- **Recomendacao:**
  - Se a producao foi inicializada manualmente (sem Migrate), avaliar se o fluxo de migrations deve ser restaurado:
    1. Criar a tabela `_prisma_migrations` e inserir um registro `baseline` apontando para a migration atual:
       ```sql
       CREATE TABLE "public"."_prisma_migrations" (
         "id" varchar(36) PRIMARY KEY,
         "checksum" varchar(64) NOT NULL,
         "finished_at" timestamptz,
         "migration_name" varchar(255) NOT NULL,
         "logs" text,
         "rolled_back_at" timestamptz,
         "started_at" timestamptz NOT NULL DEFAULT now(),
         "applied_steps_count" integer NOT NULL DEFAULT 0
       );
       ```
    2. Inserir registro de baseline para a migration mais recente que ja esta aplicada.
  - Alternativamente, manter o controle de schema via migrations manuais auditadas, documentando a decisao.

## Plano de Migracao para Alinhamento

> **Aviso:** Este plano e uma recomendacao. Sempre faca backup e teste em staging antes de aplicar em producao.

### Fase 1 — Preparacao (Janela de manutencao)
1. Criar backup completo do banco de producao via pg_dump.
2. Verificar integridade do backup.
3. Notificar stakeholders sobre a janela de manutencao.

### Fase 2 — Correcoes de Schema

### Fase 3 — Validacao
1. Re-executar este script de diagnostico e confirmar zero drifts.
2. Rodar testes automatizados do backend.
3. Rodar smoke tests das funcionalidades criticas.

### Fase 4 — Cleanup (opcional)
- Avaliar remocao de tabelas e colunas marcadas como 'extras' apos validacao.
