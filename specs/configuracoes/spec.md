# Feature Specification: Configurações e Módulos

**Short Name**: `configuracoes`
**Feature Branch**: `[038-configuracoes]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Core Infrastructure

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Configurações e Módulos** gerencia o catálogo de módulos do OrthoPlus Enterprise, permitindo que clínicas ativem/desativem funcionalidades, gerenciem dependências entre módulos e configurem backups agendados.

### Motivation
Permitir que cada clínica personalize seu OrthoPlus ativando apenas os módulos necessários, com gestão automática de dependências e sugestões inteligentes.

### Scope
**Inclui:**
- Catálogo de módulos
- Ativação/desativação de módulos
- Gestão de dependências entre módulos
- Sugestões de módulos
- Sequência recomendada de ativação
- Templates de módulos
- Importação/exportação de dados da clínica
- Backups agendados

**Exclui:**
- Configurações de faturamento
- Configurações de LGPD
- Configurações de notificações
- Configurações de tema

---

## 2. User Stories

### Story 1 — Ativar Módulo (P1)
**As a** administrador
**I want** ativar um módulo
**So that** eu use uma nova funcionalidade

**Acceptance Criteria:**
- Verificação de dependências
- Módulo não ativa se dependências não atendidas
- Retorno: success, module, message
- Status 412 se dependências não atendidas

### Story 2 — Desativar Módulo (P1)
**As a** administrador
**I want** desativar um módulo
**So that** eu simplifique a interface

**Acceptance Criteria:**
- Verificação de dependentes ativos
- Módulo não desativa se tiver dependentes
- Retorno: success, module, message
- Status 412 se tiver dependentes

### Story 3 — Ver Catálogo (P1)
**As a** administrador
**I want** visualizar o catálogo de módulos
**So that** eu saiba o que está disponível

**Acceptance Criteria:**
- Lista completa de módulos
- Status: ativo/inativo
- Dependências
- Dependentes ativos
- Ícone, descrição, categoria

### Story 4 — Configurar Backup Agendado (P2)
**As a** administrador
**I want** configurar backups automáticos
**So that** meus dados estejam seguros

**Acceptance Criteria:**
- Listar backups agendados
- Atualizar configuração
- Excluir backup agendado
- Scope por clinic_id

---

## 3. Functional Requirements

### CFG-FR-001: Catálogo de Módulos
**Description**: Listar catálogo completo de módulos.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/configuracoes/modulos
- Campos: id, module_key, name, description, category, icon, subscribed, is_active, can_activate, can_deactivate, unmet_dependencies, active_dependents
- Dados hardcoded (MODULE_CATALOG)
- Sem necessidade de clinic context

### CFG-FR-002: Dependências
**Description**: Listar dependências entre módulos.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/configuracoes/modulos/dependencies
- Retorno: module_key, depends_on[]
- Apenas módulos com dependências

### CFG-FR-003: Ativar/Desativar Módulo por Key
**Description**: Toggle módulo por module_key.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/configuracoes/modulos/toggle
- Body: module_key
- Validação de dependências antes de ativar
- Validação de dependentes antes de desativar
- Erro 412: "Dependencias nao atendidas" ou "Modulo tem dependentes ativos"
- Erro 404: módulo não encontrado

### CFG-FR-004: Ativar/Desativar Módulo por ID
**Description**: Toggle módulo por ID.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/configuracoes/modulos/:id/toggle
- Mesma lógica de dependências
- Validação de ID

### CFG-FR-005: Aplicar Template
**Description**: Aplicar template de módulos.
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/configuracoes/apply-template
- Retorno: message

### CFG-FR-006: Sugerir Módulos
**Description**: Sugerir módulos baseado no uso.
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/configuracoes/suggest
- Retorno: id, name, reason

### CFG-FR-007: Sequência Recomendada
**Description**: Recomendar sequência de ativação.
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/configuracoes/recommend-sequence
- Retorno: sequence[]

### CFG-FR-008: Importar Dados
**Description**: Importar dados para a clínica.
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/configuracoes/import-data
- Body: data[]
- Retorno: message, processed

### CFG-FR-009: Exportar Dados
**Description**: Exportar dados da clínica.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/configuracoes/export-data
- Retorno: export[], format
- Scope por clinic_id

### CFG-FR-010: Backups Agendados
**Description**: CRUD de backups agendados.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/configuracoes/backups/agendados
- PATCH /api/configuracoes/backups/agendados/:id
- DELETE /api/configuracoes/backups/agendados/:id
- Scope por clinic_id

---

## 4. Non-Functional Requirements

### Performance
- Listagem: < 100ms
- Toggle: < 200ms

### Security
- clinicId obrigatório para operações de toggle
- Dados hardcoded não requerem auth
- Apenas usuários autenticados para modificações

### Usability
- Interface de catálogo de módulos
- Indicadores visuais de dependências
- Sugestões inteligentes
- Templates pré-configurados

---

## 5. Success Criteria

### CFG-SC-001: Consistência
**Description**: 100% dos módulos ativos têm dependências atendidas
**Target**: 100%
**Measurement**: Verificação de dependências

### CFG-SC-002: Disponibilidade
**Description**: Catálogo disponível 99.9% do tempo
**Target**: 99.9%
**Measurement**: Health checks

---

## 6. User Scenarios & Testing

### Scenario 1: Ativar Módulo
**Given** o módulo CRM com dependência em PACIENTES
**When** o admin tenta ativar CRM sem PACIENTES ativo
**Then** erro 412 "Dependencias nao atendidas: pacientes"

### Scenario 2: Desativar Módulo
**Given** o módulo PACIENTES ativo com CRM ativo
**When** o admin tenta desativar PACIENTES
**Then** erro 412 "Modulo tem dependentes ativos: CRM"

### Scenario 3: Catálogo
**Given** um usuário logado
**When** ele acessa o catálogo
**Then** lista completa com status e dependências

---

## 7. Edge Cases

### EC-001: Módulo Inexistente
**Condition**: module_key não encontrado
**Expected Behavior**: Erro 404

### EC-002: Dependência Circular
**Condition**: Módulo A depende de B, B depende de A
**Expected Behavior**: Prevenido pelo catálogo hardcoded

### EC-003: Desativar Último Módulo
**Condition**: Tentativa de desativar todos os módulos
**Expected Behavior**: Permitido (sem restrição)

---

## 8. Key Entities

### Entity: CatalogModule
**Attributes**:
- id (Int)
- module_key (String)
- name (String)
- description (String)
- category (String)
- icon (String)
- dependencies (String[])
- is_active (Boolean)
- subscribed (Boolean)

### Entity: ClinicModule
**Attributes**:
- id (Int)
- clinic_id (String)
- module_catalog_id (Int)
- is_active (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: ScheduledBackup
**Attributes**:
- id (UUID)
- clinic_id (String)
- name (String)
- frequency (String)
- retention_days (Int)
- is_active (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/configuracoes/modulos | Catálogo de módulos |
| GET | /api/configuracoes/modulos/dependencies | Dependências |
| POST | /api/configuracoes/modulos/toggle | Toggle por key |
| POST | /api/configuracoes/modulos/:id/toggle | Toggle por ID |
| POST | /api/configuracoes/apply-template | Aplicar template |
| POST | /api/configuracoes/suggest | Sugerir módulos |
| POST | /api/configuracoes/recommend-sequence | Sequência recomendada |
| POST | /api/configuracoes/import-data | Importar dados |
| GET | /api/configuracoes/export-data | Exportar dados |
| GET | /api/configuracoes/backups/agendados | Listar backups |
| PATCH | /api/configuracoes/backups/agendados/:id | Atualizar backup |
| DELETE | /api/configuracoes/backups/agendados/:id | Excluir backup |

---

## 10. Dependencies & Assumptions

### Dependencies
- `auth` — autenticação
- `relatorios` — importação/exportação
- `database_admin` — backups

### Assumptions
- Catálogo é hardcoded (MODULE_CATALOG)
- Dependências são definidas no código
- Cada clínica tem sua própria configuração

---

## 11. Out of Scope

- Configurações de faturamento
- Configurações de LGPD
- Configurações de notificações
- Configurações de tema
- Licenciamento de módulos

---

## 12. Notes

- Backend: módulo `configuracoes` com Prisma
- clinicGuard obrigatório para operações de modificação
- Catálogo hardcoded em moduleCatalog.ts
- Dependências validadas no toggle
- Frontend: rota `/configuracoes`
