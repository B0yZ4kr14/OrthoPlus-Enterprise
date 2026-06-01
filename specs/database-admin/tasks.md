# Tasks: Administração de Banco de Dados

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/database_admin/` e mapear gaps vs spec.md
- [ ] T2: Verificar/criar tabelas `audit_logs` e `slow_queries` no schema `database_admin` do Prisma
- [ ] T3: Verificar disponibilidade da extensão `pg_stat_statements` e preparar fallback
- [ ] T4: Configurar integração com `prometheusMetrics` existente no projeto

## Phase 2: Implementation
- [ ] T5: Implementar `GET /api/database_admin/health` retornando conexões ativas/idle/pool, slow queries count, tempo médio, último VACUUM/ANALYZE
- [ ] T6: Implementar `GET /api/database_admin/audit_logs` e `POST /api/database_admin/audit_logs` com filtros (user_id, action, período), join com profiles, máximo 100 registros
- [ ] T7: Implementar `POST /api/database_admin/maintenance` com operações VACUUM, ANALYZE, REINDEX, VACUUM_FULL e validação rigorosa de schema target (regex seguro)
- [ ] T8: Implementar `GET /api/database_admin/slow_queries` via serviço, com fallback para pg_stat_statements ou tabela slow_queries, ordenado por execution_time DESC, limite 50
- [ ] T9: Implementar `GET /api/database_admin/connection_pool` retornando maxConnections, activeConnections, idleConnections, waitingConnections, connectionsByModule
- [ ] T10: Implementar circuit breakers: `GET /api/database_admin/circuit/metrics`, `POST /api/database_admin/circuit/reset/:category`, `POST /api/database_admin/circuit/reset-all`
- [ ] T11: Implementar master database endpoints (`/categories`, `/master/health`, `/master/stats`, `/master/cross-query`)
- [ ] T12: Implementar backup scheduler (`GET /master/backups`, `POST /master/backup/:category`)

## Phase 3: Polish
- [ ] T13: Criar dashboard de saúde do banco no frontend com gráficos de conexões e slow queries
- [ ] T14: Criar interface de logs de auditoria com filtros avançados e paginação
- [ ] T15: Criar painel de circuit breakers com visualização de status e botões de reset
- [ ] T16: Adicionar testes unitários em `backend/tests/unit/` para health check e manutenção
- [ ] T17: Documentar impacto de cada operação de manutenção e tempo estimado
