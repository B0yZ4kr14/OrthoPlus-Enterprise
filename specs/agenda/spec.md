# Feature Specification: Agenda (Gestão de Agendamentos)

**Status**: `migrated`  
**Migrated from**: Existing codebase (brownfield migration)  
**Migration date**: 2026-05-18  
**Module**: `agenda`  
**Stack**: React 18 + TypeScript (frontend), Express + Prisma (backend)

---

## Overview

Sistema completo de gestão de agendamentos odontológicos, permitindo que clínicas cadastrem consultas, gerenciem horários de dentistas, bloqueiem períodos indisponíveis e acompanhem o status de cada agendamento em visualizações de calendário semanal e lista.

---

## User Stories

### US1 — Criar Agendamento (Priority: P1)

**Como** recepcionista da clínica  
**Quero** criar um novo agendamento selecionando paciente, dentista, data, horário, duração e tipo de consulta  
**Para** organizar a agenda da clínica sem conflitos de horário

**Acceptance Scenarios**:

```
GIVEN que estou na tela de Agenda
WHEN clico em "Novo Agendamento"
AND preencho paciente, dentista, data, horário (ex: 09:00), duração (múltiplo de 15min)
AND o horário não conflita com outro agendamento nem com bloqueio
THEN o agendamento é criado com status "AGENDADO"
AND aparece no calendário semanal e na lista
```

```
GIVEN que tento criar um agendamento
WHEN o dentista já tem um agendamento no mesmo horário
THEN recebo erro: "Já existe um agendamento neste horário"
AND o agendamento não é criado
```

```
GIVEN que tento criar um agendamento
WHEN o horário está dentro de um período bloqueado para o dentista
THEN recebo erro: "Horário bloqueado para este dentista"
AND o agendamento não é criado
```

### US2 — Confirmar Agendamento (Priority: P1)

**Como** recepcionista  
**Quero** confirmar um agendamento com pelo menos 2 horas de antecedência  
**Para** garantir que o paciente comparecerá

**Acceptance Scenarios**:

```
GIVEN um agendamento com status "AGENDADO"
WHEN clico em "Confirmar" com mais de 2h antes do horário
THEN o status muda para "CONFIRMADO"
AND o horário de confirmação é registrado
```

```
GIVEN um agendamento com status "AGENDADO"
WHEN tento confirmar com menos de 2h de antecedência
THEN recebo erro: "Não é possível confirmar com menos de 2 horas de antecedência"
AND o status permanece "AGENDADO"
```

### US3 — Cancelar/Reagendar Agendamento (Priority: P1)

**Como** recepcionista  
**Quero** cancelar ou reagendar consultas  
**Para** lidar com imprevistos dos pacientes

**Acceptance Scenarios**:

```
GIVEN um agendamento "AGENDADO" ou "CONFIRMADO"
WHEN cancelo com menos de 24h de antecedência
THEN devo informar o motivo do cancelamento
AND o status muda para "CANCELADO"
```

```
GIVEN um agendamento "AGENDADO" ou "CONFIRMADO"
WHEN reagendo para uma nova data futura
THEN o status volta para "AGENDADO"
AND o horário anterior fica liberado
```

### US4 — Visualizar Agenda em Calendário (Priority: P1)

**Como** dentista ou recepcionista  
**Quero** ver os agendamentos da semana em formato de calendário visual  
**Para** ter uma visão clara da minha programação

**Acceptance Scenarios**:

```
GIVEN que estou na tela de Agenda
WHEN seleciono a aba "Calendário"
THEN vejo uma grade semanal com os agendamentos posicionados nos horários
AND posso clicar em um agendamento para ver detalhes
```

```
GIVEN que estou na aba "Lista"
THEN vejo os agendamentos como cards em grid
AND cada card mostra status, paciente, horário e ações (confirmar/cancelar)
```

### US5 — Gerenciar Horários de Dentista (Priority: P2)

**Como** administrador da clínica  
**Quero** definir os horários de trabalho de cada dentista por dia da semana  
**Para** controlar a disponibilidade para agendamentos

**Acceptance Scenarios**:

```
GIVEN que estou na tela de Agenda
WHEN clico em "Configurar Horários"
THEN posso definir dia da semana, horário de início, fim e intervalo
AND o dentista só pode ser agendado dentro desses horários
```

### US6 — Bloquear Horários (Priority: P2)

**Como** recepcionista  
**Quero** bloquear períodos específicos (férias, reuniões, emergências)  
**Para** impedir agendamentos nesses horários

**Acceptance Scenarios**:

```
GIVEN que preciso bloquear um horário
WHEN clico em "Bloquear"
AND informo dentista, início, fim e motivo
THEN nenhum agendamento pode ser criado nesse período
```

### US7 — Enviar Lembretes (Priority: P2)

