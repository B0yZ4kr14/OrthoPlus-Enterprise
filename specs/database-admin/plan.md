# Plan: Administração de Banco de Dados

## Overview
Fornecer ferramentas para monitoramento, manutenção e gestão da infraestrutura de dados do OrthoPlus Enterprise, incluindo health checks, audit logs, slow queries, circuit breakers e backup scheduling.

## Architecture
- Frontend: `apps/web/src/modules/admin/` — dashboard de saúde do banco, logs, circuit breakers
- Backend: `backend/src/modules/database_admin/` — controllers, serviços de manutenção
- Database: schema `database_admin` com tabelas de health, audit_logs, slow_queries

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/database_admin/`
- [ ] Verificar/criar tabelas de audit log e slow queries no schema `database_admin`
- [ ] Verificar extensão `pg_stat_statements` e tabela fallback
- [ ] Configurar integração com Prometheus metrics

### Phase 2: Implementation
- [ ] Implementar health check com conexões, slow queries, VACUUM/ANALYZE
- [ ] Implementar CRUD de audit logs com filtros e join com profiles
- [ ] Implementar operações de manutenção (VACUUM, ANALYZE, REINDEX) com validação de schema
- [ ] Implementar consulta de slow queries (pg_stat_statements ou fallback)
- [ ] Implementar estatísticas de pool de conexões
- [ ] Implementar circuit breakers (metrics, reset por categoria, reset global)
- [ ] Implementar endpoints de master database (health, stats, cross-query)
- [ ] Implementar backup scheduler

### Phase 3: Polish
- [ ] Criar dashboard de saúde do banco com gráficos
- [ ] Criar interface de logs de auditoria com filtros
- [ ] Criar painel de circuit breakers com reset
- [ ] Adicionar alertas automáticos para degraded status
- [ ] Documentar operações de manutenção e seus impactos

## Risks
- Operações de manutenção (VACUUM_FULL, REINDEX) podem travar tabelas
- Validação de schema target é crítica para prevenir SQL injection
- pg_stat_statements pode não estar disponível em todas as instalações
