# Feature Specification: Split de Pagamento

**Short Name**: `split-payment`
**Feature Branch**: `[027-split-pagamento]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Financial Operations

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Split de Pagamento** permite que clínicas odontológicas configurem a divisão automática de receitas entre a clínica e os profissionais (dentistas, especialistas) com base em percentuais configuráveis por procedimento.

### Motivation
Automatizar o cálculo e a gestão de comissões/proventos de profissionais, reduzindo erros manuais e garantindo transparência nos repasses.

### Scope
**Inclui:**
- Configuração de percentuais de split por profissional e tipo de procedimento
- Cálculo automático de divisão de receitas
- Registro de transações de split
- Gestão de comissões pendentes e pagas
- Listagem e filtragem de comissões

**Exclui:**
- Integração bancária para transferências automáticas
- Conciliação bancária automática
- Geração de holerites ou folha de pagamento
- Cálculo de impostos e retenções

---

## 2. User Stories

### Story 1 — Configurar Percentual de Split (P1)
**As a** administrador financeiro
**I want** configurar o percentual de comissão de um profissional
**So that** o sistema calcule automaticamente a divisão de receitas

**Acceptance Criteria:**
- Configuração por profissional (professional_id)
- Configuração por tipo de procedimento (opcional)
- Percentual de 0 a 100%
- Status ativo/inativo
- Uma configuração por clínica

### Story 2 — Calcular Split de uma Transação (P1)
**As a** recepcionista
**I want** que o sistema calcule automaticamente a divisão de um pagamento
**So that** eu saiba quanto vai para a clínica e quanto para o profissional

**Acceptance Criteria:**
- Cálculo baseado na configuração ativa do profissional
- Fallback para configuração genérica (sem tipo de procedimento)
- Validação de percentual (0-100%)
- Registro da transação e da comissão
- Retorno: valor total, percentual, valor profissional, valor clínica

### Story 3 — Consultar Comissões (P2)
**As a** dentista
**I want** visualizar minhas comissões pendentes e recebidas
**So that** eu acompanhe meus proventos

**Acceptance Criteria:**
- Filtro por status (PENDENTE, PAGA, CANCELADA)
- Filtro por profissional
- Listagem por clínica
- Valor total, percentual, transação associada

---

## 3. Functional Requirements

### SPL-FR-001: Configuração de Split
**Description**: CRUD de configurações de split por profissional.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/split-pagamento/config
- PUT /api/split-pagamento/config
- POST /api/split-pagamento/config
- Campos: professional_id (UUID), percentage (0-100), procedure_type (opcional), is_active
- Uma configuração por clínica/profissional
- clinicId obrigatório

### SPL-FR-002: Cálculo de Split
**Description**: Calcular divisão de receitas de uma transação.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/split-pagamento/calculate
- Parâmetros: transaction_id, total_amount, professional_id, procedure_type (opcional)
- Busca configuração mais específica primeiro (com procedure_type)
- Fallback para configuração genérica
- Validação: percentual deve estar entre 0 e 100
- Cria registro de transação e comissão
- Status inicial: PENDING

### SPL-FR-003: Listar Comissões
**Description**: Listar comissões de profissionais.
**Priority**: Must Have
**Acceptance Criteria**:
- GET /api/split-pagamento/comissoes
- Filtro por professional_id (query param)
- Filtro por status (query param)
- Scope por clinic_id

### SPL-FR-004: Criar Comissão Manual
**Description**: Criar registro de comissão manualmente.
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/split-pagamento/comissoes
- Campos: professional_id, amount, percentage, transaction_id, config_id, status
- Status padrão: PENDENTE

### SPL-FR-005: Listar Transações de Split
**Description**: Listar transações de split processadas.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/split-pagamento/transacoes
- Filtro por status
- Scope por clinic_id

---

## 4. Non-Functional Requirements

### Performance
- Cálculo de split: < 200ms
- Listagem de comissões: < 300ms para 1.000 registros

### Security
- clinicId obrigatório em todas as operações
- Apenas usuários autenticados da clínica
- Rate limiting: 200 req/15min por IP

### Usability
- Interface para configurar percentuais
- Visualização de comissões por profissional
- Resumo financeiro (clínica vs profissional)

---

## 5. Success Criteria

### SPL-SC-001: Precisão de Cálculo
**Description**: 100% dos cálculos de split refletem a configuração ativa
**Target**: Zero discrepâncias
**Measurement**: Auditoria de transações vs configurações

### SPL-SC-002: Tempo de Processamento
**Description**: Cálculo de split em menos de 500ms
**Target**: p99 < 500ms
**Measurement**: Logs de API

---

## 6. User Scenarios & Testing

### Scenario 1: Configurar Split
**Given** um administrador logado
**When** ele configura 40% de comissão para o Dr. Silva
**Then** a configuração é salva e ativa para futuras transações

### Scenario 2: Calcular Split
**Given** uma consulta de R$ 500 com o Dr. Silva
**When** o sistema calcula o split
**Then** retorna: profissional R$ 200 (40%), clínica R$ 300 (60%)

### Scenario 3: Fallback de Configuração
**Given** uma configuração específica para limpeza (30%) e genérica (40%)
**When** uma consulta de canal é processada (sem config específica)
**Then** o sistema usa o percentual genérico de 40%

---

## 7. Edge Cases

### EC-001: Sem Configuração Ativa
**Condition**: Profissional sem configuração de split
**Expected Behavior**: Erro 404 "No active split config found for this professional"

### EC-002: Percentual Inválido
**Condition**: Configuração com percentual < 0 ou > 100
**Expected Behavior**: Erro 400 "Invalid percentage in config"

### EC-003: Configuração Inativa
**Condition**: Configuração existe mas is_active = false
**Expected Behavior**: Tratada como inexistente (fallback ou 404)

---

## 8. Key Entities

### Entity: SplitPaymentConfig
**Attributes**:
- id (UUID)
- clinic_id (String)
- professional_id (UUID)
- percentage (Int): 0-100
- procedure_type (String): opcional
- is_active (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: SplitTransaction
**Attributes**:
- id (UUID)
- clinic_id (String)
- transaction_id (UUID)
- professional_id (UUID)
- total_amount (Int)
- percentage (Int)
- professional_amount (Int)
- clinic_amount (Int)
- status (Enum): PENDING, COMPLETED, CANCELLED
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: SplitComissao
**Attributes**:
- id (UUID)
- clinic_id (String)
- professional_id (UUID)
- amount (Int)
- percentage (Int)
- transaction_id (UUID)
- config_id (UUID)
- status (Enum): PENDENTE, PAGA, CANCELADA
- createdAt (DateTime)
- updatedAt (DateTime)

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/split-pagamento/ | Status do módulo |
| GET | /api/split-pagamento/config | Listar configurações |
| PUT | /api/split-pagamento/config | Atualizar configuração |
| POST | /api/split-pagamento/config | Criar configuração |
| GET | /api/split-pagamento/comissoes | Listar comissões |
| POST | /api/split-pagamento/comissoes | Criar comissão |
| GET | /api/split-pagamento/transacoes | Listar transações |
| POST | /api/split-pagamento/calculate | Calcular split |

---

## 10. Dependencies & Assumptions

### Dependencies
- `funcionarios` — dados de profissionais
- `financeiro` — transações financeiras
- `faturamento` — faturas e pagamentos

### Assumptions
- Cada profissional tem no máximo uma configuração ativa por clínica
- O percentual é aplicado sobre o valor bruto
- A clínica retém o valor restante (100% - percentual)

---

## 11. Out of Scope

- Transferências bancárias automáticas
- Geração de holerites
- Cálculo de impostos e retenções
- Integração com sistemas de folha de pagamento
- Repasse em criptomoedas

---

## 12. Notes

- Backend: módulo `split_pagamento` com Prisma
- Rate limiting aplicado (200 req/15min)
- clinicGuard obrigatório em todas as rotas
- Frontend: rota `/split-pagamento`
- Validação Zod em todos os inputs
