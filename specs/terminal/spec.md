# Feature Specification: Terminal Web Shell

**Short Name**: `terminal`
**Feature Branch**: `[030-terminal]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Admin Tools

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Terminal Web Shell** fornece uma interface de terminal segura para administradores do OrthoPlus Enterprise. **Nota importante**: A execução de comandos está desativada por compliance LGPD; o módulo opera em modo de sessão apenas.

### Motivation
Fornecer uma interface administrativa de terminal para diagnóstico e monitoramento, com rastreabilidade completa de sessões.

### Scope
**Inclui:**
- Criação de sessões de terminal
- Rastreamento de atividade (IP, user-agent, comandos)
- Encerramento de sessões
- Histórico de comandos (estrutura preparada)

**Exclui:**
- Execução real de comandos shell (desativado por LGPD)
- Acesso SSH direto
- Upload/download de arquivos via terminal

---

## 2. User Stories

### Story 1 — Criar Sessão de Terminal (P1)
**As a** administrador (ADMIN)
**I want** criar uma sessão de terminal web
**So that** eu possa acessar ferramentas administrativas

**Acceptance Criteria:**
- Apenas usuários com role ADMIN podem criar sessões
- Sessão com ID único (UUID)
- Registro de IP e user-agent
- Timeout de inatividade: 15 minutos
- Status: ACTIVE, IDLE, TERMINATED

### Story 2 — Encerrar Sessão (P2)
**As a** administrador
**I want** encerrar uma sessão de terminal
**So that** eu mantenha a segurança

**Acceptance Criteria:**
- Encerramento com timestamp
- Registro de quem encerrou
- Sessão marcada como TERMINATED

### Story 3 — Ver Histórico (P2)
**As a** administrador
**I want** visualizar o histórico de comandos
**So that** eu audite as atividades

**Acceptance Criteria:**
- Lista de comandos executados
- Timestamp de cada comando
- Status de execução

---

## 3. Functional Requirements

### TER-FR-001: Criar Sessão
**Description**: Criar uma nova sessão de terminal.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/terminal/sessions
- Apenas role ADMIN
- Retorno: session object com id, status, startedAt
- Registro de IP e user-agent
- Status inicial: ACTIVE

### TER-FR-002: Executar Comando
**Description**: Executar comando no terminal.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/terminal/execute
- **Desativado por LGPD**: retorna 501
- Mensagem: "Terminal feature is disabled for security compliance (LGPD). Use SSH for server access."

### TER-FR-003: Histórico de Comandos
**Description**: Obter histórico de comandos de uma sessão.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/terminal/sessions/:sessionId/history
- **Desativado por LGPD**: retorna 501

### TER-FR-004: Encerrar Sessão
**Description**: Encerrar uma sessão de terminal.
**Priority**: Must Have
**Acceptance Criteria**:
- DELETE /api/terminal/sessions/:sessionId
- Apenas ADMIN
- Retorno: sessionId, terminatedAt, message
- Status atualizado para TERMINATED

---

## 4. Non-Functional Requirements

### Performance
- Criação de sessão: < 100ms
- Encerramento: < 100ms

### Security
- Apenas role ADMIN
- Registro de IP e user-agent
- Timeout de inatividade: 15 minutos
- **Execução desativada por LGPD**
- Acesso negado (403) para não-administradores

### Usability
- Interface de terminal web (frontend)
- Indicador de status da sessão
- Mensagem clara sobre desativação LGPD

---

## 5. Success Criteria

### TER-SC-001: Segurança
**Description**: Zero execuções de comandos via terminal web
**Target**: 100% de bloqueio
**Measurement**: Logs de API (501 responses)

### TER-SC-002: Rastreabilidade
**Description**: 100% das sessões registradas com IP e user-agent
**Target**: 100%
**Measurement**: Audit logs

---

## 6. User Scenarios & Testing

### Scenario 1: Criar Sessão
**Given** um administrador logado
**When** ele cria uma sessão de terminal
**Then** uma sessão ACTIVE é criada com ID único

### Scenario 2: Tentativa de Comando
**Given** uma sessão ativa
**When** o admin tenta executar um comando
**Then** recebe 501 "Terminal feature is disabled for security compliance"

### Scenario 3: Encerrar Sessão
**Given** uma sessão ativa
**When** o admin encerra a sessão
**Then** a sessão é marcada como TERMINATED

---

## 7. Edge Cases

### EC-001: Usuário Não-Admin
**Condition**: Usuário sem role ADMIN tenta criar sessão
**Expected Behavior**: 403 "Acesso negado - apenas administradores"

### EC-002: Sessão Expirada
**Condition**: Sessão inativa por mais de 15 minutos
**Expected Behavior**: Status automático para IDLE

### EC-003: Sessão Já Encerrada
**Condition**: Tentativa de encerrar sessão já TERMINATED
**Expected Behavior**: Sucesso (idempotente)

---

## 8. Key Entities

### Entity: TerminalSession
**Attributes**:
- id (UUID)
- userId (UUID)
- clinicId (String)
- status (Enum): ACTIVE, IDLE, TERMINATED
- startedAt (DateTime)
- lastActivityAt (DateTime)
- terminatedAt (DateTime | null)
- commandsExecuted (Int)
- ipAddress (String)
- userAgent (String)

**Methods**:
- updateActivity(): atualiza lastActivityAt
- incrementCommandCount(): incrementa commandsExecuted
- terminate(): marca como TERMINATED
- isIdle(): verifica timeout de 15 minutos
- getDurationMs(): retorna duração da sessão

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/terminal/ | Status do módulo |
| POST | /api/terminal/sessions | Criar sessão |
| POST | /api/terminal/execute | Executar comando (desativado) |
| GET | /api/terminal/sessions/:sessionId/history | Histórico (desativado) |
| DELETE | /api/terminal/sessions/:sessionId | Encerrar sessão |

---

## 10. Dependencies & Assumptions

### Dependencies
- `auth` — autenticação e roles
- `lgpd` — compliance (motivo da desativação)

### Assumptions
- Apenas ADMINs têm acesso
- Execução de comandos nunca será ativada via web
- SSH é a alternativa recomendada

---

## 11. Out of Scope

- Execução real de comandos shell
- Upload/download via terminal
- Acesso a banco de dados via terminal
- Integração com CI/CD pipelines

---

## 12. Notes

- Backend: módulo `terminal`
- clinicGuard obrigatório
- Role ADMIN obrigatório para criação/encerramento
- Módulo intencionalmente limitado por compliance LGPD
- Frontend: interface visual do terminal (desativada)
