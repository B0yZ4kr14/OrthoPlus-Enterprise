# Feature Specification: Integração GitHub

**Short Name**: `github-tools`
**Feature Branch**: `[034-github-tools]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P3 — DevOps Integration

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Integração GitHub** permite que clínicas conectem seus repositórios GitHub para monitorar branches, pull requests e workflows de CI/CD, facilitando a gestão de desenvolvimento de software interno ou de parceiros.

### Motivation
Integrar o fluxo de desenvolvimento do OrthoPlus Enterprise com GitHub, permitindo que administradores monitorem o estado de repositórios, branches, PRs e pipelines diretamente do sistema.

### Scope
**Inclui:**
- Listagem de repositórios conectados
- Conexão de novos repositórios
- Visualização de branches
- Visualização de pull requests
- Visualização de workflows (CI/CD)

**Exclui:**
- Criação de repositórios
- Merge de pull requests
- Execução de workflows
- Gerenciamento de issues
- Code review

---

## 2. User Stories

### Story 1 — Conectar Repositório (P1)
**As a** administrador de TI
**I want** conectar um repositório GitHub
**So that** eu possa monitorar o desenvolvimento

**Acceptance Criteria:**
- Campos: repoName, repoUrl, accessToken, defaultBranch
- Validação de URL GitHub
- Apenas ADMIN
- Token armazenado (deve ser criptografado em produção)
- Status: ativo

### Story 2 — Visualizar Branches (P2)
**As a** desenvolvedor
**I want** visualizar as branches de um repositório
**So that** eu acompanhe o desenvolvimento

**Acceptance Criteria:**
- Nome da branch
- Último commit
- Data do último update
- Ordenação por data

### Story 3 — Visualizar Pull Requests (P2)
**As a** desenvolvedor
**I want** visualizar os pull requests abertos
**So that** eu acompanhe o código em review

**Acceptance Criteria:**
- Título, autor, estado
- Data de criação
- Data de merge (se aplicável)
- Filtro por estado: OPEN, MERGED, CLOSED

---

## 3. Functional Requirements

### GIT-FR-001: Listar Repositórios
**Description**: Listar repositórios GitHub conectados.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/github_tools/repositories
- Mock data com exemplo
- Campos: id, repoName, repoUrl, defaultBranch, isPrivate, isActive, lastSyncAt
- accessToken omitido do JSON

### GIT-FR-002: Conectar Repositório
**Description**: Conectar um novo repositório GitHub.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/github_tools/repositories
- Schema Zod: repoName (min 1), repoUrl (URL), accessToken (min 10), defaultBranch (default: main)
- Apenas ADMIN
- clinicId obrigatório
- Token armazenado (nota: deve ser criptografado em produção)

### GIT-FR-003: Visualizar Branches
**Description**: Listar branches de um repositório.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/github_tools/repositories/:repoId/branches
- Mock branches com dados de exemplo
- Campos: name, lastCommit, lastUpdated

### GIT-FR-004: Visualizar Pull Requests
**Description**: Listar pull requests de um repositório.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/github_tools/repositories/:repoId/pull-requests
- Mock PRs com dados de exemplo
- Campos: id, title, state, author, createdAt, mergedAt

### GIT-FR-005: Visualizar Workflows
**Description**: Listar workflows (CI/CD) de um repositório.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/github_tools/repositories/:repoId/workflows
- Mock workflows com dados de exemplo
- Campos: id, name, status, lastRun, duration

---

## 4. Non-Functional Requirements

### Performance
- Listagem: < 200ms
- Conexão: < 500ms

### Security
- Apenas ADMIN para conectar
- clinicId obrigatório
- accessToken criptografado em repouso
- webhookSecret criptografado
- Dados omitidos do JSON de resposta

### Usability
- Interface de integração
- Cards de repositórios
- Status visual de workflows

---

## 5. Success Criteria

### GIT-SC-001: Confiabilidade
**Description**: 100% dos repositórios conectados listados com sucesso
**Target**: 100%
**Measurement**: Logs de API

### GIT-SC-002: Segurança
**Description**: Zero vazamentos de accessToken
**Target**: 100%
**Measurement**: Audit logs + code review

---

## 6. User Scenarios & Testing

### Scenario 1: Conectar Repositório
**Given** um administrador logado
**When** ele conecta o repositório "ortho-plus-main"
**Then** o repositório é salvo e aparece na lista

### Scenario 2: Visualizar Branches
**Given** um repositório conectado
**When** o usuário acessa a aba de branches
**Then** lista de branches com último commit é exibida

### Scenario 3: Visualizar PRs
**Given** um repositório conectado
**When** o usuário acessa a aba de pull requests
**Then** lista de PRs com estado é exibida

---

## 7. Edge Cases

### EC-001: Token Inválido
**Condition**: accessToken com menos de 10 caracteres
**Expected Behavior**: Erro 400 via Zod validation

### EC-002: URL Inválida
**Condition**: repoUrl não é uma URL válida
**Expected Behavior**: Erro 400 via Zod validation

### EC-003: Acesso Negado
**Condition**: Usuário não-ADMIN tenta conectar
**Expected Behavior**: Erro 403 "Acesso negado"

---

## 8. Key Entities

### Entity: GitHubRepository
**Attributes**:
- id (UUID)
- clinicId (String)
- repoName (String)
- repoUrl (String)
- defaultBranch (String)
- isPrivate (Boolean)
- accessToken (String) — criptografado
- webhookSecret (String | null) — criptografado
- lastSyncAt (DateTime | null)
- isActive (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

**Methods**:
- activate()/deactivate()
- updateSync()
- setWebhookSecret()
- toJSON(): omite accessToken e webhookSecret

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/github_tools/repositories | Listar repositórios |
| POST | /api/github_tools/repositories | Conectar repositório |
| GET | /api/github_tools/repositories/:repoId/branches | Listar branches |
| GET | /api/github_tools/repositories/:repoId/pull-requests | Listar PRs |
| GET | /api/github_tools/repositories/:repoId/workflows | Listar workflows |

---

## 10. Dependencies & Assumptions

### Dependencies
- `auth` — autenticação e roles
- `admin_tools` — proxy GitHub

### Assumptions
- GitHub é o único provedor suportado
- Dados são mockados (não há integração real com GitHub API)
- Apenas repositórios privados são suportados

---

## 11. Out of Scope

- Criação de repositórios
- Merge de pull requests
- Execução de workflows
- Gerenciamento de issues
- Code review
- Integração GitLab/Bitbucket

---

## 12. Notes

- Backend: módulo `github_tools`
- clinicGuard obrigatório
- Dados atualmente mockados
- Apenas ADMIN pode conectar repositórios
- Tokens devem ser criptografados em produção
- Frontend: interface administrativa
