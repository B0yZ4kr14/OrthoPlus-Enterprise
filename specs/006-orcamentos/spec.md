# Feature Specification: Gestão de Orçamentos

**Short Name**: `budget-management`
**Feature Branch**: `[006-orcamentos]`
**Created**: 2026-05-17
**Status**: In Progress
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Revenue

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Sistema deve permitir criar, ler, atualizar e excluir orçamentos de tratamento.
- Must Have: Paciente aprova ou rejeita orçamento via portal.
- Must Have: Ao aprovar, gera parcelas no financeiro.
- Should Have: Métricas de performance de orçamentos.
- Should Have: Rastreabilidade de alterações.

**Exclui:**
- Emissão de NF-e (módulo faturamento)
- Gestão de convênios (módulo TISS)
- Financiamento externo
- Orçamentos recorrentes

---

## 2. User Stories

### Story 1 — Criar Orçamento (P1)
**As a** dentista
**I want** criar um orçamento de tratamento em 5 minutos
**So that** paciente aceite o tratamento rapidamente

**Acceptance Criteria:**
- Seleção de procedimentos do catálogo
- Cálculo automático de valores
- Desconto configurável
- Validade do orçamento (30 dias)
- Assinatura digital do paciente

### Story 2 — Aprovação de Orçamento (P1)
**As a** paciente
**I want** visualizar e aprovar o orçamento no portal
**So that** inicie o tratamento sem burocracia

**Acceptance Criteria:**
- Visualização clara de valores e parcelas
- Aprovação com assinatura digital
- Rejeição com motivo
- Notificação à clínica

### Story 3 — Acompanhamento de Orçamentos (P2)
**As a** administrador
**I want** ver taxa de conversão de orçamentos
**So that** otimize a receita da clínica

**Acceptance Criteria:**
- Dashboard de orçamentos (pendente/aprovado/rejeitado)
- Taxa de conversão por dentista
- Motivos de rejeição
- Follow-up automático

### Story 4 — Revisão de Orçamento (P3)
**As a** dentista
**I want** revisar e reenviar um orçamento
**So that** ajuste o tratamento conforme necessidade

**Acceptance Criteria:**
- Histórico de versões do orçamento
- Comparativo entre versões
- Notificação de alteração ao paciente

---

## 3. Functional Requirements

### ORC-FR-001: CRUD de Orçamentos ✅ PARCIAL
**Description**: Sistema deve permitir criar, ler, atualizar e excluir orçamentos de tratamento.
**Priority**: Must Have
**Status**: ✅ Scaffolding completo (2026-05-17)
**Acceptance Criteria**:
- ✅ Vinculação a paciente existente (via PatientSelector)
- Seleção múltipla de procedimentos — pendente
- ✅ Cálculo automático do total
- ✅ Aplicação de desconto percentual ou fixo
- ✅ Validade configurável (padrão 30 dias)

### ORC-FR-002: Aprovação Digital ✅ PARCIAL
**Description**: Paciente aprova ou rejeita orçamento via portal.
**Priority**: Must Have
**Status**: ✅ Backend workflow implementado (2026-05-17)
**Acceptance Criteria**:
- Link único enviado por email/SMS — pendente
- Visualização responsiva (mobile) — pendente
- ✅ Assinatura digital simples (workflow aprovar/rejeitar)
- ✅ Rejeição com campo de motivo
- Notificação automática à clínica — pendente

### ORC-FR-003: Geração de Contas a Receber
**Description**: Ao aprovar, gera parcelas no financeiro.
**Priority**: Must Have
**Status**: ⏳ Pendente
**Acceptance Criteria**:
- Configuração de parcelamento (1x a 12x)
- Vencimento mensal ajustável
- Geração automática no módulo financeiro
- Vinculação ao orçamento original

### ORC-FR-004: Dashboard de Conversão
**Description**: Métricas de performance de orçamentos.
**Priority**: Should Have
**Acceptance Criteria**:
- Total de orçamentos no período
- Taxa de conversão (% aprovados)
- Ranking por dentista
- Tempo médio de aprovação
- Motivos de rejeição (top 5)

### ORC-FR-005: Versões de Orçamento
**Description**: Rastreabilidade de alterações.
**Priority**: Should Have
**Acceptance Criteria**:
- Snapshot do orçamento ao criar/revisar
- Comparativo visual entre versões
- Auditoria de quem alterou e quando

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

### ORC-SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### ORC-SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### ORC-SC-003: Disponibilidade
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

### Entity: Orcamento
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: OrcamentoItem
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: ProcedimentoCatalogo
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

---

## 9. Dependencies & Assumptions

### Dependencies
- `pacientes` — módulo funcional necessário
- `procedimentos` — módulo funcional necessário
- `financeiro` — módulo funcional necessário
- `notifications` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Emissão de NF-e (módulo faturamento)
- Gestão de convênios (módulo TISS)
- Financiamento externo
- Orçamentos recorrentes

---

## 11. Notes

- Backend: módulo `orcamentos` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
