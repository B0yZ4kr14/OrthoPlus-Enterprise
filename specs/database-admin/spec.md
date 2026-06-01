# Feature Specification: Administração de Banco de Dados

**Short Name**: `database-admin`
**Feature Branch**: `[032-database-admin]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Infrastructure

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Administração de Banco de Dados** fornece ferramentas para monitoramento, manutenção e gestão da infraestrutura de dados do OrthoPlus Enterprise, incluindo health checks, audit logs, slow queries, circuit breakers e backup scheduling.

### Motivation
Garantir a saúde, performance e disponibilidade do banco de dados PostgreSQL através de ferramentas administrativas integradas.

### Scope
**Inclui:**
- Health checks do banco de dados
- Logs de auditoria administrativos
- Consultas lentas (slow queries)
- Operações de manutenção (VACUUM, ANALYZE, REINDEX)
- Estatísticas de pool de conexões
- Master database (federation hub)
- Circuit breakers por categoria
- Agendamento de backups

**Exclui:**
- Migrações de schema (Prisma migrations)
- Replicação de dados
- Sharding
- Tuning de queries específicas

---

## 2. User Stories

### Story 1 — Verificar Saúde do Banco (P1)
**As a** administrador de TI
**I want** verificar a saúde do banco de dados
**So that** eu detecte problemas antes que afetem usuários

**Acceptance Criteria:**
- Conexões ativas, idle, pool size
- Consultas lentas count
- Tempo médio de execução
- Último VACUUM e ANALYZE
- Status: healthy, degraded, critical

### Story 2 — Executar Manutenção (P1)
**As a** administrador de TI
**I want** executar operações de manutenção
**So that** eu otimize a performance do banco

**Acceptance Criteria:**
- Operações: VACUUM, ANALYZE, REINDEX, VACUUM_FULL
- Validação de schema target
- Apenas ADMIN
- Log de execução

### Story 3 — Consultar Logs de Auditoria (P2)
**As a** auditor/DPO
**I want** consultar logs de auditoria administrativos
**So that** eu acompanhe operações críticas

**Acceptance Criteria:**
- Filtros: user_id, action, período
- Join com perfis de usuário
- Máximo 100 registros
- Ordenação por data decrescente

### Story 4 — Gerenciar Circuit Breakers (P2)
**As a** administrador de TI
**I want** visualizar e resetar circuit breakers
**So that** eu restaure serviços após falhas

**Acceptance Criteria:**
- Métricas de circuit breakers por categoria
- Reset individual por categoria
- Reset global
- Integração com Prometheus metrics

---

## 3. Functional Requirements

### DBA-FR-001: Health Check
**Description**: Verificar saúde do banco de dados.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/database_admin/health
- Conexões ativas/idle/pool
- Slow queries count
- Tempo médio de execução
- Último VACUUM/ANALYZE
- Status: isHealthy, needsMaintenance

### DBA-FR-002: Logs de Auditoria
**Description**: Consultar logs de auditoria.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/database_admin/audit_logs
- POST /api/database_admin/audit_logs
- Filtros: user_id, action, from, to
- Join com profiles para nome do usuário
- Máximo 100 registros
- Ordenação decrescente

### DBA-FR-003: Manutenção
**Description**: Executar operações de manutenção.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/database_admin/maintenance
- Operações: VACUUM, ANALYZE, REINDEX, VACUUM_FULL
- Validação de schema target (regex seguro)
- Apenas ADMIN
- Retorno: success, operation, startedAt, message

### DBA-FR-004: Slow Queries
**Description**: Consultar queries lentas.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/database_admin/slow_queries (via service)
- Query na tabela database_admin.slow_queries
- Fallback para pg_stat_statements
- Ordenação por execution_time DESC
- Limite: 50 registros

### DBA-FR-005: Pool de Conexões
**Description**: Estatísticas do pool de conexões.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/database_admin/connection_pool (via service)
- maxConnections, activeConnections, idleConnections, waitingConnections
- connectionsByModule (application_name)

### DBA-FR-006: Master Database
**Description**: Gerenciamento do master database (federation hub).
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/database_admin/categories
- GET /api/database_admin/master/health
- GET /api/database_admin/master/stats
- POST /api/database_admin/master/cross-query
- Filtros e query cross-schema

### DBA-FR-007: Circuit Breakers
**Description**: Gerenciar circuit breakers.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/database_admin/circuit/metrics
- POST /api/database_admin/circuit/reset/:category
- POST /api/database_admin/circuit/reset-all
- Integração com prometheusMetrics

### DBA-FR-008: Backup Scheduler
**Description**: Gerenciar backups agendados.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/database_admin/master/backups
- POST /api/database_admin/master/backup/:category
- Status de backup por categoria
- Compressão opcional
- Métricas Prometheus

---

## 4. Non-Functional Requirements

### Performance
- Health check: < 500ms
- Listagem de logs: < 300ms
- Manutenção: depende da operação

### Security
- Apenas ADMIN para manutenção
- clinicId obrigatório
- Validação de schema target (injeção SQL)
- Audit log de operações de manutenção
- Dados sensíveis criptografados

### Usability
- Dashboard de saúde do banco
- Gráficos de conexões e slow queries
- Alertas automáticos

---

## 5. Success Criteria

### DBA-SC-001: Disponibilidade
**Description**: Health check disponível 99.9% do tempo
**Target**: 99.9%
**Measurement**: Health checks periódicos

### DBA-SC-002: Performance
**Description**: Zero slow queries com execution_time > 5s
**Target**: Zero
**Measurement**: Tabela slow_queries

---

## 6. User Scenarios & Testing

### Scenario 1: Health Check
**Given** o banco operando normalmente
**When** o admin consulta /health
**Then** retorna status healthy com métricas atualizadas

### Scenario 2: Manutenção
**Given** o banco precisando de VACUUM
**When** o admin executa POST /maintenance
**Then** a operação é executada e o resultado é retornado

### Scenario 3: Reset Circuit Breaker
**Given** um circuit breaker aberto
**When** o admin executa reset
**Then**: o circuit breaker é fechado e o serviço retoma

---

## 7. Edge Cases

### EC-001: Schema Inválido
**Condition**: Nome de schema não passa na regex de validação
**Expected Behavior**: Erro 400 "Nome de schema invalido"

### EC-002: Sem Permissão
**Condition**: Usuário não-ADMIN tenta executar manutenção
**Expected Behavior**: Erro 403 "Acesso negado"

### EC-003: pg_stat_statements Indisponível
**Condition**: Extensão não instalada
**Expected Behavior**: Fallback para slow_queries table ou lista vazia

---

## 8. Key Entities

### Entity: DatabaseHealth
**Attributes**:
- id (UUID)
- clinicId (String)
- connectionPoolSize (Int)
- activeConnections (Int)
- idleConnections (Int)
- slowQueriesCount (Int)
- averageQueryTime (Float)
- diskUsagePercent (Int)
- lastVacuum (DateTime)
- lastAnalyze (DateTime)
- timestamp (DateTime)

**Methods**:
- isHealthy(): status geral
- needsMaintenance(): verifica se precisa de VACUUM/ANALYZE

### Entity: AuditLog
**Attributes**:
- id (UUID)
- clinic_id (String)
- user_id (UUID)
- action (String)
- action_type (String)
- details (JSON)
- ip_address (String)
- createdAt (DateTime)

---

## 9. API Endpoints

### Database Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/database_admin/maintenance | Executar manutenção |
| GET | /api/database_admin/health | Health check |
| GET | /api/database_admin/audit_logs | Listar logs |
| POST | /api/database_admin/audit_logs | Criar log |

### Master Database
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/database_admin/categories | Listar categorias |
| GET | /api/database_admin/master/health | Health master |
| GET | /api/database_admin/master/stats | Estatísticas |
| POST | /api/database_admin/master/cross-query | Query cross-schema |
| GET | /api/database_admin/circuit/metrics | Métricas circuit breaker |
| POST | /api/database_admin/circuit/reset/:category | Reset circuit |
| POST | /api/database_admin/circuit/reset-all | Reset all circuits |
| GET | /api/database_admin/master/backups | Status backups |
| POST | /api/database_admin/master/backup/:category | Executar backup |

---

## 10. Dependencies & Assumptions

### Dependencies
- `auth` — autenticação e roles
- `configuracoes` — configurações de módulos
- `metrics` — Prometheus metrics

### Assumptions
- PostgreSQL com extensão pg_stat_statements (opcional)
- Tabela database_admin.slow_queries existe
- Circuit breakers configurados por categoria

---

## 11. Out of Scope

- Migrações de schema
- Replicação de dados
- Sharding
- Tuning de queries específicas
- Backup físico (arquivos)

---

## 12. Notes

- Backend: módulo `database_admin` com Prisma
- clinicGuard obrigatório
- Manutenção requer role ADMIN
- Validação rigorosa de schema target (prevenção SQL injection)
- Integração com Prometheus para métricas
- MasterDatabaseManager para federation hub
