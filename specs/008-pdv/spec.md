# Feature Specification: Ponto de Venda (PDV)

**Short Name**: `point-of-sale`
**Feature Branch**: `[008-pdv]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Revenue Operations

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Registro completo de transações de venda.
- Must Have: Pagamento misto e parcelado.
- Must Have: Abertura, movimentação e fechamento.
- Must Have: Vendas refletem no financeiro.
- Must Have: Produtos vendidos baixam do inventário.

**Exclui:**
- Emissão de cupom fiscal (SAT/NFC-e)
- Integração com TEF
- Delivery de produtos
- E-commerce

---

## 2. User Stories

### Story 1 — Venda Rápida (P1)
**As a** recepcionista
**I want** registrar uma venda em menos de 1 minuto
**So that** não forme fila no caixa

**Acceptance Criteria:**
- Busca de produto por nome/código
- Leitura de código de barras
- Cálculo automático de total
- Múltiplas formas de pagamento

### Story 2 — Fechamento de Caixa (P1)
**As a** recepcionista
**I want** fechar o caixa com conferência
**So that** garanta a integridade do dinheiro

**Acceptance Criteria:**
- Resumo de vendas do dia
- Comparativo sistema vs. físico
- Sangria e reforço registrados
- Bloqueio de edição pós-fechamento

### Story 3 — Controle de Estoque em Venda (P2)
**As a** administrador
**I want** que o estoque baixe automaticamente ao vender
**So that** evite vendas sem produto

**Acceptance Criteria:**
- Baixa automática no inventário
- Alerta de estoque insuficiente
- Bloqueio de venda (configurável)

### Story 4 — Relatório de Vendas (P3)
**As a** administrador
**I want** ver relatório de vendas por período
**So that** tome decisões de compra

**Acceptance Criteria:**
- Vendas por produto/procedimento
- Vendas por forma de pagamento
- Horário de pico
- Comparativo período a período

---

## 3. Functional Requirements

### FR-001: CRUD de Vendas
**Description**: Registro completo de transações de venda.
**Priority**: Must Have
**Acceptance Criteria**:
- Itens: produto ou procedimento
- Quantidade
- Preço unitário (com override)
- Desconto
- Total
- Forma de pagamento
- Cliente (opcional)

### FR-002: Múltiplas Formas de Pagamento
**Description**: Pagamento misto e parcelado.
**Priority**: Must Have
**Acceptance Criteria**:
- Dinheiro, cartão, PIX, boleto
- Pagamento misto (ex: 50% cartão + 50% PIX)
- Parcelamento em até 12x (cartão)
- Geração de QR Code PIX

### FR-003: Controle de Caixa
**Description**: Operação diária de caixa. **Owner: Financeiro (entidade); PDV (operação)** — PDV abre, movimenta e solicita fechamento; Financeiro consolida e torna o fechamento irreversível.
**Priority**: Must Have
**Acceptance Criteria**:
- Abertura com saldo inicial (via API do Financeiro)
- Registro de sangria e reforço (eventos para Financeiro)
- Fechamento solicitado pelo PDV, consolidado e bloqueado pelo Financeiro
- Relatório em PDF gerado pelo Financeiro
- Bloqueio pós-fechamento (apenas admin reabre via Financeiro)

### FR-004: Integração Financeira
**Description**: Vendas refletem no financeiro.
**Priority**: Must Have
**Acceptance Criteria**:
- Lançamento automático no caixa
- Contas a receber para parcelado
- Conciliação automática (PIX)

### FR-005: Baixa de Estoque
**Description**: Produtos vendidos baixam do inventário.
**Priority**: Must Have
**Acceptance Criteria**:
- Baixa automática
- Alerta de estoque baixo
- Bloqueio configurável

---

## 4. Non-Functional Requirements

### Performance
- Operações principais: < 300ms (p99)
- Listagens: < 500ms para 1.000 registros
- Upload de arquivos (se aplicável): progresso visual

### Security
- clinicId obrigatório em todas as operações (multi-tenancy)
- Dados sensíveis criptografados em repouso (LGPD)
- Audit log de operações críticas
- Acesso apenas por usuários autenticados

### Usability
- Interface responsiva (mobile-friendly)
- Feedback visual para todas as ações
- Keyboard navigation onde aplicável

---

## 5. Success Criteria

### SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### SC-003: Disponibilidade
**Description**: Módulo disponível 99.9% durante horário comercial
**Target**: 99.9% uptime
**Measurement**: Health checks + Prometheus

---

## 6. User Scenarios & Testing

### Scenario 1: Fluxo Principal
**Given** um usuário autenticado na clínica
**When** ele executa a operação principal do módulo
**Then** o sistema processa corretamente e retorna feedback apropriado

### Scenario 2: Erro de Validação
**Given** um usuário preenchendo dados inválidos
**When** ele tenta salvar
**Then** mensagens de erro claras aparecem e o formulário não é submetido

### Scenario 3: Multi-Tenancy
**Given** um usuário da Clínica A
**When** ele acessa o módulo
**Then** ele vê apenas dados da Clínica A, nunca da Clínica B

---

## 7. Edge Cases

### EC-001: Dados Inválidos
**Condition**: Usuário envia dados fora do formato esperado
**Expected Behavior**: Validação retorna erro 400 com mensagem específica. Nenhum dado é persistido.

### EC-002: Acesso Não Autorizado
**Condition**: Usuário sem permissão tenta acessar recurso restrito
**Expected Behavior**: Resposta 403 com mensagem "Acesso negado"

### EC-003: clinicId Inválido
**Condition**: Token manipulado com clinicId não associado ao usuário
**Expected Behavior**: clinicGuard rejeita com 403

---

## 8. Key Entities

### Entity: Venda
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: VendaItem
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Caixa
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: MovimentacaoCaixa
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

---

## 9. Dependencies & Assumptions

### Dependencies
- `inventario` — módulo funcional necessário
- `financeiro` — módulo funcional necessário
- `procedimentos` — módulo funcional necessário
- `pacientes` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Emissão de cupom fiscal (SAT/NFC-e)
- Integração com TEF
- Delivery de produtos
- E-commerce

---

## 11. Notes

- Backend: módulo `pdv` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