**Como** recepcionista  
**Quero** enviar lembretes automáticos para pacientes  
**Para** reduzir faltas e cancelamentos de última hora

**Acceptance Scenarios**:

```
GIVEN um agendamento confirmado
WHEN clico em "Enviar Lembrete"
THEN o paciente recebe notificação (SMS/app/push)
AND o envio é registrado no histórico de confirmações
```

---

## Functional Requirements

### FR1 — Agendamentos
- FR1.1: Cada agendamento deve ter: paciente, dentista, data/hora, duração (múltiplo de 15min), tipo (CONSULTA, RETORNO, EMERGENCIA, AVALIACAO, PROCEDIMENTO), status, observações
- FR1.2: Status permitidos: AGENDADO → CONFIRMADO → REALIZADO | AGENDADO/CONFIRMADO → CANCELADO | AGENDADO/CONFIRMADO → FALTOU
- FR1.3: Não permitir agendamento no passado
- FR1.4: Detectar e prevenir conflitos de horário entre agendamentos do mesmo dentista
- FR1.5: Respeitar bloqueios de horário ao criar agendamentos

### FR2 — Confirmações
- FR2.1: Agendamentos só podem ser confirmados com mais de 2h de antecedência
- FR2.2: Cancelamentos com menos de 24h exigem motivo
- FR2.3: Registrar histórico de confirmações (método, mensagem, data de envio)

### FR3 — Visualização
- FR3.1: Calendário semanal com navegação entre semanas
- FR3.2: Lista de agendamentos com filtros por dentista e status
- FR3.3: Visualização de detalhes em modal ao clicar no agendamento

### FR4 — Horários de Trabalho
- FR4.1: Definir horário por dentista e dia da semana (0-6)
- FR4.2: Suportar intervalo de almoço (break_start, break_end)
- FR4.3: Ativar/desativar horário

### FR5 — Bloqueios
- FR5.1: Criar bloqueio com dentista, início, fim e motivo
- FR5.2: Bloqueios devem ser considerados na verificação de conflitos
- FR5.3: Listar bloqueios ativos e futuros

---

## Non-Functional Requirements

- NFR1: Tempo de resposta < 500ms para criação de agendamento
- NFR2: Calendário deve carregar < 2s para semana típica (< 200 agendamentos)
- NFR3: Isolamento multi-tenant (clinic_id) em todas as operações
- NFR4: Validação de dados via Zod no backend

---

## Success Criteria

1. Usuário consegue criar agendamento em < 30 segundos (preenchendo formulário)
2. Zero conflitos de horário não detectados (todos os conflitos são bloqueados)
3. Calendário semanal renderiza corretamente com agendamentos sobrepostos visíveis
4. Todas as transições de status respeitam regras de negócio (ex: não confirmar < 2h)
5. Lembretes são enviados e registrados com sucesso

---

## Known Limitations / Backlog

| Item | Description | Decision |
|------|-------------|----------|
| US7 — Lembretes Automáticos | Envio de notificações (SMS/app/push) para pacientes antes de consultas. Requer integração com módulo de notificações (014-notificacoes). | **Backlog** — Fora do escopo da migração brownfield. Será implementado quando o módulo 014-notificacoes for integrado. |
| NFR1-NFR2 — Performance Metrics | Instrumentação de latência (`appointment_create_duration_ms`, `calendar_load_duration_ms`) não implementada. | **Next iteration** — Adicionar tasks de instrumentação (EP-4). |

---

## Gaps Identified (Post-Migration)

| Gap | Severity | Description |
|-----|----------|-------------|
| GAP-1 | ~~Medium~~ ✅ **RESOLVED** | ~~Backend controller (`agendaController.ts`) uses `@ts-nocheck`~~ — Removed on 2026-05-23. File compiles under strict mode. |
| GAP-2 | ~~Medium~~ ✅ **RESOLVED** | ~~`CreateAppointmentUseCase` has `@ts-expect-error` for appointmentType casting~~ — `AppointmentType` union literal used strictly. `@ts-expect-error` removed on 2026-05-23. |
| GAP-3 | ~~Low~~ ✅ **PARTIALLY RESOLVED** | ~~Backend duplicates business logic instead of using domain commands~~ — `createAppointment` now uses `CreateAppointmentCommandHandler` + `AppointmentRepositoryPostgres` (2026-05-23). `updateAppointment`, `deleteAppointment`, `getAppointments` still use direct Prisma. Gradual migration in progress. |
| GAP-4 | ~~Low~~ ✅ **RESOLVED** | ~~E2E tests rely on fragile locators~~ — 20+ `data-testid` attributes added to Agenda components on 2026-05-23. |
| GAP-5 | ~~Low~~ ✅ **RESOLVED** | ~~No rate limiting on agenda endpoints~~ — `agendaLimiter` (200 req/15min) added to router on 2026-05-23. |
