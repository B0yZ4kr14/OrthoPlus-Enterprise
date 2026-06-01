# Feature Specification: LGPD — Compliance de Dados

**Short Name**: `lgpd`
**Feature Branch**: `[031-lgpd]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Compliance

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **LGPD** (Lei Geral de Proteção de Dados) gerencia consentimentos de pacientes, solicitações de dados (direitos do titular) e exportações de dados pessoais, garantindo conformidade com a legislação brasileira.

### Motivation
Garantir que o OrthoPlus Enterprise esteja em conformidade com a LGPD, permitindo que pacientes exerçam seus direitos (acesso, correção, exclusão, portabilidade) e que a clínica mantenha registros de consentimento.

### Scope
**Inclui:**
- Registro de consentimentos de pacientes
- Solicitações de direitos do titular (acesso, correção, exclusão, portabilidade)
- Gestão de status das solicitações
- Exportação de dados pessoais

**Exclui:**
- Anonimização automática de dados
- Políticas de privacidade (documento)
- Treinamento de equipe em LGPD
- Auditorias externas

---

## 2. User Stories

### Story 1 — Registrar Consentimento (P1)
**As a** recepcionista
**I want** registrar o consentimento de um paciente
**So that** a clínica tenha prova legal do consentimento

**Acceptance Criteria:**
- Tipo de consentimento (tratamento, marketing, compartilhamento)
- Status: granted ou revogado
- Associado a patient_id
- Data de expiração opcional

### Story 2 — Solicitar Dados (P1)
**As a** paciente
**I want** solicitar meus dados pessoais
**So that** eu exercite meu direito de acesso (LGPD)

**Acceptance Criteria:**
- Tipos: acesso, correção, exclusão, portabilidade
- Descrição da solicitação
- Status: PENDENTE, EM_ANALISE, ATENDIDA, NEGADA
- Registro de quem solicitou e quando

### Story 3 — Atender Solicitação (P1)
**As a** administrador/DPO
**I want** atualizar o status de uma solicitação
**So that** eu acompanhe o atendimento

**Acceptance Criteria:**
- Atualização parcial (PATCH)
- Campos: status, completed_at, response, responded_by
- Notificação ao paciente

---

## 3. Functional Requirements

### LGP-FR-001: Gestão de Consentimentos
**Description**: CRUD de consentimentos de pacientes.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/lgpd/consentimentos
- POST /api/lgpd/consentimentos
- Filtro por patient_id
- Campos: consent_type, granted, patient_id, expires_at
- clinic_id obrigatório

### LGP-FR-002: Solicitações de Direitos
**Description**: CRUD de solicitações de direitos do titular.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/lgpd/solicitacoes
- POST /api/lgpd/solicitacoes
- PATCH /api/lgpd/solicitacoes/:id
- Campos: request_type, patient_id, description, status
- Status padrão: PENDENTE
- Registro de requested_at e requested_by

### LGP-FR-003: Atualização de Solicitação
**Description**: Atualizar status e resposta de solicitação.
**Priority**: Must Have
**Acceptance Criteria**:
- PATCH /api/lgpd/solicitacoes/:id
- Campos editáveis: status, completed_at, response, responded_by
- Validação: solicitação deve existir
- clinic_id validado

### LGP-FR-004: Exportação de Dados
**Description**: Exportar dados pessoais de um paciente.
**Priority**: Should Have
**Acceptance Criteria**:
- Geração de arquivo JSON/CSV com todos os dados do paciente
- Inclusão de consentimentos, prontuários, agendamentos
- Link de download temporário
- Registro em audit log

---

## 4. Non-Functional Requirements

### Performance
- Listagem: < 300ms
- Criação: < 200ms

### Security
- clinicId obrigatório (multi-tenancy)
- Apenas usuários autenticados
- Dados sensíveis criptografados em repouso
- Audit log de todas as operações
- Acesso restrito ao DPO para atualizações

### Usability
- Interface de consentimentos por paciente
- Dashboard de solicitações pendentes
- Filtros por tipo e status

---

## 5. Success Criteria

### LGP-SC-001: Cobertura de Consentimentos
**Description**: 100% dos pacientes ativos têm pelo menos um consentimento registrado
**Target**: 100%
**Measurement**: Query de pacientes sem consentimento

### LGP-SC-002: Tempo de Resposta
**Description**: Solicitações atendidas em até 15 dias úteis
**Target**: 100% < 15 dias
**Measurement**: Diferença entre requested_at e completed_at

---

## 6. User Scenarios & Testing

### Scenario 1: Registrar Consentimento
**Given** um paciente novo
**When** a recepcionista registra consentimento de tratamento
**Then** o consentimento é salvo com status granted

### Scenario 2: Solicitar Acesso aos Dados
**Given** um paciente logado no portal
**When** ele solicita acesso aos seus dados
**Then** uma solicitação PENDENTE é criada

### Scenario 3: Atender Solicitação
**Given** uma solicitação PENDENTE
**When** o DPO atualiza o status para ATENDIDA
**Then** o paciente é notificado

---

## 7. Edge Cases

### EC-001: Consentimento Revogado
**Condition**: Paciente revoga consentimento de marketing
**Expected Behavior**: Consentimento atualizado, campanhas futuras não enviadas

### EC-002: Solicitação Duplicada
**Condition**: Paciente solicita exclusão duas vezes
**Expected Behavior**: Segunda solicitação criada normalmente

### EC-003: Solicitação de Exclusão com Dados Médicos
**Condition**: Paciente solicita exclusão mas tem prontuário médico
**Expected Behavior**: Anonimização em vez de exclusão (obrigatoriedade legal)

---

## 8. Key Entities

### Entity: Consentimento
**Attributes**:
- id (UUID)
- clinic_id (String)
- patient_id (UUID)
- consent_type (String)
- granted (Boolean)
- expires_at (DateTime | null)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: SolicitacaoLGPD
**Attributes**:
- id (UUID)
- clinic_id (String)
- patient_id (UUID)
- request_type (String)
- description (String)
- status (Enum): PENDENTE, EM_ANALISE, ATENDIDA, NEGADA
- requested_at (DateTime)
- requested_by (UUID)
- completed_at (DateTime | null)
- response (String | null)
- responded_by (UUID | null)
- createdAt (DateTime)
- updatedAt (DateTime)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/lgpd/ | Status do módulo |
| GET | /api/lgpd/consentimentos | Listar consentimentos |
| POST | /api/lgpd/consentimentos | Criar consentimento |
| GET | /api/lgpd/solicitacoes | Listar solicitações |
| POST | /api/lgpd/solicitacoes | Criar solicitação |
| PATCH | /api/lgpd/solicitacoes/:id | Atualizar solicitação |

---

## 10. Dependencies & Assumptions

### Dependencies
- `pacientes` — dados dos pacientes
- `auth` — autenticação e roles
- `audit` — logs de auditoria

### Assumptions
- Cada clínica designa um DPO
- Consentimentos são coletados no primeiro atendimento
- Solicitações são atendidas em até 15 dias

---

## 11. Out of Scope

- Anonimização automática
- Políticas de privacidade (documento)
- Treinamento LGPD
- Auditorias externas
- Integração com ANPD

---

## 12. Notes

- Backend: módulo `lgpd` com Prisma
- clinicGuard obrigatório
- Validação Zod em todos os inputs
- Frontend: rota relacionada a configurações e portal do paciente
- Dados sensíveis devem ser tratados conforme LGPD
