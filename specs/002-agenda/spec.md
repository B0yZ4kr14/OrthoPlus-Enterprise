# Feature Specification: Agenda e Agendamentos

**Short Name**: `appointment-scheduling`
**Feature Branch**: `[002-agenda]`
**Created**: 2026-05-17
**Status**: Draft
**Project**: OrthoPlus Enterprise
**Priority**: P1 — Core Operations

---

## 1. Overview / Context

O módulo de **Agenda** é a espinha dorsal operacional da clínica odontológica. Gerencia horários de dentistas, marcação de consultas, confirmações, bloqueios de horário e detecção de conflitos.

### Motivation
Uma clínica sem agenda funcional não opera. Recepcionistas precisam visualizar disponibilidade em tempo real, marcar consultas rapidamente, e gerenciar cancelamentos sem fricção.

### Scope
**Inclui:**
- Calendário visual (dia, semana, mês)
- Marcação de consultas com dentista específico
- Confirmações automáticas e manuais
- Bloqueio de horários (almoço, reuniões, férias)
- Detecção de conflitos de horário
- Recall de pacientes (retorno programado)

**Exclui:**
- Teleconsulta (módulo teleodonto)
- Prontuário do atendimento (PEP)
- Faturamento da consulta (financeiro)

---

## 2. User Stories

### Story 1 — Marcar Consulta (P1)
**As a** recepcionista
**I want** marcar uma consulta em 3 cliques
**So that** eu não mantenha pacientes esperando na linha

**Acceptance Criteria:**
- Seleção de dentista → visualização de horários livres → confirmação
- Duração padrão por tipo de procedimento (30min, 60min, etc.)
- Sugestão de próximo horário disponível
- Integração com cadastro de paciente (busca rápida)

### Story 2 — Visualização do Calendário (P1)
**As a** dentista
**I want** ver minha agenda do dia em uma única tela
**So that** eu saiba exatamente quem são meus pacientes e quando

**Acceptance Criteria:**
- Visualização por dia/semana/mês
- Cores por tipo de procedimento
- Indicador de confirmação (confirmado, pendente, cancelado)
- Informações do paciente ao clicar no agendamento

### Story 3 — Confirmação Automática (P2)
**As a** recepcionista
**I want** que o sistema envie confirmações automáticas 24h antes
**So that** eu reduza faltas (no-shows)

**Acceptance Criteria:**
- SMS/WhatsApp/email automático
- Paciente responde "SIM" ou "NÃO"
- Status atualizado automaticamente na agenda
- Relatório de taxa de confirmação

### Story 4 — Bloqueio de Horário (P2)
**As a** dentista
**I want** bloquear horários para reuniões ou emergências
**So that** ninguém marque consultas nesses períodos

**Acceptance Criteria:**
- Bloqueio recorrente (toda terça 12h-14h)
- Motivo obrigatório (visível para recepção)
- Bloqueio de meio-período (manhã/tarde)

---

## 3. Functional Requirements

### FR-001: CRUD de Agendamentos
**Description**: Operações completas de agendamento com validações de negócio.
**Priority**: Must Have
**Acceptance Criteria**:
- Criar agendamento: paciente, dentista, data/hora, procedimento, duração
- Validar conflito de horário (mesmo dentista, mesmo horário)
- Validar disponibilidade do dentista (horário de trabalho + bloqueios)
- Cancelar com motivo obrigatório
- Reagendar preservando histórico

### FR-002: Visualização Multi-Modo
**Description**: Calendário com visualizações diária, semanal e mensal.
**Priority**: Must Have
**Acceptance Criteria**:
- Dia: timeline vertical (08h às 20h)
- Semana: grid 7 colunas
- Mês: grid mensal com indicadores
- Navegação por setas e date picker
- "Hoje" para voltar ao dia atual

### FR-003: Gestão de Bloqueios
**Description**: Dentistas e admins podem bloquear horários.
**Priority**: Should Have
**Acceptance Criteria**:
- Bloqueio pontual ou recorrente
- Motivo obrigatório
- Visível no calendário com cor diferente
- Impede agendamento sobreposto

### FR-004: Confirmações
**Description**: Sistema de confirmação de consultas.
**Priority**: Should Have
**Acceptance Criteria**:
- Envio automático X horas antes
- Canais: SMS, WhatsApp, email
- Resposta do paciente atualiza status
- Reenvio manual pela recepção

### FR-005: Recall de Pacientes
**Description**: Sugestão automática de retorno baseada no tratamento.
**Priority**: Could Have
**Acceptance Criteria**:
- Regra por procedimento (ex: limpeza a cada 6 meses)
- Lista de pacientes pendentes de retorno
- Envio de lembrete automático

---

## 4. Non-Functional Requirements

### Performance
- Carregamento da agenda: < 300ms para 1 semana
- Atualização em tempo real (WebSocket ou polling 5s)
- Suportar até 50 agendamentos/dia por dentista

### Usability
- Drag-and-drop para reagendar
- Mobile-friendly (recepção usa tablet)
- Atalhos de teclado (Ctrl+N novo agendamento)

---

## 5. Success Criteria

