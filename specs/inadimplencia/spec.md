# Feature Specification: Inadimplência e Cobrança

**Short Name**: `inadimplencia`
**Feature Branch**: `[028-inadimplencia]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Financial Recovery

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Inadimplência e Cobrança** permite que clínicas odontológicas gerenciem pacientes inadimplentes e executem campanhas de cobrança para recuperação de crédito.

### Motivation
Reduzir a inadimplência através de gestão estruturada de devedores e campanhas de cobrança automatizadas ou manuais.

### Scope
**Inclui:**
- Cadastro e gestão de inadimplentes
- Cálculo de dias de atraso e valor devido
- Campanhas de cobrança (manual e automatizada)
- Templates de mensagem para cobrança
- Atualização de status de inadimplentes

**Exclui:**
- Integração com Serasa/SPC
- Negativação automática
- Cobrança judicial
- Parcelamento automático de débitos

---

## 2. User Stories

### Story 1 — Registrar Inadimplente (P1)
**As a** financeiro
**I want** registrar um paciente como inadimplente
**So that** eu possa acompanhar e cobrar o débito

**Acceptance Criteria:**
- Associar a um paciente existente
- Registrar valor devido e data de vencimento
- Calcular dias de atraso automaticamente
- Status: ATIVO, NEGOCIADO, PAGO, CANCELADO

### Story 2 — Criar Campanha de Cobrança (P1)
**As a** administrador financeiro
**I want** criar campanhas de cobrança
**So that** eu possa enviar lembretes em massa

**Acceptance Criteria:**
- Nome, descrição, tipo de cobrança
- Período de execução (data_inicio, data_fim)
- Template de mensagem personalizável
- Tipo de campanha: manual, automatizada
- Status: ATIVA, PAUSADA, CONCLUIDA, CANCELADA

### Story 3 — Atualizar Status de Inadimplente (P2)
**As a** financeiro
**I want** atualizar o status de um inadimplente
**So that** eu registre pagamentos ou negociações

**Acceptance Criteria:**
- Atualização parcial (PATCH)
- Campos editáveis: status, valor_devido, data_vencimento, observacoes, dias_atraso
- Validação de clinicId

---

## 3. Functional Requirements

### INA-FR-001: Gestão de Inadimplentes
**Description**: CRUD de registros de inadimplentes.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/inadimplencia/inadimplentes
- GET /api/inadimplencia/inadimplentes/:id
- PATCH /api/inadimplencia/inadimplentes/:id
- Filtro por status
- Scope por clinic_id
- Validação Zod nos campos de atualização

### INA-FR-002: Campanhas de Cobrança
**Description**: CRUD de campanhas de cobrança.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/inadimplencia/campanhas
- POST /api/inadimplencia/campanhas
- PATCH /api/inadimplencia/campanhas/:id
- Campos: nome, descricao, status, data_inicio, data_fim, tipo_cobranca, tipo_campanha, mensagem_template
- Status padrão: ATIVA
- Tipo padrão: manual

### INA-FR-003: Cálculo de Atraso
**Description**: Calcular dias de atraso automaticamente.
**Priority**: Should Have
**Acceptance Criteria**:
- Cálculo baseado na data de vencimento vs data atual
- Atualização automática em consultas
- Campo dias_atraso persistido

### INA-FR-004: Filtros e Listagem
**Description**: Listar inadimplentes e campanhas com filtros.
**Priority**: Should Have
**Acceptance Criteria**:
- Filtro por status
- Filtro por período
- Ordenação por dias de atraso (decrescente)
- Paginação

---

## 4. Non-Functional Requirements

### Performance
- Listagem: < 300ms para 1.000 registros
- Atualização: < 200ms

### Security
- clinicId obrigatório (multi-tenancy)
- Apenas usuários autenticados
- Rate limiting: 200 req/15min por IP
- Dados de inadimplência criptografados em repouso (LGPD)

### Usability
- Interface com indicadores visuais de atraso
- Cores por faixa de dias de atraso
- Exportação de relatórios

---

## 5. Success Criteria

### INA-SC-001: Taxa de Recuperação
**Description**: Percentual de inadimplentes que regularizam após campanha
**Target**: > 30% de recuperação
**Measurement**: Comparação antes/depois de campanhas

### INA-SC-002: Tempo de Resposta
**Description**: Listagem de inadimplentes em menos de 300ms
**Target**: p99 < 300ms
**Measurement**: Logs de API

---

## 6. User Scenarios & Testing

### Scenario 1: Registrar Inadimplente
**Given** um paciente com fatura vencida há 30 dias
**When** o financeiro registra a inadimplência
**Then** o registro é criado com status ATIVO e 30 dias de atraso

### Scenario 2: Criar Campanha
**Given** um administrador logado
**When** ele cria uma campanha "Cobrança Maio" com template personalizado
**Then** a campanha é criada com status ATIVA

### Scenario 3: Atualizar Status
**Given** um inadimplente que pagou
**When** o financeiro atualiza o status para PAGO
**Then** o registro é atualizado e removido da lista ativa

---

## 7. Edge Cases

### EC-001: Paciente Já Inadimplente
**Condition**: Tentativa de registrar inadimplente já existente
**Expected Behavior**: Atualização do registro existente ou alerta de duplicidade

### EC-002: Valor Negativo
**Condition**: valor_devido negativo na atualização
**Expected Behavior**: Erro 400 — valor deve ser não-negativo

### EC-003: Campanha Expirada
**Condition**: Campanha com data_fim no passado
**Expected Behavior**: Status automático para CONCLUIDA

---

## 8. Key Entities

### Entity: Inadimplente
**Attributes**:
- id (UUID)
- clinic_id (String)
- patient_id (UUID)
- valor_devido (Decimal)
- data_vencimento (DateTime)
- dias_atraso (Int)
- status (Enum): ATIVO, NEGOCIADO, PAGO, CANCELADO
- observacoes (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: CampanhaCobranca
**Attributes**:
- id (UUID)
- clinic_id (String)
- nome (String)
- descricao (String)
- status (Enum): ATIVA, PAUSADA, CONCLUIDA, CANCELADA
- data_inicio (DateTime)
- data_fim (DateTime)
- tipo_cobranca (String)
- tipo_campanha (Enum): manual, automatizada
- mensagem_template (String)
- createdAt (DateTime)
- updatedAt (DateTime)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inadimplencia/ | Status do módulo |
| GET | /api/inadimplencia/inadimplentes | Listar inadimplentes |
| GET | /api/inadimplencia/inadimplentes/:id | Detalhes do inadimplente |
| PATCH | /api/inadimplencia/inadimplentes/:id | Atualizar inadimplente |
| GET | /api/inadimplencia/campanhas | Listar campanhas |
| POST | /api/inadimplencia/campanhas | Criar campanha |
| PATCH | /api/inadimplencia/campanhas/:id | Atualizar campanha |

---

## 10. Dependencies & Assumptions

### Dependencies
- `pacientes` — dados dos pacientes
- `financeiro` — faturas e contas a receber
- `notifications` — envio de lembretes

### Assumptions
- Cada inadimplência está ligada a um paciente existente
- O cálculo de dias de atraso é automático
- Campanhas podem ser manuais ou automatizadas

---

## 11. Out of Scope

- Integração com Serasa/SPC
- Negativação automática
- Cobrança judicial
- Parcelamento automático
- Análise de crédito

---

## 12. Notes

- Backend: módulo `inadimplencia` com Prisma
- Rate limiting aplicado (200 req/15min)
- clinicGuard obrigatório em todas as rotas
- Frontend: rota `/inadimplencia`
- Validação Zod em todos os inputs
