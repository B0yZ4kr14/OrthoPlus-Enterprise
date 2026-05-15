# Critérios para Uso Legítimo de $queryRaw — OrthoPlus Enterprise

**Data:** 2026-05-15
**Versão:** 1.0
**Status:** Draft

## Princípio Geral

> **Prefira Prisma Client sobre `$queryRaw`.** O uso de `$queryRaw` deve ser a exceção, nunca a regra.

## Critérios para Uso Legítimo

### ✅ Permitido

1. **Consultas administrativas/auditoria**
   - Queries across multiple schemas para relatórios
   - Queries que agregam dados de múltiplas tabelas
   - Exemplo: `analyticsController.ts`, `admin_tools/controller.ts`

2. **Operações de manutenção de banco**
   - Vacuum, analyze, reindex
   - Verificação de integridade
   - Exemplo: `database_admin` module

3. **Migrações de dados**
   - Scripts de migration que não usam Prisma Migrate
   - Transformações batch complexas
   - Exemplo: `scripts/apply-prisma-schemas.py`

4. **Queries dinâmicas com SQL complexo**
   - CTEs (Common Table Expressions) recursivas
   - Window functions complexas
   - Full-text search nativo do PostgreSQL
   - Exemplo: relatórios BI com queries complexas

### ❌ Proibido

1. **CRUD simples**
   - Create, Read, Update, Delete de entidades individuais
   - Deve usar `prisma.model.create()`, `findMany()`, etc.

2. **Queries que podem ser expressas via Prisma Client**
   - Joins simples
   - Filtros com `where`
   - Ordenação com `orderBy`

3. **Queries sem parametrização**
   - Qualquer `$queryRaw` que concatene strings de entrada do usuário
   - Deve usar `$queryRaw` com tagged template literals e parâmetros

## Ocorrências Atuais (2026-05-15)

| Arquivo | Ocorrências | Classificação | Justificativa |
|---------|-------------|---------------|---------------|
| `CategoryDatabaseManager.ts` | 3 | ✅ Permitido | Admin/DB maintenance |
| `admin_tools/controller.ts` | 2 | ✅ Permitido | Admin queries |
| `analyticsController.ts` | 1 | ✅ Permitido | Analytics aggregation |
| `InventarioController.ts` | 2 | ⚠️ Revisar | Pode ser convertido para Prisma |
| `marketing/controller.ts` | 1 | ⚠️ Revisar | Pode ser convertido para Prisma |
| `notificationController.ts` | 5 | ⚠️ Revisar | Alta contagem, revisar necessidade |
| `dashboard/router.ts` | 1 | ⚠️ Revisar | Stub, remover quando implementar |
| `analytics/router.ts` | 1 | ⚠️ Revisar | Stub, remover quando implementar |

## Total: 16 ocorrências

**Meta:** Reduzir para ≤10 ocorrências até 2026-06-15.

## Processo de Aprovação

Para adicionar NOVAS ocorrências de `$queryRaw`:

1. Documentar a necessidade neste arquivo
2. Obter review de pelo menos 1 desenvolvedor senior
3. Adicionar teste de segurança (SQL injection)
4. Registrar em CHANGELOG.md
