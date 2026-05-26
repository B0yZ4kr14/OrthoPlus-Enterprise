# Feature Specification: Gestão Financeira

**Short Name**: `financial-management`
**Feature Branch**: `[004-financeiro]`
**Created**: 2026-05-17
**Status**: Partially Implemented — Backfilled 2026-05-24
**Implementation**: ~80% (full backend + transactions + caixa + contas receber/pagar + conciliacao + notas fiscais; missing: DRE dedicated page, E2E tests, some edge cases)
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Business Viability

---

## 1. Overview / Context

O módulo **Financeiro** garante a saúde financeira da clínica odontológica. Gerencia receitas, despesas, fluxo de caixa, contas a receber/pagar, e conciliação bancária. Sem controle financeiro, a clínica não sobrevive — independente da qualidade clínica.

### Motivation
Dentistas e administradores precisam:
- Saber quanto a clínica faturou hoje/mês/ano
- Identificar inadimplências rapidamente
- Controlar despesas fixas e variáveis
- Conciliar extratos bancários automaticamente
- Gerenciar múltiplas formas de pagamento (dinheiro, cartão, PIX, crypto)

### Scope
**Inclui:**
- Registro de receitas e despesas
- Fluxo de caixa diário (caixa registradora)
- Contas a receber e a pagar
- Conciliação bancária automática
- Relatórios financeiros (DRE, fluxo de caixa)
- Integração com PDV

**Exclui:**
- Emissão de notas fiscais (módulo faturamento)
- Gestão de convênios (módulo TISS)
- Investimentos ou crypto trading

---

## 2. User Stories

### Story 1 — Fechamento de Caixa (P1)
**As a** recepcionista
**I want** fechar o caixa do dia em 2 minutos
**So that** eu possa ir embora no horário

**Acceptance Criteria:**
- Resumo automático: entradas, saídas, saldo
- Comparativo sistema vs. contagem física
- Identificação de divergências
- Geração de relatório em PDF
- Bloqueio de edição após fechamento

### Story 2 — Contas a Receber (P1)
**As a** administrador
**I want** ver todas as parcelas pendentes ordenadas por data
**So that** eu possa acompanhar inadimplência

**Acceptance Criteria:**
- Listagem com filtros (vencido, hoje, próximos 7 dias)
- Indicadores visuais de atraso (verde, amarelo, vermelho)
- Ação rápida: registrar pagamento, enviar lembrete, negociar
- Totalizadores por período

### Story 3 — Conciliação Bancária (P2)
**As a** administrador
**I want** que o sistema relance extratos bancários com lançamentos
**So that** eu não precise fazer manualmente

**Acceptance Criteria:**
- Importação OFX/CSV do banco
- Matching automático por valor + data
- Sugestão de matching para casos ambíguos
- Lançamentos não conciliados destacados

### Story 4 — Relatório DRE (P3)
**As a** proprietário
**I want** ver Demonstração do Resultado do Exercício mensal
**So that** eu saiba se a clínica está lucrando

**Acceptance Criteria:**
- Receitas operacionais (atendimentos, produtos)
- Custos operacionais (material, salários, aluguel)
- Lucro/prejuízo líquido
- Comparativo mês a mês e ano a ano

---

## 3. Functional Requirements

### FIN-FR-001: Lançamentos Financeiros
**Description**: CRUD de receitas e despesas com categorização.
**Priority**: Must Have
**Acceptance Criteria**:
- Campos: descrição, valor, data, categoria, forma de pagamento, conta bancária
- Categorias pré-definidas (receita: consulta, procedimento, produto; despesa: material, aluguel, salário, imposto)
- Anexos (comprovante, nota fiscal)
- Recorrência (mensal, anual)

### FIN-FR-002: Caixa Registradora
**Description**: Controle de entradas e saídas do dia. **Owner: Financeiro** — PDV opera o caixa no dia-a-dia, mas o registro histórico e fechamento oficial são do Financeiro.
**Priority**: Must Have
**Acceptance Criteria**:
- Entidade `Caixa` pertence ao bounded context Financeiro
- Abertura de caixa com saldo inicial
- Transações do PDV alimentam o caixa via eventos `SaleCompleted`
- Sangria e reforço de caixa registrados no Financeiro
- Fechamento com conferência (irreversível, apenas admin reabre)
- Múltiplos caixas por clínica

### FIN-FR-003: Contas a Receber
**Description**: Gestão de recebíveis (parcelas de tratamento).
**Priority**: Must Have
**Acceptance Criteria**:
- Geração automática a partir do orçamento aprovado
- Controle de parcelas (número, valor, vencimento)
- Registro de pagamento parcial ou total
- Juros/multa por atraso configurável
- Renegociação de dívida

### FIN-FR-004: Contas a Pagar
**Description**: Gestão de despesas programadas.
**Priority**: Should Have
**Acceptance Criteria**:
- Cadastro de fornecedores
- Parcelamento de despesas
- Alertas de vencimento próximo
- Pagamento com baixa automática

### FIN-FR-005: Conciliação Bancária
**Description**: Matching entre extrato bancário e lançamentos.
**Priority**: Should Have
**Acceptance Criteria**:
- Upload de OFX/CSV
- Matching automático (>90% de acerto)
- Interface de reconciliação manual para não-match
- Histórico de conciliações

