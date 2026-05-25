# Feature Specification: Catálogo de Procedimentos

**Short Name**: `procedure-catalog`
**Feature Branch**: `[007-procedimentos]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Clinical Operations

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Gestão completa do catálogo de procedimentos odontológicos.
- Must Have: Preços por convênio e particular.
- Should Have: Define quem pode executar o quê.
- Should Have: Vinculação ao inventário.
- Could Have: Auditoria de reajustes.

**Exclui:**
- Execução do procedimento (PEP)
- Agendamento (módulo agenda)
- Faturamento (NF-e)
- Integração com equipamentos

---

## 2. User Stories

### Story 1 — Cadastrar Procedimento (P1)
**As a** administrador
**I want** cadastrar um novo procedimento no catálogo
**So that** padronize os tratamentos da clínica

**Acceptance Criteria:**
- Nome, descrição, categoria, duração
- Código TUSS (para TISS)
- Valor padrão e custo
- Materiais necessários

### Story 2 — Tabela de Preços (P1)
**As a** administrador
**I want** definir preços por convênio ou particular
**So that** cobre diferentes formas de pagamento

**Acceptance Criteria:**
- Tabela particular (padrão)
- Tabelas por convênio
- Reajuste percentual em lote
- Histórico de preços

### Story 3 — Associação a Dentistas (P2)
**As a** administrador
**I want** definir quais dentistas realizam quais procedimentos
**So that** agenda corretamente

**Acceptance Criteria:**
- Checkbox de procedimentos por dentista
- Duração customizada por dentista
- Percentual de comissão por procedimento

### Story 4 — Categorização e Filtros (P3)
**As a** recepcionista
**I want** encontrar procedimentos rapidamente
**So that** agende consultas sem erro

**Acceptance Criteria:**
- Categorias: preventivo, restaurador, cirúrgico, ortodôntico, estético
- Filtros por categoria e dentista
- Busca por nome ou código

---

## 3. Functional Requirements

### PRO-FR-001: CRUD de Procedimentos
**Description**: Gestão completa do catálogo de procedimentos odontológicos.
**Priority**: Must Have
**Acceptance Criteria**:
- Campos: nome, descrição, categoria, duração padrão (min), valor padrão, custo estimado
- Código TUSS opcional
- Status: ATIVO, INATIVO
- clinicId obrigatório

### PRO-FR-002: Tabela de Preços Multipla
**Description**: Preços por convênio e particular.
**Priority**: Must Have
**Acceptance Criteria**:
- Tabela padrão (particular)
- Tabelas ilimitadas por convênio
- Campos: valor, tempo de retorno
- Reajuste em lote por tabela

### PRO-FR-003: Associação Dentista-Procedimento
**Description**: Define quem pode executar o quê.
**Priority**: Should Have
**Acceptance Criteria**:
- Procedimentos habilitados por dentista
- Duração customizada (sobrescreve padrão)
- Comissão percentual por procedimento-dentista

### PRO-FR-004: Materiais e Insumos
**Description**: Vinculação ao inventário.
**Priority**: Should Have
**Acceptance Criteria**:
- Lista de materiais necessários por procedimento
- Quantidade estimada
- Alerta de estoque baixo ao agendar

### PRO-FR-005: Histórico de Preços
**Description**: Auditoria de reajustes.
**Priority**: Could Have
**Acceptance Criteria**:
- Log de alterações de valor
- Quem alterou, data anterior/nova
- Gráfico de evolução de preço

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

### PRO-SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### PRO-SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### PRO-SC-003: Disponibilidade
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

### Entity: Procedimento
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: TabelaPreco
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: PrecoItem
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: DentistaProcedimento
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
- `funcionarios` — módulo funcional necessário
- `tiss` — módulo funcional necessário
- `agenda` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Execução do procedimento (PEP)
- Agendamento (módulo agenda)
- Faturamento (NF-e)
- Integração com equipamentos

---

## 11. Notes

- Backend: módulo `procedimentos` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
