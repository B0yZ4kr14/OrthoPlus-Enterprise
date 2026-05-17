# Feature Specification: Gestão de Inventário

**Short Name**: `inventory-management`
**Feature Branch**: `[011-inventario]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Supply Chain

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Catálogo de materiais e produtos.
- Must Have: Entradas e saídas com rastreabilidade.
- Should Have: Notificações de estoque crítico.
- Should Have: Análise de consumo e perdas.
- Could Have: Baixa automática em vendas.

**Exclui:**
- Compras e cotações
- Gestão de equipamentos (ativos fixos)
- Produção interna
- Logística de entrega

---

## 2. User Stories

### Story 1 — Cadastro de Produto (P1)
**As a** administrador
**I want** cadastrar produtos e materiais
**So that** controle o estoque

**Acceptance Criteria:**
- Nome, descrição, categoria, código SKU
- Unidade (un, ml, g, kit)
- Fornecedor
- Preço de custo e venda
- Estoque mínimo e máximo

### Story 2 — Entrada e Saída (P1)
**As a** recepcionista
**I want** registrar movimentações
**So that** mantenha o estoque atualizado

**Acceptance Criteria:**
- Entrada: compra, devolução, ajuste positivo
- Saída: venda, consumo (procedimento), perda, ajuste negativo
- Motivo obrigatório
- Lote e validade

### Story 3 — Alertas de Estoque (P2)
**As a** administrador
**I want** receber alertas de estoque baixo
**So that** não falte produto

**Acceptance Criteria:**
- Alerta quando estoque < mínimo
- Alerta de validade próxima (30 dias)
- Sugestão de compra
- Pedido automático (futuro)

### Story 4 — Inventário Físico (P3)
**As a** administrador
**I want** realizar contagem física
**So that** alinhe sistema com realidade

**Acceptance Criteria:**
- Contagem por produto ou categoria
- Comparativo sistema vs. físico
- Ajuste automático com justificativa
- Relatório de perdas

---

## 3. Functional Requirements

### FR-001: CRUD de Produtos
**Description**: Catálogo de materiais e produtos.
**Priority**: Must Have
**Acceptance Criteria**:
- Campos: nome, SKU, categoria, unidade, fornecedor, preço custo, preço venda
- Estoque atual, mínimo, máximo
- Lote e validade
- Foto
- Status: ATIVO, INATIVO

### FR-002: Movimentações
**Description**: Entradas e saídas com rastreabilidade.
**Priority**: Must Have
**Acceptance Criteria**:
- Tipos: ENTRADA, SAIDA, AJUSTE, PERDA, DEVOLUCAO
- Motivo obrigatório
- Quantidade
- Custo médio atualizado
- Vinculação a venda ou procedimento

### FR-003: Alertas
**Description**: Notificações de estoque crítico.
**Priority**: Should Have
**Acceptance Criteria**:
- Estoque abaixo do mínimo
- Validade próxima (< 30 dias)
- Sugestão de quantidade a comprar
- Notificação por email/dashboard

### FR-004: Relatórios
**Description**: Análise de consumo e perdas.
**Priority**: Should Have
**Acceptance Criteria**:
- Curva ABC (80/20 de consumo)
- Perdas e ajustes
- Giro de estoque
- Custo médio histórico

### FR-005: Integração com PDV
**Description**: Baixa automática em vendas.
**Priority**: Could Have
**Acceptance Criteria**:
- Baixa ao vender no PDV
- Baixa ao registrar procedimento (consumo de material)

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

### Entity: Produto
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: MovimentacaoEstoque
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Fornecedor
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: AlertaEstoque
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

---

## 9. Dependencies & Assumptions

### Dependencies
- `pdv` — módulo funcional necessário
- `procedimentos` — módulo funcional necessário
- `financeiro` — módulo funcional necessário
- `notifications` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Compras e cotações
- Gestão de equipamentos (ativos fixos)
- Produção interna
- Logística de entrega

---

## 11. Notes

- Backend: módulo `inventario` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
