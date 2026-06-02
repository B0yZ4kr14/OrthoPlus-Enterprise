# Tasks: Administração de Banco de Dados

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Auditar código existente em `backend/src/modules/database_admin/` e mapear gaps vs spec.md
- [x] T2: Verificar/criar tabelas `audit_logs` e `slow_queries` no schema `database_admin` do Prisma
- [x] T3: Verificar disponibilidade da extensão `pg_stat_statements` e preparar fallback
- [x] T4: Configurar integração com `prometheusMetrics` existente no projeto

## Phase 2: Implementation
- [x] T5: Implementar `GET /api/database_admin/health` retornando conexões ativas/idle/pool, slow queries count, tempo médio, último VACUUM/ANALYZE
- [x] T6: Implementar `GET /api/database_admin/audit_logs` e `POST /api/database_admin/audit_logs` com filtros (user_id, action, período), join com profiles, máximo 100 registros
- [x] T7: Implementar `POST /api/database_admin/maintenance` com operações VACUUM, ANALYZE, REINDEX, VACUUM_FULL e validação rigorosa de schema target (regex seguro)
- [x] T8: Implementar `GET /api/database_admin/slow_queries` via serviço, com fallback para pg_stat_statements ou tabela slow_queries, ordenado por execution_time DESC, limite 50
- [x] T9: Implementar `GET /api/database_admin/connection_pool` retornando maxConnections, activeConnections, idleConnections, waitingConnections, connectionsByModule
- [x] T10: Implementar circuit breakers: `GET /api/database_admin/circuit/metrics`, `POST /api/database_admin/circuit/reset/:category`, `POST /api/database_admin/circuit/reset-all`
- [x] T11: Implementar master database endpoints (`/categories`, `/master/health`, `/master/stats`, `/master/cross-query`)
- [x] T12: Implementar backup scheduler (`GET /master/backups`, `POST /master/backup/:category`)

## Phase 3: Polish
- [x] T13: Criar dashboard de saúde do banco no frontend com gráficos de conexões e slow queries
- [x] T14: Criar interface de logs de auditoria com filtros avançados e paginação
- [x] T15: Criar painel de circuit breakers com visualização de status e botões de reset
- [x] T16: Adicionar testes unitários em `backend/tests/unit/` para health check e manutenção
- [x] T17: Documentar impacto de cada operação de manutenção e tempo estimado
