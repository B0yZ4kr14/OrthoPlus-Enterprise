# Feature Specification: Ferramentas Administrativas

**Short Name**: `admin-tools`
**Feature Branch**: `[039-admin-tools]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Administration

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Ferramentas Administrativas** fornece funcionalidades de alto nível para administradores do OrthoPlus Enterprise, incluindo ADRs (Architecture Decision Records), wiki interno, gerenciamento de root users, proxy GitHub, health check do banco e busca global.

### Motivation
Centralizar ferramentas administrativas críticas em um único módulo, facilitando a gestão técnica e documentação do sistema.

### Scope
**Inclui:**
- ADRs (Architecture Decision Records)
- Wiki interno
- Criação de root user (endpoint perigoso, protegido)
- Health check do banco
- Proxy GitHub
- Busca global

**Exclui:**
- Gestão de usuários comuns (módulo auth)
- Configurações de sistema (módulo configuracoes)
- Logs de auditoria (módulo database_admin)
- Deploy e CI/CD

---

## 2. User Stories

### Story 1 — Criar ADR (P1)
**As a** arquiteto de software
**I want** criar um ADR
**So that** eu documente decisões arquiteturais

**Acceptance Criteria:**
- Campos: title, decision, consequences, context, status, adr_number
- Tags opcionais
- Alternativas consideradas
- Criado por usuário autenticado

### Story 2 — Gerenciar Wiki (P1)
**As a** administrador
**I want** criar e gerenciar páginas wiki
**So that** eu documente processos internos

**Acceptance Criteria:**
- CRUD de páginas wiki
- Campos: title, content, slug, category, version, is_published
- Tags e parent_id opcionais
- Versionamento

### Story 3 — Health Check do Banco (P2)
**As a** administrador de TI
**I want** verificar a saúde do banco
**So that** eu detecte problemas

**Acceptance Criteria:**
- Conexões ativas
- Tamanho das tabelas
- Status: healthy
- Apenas ADMIN/ROOT

### Story 4 — Busca Global (P2)
**As a** administrador
**I want** buscar em todas as entidades
**So that** eu encontre informações rapidamente

**Acceptance Criteria:**
- Busca em pacientes e dentistas
- Filtro por entityType
- Query obrigatória

---

## 3. Functional Requirements

### ADM-FR-001: ADRs
**Description**: CRUD de Architecture Decision Records.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/admin_tools/adrs
- POST /api/admin_tools/adrs
- Campos: title, decision, consequences, context, status, adr_number, alternatives_considered, tags
- clinic_id obrigatório
- Criado por usuário autenticado
- ListAdrsUseCase + CreateAdrUseCase

### ADM-FR-002: Wiki
**Description**: CRUD de páginas wiki.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/admin_tools/wiki
- POST /api/admin_tools/wiki
- PATCH /api/admin_tools/wiki/:id
- DELETE /api/admin_tools/wiki/:id
- Campos: title, content, slug, category, version, is_published, tags, parent_id
- clinic_id obrigatório
- ListWikiEntriesUseCase + CreateWikiEntryUseCase + UpdateWikiEntryUseCase + DeleteWikiEntryUseCase

### ADM-FR-003: Criar Root User
**Description**: Criar usuário root (endpoint perigoso).
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/admin_tools/create-root-user
- Apenas super_admin
- ENABLE_DANGEROUS_ADMIN_ENDPOINTS === "true"
- Campos: email, name
- tenantId fixo: "00000000-0000-0000-0000-000000000000"
- Atualização de role para ROOT
- Retorno: message, user

### ADM-FR-004: Health Check do Banco
**Description**: Verificar saúde do banco de dados.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/admin_tools/analyze-database-health
- Apenas ADMIN/ROOT
- activeConnections, tableSizes
- Status: healthy

### ADM-FR-005: Proxy GitHub
**Description**: Proxy para API do GitHub.
**Priority**: Should Have
**Acceptance Criteria**:
- ALL /api/admin_tools/github-proxy
- URL obrigatória (api.github.com apenas)
- Método: GET, POST, PUT, DELETE
- Headers: Authorization com GITHUB_TOKEN
- Validação estrita de URL (https, hostname)

### ADM-FR-006: Busca Global
**Description**: Buscar em todas as entidades.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/admin_tools/global-search
- Query obrigatória
- Filtro por entityType (patients, dentists)
- Scope por clinic_id

---

## 4. Non-Functional Requirements

### Performance
- Listagem: < 300ms
- Busca: < 500ms

### Security
- clinicId obrigatório
- Apenas ADMIN para operações sensíveis
- Endpoint root user protegido por env var
- Proxy GitHub com validação de URL
- Dados criptografados em repouso

### Usability
- Interface de wiki com editor
- Listagem de ADRs
- Busca global com filtros
- Dashboard administrativo

---

## 5. Success Criteria

### ADM-SC-001: Documentação
**Description**: 100% das decisões arquiteturais documentadas em ADR
**Target**: 100%
**Measurement**: Contagem de ADRs

### ADM-SC-002: Segurança
**Description**: Zero acessos não autorizados ao endpoint root user
**Target**: 100%
**Measurement**: Audit logs

---

## 6. User Scenarios & Testing

### Scenario 1: Criar ADR
**Given** um arquiteto logado
**When** ele cria um ADR sobre nova arquitetura
**Then** o ADR é salvo com número sequencial

### Scenario 2: Criar Wiki
**Given** um admin logado
**When** ele cria uma página wiki
**Then** a página é publicada e listada

### Scenario 3: Health Check
**Given** um admin logado
**When** ele consulta a saúde do banco
**Then** retorna conexões ativas e tamanho das tabelas

---

## 7. Edge Cases

### EC-001: Endpoint Root User Desativado
**Condition**: ENABLE_DANGEROUS_ADMIN_ENDPOINTS !== "true"
**Expected Behavior**: Erro 404 "Endpoint"

### EC-002: Usuário Não Super Admin
**Condition**: Usuário sem role super_admin tenta criar root
**Expected Behavior**: Erro 403 "Requires super_admin role"

### EC-003: URL GitHub Inválida
**Condition**: URL não é api.github.com
**Expected Behavior**: Erro 400 "Invalid GitHub URL"

---

## 8. Key Entities

### Entity: ADR
**Attributes**:
- id (UUID)
- clinic_id (String)
- title (String)
- decision (String)
- consequences (String)
- context (String)
- status (String)
- adr_number (Int)
- alternatives_considered (String)
- tags (String[])
- created_by (UUID)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: WikiPage
**Attributes**:
- id (UUID)
- clinic_id (String)
- title (String)
- content (String)
- slug (String)
- category (String)
- version (Int)
- is_published (Boolean)
- tags (String[])
- parent_id (UUID | null)
- created_by (UUID)
- createdAt (DateTime)
- updatedAt (DateTime)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin_tools/adrs | Listar ADRs |
| POST | /api/admin_tools/adrs | Criar ADR |
| GET | /api/admin_tools/wiki | Listar wiki |
| POST | /api/admin_tools/wiki | Criar wiki |
| PATCH | /api/admin_tools/wiki/:id | Atualizar wiki |
| DELETE | /api/admin_tools/wiki/:id | Excluir wiki |
| POST | /api/admin_tools/create-root-user | Criar root user |
| GET | /api/admin_tools/analyze-database-health | Health check |
| ALL | /api/admin_tools/github-proxy | Proxy GitHub |
| GET | /api/admin_tools/global-search | Busca global |

---

## 10. Dependencies & Assumptions

### Dependencies
- `auth` — autenticação e roles
- `database_admin` — health check
- `github_tools` — proxy GitHub

### Assumptions
- ADRs são documentações técnicas
- Wiki é documentação interna
- Root user é para emergências apenas
- Proxy GitHub é para integrações internas

---

## 11. Out of Scope

- Gestão de usuários comuns
- Configurações de sistema
- Logs de auditoria
- Deploy e CI/CD
- Gestão de permissões detalhadas

---

## 12. Notes

- Backend: módulo `admin_tools` com Prisma
- clinicGuard obrigatório
- Use cases: ListAdrs, CreateAdr, ListWiki, CreateWiki, UpdateWiki, DeleteWiki
- Endpoint root user protegido por ENABLE_DANGEROUS_ADMIN_ENDPOINTS
- Proxy GitHub com validação rigorosa de URL
- Frontend: rota `/admin/*`