### FIN-FR-006: Relatórios
**Description**: Relatórios gerenciais e contábeis.
**Priority**: Should Have
**Acceptance Criteria**:
- Fluxo de caixa (diário, semanal, mensal)
- DRE (Demonstração do Resultado)
- Contas a receber/pagar aging
- Comparativo período a período
- Exportação PDF e Excel

---

## 4. Non-Functional Requirements

### Performance
- Listagem de lançamentos: < 300ms para 1.000 registros
- Relatórios: < 2s para período de 1 ano
- Conciliação: < 5s para 500 movimentações

### Security
- Fechamento de caixa irreversível (apenas admin pode reabrir)
- Audit log de todas as transações financeiras
- Dados sensíveis de contas bancárias criptografados
- Separação de permissões (recepcionista só vê caixa, admin vê tudo)

---

## 5. Success Criteria

### FIN-SC-001: Precisão do Caixa
**Description**: Divergência entre sistema e físico menor que 0.1%
**Target**: 99.9% de precisão
**Measurement**: Comparativo fechamento de caixa

### FIN-SC-002: Cobertura de Conciliação
**Description**: >90% das movimentações bancárias conciliadas automaticamente
**Target**: 90% auto-match
**Measurement**: Taxa de matching pós-importação

### FIN-SC-003: Visibilidade de Inadimplência
**Description**: Administrador identifica contas vencidas em menos de 10 segundos
**Target**: < 10s
**Measurement**: Tempo de acesso ao relatório de inadimplência

---

## 6. User Scenarios & Testing

### Scenario 1: Pagamento de Consulta
**Given** um paciente no caixa após consulta
**When** a recepcionista registra pagamento de R$ 200 em PIX
**Then** o lançamento é criado, o caixa do dia atualiza, e uma notificação é enviada ao financeiro

### Scenario 2: Parcelamento de Tratamento
**Given** um orçamento de R$ 3.000 aprovado
**When** o paciente escolhe pagar em 3x
**Then** 3 parcelas de R$ 1.000 são geradas com vencimentos mensais, aparecendo no contas a receber

### Scenario 3: Conciliação
**Given** um extrato OFX importado com 50 movimentações
**When** o sistema processa o matching
**Then** 45 são conciliadas automaticamente, 5 ficam pendentes para revisão manual

---

## 7. Edge Cases

### EC-001: Pagamento Parcial
**Condition**: Paciente paga apenas parte da parcela
**Expected Behavior**: Registro do valor pago, saldo devedor atualizado, nova parcela ou continuidade conforme configuração

### EC-002: Estorno
**Condition**: Cartão de crédito estorna transação
**Expected Behavior**: Lançamento de estorno no caixa, reversão da baixa, notificação ao financeiro

### EC-003: Caixa Negativo
**Condition**: Saídas excedem entradas no dia
**Expected Behavior**: Alerta visual, bloqueio de novas saídas (configurável), notificação ao admin

---

## 8. Key Entities

### Entity: FinancialTransaction
**Attributes**:
- `id` (UUID)
- `clinicId` (String)
- `type` (Enum): RECEITA, DESPESA
- `category` (String)
- `amount` (Decimal)
- `date` (DateTime)
- `description` (String)
- `paymentMethod` (Enum): DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO, PIX, BOLETO, TRANSFERENCIA, CRYPTO
- `status` (Enum): PENDENTE, CONCLUIDO, CANCELADO, ESTORNADO
- `patientId` (UUID): opcional
- `appointmentId` (UUID): opcional
- `createdAt`, `updatedAt`

### Entity: CashRegister
**Attributes**:
- `id` (UUID)
- `clinicId` (String)
- `date` (Date)
- `openingBalance` (Decimal)
- `closingBalance` (Decimal)
- `physicalCount` (Decimal)
- `status` (Enum): ABERTO, FECHADO
- `openedBy` (UUID)
- `closedBy` (UUID)

### Entity: ContaReceber
**Attributes**:
- `id` (UUID)
- `clinicId` (String)
- `patientId` (UUID)
- `orcamentoId` (UUID)
- `parcelaNumero` (Int)
- `totalParcelas` (Int)
- `valor` (Decimal)
- `vencimento` (Date)
- `status` (Enum): PENDENTE, PAGO_PARCIAL, PAGO, ATRASADO, CANCELADO
- `valorPago` (Decimal)
- `dataPagamento` (DateTime)

---

## 9. Dependencies & Assumptions

### Dependencies
- `pacientes` — vinculação de receita ao paciente
- `orcamentos` — geração de contas a receber
- `pdv` — registro de vendas no caixa
- `faturamento` — emissão de NF-e vinculada
- `bancos` — contas para conciliação

### Assumptions
- Cada clínica tem pelo menos uma conta bancária cadastrada
- Formas de pagamento são configuráveis por clínica
- Taxas de cartão e intermediadores são conhecidas

---

## 10. Out of Scope

- Contabilidade completa (DP, DARF, SPED)
- Folha de pagamento de funcionários
- Emissão de nota fiscal (módulo faturamento)
- Gestão de investimentos

---

## 11. Notes

- Backend: módulo `financeiro` com Clean Architecture (mais maduro do projeto)
- Frontend: Clean Architecture completa com aggregates, value objects (Period), use-cases
- Workers: financeiroJobs reconcilia automaticamente às 01:00 e 18:00
- Integração com split de pagamento (módulo split_pagamento)
