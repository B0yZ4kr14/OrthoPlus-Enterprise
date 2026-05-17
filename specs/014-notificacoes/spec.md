# Feature Specification: Sistema de Notificações

**Short Name**: `notification-system`
**Feature Branch**: `[014-notificacoes]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Engagement

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Notificações via WhatsApp, SMS e email.
- Must Have: Lembrete e confirmação de consulta.
- Must Have: Lembrete de retorno programado.
- Should Have: Alertas dentro do sistema.
- Should Have: Editor de templates.

**Exclui:**
- Chatbot
- Central telefônica (PABX)
- Notificações push mobile
- Integração com redes sociais

---

## 2. User Stories

### Story 1 — Notificação de Agendamento (P1)
**As a** recepcionista
**I want** enviar confirmação de agendamento
**So that** reduza no-shows

**Acceptance Criteria:**
- Canal: WhatsApp, SMS, email
- Template com data, hora, dentista, endereço
- Botão de confirmação/cancelamento
- Lembrete 24h antes

### Story 2 — Alerta de Recall (P1)
**As a** sistema
**I want** enviar lembrete de retorno
**So that** mantenha a recorrência

**Acceptance Criteria:**
- Baseado em regra por procedimento
- Canal: WhatsApp, SMS
- Link direto para agendamento
- Acompanhamento de conversão

### Story 3 — Notificações Internas (P2)
**As a** staff
**I want** receber notificações no sistema
**So that** mantenha a equipe informada

**Acceptance Criteria:**
- Toast in-app
- Badge no ícone
- Notificações por tipo: agendamento, financeiro, sistema
- Marcação como lida

### Story 4 — Template Builder (P3)
**As a** administrador
**I want** criar templates personalizados
**So that** padronize a comunicação

**Acceptance Criteria:**
- Editor de texto com variáveis (nome, data, valor)
- Preview antes de enviar
- Templates por canal
- A/B test (futuro)

---

## 3. Functional Requirements

### FR-001: Envio Multi-Canal
**Description**: Notificações via WhatsApp, SMS e email.
**Priority**: Must Have
**Acceptance Criteria**:
- Configuração de canal por tipo de notificação
- Fallback automático (ex: WhatsApp falhou → SMS)
- Templates por canal
- Agendamento de envio

### FR-002: Confirmação de Agendamento
**Description**: Lembrete e confirmação de consulta.
**Priority**: Must Have
**Acceptance Criteria**:
- Envio automático 24h antes
- Botão SIM/NÃO
- Atualização automática do status na agenda
- Reenvio manual pela recepção

### FR-003: Alertas de Recall
**Description**: Lembrete de retorno programado.
**Priority**: Must Have
**Acceptance Criteria**:
- Regra por procedimento (ex: limpeza a cada 6 meses)
- Envio automático
- Link para agendamento online
- Acompanhamento de conversão

### FR-004: Notificações In-App
**Description**: Alertas dentro do sistema.
**Priority**: Should Have
**Acceptance Criteria**:
- Toast notifications
- Badge counters
- Centro de notificações
- Marcação como lida/arquivada
- Filtros por tipo e data

### FR-005: Template Builder
**Description**: Editor de templates.
**Priority**: Should Have
**Acceptance Criteria**:
- Variáveis dinâmicas (nome, data, valor, dentista)
- Preview em tempo real
- Templates por canal e tipo
- Versionamento

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

### Entity: Notificacao
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Template
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Envio
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: CanalComunicacao
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
- `pacientes` — módulo funcional necessário
- `crm` — módulo funcional necessário
- `procedimentos` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Chatbot
- Central telefônica (PABX)
- Notificações push mobile
- Integração com redes sociais

---

## 11. Notes

- Backend: módulo `notificacoes` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