### SC-001: Tempo de Marcação
**Description**: Marcar uma consulta leva menos de 30 segundos
**Target**: 90% das marcações < 30s
**Measurement**: Analytics de cliques e tempo

### SC-002: Taxa de No-Show
**Description**: Reduzir faltas com confirmações automáticas
**Target**: Redução de 30% no no-show
**Measurement**: Comparativo antes/depois da feature

### SC-003: Conflitos Zero
**Description**: Zero agendamentos duplos no mesmo horário
**Target**: 100% de prevenção
**Measurement**: Query de sobreposição no banco

---

## 6. User Scenarios & Testing

### Scenario 1: Marcação Completa
**Given** uma recepcionista na tela de agenda
**When** ela clica em um horário livre, busca o paciente, seleciona o procedimento e salva
**Then** o agendamento aparece no calendário, uma notificação é enviada ao paciente

### Scenario 2: Conflito Detectado
**Given** o dentista Dr. Silva tem consulta às 14h
**When** a recepcionista tenta marcar outra consulta às 14h para o mesmo dentista
**Then** um alerta de conflito aparece com sugestão do próximo horário livre

### Scenario 3: Cancelamento
**Given** uma consulta confirmada amanhã às 10h
**When** o paciente liga para cancelar
**Then** a recepcionista marca como cancelado, o horário fica livre, e uma mensagem é enviada ao dentista



---

## 7. Security & Compliance

### Authentication & Authorization
- **Auth method**: JWT (HS256, 24h expiry) via HttpOnly cookie with SameSite=Strict
- **Multi-tenancy**: All data access scoped by `clinicId`; `clinicGuard` mandatory on all protected routes
- **Role-based access**: Module-level permissions enforced via `ModulesContext`
- **Patient portal auth**: CPF + OTP (separate from staff auth flow)

### Data Protection (LGPD)
- **Sensitive data**: Patient data classified as "sensível" under LGPD Art. 5, II
- **Encryption at rest**: Required for patient documents, radiographs, and financial records
- **Encryption in transit**: TLS 1.2+ mandatory; no plaintext data over network
- **Right to erasure**: Patient data must be deletable within 30 days of request
- **Audit logging**: All CRUD operations on patient data logged with userId, timestamp, IP

### Rate Limiting & Abuse Prevention
- Auth endpoints: 10 requests / 15 min
- Upload endpoints: 50 requests / hour
- General API: 500 requests / 15 min
- Nginx layer: additional IP-based limits in production

### Input Validation & Sanitization
- All inputs validated via Zod schemas (backend) and form validators (frontend)
- File uploads: MIME-type validation + magic bytes check + size limits
- SQL injection: Prevented by Prisma ORM (no raw queries for user-facing endpoints)
- XSS: React auto-escaping + CSP headers in nginx

### Security Testing
- `pnpm audit --moderate` in CI (weekly)
- ESLint security plugin scan
- Dependabot alerts enabled

---

## 8. Edge Cases

### EC-001: Paciente Não Encontrado
**Condition**: Paciente ainda não cadastrado durante a marcação
**Expected Behavior**: Shortcut para cadastro rápido sem sair da tela de agenda

### EC-002: Dentista em Férias
**Condition**: Tentativa de agendar durante férias do dentista
**Expected Behavior**: Horários aparecem como bloqueados. Mensagem: "Dr. Silva em férias de X a Y."

### EC-003: Consulta Passada
**Condition**: Tentativa de editar agendamento de data passada
**Expected Behavior**: Edição bloqueada. Apenas visualização e adição de notas.

---

## 9. Key Entities

### Entity: Appointment
**Attributes**:
- `id` (UUID)
- `clinicId` (String)
- `patientId` (UUID) → Patient
- `dentistId` (UUID) → Funcionário
- `startTime` (DateTime)
- `endTime` (DateTime)
- `procedureId` (UUID) → Procedimento
- `status` (Enum): AGENDADO, CONFIRMADO, CANCELADO, CONCLUIDO, FALTOU
- `notes` (String)
- `confirmationSentAt` (DateTime)
- `confirmedAt` (DateTime)
- `createdAt`, `updatedAt`

### Entity: BlockedTime
**Attributes**:
- `id` (UUID)
- `clinicId` (String)
- `dentistId` (UUID)
- `startTime` (DateTime)
- `endTime` (DateTime)
- `reason` (String)
- `isRecurring` (Boolean)
- `recurrenceRule` (String) — iCal RRULE format

---

## 10. Dependencies & Assumptions

### Dependencies
- `pacientes` — busca de paciente
- `procedimentos` — duração e tipo
- `funcionarios` — dentistas disponíveis
- `notifications` — envio de confirmações

### Assumptions
- Cada consulta tem duração definida pelo procedimento
- Dentistas têm horário de trabalho configurado
- Fuso horário é America/Sao_Paulo

---

## 11. Out of Scope

- Integração com Google Calendar / Outlook
- Videochamada (teleodonto)
- Gestão de fila de espera
- Chat entre paciente e clínica

---

## 12. Notes

- Backend: módulo `agenda` com Prisma (appointments, blocked_times, dentist_schedules)
- Frontend: Clean Architecture completa (domain, application, infrastructure, presentation)
- WebSocket ou SSE para atualização em tempo real
