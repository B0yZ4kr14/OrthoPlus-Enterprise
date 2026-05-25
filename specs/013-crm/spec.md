# Feature Specification: CRM e Marketing

**Short Name**: `crm-marketing`
**Feature Branch**: `[013-crm]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Growth

---

## 1. Overview / Context

### Motivation
[Contexto específico do módulo — preenchido automaticamente pelo gerador]

### Scope
**Inclui:**
- Must Have: Criação e execução de campanhas de marketing.
- Must Have: Fluxos automáticos baseados em eventos.
- Should Have: Visualização do journey do paciente.
- Should Have: Coleta de feedback.
- Could Have: Programa de indicação.

**Exclui:**
- Integração com Facebook Ads/Google Ads
- Gestão de redes sociais
- Site institucional
- Blog

---

## 2. User Stories

### Story 1 — Campanha de Recall (P1)
**As a** marketing
**I want** criar campanha de recall automático
**So that** traga pacientes de volta

**Acceptance Criteria:**
- Segmentação por última visita
- Canal: WhatsApp, SMS, email
- Template personalizado
- Agendamento de envio
- Taxa de abertura/conversão

### Story 2 — Aniversariantes (P1)
**As a** recepcionista
**I want** enviar mensagem de aniversário
**So that** fidelize pacientes

**Acceptance Criteria:**
- Lista diária de aniversariantes
- Template de mensagem
- Envio automático às 9h
- Oferta exclusiva anexada

### Story 3 — Funil de Conversão (P2)
**As a** administrador
**I want** visualizar o funil de pacientes
**So that** otimize o marketing

**Acceptance Criteria:**
- Etapa: lead → orçamento → agendamento → atendimento → fidelização
- Taxa de conversão entre etapas
- Identificação de gargalos
- Comparativo período a período

### Story 4 — NPS e Pesquisa (P3)
**As a** administrador
**I want** coletar feedback dos pacientes
**So that** melhore o atendimento

**Acceptance Criteria:**
- Envio de pesquisa pós-atendimento
- Escala NPS (0-10)
- Comentários abertos
- Relatório de satisfação

---

## 3. Functional Requirements

### CRM-FR-001: Campanhas
**Description**: Criação e execução de campanhas de marketing.
**Priority**: Must Have
**Acceptance Criteria**:
- Segmentação por: última visita, procedimento, idade, convênio
- Canais: WhatsApp, SMS, email
- Templates personalizáveis
- Agendamento de envio
- Acompanhamento: enviado, entregue, aberto, convertido

### CRM-FR-002: Automações
**Description**: Fluxos automáticos baseados em eventos.
**Priority**: Must Have
**Acceptance Criteria**:
- Trigger: aniversário, retorno programado, orçamento não aprovado, inadimplência
- Ação: envio de mensagem, criação de tarefa, desconto automático
- Delay configurável

### CRM-FR-003: Funil de Conversão
**Description**: Visualização do journey do paciente.
**Priority**: Should Have
**Acceptance Criteria**:
- Etapa: lead, orçamento, agendamento, atendimento, fidelização
- Taxa de conversão entre etapas
- Gargalos identificados
- Comparativo mês a mês

### CRM-FR-004: Pesquisa de Satisfação (NPS)
**Description**: Coleta de feedback.
**Priority**: Should Have
**Acceptance Criteria**:
- Envio automático pós-atendimento
- Escala NPS (0-10)
- Comentários abertos
- Relatório de satisfação por dentista e clínica

### CRM-FR-005: Indicações
**Description**: Programa de indicação.
**Priority**: Could Have
**Acceptance Criteria**:
- Código único por paciente
- Recompensa para indicador e indicado
- Rastreamento de conversão

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

### CRM-SC-001: Tempo de Operação
**Description**: Operação principal do módulo completa em menos de 2 minutos
**Target**: 90% das operações < 2min
**Measurement**: Analytics de tempo de interação

### CRM-SC-002: Precisão de Dados
**Description**: Zero erros de duplicação ou inconsistência
**Target**: 100% de integridade
**Measurement**: Queries de validação no banco

### CRM-SC-003: Disponibilidade
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

### Entity: Campanha
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Segmento
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: Automacao
**Attributes**:
- id (UUID): Identificador único
- clinicId (String): Tenant (multi-clínica)
- createdAt (DateTime)
- updatedAt (DateTime)
- [Campos específicos definidos na implementação]

### Entity: PesquisaSatisfacao
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
- `agenda` — módulo funcional necessário
- `orcamentos` — módulo funcional necessário
- `notifications` — módulo funcional necessário
- `financeiro` — módulo funcional necessário

### Assumptions
- Multi-tenancy ativo (clinicId em todas as entidades)
- Usuários autenticados via JWT
- Frontend com acesso a apiClient e React Query

---

## 10. Out of Scope

- Integração com Facebook Ads/Google Ads
- Gestão de redes sociais
- Site institucional
- Blog

---

## 11. Notes

- Backend: módulo `crm` com Prisma
- Frontend: seguir padrão do módulo (CA ou hooks diretos)
- clinicGuard obrigatório em todas as rotas
- Qualidade: build, type-check, lint, test = 0 erros
