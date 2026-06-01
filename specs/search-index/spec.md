# Feature Specification: Índice de Busca (Full-Text Search)

**Short Name**: `search-index`
**Feature Branch**: `[035-search-index]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Search & Discovery

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Índice de Busca** fornece busca full-text unificada em tempo real sobre entidades do OrthoPlus Enterprise (pacientes, agenda, PEP) utilizando PostgreSQL Full-Text Search (FTS) com caching Redis.

### Motivation
Permitir que usuários encontrem rapidamente qualquer informação no sistema através de uma busca unificada e performática.

### Scope
**Inclui:**
- Busca full-text em tempo real
- Filtro por módulo
- Cache de resultados (Redis)
- Reindexação completa e incremental
- Reindexação por entidade (pacientes, agenda, PEP)
- Health check do índice
- Snippets com highlight

**Exclui:**
- Busca fuzzy (aproximada)
- Busca semântica/vectorial
- Autocomplete/sugestões
- Busca em documentos (PDF, Word)

---

## 2. User Stories

### Story 1 — Buscar no Sistema (P1)
**As a** dentista
**I want** buscar por nome de paciente, procedimento ou agendamento
**So that** eu encontre informações rapidamente

**Acceptance Criteria:**
- Busca por texto livre
- Filtro por módulo (pacientes, agenda, pep)
- Paginação (padrão: 20, máximo: 100)
- Cache de 60 segundos
- Snippet com highlight
- Score de relevância

### Story 2 — Reindexar Dados (P2)
**As a** administrador de TI
**I want** reindexar os dados
**So that** a busca reflita as últimas alterações

**Acceptance Criteria:**
- Reindexação completa (force=true)
- Reindexação incremental (since=<data>)
- Por entidade: pacientes, agenda, PEP
- Rate limiting: 10 req/5min
- Invalidação de cache

### Story 3 — Monitorar Índice (P2)
**As a** administrador de TI
**I want** verificar a saúde do índice
**So that** eu detecte problemas

**Acceptance Criteria:**
- Health check: PostgreSQL, Redis, recency
- Latência por componente
- Contagem de registros indexados
- Status: healthy, degraded

---

## 3. Functional Requirements

### SCH-FR-001: Busca Full-Text
**Description**: Buscar em todas as entidades indexadas.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/search_index/
- Query param: q (obrigatório)
- Filtro: module (opcional)
- Paginação: page, limit
- Cache Redis (60 segundos)
- FTS PostgreSQL com websearch_to_tsquery('portuguese')
- Score de relevância (ts_rank)
- Snippet com highlight (<mark>)
- Escape HTML

### SCH-FR-002: Reindexar Pacientes
**Description**: Reindexar entidade de pacientes.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/search_index/reindex/pacientes
- Parâmetros: force (boolean) ou since (data ISO)
- Rate limit: 10 req/5min
- Invalidação de cache
- Retorno: indexed, durationMs

### SCH-FR-003: Reindexar Agenda
**Description**: Reindexar entidade de agenda.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/search_index/reindex/agenda
- Mesma lógica de reindexação
- Rate limit aplicado

### SCH-FR-004: Reindexar PEP
**Description**: Reindexar entidade de prontuários.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/search_index/reindex/pep
- Mesma lógica de reindexação
- Rate limit aplicado

### SCH-FR-005: Health Check
**Description**: Verificar saúde do índice de busca.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/search_index/health
- Checks:
  - postgresql: ping + contagem de registros
  - redis: ping + latência
  - indexRecency: última atualização
- Status: healthy (200) ou degraded (503)
- Latência total

---

## 4. Non-Functional Requirements

### Performance
- Busca: < 300ms (com cache)
- Reindexação: depende do volume
- Health check: < 500ms

### Security
- clinicId obrigatório
- Rate limiting em reindexação
- Escape HTML nos snippets
- SQL injection prevention (raw queries seguras)

### Usability
- Barra de busca global
- Filtros por módulo
- Highlight nos resultados
- Paginação intuitiva

---

## 5. Success Criteria

### SCH-SC-001: Precisão
**Description**: 95% dos resultados relevantes aparecem na primeira página
**Target**: 95%
**Measurement**: Feedback de usuários

### SCH-SC-002: Performance
**Description**: Busca retorna em menos de 300ms
**Target**: p99 < 300ms
**Measurement**: Logs de API

---

## 6. User Scenarios & Testing

### Scenario 1: Buscar Paciente
**Given** um paciente chamado "Maria Silva"
**When** o usuário busca "Maria"
**Then** o paciente aparece nos resultados com snippet e score

### Scenario 2: Reindexar
**Given** dados atualizados
**When** o admin executa reindexação completa
**Then** os novos dados são indexados e o cache é invalidado

### Scenario 3: Health Check
**Given** o sistema operando
**When** o admin consulta /health
**Then** retorna status healthy com métricas de PostgreSQL e Redis

---

## 7. Edge Cases

### EC-001: Query Vazia
**Condition**: Query parameter 'q' ausente ou vazio
**Expected Behavior**: Erro 400 "Query parameter 'q' is required"

### EC-002: Rate Limit
**Condition**: Mais de 10 reindexações em 5 minutos
**Expected Behavior**: Erro 429 "Reindex rate limit exceeded"

### EC-003: PostgreSQL Down
**Condition**: PostgreSQL indisponível
**Expected Behavior**: Health check retorna degraded (503)

---

## 8. Key Entities

### Entity: SearchIndex
**Attributes**:
- id (UUID)
- entity_type (String)
- entity_id (UUID)
- clinic_id (String)
- title (String)
- content (String)
- module (String)
- content_tsv (tsvector)
- updated_at (DateTime)

### Entity: SearchResult
**Attributes**:
- id (UUID)
- entityType (String)
- entityId (UUID)
- title (String)
- snippet (String)
- score (Number)
- module (String)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/search_index/ | Busca full-text |
| GET | /api/search_index/health | Health check |
| POST | /api/search_index/reindex/pacientes | Reindexar pacientes |
| POST | /api/search_index/reindex/agenda | Reindexar agenda |
| POST | /api/search_index/reindex/pep | Reindexar PEP |

---

## 10. Dependencies & Assumptions

### Dependencies
- `pacientes` — dados de pacientes
- `agenda` — dados de agendamentos
- `pep` — dados de prontuários
- PostgreSQL FTS
- Redis (cache)

### Assumptions
- Índice FTS em português
- Cache de 60 segundos
- Reindexação manual ou por eventos
- Tabela core.search_index existe

---

## 11. Out of Scope

- Busca fuzzy
- Busca semântica/vectorial
- Autocomplete
- Busca em documentos
- Elasticsearch/Solr

---

## 12. Notes

- Backend: módulo `search_index` com Prisma
- clinicGuard obrigatório
- Rate limiting em reindexação
- Cache Redis para buscas
- FTS PostgreSQL com websearch_to_tsquery
- Snippets com highlight e escape HTML
- CLI scripts para reindexação disponíveis
