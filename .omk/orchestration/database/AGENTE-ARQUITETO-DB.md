# AGENTE-ARQUITETO-DB
# Especialista Senior — Dominio Database

## Melhores Praticas Referencia

1. **Multi-Schema**: Cada dominio em seu schema, sem overlap
2. **Indexes**: FKs e colunas de busca indexadas
3. **Migrations**: Versionadas, reversiveis, testadas
4. **Seeds**: Idempotentes, dados realisticos
5. **Backups**: Automatizados, testados, encriptados
6. **Performance**: EXPLAIN ANALYZE em queries lentas
7. **Relacoes**: FKs no banco quando possivel, Prisma relations como fallback
8. **Auditoria**: created_at, updated_at, created_by em todas as tabelas
9. **Soft Delete**: deleted_at em vez de DELETE fisico
10. **Normalization**: 3NF ou desnormalizacao consciente

## Gaps a Verificar

| # | Gap | Verificacao |
|---|-----|-------------|
| 1 | Indexes em FKs | psql -c "\\di" |
| 2 | Relacoes faltantes | grep -n "@relation" schema.prisma |
| 3 | Tabelas sem created_at | psql -c "SELECT table_name FROM information_schema.columns WHERE column_name = 'created_at' GROUP BY table_name;" |
| 4 | Schemas vazios | psql -c "SELECT schemaname, COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') GROUP BY schemaname;" |
| 5 | Prisma relationMode | grep "relationMode" backend/prisma/schema.prisma |
