# Feature Specification: Gestão de Funcionários

**Short Name**: `staff-management`
**Feature Branch**: `[010-funcionarios]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P2 — Operations

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Gestão completa de colaboradores.
- Must Have: Registro de jornada.
- Should Have: Planejamento de folgas e turnos.
- Should Have: Remuneração variável.
- Could Have: Gestão de contratos e certificados.

**Exclui:**
- Folha de pagamento completa
- Recrutamento
- Avaliação de desempenho 360°
- Gestão de benefícios

---

## 2. User Stories

### Story 1 — Cadastro de Funcionário (P1)
**As a** administrador
**I want** cadastrar dentistas e staff
**So that** organize a equipe

**Acceptance Criteria:**
- Dados pessoais, CRO (para dentistas), cargo
- Horário de trabalho
- Especialidades (para dentistas)
- Foto e assinatura
- Contrato (PDF)

### Story 2 — Controle de Ponto (P1)
**As a** administrador
**I want** registrar entrada e saída
**So that** calcule horas trabalhadas

**Acceptance Criteria:**
- Registro manual ou por biometria (futuro)
- Cálculo de horas extras
- Banco de horas
- Relatório mensal

### Story 3 — Escalas e Folgas (P2)
**As a** administrador
**I want** montar escala de trabalho
**So that** garanta cobertura da clínica

**Acceptance Criteria:**
- Escala semanal/mensal visual
- Bloqueio de folgas em dias lotados
- Notificação de alteração
- Integração com agenda

### Story 4 — Comissões (P3)
**As a** administrador
**I want** calcular comissão por procedimento
**So that** pague corretamente

**Acceptance Criteria:**
- Percentual por procedimento
- Meta mínima para comissão
- Relatório de comissões
- Integração financeira

---

## 3. Functional Requirements

### FUN-FR-001: CRUD de Funcionários
**Description**: Gestão completa de colaboradores.
**Priority**: Must Have
**Acceptance Criteria**:
- Campos: nome, CPF, email, telefone, cargo, CRO (dentistas), especialidades
- Horário de trabalho
- Status: ATIVO, FERIAS, INATIVO
- clinicId obrigatório

### FUN-FR-002: Controle de Ponto
**Description**: Registro de jornada.
**Priority**: Must Have
**Acceptance Criteria**:
- Entrada/saída com timestamp
- Cálculo de horas trabalhadas
- Horas extras
- Banco de horas
- Relatório mensal por funcionário

### FUN-FR-003: Escala de Trabalho
**Description**: Planejamento de folgas e turnos.
**Priority**: Should Have
**Acceptance Criteria**:
- Visualização semanal/mensal
- Bloqueio automático de horários na agenda
- Notificação de mudanças
- Limite de folgas por mês

### FUN-FR-004: Comissões e Metas
**Description**: Remuneração variável.
**Priority**: Should Have
**Acceptance Criteria**:
- Percentual por procedimento-dentista
- Meta mínima mensal
- Relatório de produção
- Lançamento automático no financeiro

### FUN-FR-005: Documentos
**Description**: Gestão de contratos e certificados.
**Priority**: Could Have
**Acceptance Criteria**:
- Upload de contrato, diploma, certificados
- Alerta de vencimento de certificado (CRO, capacitação)
- Download em lote

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

### FUN-SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### FUN-SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### FUN-SC-003: Disponibilidade
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

### Entity: Funcionario
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: RegistroPonto
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Escala
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Comissao
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

---

## 9. Dependencies & Assumptions

### Dependencies
- `agenda` — módulo funcional necessário
- `procedimentos` — módulo funcional necessário
- `financeiro` — módulo funcional necessário
- `files` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Folha de pagamento completa
- Recrutamento
- Avaliação de desempenho 360°
- Gestão de benefícios

---

## 11. Notes

- Backend: módulo `funcionarios` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
