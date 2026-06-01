# Feature Specification: Gestão de Contratos

**Short Name**: `contratos`
**Feature Branch**: `[037-contratos]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Legal & Financial

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Gestão de Contratos** permite que clínicas odontológicas criem, gerenciem e acompanhem contratos de tratamento com pacientes, incluindo templates, assinatura digital e itens de procedimentos.

### Motivation
Padronizar e digitalizar os contratos de tratamento odontológico, garantindo rastreabilidade legal e facilitando a gestão financeira dos tratamentos.

### Scope
**Inclui:**
- CRUD de contratos
- Templates de contratos
- Itens de procedimentos no contrato
- Status do contrato (rascunho, pendente, assinado, em execução, concluído, cancelado)
- Assinatura digital
- Formas de pagamento (à vista, parcelado, mensalidade)
- Associação a paciente e orçamento

**Exclui:**
- Nota fiscal vinculada (módulo NFE)
- Cobrança automática (módulo financeiro)
- Integração com cartórios
- Assinatura com certificado digital ICP-Brasil

---

## 2. User Stories

### Story 1 — Criar Contrato (P1)
**As a** recepcionista
**I want** criar um contrato de tratamento
**So that** eu formalize o acordo com o paciente

**Acceptance Criteria:**
- Título, conteúdo HTML
- Paciente associado
- Número do contrato único
- Valor total
- Data de início e término
- Template opcional
- Orçamento opcional

### Story 2 — Assinar Contrato Digitalmente (P1)
**As a** paciente
**I want** assinar o contrato digitalmente
**So that** eu formalize o tratamento

**Acceptance Criteria:**
- Status: PENDENTE_ASSINATURA → ASSINADO
- Registro de assinatura digital
- Data da assinatura
- Validação de status

### Story 3 — Gerenciar Status (P2)
**As a** administrador
**I want** atualizar o status de um contrato
**So that** eu acompanhe o andamento

**Acceptance Criteria:**
- Status: RASCUNHO, PENDENTE_ASSINATURA, ASSINADO, EM_EXECUCAO, CONCLUIDO, CANCELADO
- Cancelamento: não permitido se CONCLUIDO
- Atualização parcial (PATCH)

### Story 4 — Usar Templates (P2)
**As a** administrador
**I want** criar templates de contratos
**So that** eu padronize os documentos

**Acceptance Criteria:**
- Templates pré-definidos
- Reutilização ao criar contratos
- Variáveis dinâmicas (nome, valor, datas)

---

## 3. Functional Requirements

### CON-FR-001: CRUD de Contratos
**Description**: Criar, ler, atualizar e excluir contratos.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/contratos
- GET /api/contratos/:id
- POST /api/contratos
- PATCH /api/contratos/:id
- PUT /api/contratos/:id (alias)
- DELETE /api/contratos/:id
- Schema Zod:
  - titulo (max 200)
  - conteudo_html
  - patient_id (UUID)
  - numero_contrato (max 50)
  - valor_contrato (nonnegative)
  - status (opcional)
  - data_inicio
  - data_termino (opcional)
  - template_id (opcional)
  - orcamento_id (opcional)
- clinic_id obrigatório

### CON-FR-002: Listar Templates
**Description**: Listar templates de contratos.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/contratos/templates
- Lista de templates disponíveis
- Campos: id, titulo, descricao, conteudo_html

### CON-FR-003: Assinatura Digital
**Description**: Assinar contrato digitalmente.
**Priority**: Must Have
**Acceptance Criteria**:
- Status deve ser PENDENTE_ASSINATURA
- Registro de assinaturaDigital
- Data da assinatura
- Status atualizado para ASSINADO
- Não permitir assinar contrato já assinado ou cancelado

### CON-FR-004: Cancelamento
**Description**: Cancelar contrato.
**Priority**: Should Have
**Acceptance Criteria**:
- Não permitir cancelar contrato CONCLUIDO
- Status atualizado para CANCELADO
- Data de cancelamento

---

## 4. Non-Functional Requirements

### Performance
- Listagem: < 300ms
- Criação: < 200ms

### Security
- clinicId obrigatório
- Apenas usuários autenticados
- Dados criptografados em repouso
- Assinatura digital registrada
- Audit log de operações

### Usability
- Editor de contratos (HTML)
- Preview antes de salvar
- Status visual (cores)
- Filtros por status

---

## 5. Success Criteria

### CON-SC-001: Precisão
**Description**: 100% dos contratos com status correto
**Target**: 100%
**Measurement**: Query de inconsistências

### CON-SC-002: Tempo
**Description**: Criação de contrato em menos de 2 minutos
**Target**: 95% < 2min
**Measurement**: Analytics

---

## 6. User Scenarios & Testing

### Scenario 1: Criar Contrato
**Given** um paciente e um orçamento
**When** a recepcionista cria um contrato
**Then** o contrato é salvo com status RASCUNHO

### Scenario 2: Assinar Contrato
**Given** um contrato PENDENTE_ASSINATURA
**When** o paciente assina digitalmente
**Then** o status muda para ASSINADO e a assinatura é registrada

### Scenario 3: Cancelar Contrato
**Given** um contrato EM_EXECUCAO
**When** o admin cancela
**Then** o status muda para CANCELADO

---

## 7. Edge Cases

### EC-001: Assinar Contrato Inválido
**Condition**: Tentativa de assinar contrato não pendente
**Expected Behavior**: Erro "Contrato não está pendente de assinatura"

### EC-002: Cancelar Contrato Concluído
**Condition**: Tentativa de cancelar contrato CONCLUIDO
**Expected Behavior**: Erro "Não é possível cancelar um contrato concluído"

### EC-003: Contrato Duplicado
**Condition**: Número de contrato já existe
**Expected Behavior**: Erro de duplicidade

---

## 8. Key Entities

### Entity: Contrato
**Attributes**:
- id (UUID)
- clinic_id (String)
- titulo (String)
- conteudo_html (String)
- patient_id (UUID)
- numero_contrato (String)
- valor_contrato (Decimal)
- status (Enum): RASCUNHO, PENDENTE_ASSINATURA, ASSINADO, EM_EXECUCAO, CONCLUIDO, CANCELADO
- data_inicio (DateTime)
- data_termino (DateTime | null)
- template_id (UUID | null)
- orcamento_id (UUID | null)
- assinatura_digital (String | null)
- data_assinatura (DateTime | null)
- observacoes (String | null)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: ItemContrato
**Attributes**:
- procedimentoId (UUID)
- procedimentoNome (String)
- quantidade (Int)
- valorUnitario (Decimal)
- desconto (Decimal)
- valorTotal (Decimal)

### Entity: ContratoTemplate
**Attributes**:
- id (UUID)
- clinic_id (String)
- titulo (String)
- descricao (String)
- conteudo_html (String)
- createdAt (DateTime)
- updatedAt (DateTime)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/contratos | Listar contratos |
| GET | /api/contratos/templates | Listar templates |
| GET | /api/contratos/:id | Detalhes do contrato |
| POST | /api/contratos | Criar contrato |
| PATCH | /api/contratos/:id | Atualizar contrato |
| PUT | /api/contratos/:id | Atualizar contrato (alias) |
| DELETE | /api/contratos/:id | Excluir contrato |

---

## 10. Dependencies & Assumptions

### Dependencies
- `pacientes` — dados dos pacientes
- `orcamentos` — orçamentos vinculados
- `procedimentos` — itens do contrato

### Assumptions
- Cada contrato está ligado a um paciente
- Assinatura digital é simples (não ICP-Brasil)
- Templates são reutilizáveis

---

## 11. Out of Scope

- Nota fiscal (módulo NFE)
- Cobrança automática (financeiro)
- Certificado digital ICP-Brasil
- Integração com cartórios
- Gestão de garantias

---

## 12. Notes

- Backend: módulo `contratos` com Prisma
- clinicGuard obrigatório
- Validação Zod em todos os inputs
- Frontend: rota relacionada a contratos
- Entidade Contrato com regras de negócio (assinar, cancelar)
